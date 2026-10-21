# Cloudtoid Interprocess: shared-memory IPC across languages

A Python worker and a Rust service can run on the same computer yet exchange jobs through a separate messaging service. **Cloudtoid Interprocess** offers a shorter path: put those messages in memory both processes can access.

The open-source, MIT-licensed library supports Rust, C/C++, Python, Node.js, Go and .NET. Its current **v3 protocol** lets those languages share a queue on Windows, Linux and macOS, within the project's supported 64-bit environments. There is no broker service to deploy. The useful question is what an application can give up when its messages never need to leave the machine.

## One shared queue, several workers

**Interprocess communication**, or IPC, means exchanging information between running programs. Separate processes normally have separate memory; Cloudtoid uses a shared memory mapping so they can access the same message buffer.

Consider a Rust service handing image-processing jobs to several Python workers. It publishes a message containing an image path and the required operation. A worker receives that message, opens the image and does the work. Both sides agree on the message format because Cloudtoid transports **bytes**, without supplying a serializer.

The buffer is circular: after reaching its end, writes wrap back to the beginning as consumed space becomes reusable. Atomic operations coordinate access when several publishers or subscribers act concurrently. A fixed capacity keeps queue memory bounded, while reusable receive buffers reduce repeated allocations.

Subscribers **compete for work**. Under ordinary operation, one worker consumes each queued message; every worker does not receive a copy. That makes it suitable for sharing image jobs across a local worker pool. Broadcasting an event to every consumer requires separate queues.

Rust provides the native engine used by the C, Python, Node.js and Go interfaces. .NET implements the same protocol separately. The common format is what allows those processes to communicate across language boundaries.

## What the 13 ns benchmark measures

Cloudtoid reports **12.98 nanoseconds** for sending and receiving a three-byte message in its Rust benchmark on an Apple M5 Max, using a reused receive buffer. That is an **in-process microbenchmark**, with queue creation and cleanup outside the timed work. It does not measure a Python worker receiving a job from a separate Rust application.

Binding overhead, process scheduling, message size and idle waiting can change application results. The documentation notes that Node.js and Go use adaptive timer backoff while idle, which can add 1–10 milliseconds plus scheduling delay before receiving new work.

Version 3 also reduces repeated operating-system notifications while readers are active. The project's .NET comparison reports 12 times faster eight-byte send-and-receive operations than v2 on the same Mac. These are project measurements; I have not independently benchmarked the library.

## Shared memory still involves copying and delivery rules

Inspecting the [Rust queue implementation](https://github.com/cloudtoid/interprocess/blob/3f6ed2a25580ba8b686a007daa02ca300d1998dc/src/rust/src/queue.rs) clarifies the performance claim. Its read and write helpers explicitly copy bytes into and out of the circular buffer, splitting the copy when a record crosses the end. Shared memory removes the broker hop; it does not make this a zero-copy payload API.

Capacity also needs an application policy. A nonblocking send can report that space is unavailable. The producer must decide whether to retry, wait within a deadline or reject the job. A receive buffer that is too small **truncates and consumes** the message, so buffer sizing affects correctness.

Most importantly, queues are **transient**. When every publisher and subscriber disconnects or exits, unread messages are lost. Recovery can also lose messages, and the queue provides neither durable acknowledgements nor exactly-once effects.

> Receiving a job is different from proving that its work finished.

For the image workers, Cloudtoid fits when jobs can be recreated and all participants stay on one machine. Work that must survive a restart needs a durable record and an explicit retry policy. If workers move onto different hosts, the shared-memory connection no longer covers that deployment.

Cloudtoid's appeal is a smaller local messaging setup: different languages can share work without operating another service. The decision starts with the job's lifetime. A disposable image-processing task and a payment instruction may both fit into a byte buffer, but they need very different delivery guarantees.

## Sources

- [Cloudtoid repository and benchmark methodology](https://github.com/cloudtoid/interprocess): language support, v3 changes and published performance results.
- [Queue concepts](https://cloudtoid.com/docs/concepts/): competing subscribers, capacity, waiting, recovery and message lifetime.
- [Protocol v3](https://cloudtoid.com/docs/protocol/): shared-memory layout and synchronization rules.
