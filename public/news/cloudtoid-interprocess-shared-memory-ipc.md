# Cloudtoid Interprocess v3 connects local apps without a message broker

**Cloudtoid's Interprocess library lets separate applications on the same computer exchange messages without running a message broker.** Its v3 protocol connects programs written in Rust, C/C++, Python, Node.js, Go and .NET through a shared queue in memory.

The [repository credits Pedram Rezaei as its author](https://github.com/cloudtoid/interprocess#author). Rezaei, a former Microsoft Copilot CTO and corporate vice president, [joined AWS as a distinguished engineer in October 2026](https://www.geekwire.com/2026/amazon-hires-a-microsoft-ai-leader-to-help-build-its-tools-for-coding-and-work/).

The open-source project's pitch is a smaller messaging setup for applications that already run together. Instead of sending work through another service, one program places a message in memory that another can read. Version 3 also changes how waiting readers are notified, with the project reporting improvements over its previous .NET version.

That makes Interprocess relevant to local worker systems: an application can keep its main service and specialist workers separate, even when they use different languages, without adding a messaging server to connect them. The important boundary is **the same machine**. This is local communication, rather than a replacement for messaging across servers.

## What removing the broker changes

A process is a running instance of a program, with its own private memory. A Rust service cannot ordinarily read a Python worker's memory simply because both run on the same computer. Exchanging information between them is called **interprocess communication**, or IPC—the category from which Cloudtoid's library takes its name.

A message broker is one way to connect those programs. It is a separate service that receives messages, holds them in a queue and delivers them to consumers. Depending on the product and configuration, it can also retain work, track acknowledgements and connect applications across machines.

Consider a service that asks Python workers to resize uploaded images. In the broker arrangement below, the service sends a job describing the image and required size. The broker queues it, then passes it to a worker that produces the thumbnail.

![Isometric view of a Rust producer sending an image job through a separate message broker, whose queue delivers it to a Python worker that creates a thumbnail.](/news/assets/cloudtoid-interprocess-shared-memory-ipc/broker-mediated.svg)

Those delivery features can justify running the broker. But when the programs share one computer and need only a temporary handoff, the intermediary is another service to deploy and maintain. Cloudtoid offers a shared-memory route for that narrower job.

## How Interprocess connects the applications

With Interprocess, the producer and worker open the same named queue. The operating system makes a common region of memory accessible to both, while the rest of each program's memory stays private. The queue has a fixed capacity, keeping its memory use bounded.

The image job now follows the second illustration. Rust writes a message into the shared queue; Python receives it and creates the thumbnail. **The broker process disappears**, while the two applications remain separate. Multiple workers can share the queue, with each message taken by one competing receiver during ordinary operation.

![Isometric view of separate Rust and Python processes with private buffers, both mapping one shared circular queue. Job bytes are copied into the queue and out to the worker, which produces a thumbnail.](/news/assets/cloudtoid-interprocess-shared-memory-ipc/interprocess.svg)

The library carries bytes, so the applications still need an agreed message format. A small JSON message could contain an image path and resize dimensions; the image itself need not travel through the queue. Payloads are copied into and out of the queue, so shared memory does not make this entire path zero-copy.

Cloudtoid publishes packages for the six language families and supports Windows, Linux and macOS on documented 64-bit platforms.

> **One Rust engine, language-specific bindings.** Python, Node.js, Go and C/C++ use bindings—adapters that let each language call the Rust engine. The engine runs inside each application; there is no separate server or broker to host. **.NET is the exception:** it implements the same shared-memory protocol separately, so it can still exchange messages with applications using the Rust engine.

### Configuring both apps to meet

These setup excerpts open **the same queue**, named `image-jobs`, with a 64 KiB capacity.

Rust producer:

```rust
use cloudtoid_interprocess::{Options, Publisher};
let publisher = Publisher::open(&Options::new("image-jobs", 65536))?;
```

Python worker:

```python
from cloudtoid_interprocess import Subscriber
subscriber = Subscriber("image-jobs", 65536)
```

Both use protocol v3. On Linux and macOS, their storage directories must also match; these examples use the default temporary directory. The first participant initializes the queue, and the other joins it. Keep the endpoints open during the handoff.

## What v3's performance figures actually show

Version 3 groups notifications to avoid repeatedly calling the operating system while readers are already active. In the project's .NET tests on an Apple M5 Max, an eight-byte send-and-receive operation measured **17.82 ns**, compared with **214.6 ns** for v2. Its concurrent test rose from 1.04 million to 2.42 million messages per second.

The repository also reports a **12.98 ns** Rust send-and-receive result for a three-byte message with reused receive storage. That figure comes from an in-process microbenchmark: the timed operations run inside one program, with queue creation and cleanup excluded. It does not measure the complete Rust-to-Python exchange shown above.

These are project-reported measurements. They support the case for evaluating v3, but establish neither application-level latency nor a measured speedup over a broker. Message size, language bindings, scheduling and the way idle workers wait all affect the eventual result.

## The smaller setup comes with a narrower delivery contract

Interprocess queues are **transient**. When every publisher and subscriber disconnects or exits, unread messages are lost. Receiving a job also does not prove that the worker completed it; durable acknowledgements and exactly-once effects are not built into this handoff.

For the thumbnail example, that can be acceptable if the original image and job record remain elsewhere, allowing failed work to be recreated. A full queue still needs an application policy for waiting, retrying or rejecting new work. Tasks that must survive failures need persistent tracking and recovery beyond the shared queue.

### Capabilities at a glance

Benchmarks below are [Cloudtoid's own measurements](https://github.com/cloudtoid/interprocess#performance) on an Apple M5 Max, not independent tests or measured broker speedups.

| Area | Reported result or capability | Practical limit |
| --- | --- | --- |
| Rust benchmark | 12.98 ns send + receive; 3-byte message, reused buffer. | In-process microbenchmark; excludes cross-language binding overhead. |
| .NET v3 vs v2 | 17.82 vs 214.6 ns for 8-byte send + receive; 2.42M vs 1.04M messages/s with four publishers and four subscribers. | Separate workloads; neither measures the illustrated Rust-to-Python path. |
| Deployment | Library inside each app; shared queue on one machine. | No central engine or cross-machine messaging. |
| Queue configuration | Matching name, capacity and protocol; matching storage directory on Unix. | Apps must explicitly join the same queue. |
| Concurrency | Senders reserve space atomically; receivers coordinate through a shared reader lock. | Workers compete for messages; this is not broadcast. |
| Persistence | Queue remains while at least one endpoint stays connected. | All endpoints gone: unread messages lost; reopening starts empty. No reboot durability. |
| Database backing | No built-in database persistence. | Applications must add durable job records, completion tracking and retries. |
| Worker failure | Pending messages remain if another endpoint stays connected. | A consumed job is not automatically requeued if its worker crashes. |

Cloudtoid's contribution is a way to connect local applications across languages with less messaging infrastructure. For workers that share a machine and can recover their jobs elsewhere, removing the broker can simplify the setup. When messages must cross machines or survive restarts, those requirements still determine the messaging system.

## Sources

- [Cloudtoid repository, language packages and v3 benchmarks](https://github.com/cloudtoid/interprocess): supported environments, implementation structure and project-reported measurements, including September 2026 benchmark conditions.
- [Queue concepts](https://cloudtoid.com/docs/concepts/): shared queues, capacity, competing subscribers and message lifetime.
- [Protocol v3](https://cloudtoid.com/docs/protocol/): shared-memory layout, publication, consumption and recovery rules.
- [RabbitMQ work queues](https://www.rabbitmq.com/tutorials/tutorial-two-python): broker-mediated delivery, acknowledgements and persistence settings.
