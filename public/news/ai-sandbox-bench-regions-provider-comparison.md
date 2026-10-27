# AI Sandbox Bench adds regional tests: how to read the provider results

A cloud sandbox can start quickly and still feel slow to an agent issuing dozens of commands. Each remote read, edit or test adds another round trip, so the caller’s location can change the experience even when the virtual machine is unchanged.

That is the useful addition in **AI Sandbox Bench’s latest update**, announced by Leo, who publishes as `@leodev`. Alongside Boat and Upstash Ephemeral Box, the benchmark now includes calls from Florida and Frankfurt. It compares both the waiting time to start an environment and the work an agent performs after it is ready.

## A benchmark of the agent’s execution environment

[Sandbox Bench](https://aisandboxbench.com/) evaluates cloud services that give agents a remote workspace for commands, files and application processes. It does not measure whether a language model writes correct code. It measures parts of the infrastructure that carries out the model’s requested actions.

The published October 22–26 dataset covers **eight providers and nine configurations**, because Upstash Box and Ephemeral Box are treated as separate products. The benchmark includes cold starts, snapshots, pause and resume, file operations, package installation, development-server readiness and a replay of **100 sequential tool calls**.

That replay writes, reads, edits, lists, searches and runs a test. It is useful for estimating accumulated execution overhead without adding differences in model reasoning to the measurement. It cannot establish how often an agent completes a real software task successfully.

The [site repository](https://github.com/opencoredev/sandbox-bench) belongs to OpenCore and is **MIT-licensed**. Its README links the measurement pipeline to the separate Sandbox SDK project. The website’s license does not make the compared providers free or give them identical terms.

## Two machine tracks answer different questions

The benchmark separates **“same machine”** from **“default machines.”** The former requests four virtual CPUs and 8 GB of memory; the latter uses what each service gives a caller without an explicit size selection.

These comparisons serve different needs. Equal requested resources help compare platforms for a planned deployment. Defaults show the experience a developer first encounters, but a default with less memory is not an equivalent machine.

Exceptions are identified in the results. For example, boxd runs the same-machine track with 16 GB because it lacks an 8 GB option at four CPUs. The default E2B template used in the benchmark has two CPUs and 512 MB. Those details can affect both timing and the workload that fits.

The methodology reports 100 runs for quick tests and 30 for agent or snapshot tests, with per-chart attempt counts. It records medians and uncertainty intervals, treating overlapping intervals as tied. Numbers at the top of a chart should therefore be read alongside the configuration and distribution beneath them.

## Caller location can move the result

The location comparison reruns network-sensitive operations from **Florida, US-East, and Frankfurt, EU-Central**. These labels describe the caller, not a guarantee that every provider’s sandbox is hosted in that region.

For example, the published regional data gives Boat, whose sandbox is in northern France, these median timings:

| Operation | Caller in Frankfurt | Caller in Florida |
| --- | ---: | ---: |
| Cold start | 0.78 s | 1.1 s |
| Run a command | 0.11 s | 0.33 s |
| 100-call agent replay | 23 s | 43 s |

The comparison does not prove that geography explains every millisecond. It does show why an agent’s many small operations deserve testing from its actual application region. The larger accumulated difference is more relevant to an editing session than an isolated startup score.

The site also reports in-sandbox CPU, memory and disk tests separately. Caller distance affects the request path; it does not turn the remote CPU into a different processor.

## Cost and failure accounting need their own reading

The cost test runs one task per sandbox and uses provider charges where available, otherwise usage records or measured time at list prices. It excludes credits, tax and plan minimums. A low cost per 1,000 benchmark tasks is therefore a workload estimate rather than an invoice forecast for a complete application.

Failure counts exclude errors attributed to the benchmark’s own setup and some ambiguous SDK timeouts. The methodology lists these exclusions and quota changes, including provider account limits raised before reruns. “Zero failures” in a chart is consequently a result under those counting rules, rather than a reliability guarantee.

The author states that providers did not pay for or decide the tests, while noting that some reviewed early results for mistakes and that future commercial relationships are possible. [Superserve’s public response](https://x.com/superserve_ai) highlights its favorable measurements; it is a provider’s reaction, not outside validation of the entire suite.

## Using it to narrow a sandbox decision

The value of the update is the ability to compare several stages of an agent workflow. Choose the resource track, inspect the caller region and identify the operations your application repeats. Then rerun that workload before committing to a platform.

For local execution, [Microsoft Quicksand](/news/microsoft-quicksand-qemu-agent-sandboxes/) offers a different operating model: developer-controlled VMs rather than a remote service. For hosted systems, [Perplexity SPACE](/news/perplexity-space-firecracker-agent-sandboxes/) shows why permissions, routing and credentials also matter beyond execution speed.

Sandbox Bench helps answer how long the infrastructure takes under documented conditions. A deployment decision also needs to answer whether that infrastructure has the controls, capacity and operating model the application requires.

Sources: [live results and methodology](https://aisandboxbench.com/), [MIT-licensed site repository](https://github.com/opencoredev/sandbox-bench), [same-machine allocation data](https://github.com/opencoredev/sandbox-bench/blob/main/src/data/benchmark.same-spec.json), [Leo’s announcements](https://x.com/leodev), and [Superserve’s response](https://x.com/superserve_ai).
