# Redis Pub/Sub vs. Kafka: Defining Delivery Contracts in Distributed Systems

An event-driven microservices architecture can use Kafka or RabbitMQ and still
need Redis. This can feel unnecessary at first: if one broker can retain
events, retry consumers, and route work, why add another messaging mechanism?

The answer is not that Redis is a faster version of Kafka. Redis is useful
because some messages are not really messages in the durable-workflow sense.
They are short-lived signals that help the processes currently serving traffic
stay in step.

When one API node updates a user profile, the database remains authoritative.
Other stateless nodes may still hold a local cache of that profile. They need to
know that `user:123` is stale, but they do not need an event history for that
instruction. A small Redis signal can tell them to evict the entry immediately.
If one node is offline, its cache can expire or reload the current value later.

That is the decision this article explores. I will define the patterns behind
the decision, show where `Redis Pub/Sub` and `Redis Streams` fit, and explain
where Kafka, RabbitMQ, and MQTT remain the better tools. The practical question
throughout is simple: what must happen if this message is late, duplicated, or
missing?

By the end, you should be able to choose between Redis Pub/Sub, Redis Streams,
and a durable broker for a Spring Boot API, PostgreSQL cache, or WebSocket
gateway without confusing a live notification with a durable business event.

## Redis as a Data-Structure Server with Messaging

Kafka, RabbitMQ, and MQTT are primarily message infrastructure. Kafka gives
you a retained log, RabbitMQ gives you queueing and routing, and MQTT gives
connected devices a broker and quality-of-service choices.

Redis starts from a different centre. It is an in-memory data-structure server
with strings, hashes, sets, sorted sets, counters, expiry, atomic operations,
and messaging. That combination lets one service hold a small piece of shared
state and notify the processes interested in that state.

This compact comparison summarises the responsibility each technology is
designed to carry:

![Comparison of Kafka, RabbitMQ, MQTT, and Redis by the delivery responsibility each one is designed to carry](/blogs/others/assets/redis-broker-responsibilities.svg)

This does not make Redis universally faster or better. It means Redis can solve
a different class of problem without forcing a temporary signal through a
durable workflow system.

**Takeaway:** Redis is most useful when shared state and live notification need
to sit close together.

## Defining Delivery Contracts: Redis Pub/Sub vs. Kafka

When a message moves between services, the failure is not always a broker
failure; it may be an unclear promise about what the receiver can expect. A
delivery contract describes what the system promises about a message. Is it
retained? Can a consumer replay it? Must one worker acknowledge it? Is it
acceptable for a disconnected client to miss it?

Standard `Redis Pub/Sub` makes a deliberately small promise. A publisher sends
a payload to a channel and Redis forwards it to clients subscribed at that
moment. There is no message history, acknowledgement, or replay. A client that
is disconnected when the message is published misses it.

`Redis Streams` makes a larger promise. Entries are retained in a stream, and
consumer groups can divide work, acknowledge entries, and recover entries left
pending by a failed consumer. It is still normally at-least-once: a retry can
deliver the same entry more than once.

Kafka is designed around a durable, replayable log. RabbitMQ is designed around
queues, exchanges, routing, and acknowledgements. MQTT is designed around
connected clients and device delivery semantics. None of these contracts is
automatically correct for every event.

![Delivery contract decision: durable records choose Kafka, RabbitMQ, or Redis Streams, while recoverable live signals choose Redis Pub/Sub](/blogs/others/assets/redis-delivery-contract.svg)

If a missing message can be recovered by reading current state or waiting for
the next update, a live Redis signal may be enough. If missing it can leave an
order, payment, inventory count, or audit trail wrong, the event belongs on a
durable path.

> A broker choice cannot repair an unclear rule. Decide whether a missing event
> is acceptable before choosing how to deliver it.

**Takeaway:** Choose the delivery guarantee from the consequence of a missed
message, not from the feature list of a broker.

## Fan-out: one signal, many live consumers

When several live processes need to react to the same change, calling each one
directly creates unnecessary coupling. `Fan-out` means that one publisher distributes an event to several independent
consumers. The publisher sends once; the broker or channel makes the event
available to every interested subscriber.

Redis Pub/Sub is a natural fan-out tool for live application instances. Imagine
three API nodes with local caches. Node A updates a profile in PostgreSQL and
publishes `user:123` on `cache:invalidate`. Nodes B and C remove their local
copies. A WebSocket gateway may also tell connected clients to refresh.

![Fan-out flow from a database update through Redis to two API nodes that evict their local caches](/blogs/others/assets/redis-fan-out.svg)

The event is a signal, not the new profile. Each node reads the authoritative
value when it needs it. That separation matters because a missed invalidation
must not make the database incorrect. Give local entries a bounded `TTL`, and
make cache reads able to recover from a missed notification.

The same shape works for presence, typing indicators, cursor movement, live
scores, and configuration refresh requests. These values are useful while the
application is live. Replaying a typing event from an hour ago would not help
a user, and retaining every cursor movement would create history without
creating business value.

**Takeaway:** Fan-out is a good fit for live signals when every subscriber can
recover from the current state.

## Ephemeral coordination: helping live processes agree

When multiple nodes make a shared decision, they need a quick meeting point
that does not become another business workflow. **Ephemeral coordination** is temporary, stateless communication that helps
distributed components stay aligned without becoming part of a durable
workflow. A node may ask whether another node is refreshing a cache key.
Several instances may share a rate-limit counter. A deployment may tell live
processes to reload configuration.

These signals are not facts that another service must replay later. They are
hints that help live processes behave correctly right now, which puts them on
the “no durable record required” branch of the delivery contract.

Redis fits this category because its in-memory operations can be very low
latency, its atomic primitives let several nodes make one shared decision, and
its expiry gives temporary state a recovery path if a process crashes. Kafka and
RabbitMQ can carry coordination messages, but retaining and acknowledging every
short-lived hint is usually unnecessary when the receiver can read current
state again.

A cache refresh is a simple example. Only one node should perform an expensive
refresh while the others continue serving the existing value:

![Ephemeral cache-refresh coordination: one node acquires a short-lived Redis lock while other nodes skip duplicate work](/blogs/others/assets/redis-ephemeral-coordination.svg)

The lock coordinates access; it does not prove that a payment or reservation
succeeded. Coordination is not correctness. Put the durable invariant in the
database or a durable workflow, and use Redis to help live processes cooperate
around it.

**Takeaway:** Coordination helps processes cooperate; it does not make a
business outcome durable.

## Fan-in: collecting outcomes into one result

When one response depends on several services, the difficult question is what
to do with a slow or missing response. `Fan-in` is when several independent tasks must converge into one combined
result, and the system must decide what to do if one never arrives. Fan-out
distributes work; fan-in collects outcomes. Both patterns need different
guarantees.

Consider a dashboard that needs profile, billing, and activity data. A
coordinator sends the three requests together, gives them the same
`correlationId`, and waits for the responses. “Done” must be defined before
the first request is sent: do we need all three responses, is a partial result
acceptable, and how long should we wait for the slowest service?

![Fan-in flow where profile, billing, and activity responses converge by correlation ID before completion or a deadline](/blogs/others/assets/redis-fan-in.svg)

Redis is useful when this meeting point is short-lived. Its in-memory speed
keeps the coordinator responsive, a `TTL` removes abandoned state after a
timeout, and atomic updates prevent two responses arriving together from both
declaring the aggregate complete. This is temporary aggregation, not durable
orchestration.

If the result must survive a deployment, a process crash, or a workflow that
runs for hours, Redis is the wrong store. Put that state in a database or
workflow engine and use the durable branch of the delivery contract. When
fan-in drives a business outcome, it belongs with the durable workflow and
recovery rules described earlier.

**Takeaway:** Fan-in is a delivery-contract problem first and a Redis problem
second.

## Redis Streams: a retained queue for a smaller subsystem

When a temporary signal becomes work that must wait for a worker, Pub/Sub no
longer provides enough history. The short version is: **Pub/Sub is a live broadcast; Streams is a retained,
recoverable queue.**

Streams exists for small durable queues inside Redis: a notification worker, a
contained background pipeline, or a per-room delivery queue. A producer appends
an entry, a consumer group claims work, and the consumer acknowledges it after
the side effect is safe.

Streams is at-least-once by design. If a worker sends an email and crashes
before acknowledging the entry, Redis may deliver the entry again. Duplicates
are normal, so the worker needs an idempotency key or another deduplication
strategy.

![Redis messaging comparison: Pub/Sub broadcasts and discards live messages, while Streams retains entries for acknowledgement and recovery](/blogs/others/assets/redis-pubsub-vs-streams.svg)

Streams belongs on the “durable record required” branch when you need retry and
recovery but not a full Kafka cluster. Its durability still depends on the
operational envelope of Redis: persistence, replication, memory limits,
retention, and failover must match the workload.

It is not a replacement for Kafka’s long event history, independent replay
across many consumer groups, or dedicated streaming semantics. Use Kafka when
those guarantees matter. Use Streams when a smaller, recoverable queue is the
actual requirement.

**Takeaway:** Streams gives a small subsystem a recoverable queue, but duplicate
delivery remains part of the contract.

## Cache invalidation: the Redis use case most systems meet first

When each API node keeps a local copy, one database update can leave the fleet
temporarily inconsistent. Cache invalidation shows how shared state and messaging complement each other.
The database remains the source of truth, Redis may hold a shared cache, and
each API process may keep a smaller local cache for speed.

When a profile changes, the durable write and the invalidation signal have
different jobs:

![Cache invalidation flow from a committed PostgreSQL update through Redis Pub/Sub to local cache eviction on API nodes](/blogs/others/assets/redis-cache-invalidation.svg)

The invalidation payload should be small: a key, version, and reason. It should
lead receivers back to current state rather than pretending to be the record
itself.

```json
{
  "type": "user.cache-invalidated",
  "userId": "123",
  "version": 42,
  "reason": "profile-updated"
}
```

A missed notification is acceptable only because the local cache has a
recovery path: a bounded `TTL`, a version check, or a cache miss that reads
from PostgreSQL. Redis reduces staleness; it does not replace the transaction
that made the profile update correct.

In Spring Boot, Spring Data Redis can publish the invalidation after the
database transaction commits. `@TransactionalEventListener` prevents a
rolled-back profile update from publishing a notification that never happened.

```java
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void invalidate(ProfileUpdated event) {
  redisTemplate.convertAndSend(
      "cache:invalidate",
      new CacheInvalidation("user", event.userId(), event.version())
  );
}
```

For a business event that must survive a crash, use the outbox pattern:
save the durable state and an outbox row in one transaction, then publish and
retry from the row. Do not turn a cache hint into a durable workflow unless the
system actually needs that guarantee.

**Takeaway:** Cache invalidation reduces staleness; the database remains the
source of truth.

## Per-instance communication inside a backend

When a live process needs to refresh itself, sending a durable business event
is unnecessary. Redis Pub/Sub is often most useful inside the backend rather than as a public
event API. A deployment can tell instances to reload configuration. A worker
can notify live nodes that a precomputation is ready. A WebSocket gateway can
tell connected clients that a room changed.

The receiver should read current state when correctness matters. A message such
as `config:reload` asks a node to fetch the active configuration version; it
does not try to carry the entire configuration as an irreversible command. A
node that was offline during the broadcast can still load the current version
during startup.

This is why Redis can sit beside a durable broker without duplicating its job:
the durable broker moves facts or recoverable work, while Redis tells live
processes where to look next.

**Takeaway:** Per-instance Redis messages should point processes to current
state, not carry irreversible state changes.

## Rate limits, presence, and other shared decisions

When the decision is “may this request proceed?” a message history is not the
main data structure. Rate limiting is primarily a shared-state problem, not a message-log problem.
The decision is an atomic update: can this user, API key, or IP address make
another request in this window? Redis provides counters, expiry, and scripts
close to that decision. A Pub/Sub event may notify observability or a dashboard,
but it does not enforce the limit.

Presence follows the same model. A heartbeat or session key expires when the
client disappears. A channel can announce the change to connected consumers.
If that announcement is missed, the expiry and the next state read recover the
answer.

A distributed lock can prevent duplicate cache refreshes or coordinate one
tenant-specific job. Keep the key narrow, set an expiry, and release only the
lock you own. If the operation itself must happen exactly once, use an
idempotency key and a durable constraint; the lock is supporting coordination,
not proof of completion.

**Takeaway:** Use Redis to make a shared decision atomically, then protect the
durable outcome somewhere that can enforce it.

## Kafka, RabbitMQ, and MQTT: Where Each Broker Fits

Redis is not a substitute when the message itself must live for a long time or
be delivered under a specialised client contract. **Kafka** remains the better fit for a **large retained event history**, **independent
replay**, and **multiple consumer groups** that may appear long after an event was
written. It gives the event a durable life beyond the process that produced it.

**RabbitMQ** remains a strong fit when **routing exchanges, queues, acknowledgements,
and worker ownership** are central to the design. A task such as “send this
email” usually belongs in an **acknowledged work queue** rather than a live
broadcast.

**MQTT** remains the natural choice when **devices are the clients**. Its **sessions,
topics, and quality-of-service levels** address connection and delivery
behaviour that **Redis Pub/Sub** does not try to provide.

**Redis** complements these systems when the problem is **shared memory, live
fan-out, temporary coordination, cache invalidation, or a contained stream**. It
does not need to replace the broker that already owns **durable business events**.

**Takeaway:** Kafka owns retained history, RabbitMQ owns routed work, and MQTT
owns device-oriented delivery; Redis complements them with live state.

## Do not make Redis a casual failover broker

It is tempting to say that Redis can temporarily buffer events when Kafka is
down or RabbitMQ is overloaded. That can be designed, but it is not a free
fallback. The alternative path needs explicit retention, ordering,
deduplication, replay, monitoring, and a way to move events back into the
primary workflow.

A Redis Pub/Sub channel is not a failover queue because it cannot replay a
message for a disconnected subscriber. Redis Streams can be a bounded retry
store or dead-letter aid when its persistence and capacity are understood. The
important part is to choose that role deliberately rather than silently
creating a second event system during an outage.

**Takeaway:** A fallback broker is a second delivery contract and must be
designed and operated as one.

## Choosing Redis Pub/Sub, Redis Streams, Kafka, RabbitMQ, or MQTT

### TL;DR: the delivery contract in three choices

Choose the tool based on the use case, not the fan base. If the state or context
can be retrieved or calculated and missing them won't cause problem, Redis Pub/Sub
is usually enough.

If the state or context needs to be retained because the failover or in case
of missing of event or system might cause application to be in inconsistent state,
use Redis Streams.

If an event must remain available for independent replay, use Kafka or another durable log. 

If one worker or more must own routed work and acknowledge it, use RabbitMQ or another durable queue.

If connected devices and QoS are central, MQTT addresses that client
model directly.

- Use `Redis Pub/Sub` for live signals that can be missed and recovered from
  current state.
- Use `Redis Streams` for a small retained queue with acknowledgement, retry,
  and at-least-once processing.
- Use Kafka, RabbitMQ, or MQTT when their durable log, routed work queue, or
  device-session guarantees match the problem.

Redis is not valuable because Kafka, RabbitMQ, or MQTT are incomplete. It is
valuable because a live application has coordination needs that do not deserve
a durable event history.

The question I return to is still the simplest one: what happens if this
message is late, duplicated, or missing? If the answer is “read the current
state and continue,” Redis can keep the live system responsive. If the answer
is “the business outcome may be lost,” give the event a durable record,
recovery, and idempotent consumers.

Use Redis for the present. Use a durable broker for the work that must survive
the present.
