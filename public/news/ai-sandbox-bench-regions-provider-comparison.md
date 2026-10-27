# AI Sandbox Bench shows how regional latency adds up in agent workflows

A sandbox that boots in under a second can still leave an agent waiting through a long sequence of commands. **AI Sandbox Bench’s regional update makes that accumulated delay visible**, adding calls from Florida and Frankfurt alongside Boat and Upstash Ephemeral Box.

Announced by Leo, who publishes as `@leodev`, the update broadens the comparison from startup speed to the execution path an agent repeatedly uses: reading files, editing code, running commands and checking results.

## Measuring the work after startup

The October 22–26 dataset covers **eight providers and nine configurations**, with Upstash Box and Ephemeral Box treated separately. Tests include cold starts, snapshots, pause and resume, file operations, package installation and development-server readiness.

A replay of **100 sequential tool calls** ties several operations together. It writes, reads, edits, lists, searches and runs a test, measuring execution overhead without introducing differences in a model’s reasoning.

That separation gives the results a clear scope. They describe how quickly infrastructure carries out a sequence of actions, rather than how often an AI agent solves a real coding task.

## Distance becomes more visible across repeated calls

The new regional results compare callers in **Florida and Frankfurt**. These are the locations making the requests, not a statement that every provider hosts its sandbox in both regions.

Boat, whose sandbox is in northern France, provides one example:

| Operation | Frankfurt caller | Florida caller |
| --- | ---: | ---: |
| Median cold start | 0.78 s | 1.1 s |
| Median command execution | 0.11 s | 0.33 s |
| Median 100-call replay | 23 s | 43 s |

The difference is modest when viewed as a single startup, but considerably larger over the replay. Geography does not necessarily explain every millisecond; the result nevertheless shows why a sequence of small remote operations can feel slow even when the underlying machine starts quickly.

CPU, memory and disk tests run inside the sandbox are reported separately, helping distinguish machine performance from the request path leading to it.

## A comparison still needs comparable conditions

Sandbox Bench separates a **same-machine track**, requesting four virtual CPUs and 8 GB of memory, from a **default-machine track**, using each provider’s initial allocation. The first aims to compare similar resources; the second captures what a new caller receives without specifying a size.

Even the same-machine track has exceptions. Boxd uses 16 GB because it lacks an 8 GB option at four CPUs. These differences are recorded alongside the results and can affect both performance and cost.

The methodology reports 100 runs for quick tests and 30 for agent or snapshot tests, with per-chart counts and uncertainty intervals. Overlapping intervals are treated as ties, avoiding a precise ranking where the measurements do not support one.

Cost estimates exclude credits, tax and plan minimums. Failure counts also follow published exclusions, including benchmark setup errors and some ambiguous SDK timeouts. Both measures therefore need to be read within the test’s stated conditions.

## A fuller picture of execution time

The site repository is MIT-licensed, and the author states that providers did not pay for or determine the tests, although some reviewed early results for errors.

The update’s main contribution is the connection between individual operations and a complete execution sequence. Alongside [local approaches such as Quicksand](/news/microsoft-quicksand-qemu-agent-sandboxes/), it helps explain where an agent spends time once it starts acting. For remote sandboxes, startup is only the beginning; the distance and frequency of subsequent calls can shape much of the wait.

Sources: [live results and methodology](https://aisandboxbench.com/), [MIT-licensed site repository](https://github.com/opencoredev/sandbox-bench), [same-machine allocation data](https://github.com/opencoredev/sandbox-bench/blob/main/src/data/benchmark.same-spec.json), [Leo’s announcements](https://x.com/leodev), and [Superserve’s response](https://x.com/superserve_ai).
