# Kafgres runs a Kafka-compatible broker inside PostgreSQL

**Kafgres 0.2.0 brings a Kafka-compatible broker into PostgreSQL**, allowing Kafka clients to send and receive events through a Postgres extension. The release follows a performance report in which the project’s author measured about **700 MB/s of writes on one machine**.

The project is written in Rust using **pgrx**, a toolkit for building Postgres extensions. Applications can keep using SQL on port 5432, while Kafka clients connect on port 9092. Its appeal is straightforward: teams already using Postgres can retain Kafka client libraries without running a separate broker service.

## SQL writes and Kafka events in one system

In the author’s example, a SQL transaction both inserts an order and publishes an `OrderPlaced` event. A Kafka consumer can read the event from its topic—the named stream where related events are stored. An ordinary Kafka producer can write to that same topic too, so existing client libraries remain useful.

Keeping the order and event together is the appeal. The application can coordinate them in the database while other services continue to speak Kafka. Kafgres also supports mapping table changes to topics, giving teams another way to turn database activity into events.

This does not mean every event becomes an ordinary database row. A Postgres background worker handles the broker, with topic data written through a separate path to disk and metadata managed through Postgres. That design helps explain the project’s recent performance work.

## What the 700 MB/s benchmark measured

In a September 23 report, the author describes reaching about **700 MB/s of write throughput with 256 KiB records** on an i9 machine with NVMe drives. A separate small-record test reached roughly **600,000 events per second**. Reusing database query plans and reacting when network sockets had work ready helped reduce time spent waiting or repeating work.

Some gains also came from relaxing when metadata commits wait for disk. The author says the tested non-transactional write path already did **not guarantee that event data had reached disk when acknowledged**. That detail belongs beside the speed result: a successful acknowledgement and a durable event are different promises, and applications need to know which they are receiving.

The same distinction applies to availability. Kafgres is a **single broker**, and its recovery follows Postgres failover. The author notes that it does not offer the same resilience to a zone outage as a Kafka cluster spread across three zones.

The release makes Kafgres a project to watch for teams that want **Kafka-compatible messaging alongside Postgres**. Its reported throughput is notable, while its single-broker design and durability settings remain central to deciding where it fits.

Sources: [Kafgres introduction](https://rynr.dev/blog/kafgres/), [700 MB/s profiling report](https://rynr.dev/blog/700mbskafgres/), and [project repository](https://github.com/RayElg/kafgres).
