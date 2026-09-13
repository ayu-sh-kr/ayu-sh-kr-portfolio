# Most “we need Kafka” conversations end at a Postgres table

If a queue holds a few thousand jobs, one worker family drains it, and the application already depends on PostgreSQL, a table can be the complete system. Insert a row in the same transaction as the business change, claim batches with `FOR UPDATE SKIP LOCKED`, and record attempts and completion explicitly.

That gives the workflow one durability boundary instead of a database commit followed by a broker publish that may or may not happen. It is observable with ordinary SQL, easy to replay, and understandable by everyone already operating the service.

## The point where it stops fitting

Add a broker when a second independent consumer needs the same event history, retention becomes a product requirement, throughput makes database polling expensive, or partitioned ordering is genuinely part of the contract. Those are concrete pressures, not architectural fashion.

Kafka is excellent at being Kafka. It is expensive when used as a costume for a small work table. Start with the smallest system that makes delivery and retry behavior explicit, then move when measurements show which broker capability is actually missing.
