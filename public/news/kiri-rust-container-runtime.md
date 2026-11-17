# Kiri puts a Rust runtime behind familiar Docker commands

Running a container usually starts with a familiar Docker command. **Kiri changes the engine that answers it.** The Rust project runs Docker images and supports the Docker Engine API, so CLI commands, Compose projects and buildx workflows can connect to its runtime.

The [Apache-2.0 project](https://github.com/libracoder/kiri) offers an alternative to Docker Desktop and OrbStack on macOS, Windows and Linux. Its first launch creates a `kiri` Docker context, which tells your tools where to send requests. Its approach is to rebuild container startup behind an established interface.

## Reworking the path beneath Docker commands

A fresh implementation gives Kiri room to choose a different process layout. Its [architecture](https://github.com/libracoder/kiri/blob/main/docs/development.md#architecture) brings container creation into a small Rust guest agent, leaving out dockerd, runc and per-container shims. Those choices shorten the machinery a request passes through.

On macOS, the host daemon manages a Linux virtual machine and forwards requests through **vsock**, a communication channel between host and guest. Inside, the agent uses Linux’s `clone3` call to create a process with namespaces for isolation and a cgroup for resource control. The project describes a roughly 900 KB agent and a custom 10 MB kernel.

![Animated isometric macOS architecture: Docker tools reach the Kiri host daemon, a vsock request crosses into the Linux VM, and its guest agent starts isolated container processes.](/news/assets/kiri-rust-container-runtime/runtime.svg)

Linux runs the engine directly on its kernel, while Windows uses WSL2. Existing Docker tools supply the requests; Kiri supplies its own implementation underneath.

## The speed reported by Kiri

Kiri’s README reports **2.55 ms versus Docker Desktop’s 213 ms** for an Alpine container running `true` and being removed through the Docker API—the basis of its roughly **80×** figure. These are medians from 30 runs.

The project’s separate [November 2 benchmark](https://runkiri.com/benchmarks/) records the following medians with images already present:

| Container lifecycle | Kiri | Docker Desktop |
| --- | --- | --- |
| Through the Docker API | 3.1 ms | 163 ms |
| Through `docker run --rm alpine true` | 22 ms | 178 ms |

That run used an M3 Max on macOS 27.0.1, Kiri 0.1.13 and Docker Desktop 4.90.0, each allocated two CPUs and 8 GB, with 30 samples after three warmups.

For repeated container creation in local development, that is the work Kiri aims to shorten. Its beta brings a different runtime design to an established workflow: the command stays familiar, while the path from that command to a container is rebuilt.
