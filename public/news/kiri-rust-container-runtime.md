# Kiri puts a Rust runtime behind familiar Docker commands

You can change what runs your containers without changing every command used to start them. **Kiri** is a Rust alternative to Docker Desktop and OrbStack that accepts the Docker Engine API, letting familiar CLI commands, Compose projects and buildx workflows connect to a different engine.

The [Apache-2.0 project](https://github.com/libracoder/kiri) sets up a `kiri` Docker context on first launch. Its appeal is a shorter path from a request to a running container, though the widely shared **80× claim needs its benchmark attached**.

## What changes beneath the command

On macOS, [Kiri runs a small Linux virtual machine](https://github.com/libracoder/kiri/blob/main/docs/development.md#architecture). The host daemon communicates over **vsock**, a host-to-VM channel, with a Rust guest agent. That agent starts container processes using Linux’s `clone3` system call, namespaces for isolation and cgroups for resource control. It avoids the usual dockerd, runc and per-container shim chain.

![Isometric Kiri architecture: Docker tools send requests to the host daemon, a vsock connection reaches the Linux guest agent, and that agent starts containers within the VM.](/news/assets/kiri-rust-container-runtime/runtime.svg)

Linux runs the engine directly on its own kernel; Windows uses WSL2. The compatibility layer preserves the developer-facing commands while the operating-system work underneath changes.

## Where the speedup comes from

The README compares **2.55 ms with Docker Desktop’s 213 ms** for a container lifecycle through the API, supporting its roughly 80× figure. Its CLI measurements are different.

The separate [November 2 benchmark](https://runkiri.com/benchmarks/) reports these medians:

| Path | Kiri | Docker Desktop |
| --- | --- | --- |
| `docker run --rm alpine true` | 22 ms | 178 ms |
| Lifecycle through the Docker API | 3.1 ms | 163 ms |

That test used an **M3 Max, macOS 27.0.1**, Kiri 0.1.13 and Docker Desktop 4.90.0, with each engine limited to two CPUs and 8 GB. Images were warm, with 30 timed samples after three warmups. These are the project’s measurements; they do not measure application readiness or an initial image download. The same report shows competitors ahead on some file and network workloads.

Kiri remains **beta**. The useful next step is trying an existing Compose project and checking its mounts, networking and builds. Faster container creation can shorten repeated development tasks, but the application still has its own work to do after the process starts.
