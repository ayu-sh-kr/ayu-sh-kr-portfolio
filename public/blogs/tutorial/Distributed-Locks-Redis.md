# Distributed locks in Redis, without the folklore

Distributed systems are a practical response to work that no longer fits
comfortably on one application instance. Rather than asking a single server
to accept every request, run every background job, and process every event,
we can run several instances and divide the work between them.

That arrangement has useful properties. More instances can serve more
concurrent requests, and a failed instance does not have to take the whole
application offline. It also allows horizontal scaling: add another ordinary
application node when demand grows instead of repeatedly replacing one server
with a larger, more expensive machine. Given the same application design and
the same downstream capacity, a group of modest instances can often provide
better throughput and availability than one high-spec instance. It does not
remove bottlenecks in the database, a third-party API, or a shared network
connection; those still need their own limits and capacity planning.

The decision to distribute work also removes a convenient assumption: local
memory is no longer shared. Two requests can reach different application
instances at the same time. Several message consumers can receive related
events. A retry can arrive after the original worker has timed out but before
its effects are visible. The concurrency that improves throughput can now
also make the same business action happen twice.

## Start with the invariant

Begin with the outcome that must remain true. A payment should be captured at
most once. One inventory reservation should not consume the last item twice.
A scheduled reconciliation should have one active run for a tenant and date.
The invariant is more useful than a generic decision to “add a lock”, because
it tells us which state needs protection and how long the critical section can
be.

Not every repeated request requires a lock. If an operation can safely be
replayed, an idempotency key is usually the simpler control. If the state
lives in PostgreSQL, a unique constraint, an atomic update, or a row lock may
already express the rule directly. A lock coordinates access; it does not make
an entire workflow a distributed transaction.

## When the database should do the locking

For a decision that is made and persisted in the same database transaction,
the database is normally the strongest place to enforce it. A unique index can
prevent duplicate rows. An update with a predicate can reserve stock only when
the remaining quantity is positive. `SELECT ... FOR UPDATE` can serialize a
short, contested update to an existing row.

These mechanisms work because the database owns the durable state and decides
which transaction commits. Keep the transaction short. Holding a row lock
while calling a payment provider, sending an email, or waiting on another
service increases contention and makes recovery harder. Persist the durable
state transition first, then use an outbox, retry, or idempotent downstream
operation for the external work.

## When a Redis lock is useful

Redis is useful when several application instances need short-lived,
cross-process coordination before or around work that is not naturally a
single database transaction. Typical examples include preventing duplicate
cache refreshes, allowing one worker to start a tenant-specific job, or
avoiding parallel calls to an expensive upstream API.

A Redis lock should have a narrow key and a short lease. `lock:invoice:42` is
meaningful; `lock:invoice-processing` is usually too broad. The lock value
must uniquely identify the owner, and acquisition must set the value and
expiry atomically:

```java
String token = UUID.randomUUID().toString();
String lockKey = "lock:payment:" + paymentId;

boolean acquired = Boolean.TRUE.equals(redisTemplate.opsForValue()
    .setIfAbsent(lockKey, token, Duration.ofSeconds(15)));
```

The expiry is a recovery mechanism. If a process crashes, its lock should not
remain forever. It is not evidence that the work completed, and it cannot make
a slow or retried request safe by itself. Set the TTL above the expected
critical-section duration, observe locks that approach that limit, and retain
idempotency or a durable state check at the boundary that matters.

## Release only the lock you own

The owner must not delete a lock that has expired and been acquired by another
worker. Checking the token and deleting the key must therefore be one atomic
operation. A small Lua script performs that compare-and-delete:

```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
```

In a simple Spring application, Spring Data Redis provides the Redis access
needed for this pattern. Keep the token, release script, key construction,
TTL choice, and acquisition-failure behaviour in one well-tested component;
repeating them in controllers makes subtle mistakes likely.

For Java services that need a richer lock API, Redisson integrates with Redis
and offers `RLock`, `tryLock`, and lease handling. Its lock watchdog can renew
a lock while a live client still owns it, which is useful for bounded work
whose duration varies. An explicit lease is often easier to reason about when
the operation has a known upper bound. In either case, define what happens if
the lease ends while work is still running: the protected write must reject a
stale worker or otherwise remain idempotent.

## From a single lock to a reusable boundary

A lock is often first introduced next to one method. Once the same pattern is
needed in several services, it can become an aspect-oriented boundary: an
annotation declares the lock name and key inputs, while the interceptor
acquires, releases, records metrics, and maps contention to a deliberate
response. This is helpful only when the rule is genuinely consistent. The
aspect should make key scope, lease duration, timeout, and failure policy
visible rather than hiding them behind defaults.

Redis can also support adjacent coordination concerns, but their semantics
should stay distinct:

- **Cache coordination:** use a short lock to reduce cache stampedes while one
  worker refreshes a missing value. The cache remains an optimisation; the
  source of truth must still handle a miss or a failed refresh.
- **Rate limiting:** use an atomic counter, token bucket, or Lua script to
  decide whether an identity may make another request. A rate limiter controls
  admission over time; it is not a mutual-exclusion lock.
- **Temporary user blocking:** store an explicit expiry-backed block or
  cooldown after a defined security or abuse rule is triggered. Make the
  reason, duration, and reset behaviour part of the product policy, not an
  accidental side effect of a lock key.

## Boundaries that a lock does not solve

Redis replication, process pauses, network partitions, and lease expiry make
distributed coordination inherently less certain than a local mutex. A worker
can continue running after its lease has expired, and a service can lose its
connection to Redis without knowing immediately whether another worker has
proceeded. For high-value state, the database still needs an authoritative
transition, and downstream effects need idempotency.

Where stale work must be rejected strictly, consider a monotonically
increasing fencing token and have the protected resource reject an older
token. That design needs support from the resource being written to; adding a
Redis lock alone cannot provide it. For work that crosses services, an outbox,
deduplication record, or queue consumer with idempotent handling is frequently
the more durable answer.

## What this pattern teaches

The useful lesson is not that Redis locks solve concurrency. It is that
horizontal scale requires an explicit owner, a bounded period of ownership,
and a recovery path when the owner fails. Database constraints, Spring Data
Redis, Redisson, cache coordination, rate limiting, and user-blocking rules
are tools for different parts of that problem.

Use the smallest mechanism that enforces the invariant. Start with durable
state and idempotency, add a database lock when the decision belongs in one
transaction, and use Redis when short-lived coordination across application
instances will reduce duplicated work. Measure contention, acquisition
failures, lock age, and retries so the design can be adjusted from evidence
rather than from a copied locking snippet.
