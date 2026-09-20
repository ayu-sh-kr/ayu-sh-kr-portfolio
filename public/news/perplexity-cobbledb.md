# Perplexity CobbleDB: why AI search moved beyond DynamoDB

When you control how pages are crawled, processed, and ranked, storage can become the part that limits what you can change. Perplexity's CobbleDB story starts there: keeping ingestion fast and reads responsive meant taking control of how updates reach the hot store and how that store serves them.

## Why replace DynamoDB

Perplexity introduced CobbleDB, its response to the issues it had been facing with DynamoDB, where cost and feature gaps were limiting its ability to crawl pages at scale, apply read-write updates, and test new models for serving content.

DynamoDB provided managed storage, but Perplexity had limited control over it. On one side, the team had built its own crawling, indexing, and ranking infrastructure, along with embedding models and inference engines, to power efficient processing and fast serving. On the other side, storage management offered limited control and could not be customised around the system they had built.

With CobbleDB, they are calling it storage infrastructure for AI-native search at scale. That framing makes sense. Regular search is designed for human understanding and is queried as such — but when an AI sits in between, it understands data better when it is embedded as vectors. Perplexity puts it plainly:

> To turn raw HTML into model-ready content, our processing pipeline cleans each page, splits it into semantically coherent passages, computes their embeddings, and stores the passages and embeddings together in the database. At query time, the serving pipeline selects the text most relevant to the query and passes it to the model.

Their storage demands were straightforward: fast ingestion of data and low-latency reads for content serving.

### The issues with DynamoDB

- A managed database charges for every byte read and written.
- It lacked the flexibility they needed to tune performance to their requirements.
- Processing was coupled to hot-store writes.

For those who don't know what hot-store writes are: it's a pattern where written data needs to be queryable immediately, so the storage system must be optimised for fast, immediate access. Redis, DynamoDB, and Elasticsearch are a few examples. This is also why they are expensive, whereas cold storage like S3 is cheap.

## The new architecture

Their new architecture is a mix of Pillar, Lorry, CobbleDB itself, and Postgres for metadata — "just use Postgres", as they say, for a reason. CobbleDB is the hot store itself: a distributed key-value store pairing hashed page URLs with each page's processed representation, and the important change is Perplexity's control over the storage configuration. The diagram below carries the detail:

![CobbleDB architecture: Pillar publishes durable page updates, Lorry batches them through S3, and replicas ingest independently. A stateless router directs candidate page keys to RocksDB nodes for MultiGet reads from memory or NVMe, preferring same-zone replicas with fallback for slow reads.](/news/assets/perplexity-cobbledb/cobbledb-tunable-read-path.svg)

Read it top to bottom:

- **Record** — the key is a hashed page URL; the value is pre-chunked passages with per-chunk vector embeddings.
- **Router** — retrieval and ranking hand over candidate keys; the router hashes them to partitions and fans out parallel reads, preferring replicas in the same availability zone to cut cross-zone latency.
- **Data nodes** — each partition lives on three nodes, so the loss of one still serves reads. RocksDB — an embedded engine well-suited to batch-fed, read-heavy data — answers MultiGet batch reads at low latency: hot reads from the memory cache, the rest from local NVMe. The memory-to-disk balance is tuned per workload instead of inheriting a managed cache policy. A slow node falls back to another replica, improving tail latency.
- **Omitted on purpose** — no transactions and no synchronised replicas. A brief write-to-read gap is acceptable, so unneeded features never add overhead or cost.

That brings us back to control. Perplexity needed storage it could tune around the pipeline it had already built: updates delivered independently of live reads, and a hot store configured for serving prepared pages in batches. CobbleDB makes that trade-off explicit — accept a brief delay before updates become readable, and spend the storage effort on the ingestion and read performance the workload needs.
