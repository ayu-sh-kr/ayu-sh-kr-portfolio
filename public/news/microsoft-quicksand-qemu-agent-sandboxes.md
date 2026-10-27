# Microsoft Quicksand gives AI agents local Linux VMs and rollback

An agent testing a dependency upgrade may need to install packages, change configuration and run commands. Giving it a disposable environment is useful; being able to return that environment to a known state makes the experiment easier to repeat.

Microsoft’s **Quicksand** supplies that environment through a Python API. It launches full Linux virtual machines using QEMU, runs commands inside them and supports checkpoints, saved environments and desktop control. The project is already available, with its October 14 update adding connections from guests back to selected host services.

## A Python-controlled VM rather than another agent framework

[Quicksand](https://github.com/microsoft/quicksand) is infrastructure for an agent’s actions. It does not choose a model or decide which commands to run. Your application creates a sandbox, gives it work, reads the result and determines what comes next.

The guest has its own **Linux kernel**, filesystem and package manager. QEMU provides the virtual machine; Quicksand packages the images and exposes operations such as command execution, file exchange and rollback through asynchronous Python calls. That allows an orchestrator to manage multiple environments without blocking on every operation.

Ubuntu and Alpine images are available for headless work. Desktop variants add a graphical environment with screenshots, keyboard and mouse input, making them relevant to computer-use agents as well as coding tools. The documented host platforms are macOS, Linux and Windows, with supported architecture combinations described in the installation guide.

Running a sandbox requires neither Docker nor host root privileges. The QEMU runtime and guest-image packages are still required, so this is a packaged virtualization setup rather than an environment with no dependencies.

## Checkpoint an experiment before changing its environment

For the dependency upgrade, you can prepare a working application, record a **checkpoint**, then let the agent attempt the change. If installation or configuration fails, reverting restores the guest’s RAM and disk state. A persistent save serves a different purpose: retaining a prepared disk environment for a later session.

Quicksand uses copy-on-write disk overlays, which record changes above a shared base image. Several sandboxes can therefore begin with the same image without each needing a separate full copy of it. Their RAM allocations remain separate.

The [October 14 release](https://github.com/microsoft/quicksand/blob/main/CHANGELOG.md), `quick-sandbox` 0.13.0 with `quicksand-core` 0.14.0, adds **bidirectional port forwarding**. A guest can reach a host-side proxy, database or API through an explicitly configured connection. [New Runtime’s October 23 coverage](https://newruntime.com/posts/microsoft-quicksand-core-0-14-0-adds-bidirectional-08d1ef/) focuses on this addition; it is an update to the existing project, rather than its first release.

That connection is useful when testing against a local development service. It also marks a boundary for rollback: reverting the VM cannot reverse an operation already committed to an external database. Experiments that write outside the guest still need disposable external state or application-level cleanup.

## The published startup numbers depend on acceleration

Quicksand’s [performance guide](https://github.com/microsoft/quicksand/blob/main/docs/user-guide/08-performance.md) reports these boot measurements from **five runs on an Apple M3 Max using macOS hardware virtualization**:

| Guest image | Median boot | 95th-percentile boot |
| --- | ---: | ---: |
| Alpine | 0.37 s | 0.45 s |
| Ubuntu | 0.88 s | 0.91 s |

Boot is measured from starting the sandbox until its agent has connected and mounts are configured. These project measurements do not include downloading images or installing the application’s dependencies, and they are not cross-platform guarantees.

The host’s virtualization support is especially important. Quicksand can use Linux KVM, macOS HVF or Windows WHPX; its documentation describes software emulation through QEMU’s TCG as a much slower fallback. A CI container without access to virtualization should not be expected to match the laptop results.

The guide lists typical checkpoint and revert times of around one to two seconds, with memory determined by the configured guest allocation plus QEMU overhead. Those figures help estimate an experiment’s lifecycle, but need measuring on the actual host.

## Choosing between local VMs, containers and hosted sandboxes

Containers remain an alternative for reproducible builds and tests, especially where existing tooling assumes Docker. Their usual isolation model shares a kernel with the host environment; Quicksand runs a separate guest kernel.

Firecracker-based systems emphasize lightweight Linux microVMs and cloud-scale execution. The [Perplexity SPACE article](/news/perplexity-space-firecracker-agent-sandboxes/) shows the scheduling, networking and credential services needed around such a runtime. Quicksand’s immediate focus is the developer controlling a VM through Python, not supplying that complete hosted platform.

Managed sandbox providers are another option when remote capacity, preview URLs and service operations matter more than local control. The [Sandbox Bench comparison](/news/ai-sandbox-bench-regions-provider-comparison/) examines some of those lifecycle measurements.

**Quicksand’s code is MIT-licensed**; bundled runtimes, guest distributions and their packages retain their own licenses. The project can be installed now as `quick-sandbox`.

For the upgrade experiment, its value is concrete: start from a prepared environment, observe the change and recover the guest state when needed. The VM makes that loop repeatable. The access you grant to files and external services determines how much of the experiment remains inside it.

Sources: [Microsoft Quicksand](https://github.com/microsoft/quicksand), [release history](https://github.com/microsoft/quicksand/blob/main/CHANGELOG.md), [performance guide](https://github.com/microsoft/quicksand/blob/main/docs/user-guide/08-performance.md), [installation requirements](https://github.com/microsoft/quicksand/blob/main/docs/user-guide/01-installation.md), and [New Runtime’s update coverage](https://newruntime.com/posts/microsoft-quicksand-core-0-14-0-adds-bidirectional-08d1ef/).
