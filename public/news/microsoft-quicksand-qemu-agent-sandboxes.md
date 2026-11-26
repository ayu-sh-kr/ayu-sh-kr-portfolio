# Microsoft Quicksand adds host connections to reversible agent VMs

**Microsoft’s Quicksand lets AI agents run commands inside disposable Linux virtual machines and return them to an earlier state.** Its October 14 update adds bidirectional port forwarding, allowing a guest to reach selected services on the host as well as exposing services in the other direction.

That extends the kind of experiment an agent can perform locally. A dependency upgrade, for example, can run inside a prepared VM while connecting to a development API outside it. The same connection also establishes an important limit: restoring the VM cannot undo changes already made to that external service.

## A complete Linux environment behind a Python API

Quicksand uses **QEMU** to run guests with their own Linux kernel, filesystem and package manager. An asynchronous Python API exposes commands, file exchange, checkpoints and saved environments, leaving the surrounding application to decide what the agent should do.

Ubuntu and Alpine images support headless work. Desktop variants add screenshots, keyboard input and mouse control for computer-use tasks. The project documents host support for macOS, Linux and Windows, subject to its supported architecture combinations.

The setup requires neither Docker nor host root privileges, although the QEMU runtime and guest-image packages remain dependencies. The separate guest kernel is central to the design: Quicksand provides a VM boundary around the work an agent executes.

## Returning to a known state

A **checkpoint** captures RAM and disk state, allowing a failed experiment to be reverted. A persistent save retains a prepared disk environment for a later session. These mechanisms make it possible to start several attempts from a consistent baseline.

Copy-on-write overlays record changes above a shared base image. Multiple sandboxes can therefore start from that image without each storing a complete independent copy; their memory allocations remain separate.

The networking update, released as `quick-sandbox` 0.13.0 with `quicksand-core` 0.14.0, adds explicitly configured connections to host-side databases, proxies or APIs. This makes local integration testing more flexible, but rollback remains confined to the guest. External writes need their own cleanup or disposable test data.

## Fast startup depends on the host

Quicksand’s performance guide reports these results from **five runs on an Apple M3 Max with hardware virtualization**:

| Guest | Median boot | 95th-percentile boot |
| --- | ---: | ---: |
| Alpine | 0.37 s | 0.45 s |
| Ubuntu | 0.88 s | 0.91 s |

The measurement ends when the guest agent has connected and mounts are configured. It excludes image downloads and application dependency installation.

Those conditions matter because Quicksand can use Linux KVM, macOS HVF or Windows WHPX for acceleration. Software emulation is a much slower fallback; a CI environment without virtualization access will not necessarily resemble the published laptop results.

The guide also gives typical checkpoint and revert times of around one to two seconds. These figures describe the lifecycle of the local VM, whereas the [Sandbox Bench results](/news/ai-sandbox-bench-regions-provider-comparison/) examine remote services and their network overhead.

## Making experiments repeatable

Quicksand is available as **`quick-sandbox`**, with MIT-licensed project code and separate terms for bundled runtimes and guest packages.

Its value lies in combining execution and recovery through one interface. An agent can attempt a change, inspect the result and return to a known state. The new host connections make those experiments more representative of real applications, while making the boundary of that recovery more important to understand.

Sources: [Microsoft Quicksand](https://github.com/microsoft/quicksand), [release history](https://github.com/microsoft/quicksand/blob/main/CHANGELOG.md), [performance guide](https://github.com/microsoft/quicksand/blob/main/docs/user-guide/08-performance.md), [installation requirements](https://github.com/microsoft/quicksand/blob/main/docs/user-guide/01-installation.md), and [New Runtime’s update coverage](https://newruntime.com/posts/microsoft-quicksand-core-0-14-0-adds-bidirectional-08d1ef/).
