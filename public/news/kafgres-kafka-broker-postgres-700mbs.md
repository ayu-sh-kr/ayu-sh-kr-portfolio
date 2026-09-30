# Kafgres puts a Kafka-compatible broker inside Postgres

Postgres can hold an event queue, but a homegrown queue does not automatically work with Kafka clients and tooling. **Kafgres** approaches that gap from the other side: it embeds a Kafka-compatible broker in a PostgreSQL extension, so ordinary Kafka clients can connect while the application keeps its database.

## How does a Kafka client reach Postgres?

The Rust extension uses **pgrx** and a Postgres background worker. The database still answers SQL on port 5432; the embedded broker answers Kafka clients on port 9092. Its author demonstrates a client producing an event and a SQL transaction inserting an order and producing another event to the same topic. A Kafka consumer can read both.

That is the practical appeal for an application that already runs Postgres. An order write and its event can be coordinated in the database, while existing Kafka libraries remain usable. Kafgres also describes a mapping from table changes to topics. Topic bytes follow a separate data path to disk; metadata uses Postgres machinery. **It is a single broker inside the database**, rather than a distributed Kafka cluster appearing by magic.

## What does the 700 MB/s result show?

In a September 23 performance write-up, the author reports about **700 MB/s of produce throughput with 256 KiB records** and roughly **600,000 events per second** on a rented i9 machine with NVMe drives. Cached query plans, a configurable relaxed commit setting, and waking the worker when sockets were ready helped raise throughput. The large-record throughput is a test result on that machine, not a general production guarantee.

The durability setting deserves attention: the author says the tested non-transactional produce path did **not guarantee topic data had reached disk when acknowledged**, and relaxing offset commits improved throughput. Kafgres can follow Postgres failover, but the author also notes that a single broker does not provide the same zone resilience as a three-zone Kafka cluster. Hosting storage and network traffic still costs money.

For a team whose event traffic fits on one database host, Kafgres is an intriguing way to keep Kafka client compatibility without operating a separate cluster. Its strongest result is a reason to test a realistic workload, including failures and acknowledgement semantics, before treating a benchmark as an architecture decision.

Sources: [Kafgres introduction](https://rynr.dev/blog/kafgres/), [700 MB/s profiling report](https://rynr.dev/blog/700mbskafgres/), and [project repository](https://github.com/RayElg/kafgres).
