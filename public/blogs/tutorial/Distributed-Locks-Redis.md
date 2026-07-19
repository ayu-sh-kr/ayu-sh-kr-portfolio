# Distributed locks in Redis, without the folklore

Distributed locks are useful when two workers can act on the same piece of state and the cost of doing the work twice is real. They are not a general-purpose replacement for transactions, idempotency, or a clear ownership model.

## Start with the invariant

Before reaching for Redis, write down what must never happen twice. If the operation can safely be repeated, an idempotency key is usually simpler. If the state lives in PostgreSQL, a unique constraint or a row lock may already be the right tool.

The lock is only protecting a small critical section. It is not making the whole workflow distributed-transaction safe.

## The minimum safe acquire

The lock value must be unique to the owner. A worker may only delete a lock that it still owns; deleting by key alone can release a newer worker's lock after a timeout.

```java
String token = UUID.randomUUID().toString();
String lockKey = "lock:payment:" + paymentId;

boolean acquired = Boolean.TRUE.equals(redisTemplate.opsForValue()
    .setIfAbsent(lockKey, token, Duration.ofSeconds(15)));
```

The expiry is a recovery mechanism, not proof that the work has finished. Keep the TTL comfortably above the normal critical-section duration and make the operation idempotent anyway.

## Release only what you own

The check and delete must be one atomic operation. A Lua script is enough for this small compare-and-delete:

```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
```

Without the ownership check, a slow worker can wake up after its lease expired and delete the lock now held by somebody else.

## The practical rule

Use a lock to reduce concurrent work, not to establish correctness on its own. Pair it with an idempotency key, a durable state transition, and metrics for acquisition failures and lock age. That combination survives retries much better than a copied `SETNX` snippet.
