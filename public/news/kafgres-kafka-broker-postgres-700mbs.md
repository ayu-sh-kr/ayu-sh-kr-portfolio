# Kafgres runs a Kafka-compatible broker inside PostgreSQL

An application saves an order in Postgres, then sends an event so another service can email the customer. That second step often introduces a separate messaging system. **Kafgres** puts a Kafka-compatible broker inside PostgreSQL, letting applications use familiar Kafka clients while keeping the event infrastructure alongside the database.

A broker receives events and makes them available to consumers. With Kafgres, that broker is a **Rust-based Postgres extension**, built using pgrx, a toolkit for writing extensions in Rust. SQL connections still use port 5432; Kafka clients connect to the embedded broker on port 9092.

## One order, two connected pieces of work

In the author’s example, a SQL transaction both inserts an order and publishes an `OrderPlaced` event. A Kafka consumer can read the event from its topic—the named stream where related events are stored. An ordinary Kafka producer can write to that same topic too, so existing client libraries remain useful.

Keeping the order and event together is the appeal. The application can coordinate them in the database while other services continue to speak Kafka. Kafgres also supports mapping table changes to topics, giving teams another way to turn database activity into events.

This does not mean every event becomes an ordinary database row. A Postgres background worker handles the broker, with topic data written through a separate path to disk and metadata managed through Postgres. That design helps explain the project’s recent performance work.

## What the 700 MB/s benchmark measured

In a September 23 report, the author describes reaching about **700 MB/s of write throughput with 256 KiB records** on an i9 machine with NVMe drives. A separate small-record test reached roughly **600,000 events per second**. Reusing database query plans and reacting when network sockets had work ready helped reduce time spent waiting or repeating work.

Some gains also came from relaxing when metadata commits wait for disk. The author says the tested non-transactional write path already did **not guarantee that event data had reached disk when acknowledged**. That detail belongs beside the speed result: a successful acknowledgement and a durable event are different promises, and applications need to know which they are receiving.

The same distinction applies to availability. Kafgres is a **single broker**, and its recovery follows Postgres failover. The author notes that it does not offer the same resilience to a zone outage as a Kafka cluster spread across three zones.

Kafgres offers a concrete option for the order example: retain Kafka clients while operating the broker within Postgres. The benchmark makes it worth investigating, but the decision rests on whether the application can accept its storage, durability, and recovery behavior—not throughput alone.

Sources: [Kafgres introduction](https://rynr.dev/blog/kafgres/), [700 MB/s profiling report](https://rynr.dev/blog/700mbskafgres/), and [project repository](https://github.com/RayElg/kafgres).
