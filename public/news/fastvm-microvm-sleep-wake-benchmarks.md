# FastVM wakes idle microVMs on demand. How fast is it?

You open a preview link after lunch. The development server hasn’t seen a request in hours, but the process you left running still knows what it was doing. Keeping a VM awake buys that continuity at the cost of host memory. [FastVM](https://github.com/tuananh/fastvm) tries a third option: let the VM sleep and make the next request wake it. The question is how much memory the host gets back and how long that request has to wait.

FastVM is an experimental sandbox manager for a single Linux host. In November it [switched from Firecracker to Cloud Hypervisor](https://github.com/tuananh/fastvm/commit/a6f516a9b057a510fc18e1e084566673e63b139f). Both run lightweight VMs with their own Linux kernel on top of KVM. The switch changed which devices FastVM can offer a workspace, without changing the idea behind wake-on-request.

## What happens when a request arrives?

FastVM can turn the filesystem from a container image into a bootable guest disk. When that guest goes idle, its daemon first pauses the virtual CPUs while leaving RAM resident. If it goes into **deeper sleep**, FastVM saves a snapshot and reopens it with guest memory backed by a file. The host can then reclaim cached pages under memory pressure.

![FastVM sleep and wake: an inbound packet waits in the virtual network queue, the daemon tells Cloud Hypervisor to resume the Linux guest, and the guest reads needed memory pages from the snapshot.](/news/assets/fastvm-microvm-sleep-wake-benchmarks/sleep-wake-architecture.svg)

The virtual network queue stays available. An incoming packet both enters that path and [signals the daemon](https://github.com/tuananh/fastvm/blob/a9624faae524c82ca0824753690439e198ff7182/internal/daemon/daemon.go) to resume the guest. The server can pick up where it left off; if the pages it needs aren’t cached, fetching them adds to the first request’s wait.

## Why switch from Firecracker?

The [migration notes](https://github.com/tuananh/fastvm/blob/a9624faae524c82ca0824753690439e198ff7182/docs/CLOUD_HYPERVISOR_MIGRATION.md) point to **host directory sharing**. Cloud Hypervisor’s virtio-fs device lets the guest mount a directory from the host, so a preview server can see local project files without copying them into its image. The November 25 development build [added live CPU and memory resizing](https://github.com/tuananh/fastvm/commit/bfe710f9c6eb9a7d804bc4b3d91db8b0d8cd729b) within limits set at creation. Those are workspace features. Whether the switch makes the machine faster is a separate question.

## Firecracker vs. Cloud Hypervisor: measured side by side

| Test | Firecracker | Cloud Hypervisor |
| --- | ---: | ---: |
| AWS, NSDI 2020: VM boot with 50 launches in parallel, p99 | **146 ms** (preconfigured) | 158 ms |
| OpenSandbox: Kata sandbox creation on a non-nested KVM host, p50 | **560 ms** | 829 ms |
| OpenSandbox: Kata sandbox creation in a resource-constrained nested VM, p50 | 5,462 ms | **1,335 ms** |

In [AWS’s historical boot test](https://www.usenix.org/conference/nsdi20/presentation/agache), preconfigured Firecracker’s tail latency was **12 ms lower**. In [OpenSandbox’s 20-create Kata tests](https://github.com/opensandbox-group/fast-sandbox/blob/main/docs/guides/performance.md), Firecracker took **about 32% less time** on the non-nested host. On the nested setup, Cloud Hypervisor took **about 76% less time**; Firecracker spent much more time setting up its block-backed storage. Those are results for the tested stacks, and the Kata tests stopped at sandbox creation rather than application readiness.

> FastVM separately reports **about 600 ms from cold boot to guest-agent ready** with Cloud Hypervisor v54.0. Its published wake targets predate the backend change and are awaiting remeasurement. The head-to-head tests above didn’t measure FastVM’s wake-on-request path.

## What the preview link has to wait for

Firecracker can [load snapshot pages on demand](https://github.com/firecracker-microvm/firecracker/blob/main/docs/snapshotting/snapshot-support.md), too. FastVM’s idea is to make the preview link trigger that lifecycle automatically. To tell whether it pays off, compare **host memory at idle** and **time to first byte after sleep**, with the same service and both warm and cold page caches. Until those results are published, the practical reason to try FastVM in a disposable environment is a workspace that can sleep without having to restart its server on the next visit.

## Sources

- [FastVM lifecycle and limitations](https://github.com/tuananh/fastvm/blob/a9624faae524c82ca0824753690439e198ff7182/docs/LIMITATIONS.md)
- [AWS’s Firecracker paper and benchmark data](https://github.com/firecracker-microvm/nsdi2020-data)
- Related: [Firecracker in agent sandbox hosting](/news/ai-agent-cloud-hosting-costs/) and [how to read end-to-end sandbox benchmarks](/news/ai-sandbox-bench-regions-provider-comparison/).
