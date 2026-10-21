# Cloudtoid Interprocess: shared-memory IPC across languages

A Rust service hands image-processing jobs to Python workers on the same computer. Sending those jobs through a message broker means running another service for a local handoff. **Cloudtoid Interprocess** offers a shorter route: a queue in memory that both programs can access.

The open-source, MIT-licensed library connects Rust, C/C++, Python, Node.js, Go and .NET through its **v3 protocol**. It supports Windows, Linux and macOS within the project's supported 64-bit environments. Its appeal is practical: separate programs can share work without deploying a broker. Understanding where it fits starts with the boundary between those programs.

## Inside one process: threads share memory

A **process** is a running program with its own address space: the memory it can access. **Threads** are execution paths within that process. They share its memory, so a producer thread can put a job into a local queue and a consumer thread can take it out. Access still needs coordination so the threads do not overwrite or read unfinished work.

In this first illustration, one process contains the whole image-processing pipeline. The producer prepares a job, the queue holds it until the consumer takes it, and the consumer writes a thumbnail. The cutaway shell marks their shared address space; the slots show storage being reused.

![Isometric cutaway of one process containing a producer thread, reusable local queue and consumer thread, with an image-processing job entering and a thumbnail leaving.](/news/assets/cloudtoid-interprocess-shared-memory-ipc/intraprocess.svg)

This is a conceptual threaded example, rather than a drawing of Cloudtoid's benchmark harness. The distinction matters because doing work inside one process and handing it to a separate program involve different costs.

## Between processes: Cloudtoid shares a specific region

The Rust service and Python workers are separate processes. Their private memory is separate too: a Rust pointer cannot simply become a usable Python reference. **Interprocess communication**, or IPC, provides a way to exchange information across that boundary.

Cloudtoid maps a common memory region into the participating processes. Each opens the same queue name and capacity. On Unix, they must also agree on the backing directory; an explicit absolute path avoids differences between language runtimes' temporary directories.

The second illustration keeps private memory on separate platforms. Solid arrows follow the job bytes; dashed links identify access to the same shared mapping. Rust encodes an image path and resize operation, copies those bytes into the queue, and publishes the message. Python copies a received message into its own buffer, interprets the job and creates the thumbnail.

![Isometric view of separate Rust and Python processes with private buffers, both mapping one shared circular queue. Job bytes are copied into the queue and out to the worker, which produces a thumbnail.](/news/assets/cloudtoid-interprocess-shared-memory-ipc/interprocess.svg)

Both sides must agree on a format, such as JSON. Cloudtoid transports **bytes**, without supplying a serializer. Rust provides the native engine behind the C, Python, Node.js and Go interfaces; .NET separately implements the same queue protocol.

## How the queue hands work to a receiver

The buffer is circular: consumed storage becomes reusable, and physical positions wrap around at its end. The [v3 protocol](https://cloudtoid.com/docs/protocol/) distinguishes reserving space from publishing a finished record. A publisher atomically reserves a range, writes the payload and marks it ready. A receiver claims a ready record, copies it out and releases the consumed space.

Subscribers **compete for work**. During ordinary operation, one Python worker takes each image job; the queue does not deliver a copy to every worker. Broadcasting requires separate queues. Atomic publisher reservations also do not make the complete queue formally lock-free: consumption is serialized, and a paused live owner can block progress.

The fixed capacity limits memory use, but it also means a send can report that space is unavailable. The application needs a retry deadline, waiting strategy or rejection policy. Receive-buffer sizing matters too: the documented native receive path **truncates and consumes** a message when the buffer is too small.

## What the 13 ns benchmark measures

Cloudtoid reports **12.98 nanoseconds** for a Rust send plus receive of a three-byte message on an Apple M5 Max, using reused receive storage. This is an **in-process microbenchmark**, with queue creation and cleanup outside the timed work. It does not measure the Rust-to-Python handoff illustrated above.

Version 3 also groups notifications to reduce repeated operating-system calls while readers are active. The project's .NET comparison reports an eight-byte send-and-receive time of 17.82 ns for v3 against 214.6 ns for v2 on the same Mac. These are project measurements, not independently reproduced results.

Message size, binding overhead, scheduling and idle waiting all affect application performance. The documentation notes that Node.js and Go use adaptive timer backoff while idle, which can add 1–10 milliseconds plus scheduling delay. A small queue-operation measurement therefore cannot predict every application's response time.

## The job still needs a lifetime and recovery policy

The [Rust queue's copy helpers](https://github.com/cloudtoid/interprocess/blob/3f6ed2a25580ba8b686a007daa02ca300d1998dc/src/rust/src/queue.rs) explicitly copy payloads into and out of the circular buffer. The shared-memory route removes the broker hop while retaining those copies.

The queue is also **transient**. Once every publisher and subscriber disconnects or exits, unread messages are lost. Recovery can lose messages too. There are no durable acknowledgements or exactly-once effects built into that handoff.

> Receiving a job is different from proving that its work finished.

For the image workers, Cloudtoid fits when all participants stay on one machine and jobs can be recreated or tracked elsewhere. Work that must survive a restart needs a durable record and an explicit retry policy. The useful gain is a smaller local messaging setup, with the application's delivery requirements deciding whether that is enough.

## Sources

- [Cloudtoid repository and benchmark methodology](https://github.com/cloudtoid/interprocess): supported languages, v3 changes and project measurements from September 2026.
- [Queue concepts](https://cloudtoid.com/docs/concepts/): capacity, competing subscribers, waiting and message lifetime.
- [Protocol v3](https://cloudtoid.com/docs/protocol/): shared-memory layout, publication, consumption and recovery rules.
