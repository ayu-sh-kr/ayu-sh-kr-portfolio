# FastVM wakes idle microVMs on demand. How fast is it?

A development server can go quiet for hours and still need to answer the next request. Leaving its virtual machine awake keeps the workspace ready, but ties up memory. [FastVM](https://github.com/tuananh/fastvm) is a single-host sandbox runtime that pauses idle **microVMs** and wakes them when traffic arrives. The project switched from Firecracker to **Cloud Hypervisor** on November 17 and [added live CPU and memory resizing](https://github.com/tuananh/fastvm/commit/bfe710f9c6eb9a7d804bc4b3d91db8b0d8cd729b) to its development branch on November 25.

## How a sleeping FastVM sandbox answers

A microVM runs its own guest kernel. Firecracker and Cloud Hypervisor are both virtual machine monitors: they provide the virtual devices and use Linux KVM to run the guest. **FastVM manages the lifecycle around that monitor**. It can pull a container image and use its filesystem to build a bootable disk for a VM.

When the sandbox goes quiet, FastVM can first **pause its virtual CPUs** while keeping guest RAM resident. In deeper sleep, it saves a snapshot and restores a paused VM backed by a memory file. The host can reclaim cached pages under pressure, and the guest reads them back as needed. In the [wake path](https://github.com/tuananh/fastvm/blob/a9624faae524c82ca0824753690439e198ff7182/internal/daemon/daemon.go), the virtual network queue remains available for incoming traffic. A packet signals the daemon to resume the guest, which can then consume the queued traffic.

The [switch to Cloud Hypervisor](https://github.com/tuananh/fastvm/blob/a9624faae524c82ca0824753690439e198ff7182/docs/CLOUD_HYPERVISOR_MIGRATION.md) made it possible to mount host directories directly into the guest with **virtio-fs**. The newer resize support lets a running sandbox grow within ceilings set at creation. Both are practical additions for a development workspace; neither establishes a faster boot.

## FastVM vs. Firecracker: what the numbers measure

| System | Start and end of the measurement | Published figure |
| --- | --- | ---: |
| FastVM with Cloud Hypervisor v54.0 | Cold boot to guest agent ready on the maintainer’s reference host | **About 600 ms**, measured |
| Firecracker project specification | Start API call to the guest reaching `/sbin/init`, using a minimal guest | **≤125 ms**, specification |
| NumaVM on Firecracker v1.14.2 | Cold provision through working SSH | **1,133 ms**, measured |
| NumaVM on Firecracker v1.14.2 | Restore a prepared snapshot through working SSH | **176 ms**, measured |

The [FastVM migration note](https://github.com/tuananh/fastvm/blob/a9624faae524c82ca0824753690439e198ff7182/docs/CLOUD_HYPERVISOR_MIGRATION.md) reports the 600 ms figure without a distribution. [NumaVM’s five-run test](https://numavm.com/blog/2026-03-10-1-second-boot/) used an Alpine guest with two vCPUs and 256 MiB on AWS Graviton. On **that same Firecracker setup**, restoring instead of cold booting cut time to SSH by **about 85%**. The [Firecracker specification](https://github.com/firecracker-microvm/firecracker/blob/main/SPECIFICATION.md) stops earlier, before an app can serve a request. None of these figures gives a same-host FastVM-versus-Firecracker speedup.

> FastVM’s design lists **p95 wake targets** of 250 ms from pause and 500 ms from deeper sleep with a 512 MB guest and warm cache. The project says its wake timings need to be remeasured after the backend switch. Those numbers are goals, not results for the current build.

## Where the improvement would show up

Firecracker can also [restore guest memory on demand](https://github.com/firecracker-microvm/firecracker/blob/main/docs/snapshotting/snapshot-support.md). FastVM’s contribution is connecting that kind of lifecycle to idle detection and incoming traffic, so the service does not need to manage its own sleep and wake.

For an idle dev server, the useful trade-off is **memory reclaimed while it sleeps** versus **how long the first request waits**. Compare both runtimes on the same host with the same guest resources and service. Measure host memory and time to first byte from awake, paused and disk-backed states, with both warm and cold page caches. That’s the benchmark that would show what FastVM buys you. For now, the project is experimental and intended for disposable test environments.

## Sources

- [FastVM design targets and measurement plan](https://github.com/tuananh/fastvm/blob/a9624faae524c82ca0824753690439e198ff7182/docs/DESIGN.md#8-success-metrics-v01-targets)
- [FastVM lifecycle and current limitations](https://github.com/tuananh/fastvm/blob/a9624faae524c82ca0824753690439e198ff7182/docs/LIMITATIONS.md)
- Related: [How Firecracker fits into agent sandbox hosting](/news/ai-agent-cloud-hosting-costs/) and [what end-to-end sandbox benchmarks measure](/news/ai-sandbox-bench-regions-provider-comparison/).
