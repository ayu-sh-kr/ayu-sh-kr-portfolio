# AI Sandbox Bench: comparing the infrastructure behind agent sandboxes

Agent sandboxes have been appearing across the AI stack, each addressing a different part of the same problem: **how do we let an agent work without giving it unrestricted access to everything around it?**

[AWS Strands Box](/news/aws-strands-box-ai-agent-sandbox/) applies policies to actions in a local environment. [Perplexity SPACE](/news/perplexity-space-firecracker-agent-sandboxes/) runs tasks in isolated microVMs with controls around credentials and network access. [Docker Sandbox Kit and AWS Lambda MicroVMs](/news/docker-sandbox-kit-aws-lambda-microvms-agent-coding/) approach the problem through portable permissions and isolated execution.

With more options, the next question is how they behave during actual work. **AI Sandbox Bench** compares cloud sandbox providers on startup, file and command operations, and a simulated agent workflow. Its recent update adds Boat and Upstash Ephemeral Box, along with measurements from Florida and Frankfurt.

## Why agents need boundaries

A coding agent may read a repository, edit files, install dependencies and run commands while trying to fix a bug. A mistake or a malicious instruction could turn those capabilities against the workspace. A sandbox gives the work a defined environment; policies determine which files, tools and network destinations it can reach.

The concern extends beyond an agent making a bad edit. In the [ZCode workspace-upload incident](/news/zcode-user-code-upload-key/), a researcher reported that Z.ai’s coding tool had staged a project archive, including Git history, for upload. Z.ai apologized and described the behavior as a bug. It was **ZCode**, not OpenCode.

A network policy can restrict outbound transfers, but only if the process making the request is actually inside the enforced boundary. An isolated workspace with unrestricted network access or exposed credentials can still send data out.

These projects do not all provide the same product. Strands Box is a local policy-controlled environment; SPACE is infrastructure Perplexity built for its own agent service; cloud sandbox providers supply remote execution environments. **Sandbox Bench measures the latter**, not all of these systems head to head.

## What matters once an agent starts working

The security boundary is only one part of a sandbox’s usefulness. An agent also needs a workspace it can start, inspect and change without spending most of its time waiting for infrastructure.

A typical coding task may start an environment, read and edit files, search the repository, run tests and contact a package registry or API. Startup time affects the first step; repeated tool calls and network round trips affect everything that follows. Snapshots and pause/resume matter when work spans sessions or needs to be recovered.

Sandbox Bench’s October 22–26 dataset covers **eight providers and nine configurations**, counting Upstash Box and Ephemeral Box separately. It measures cold starts, snapshots, pause/resume, file operations, package installation and development-server readiness. A **100-call replay** combines writes, reads, edits, directory listings, searches and a test into a sequential workload.

That replay exposes the accumulated cost of ordinary operations without mixing in model reasoning. It does not show whether an agent would solve the task correctly, nor does the benchmark establish how well a provider enforces security policies.

## Regional results show how the wait adds up

The update includes callers in **Frankfurt and Florida**. Those are the locations issuing requests; they do not mean every sandbox is hosted in both regions.

For Boat, whose measured sandbox is in northern France, the published median results show the effect across an entire sequence:

| Operation | Frankfurt caller | Florida caller |
| --- | ---: | ---: |
| Cold start | 0.78 s | 1.1 s |
| Run a command | 0.11 s | 0.33 s |
| 100-call agent replay | 23 s | 43 s |

The geographic difference does not explain every millisecond, but it illustrates why a quick boot alone is an incomplete picture. Small waits on commands and file operations can accumulate over a long agent session. The benchmark’s in-sandbox CPU, memory and disk tests are reported separately from those request-path timings.

## Reading the comparison

Sandbox Bench offers a **same-machine track**, requesting four virtual CPUs and 8 GB of memory, and a **default-machine track**, using each provider’s default allocation. The former makes resource comparisons more consistent; the latter shows what a developer receives without specifying a size.

There are exceptions even in the same-machine track: boxd uses 16 GB because it does not offer an 8 GB option at four CPUs. The benchmark records those differences, along with medians and uncertainty intervals. Its methodology reports 100 runs for quick tests and 30 for agent or snapshot tests, with counts shown per chart.

The cost test estimates one task per sandbox and excludes credits, taxes and plan minimums. Failure counts also follow stated exclusions, including benchmark setup errors and some ambiguous SDK timeouts. Those figures describe the measured workload and counting rules, not a complete bill or a reliability guarantee.

## The benchmark is a starting point

Sandbox Bench helps narrow the performance question: how long an environment takes to start, how its basic operations behave and how those delays add up from a particular region. Its [results and methodology](https://aisandboxbench.com/) provide the context behind each chart.

The security decision still requires examining the controls around the workload: what the agent can read or change, where it can connect, how credentials are supplied and which process is actually confined. The right sandbox must support both the work the agent needs to do and the boundaries that make that work acceptable.

Sources: [Sandbox Bench results and methodology](https://aisandboxbench.com/), [benchmark site repository](https://github.com/opencoredev/sandbox-bench), [same-machine allocation data](https://github.com/opencoredev/sandbox-bench/blob/main/src/data/benchmark.same-spec.json), [AWS Strands Box](https://aws.amazon.com/blogs/opensource/introducing-strands-box-ai-agent-sandboxes-powered-by-dogwood/), [Perplexity SPACE](https://www.perplexity.ai/hub/blog/making-space-secure-and-efficient-runtimes-for-long-running-agents), and [Ferstar’s ZCode investigation](https://blog.ferstar.org/en/posts/zcode-silent-workspace-snapshot-upload/).
