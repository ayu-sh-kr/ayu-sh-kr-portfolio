# Perplexity SPACE: How Firecracker sandboxes isolate AI agents

An AI agent may need a private spreadsheet to write a report. That does not mean its generated code needs the credentials to the account holding it. Keeping those two kinds of access separate is central to **SPACE**, the sandbox system Perplexity built for **Computer**, its service for carrying out multi-step tasks.

Perplexity introduced SPACE on July 15, 2026. Its published architecture combines Firecracker microVMs with services that manage permissions, network traffic and saved work. The question running through the design is straightforward: **what can an agent's code reach if it makes a mistake or turns hostile?**

## Each task gets a separate operating system

SPACE runs tasks inside **Firecracker microVMs**, lightweight virtual machines built with open-source technology developed at AWS. Each guest has its own operating-system kernel, the core that manages processes, memory and devices.

Ordinary containers share the host's kernel. A separate guest kernel adds a VM boundary between the task's code and the machine running it. Firecracker uses Linux's hardware virtualization support and a small set of emulated devices to keep that separation relatively lightweight. AWS also uses it for Lambda; SPACE is Perplexity's system built around the technology.

For the spreadsheet example, this is where the script reads the file and produces the report. Isolation alone leaves several decisions unresolved: which files the script receives, where it can send data, and whether it can obtain an account secret. Those decisions sit around the VM.

## The controls extend beyond the VM

The architecture divides responsibility across three layers. The illustration follows instructions into two parallel tasks, network requests back through host controls, and checkpoints into storage. Solid, dashed and dotted paths distinguish those flows; their timing is illustrative.

![Centered isometric SPACE architecture with control-plane modules above node services and two isolated Firecracker guests. Instructions branch to both guests concurrently; distinct dashed network paths return through the host gate, while dotted checkpoint paths reach storage. Credentials remain on the host layer.](/news/assets/perplexity-space-firecracker-agent-sandboxes/space-architecture.svg)

**The control plane assigns and tracks work.** Its API checks access and records the requested sandbox state in a shared database. That lets another control-plane instance continue coordination after a restart. For the report, it determines which worker should run the sandbox and whether that sandbox should be running, paused or stopped.

**Node services manage the host machine.** A node is the machine running the guests. Its sandbox manager tracks their actual state, while a separate node manager handles operations requiring root access. Storage services handle snapshots, and a network gateway controls outbound traffic. The code inside a task does not take over these management duties.

**The guest runs the code.** Inside each VM, a background process called the Space Daemon handles the platform's file and process operations through a private host-to-guest channel. This gives the surrounding services a controlled route into the workspace. Perplexity describes the division in its [engineering account](https://www.perplexity.ai/hub/blog/making-space-secure-and-efficient-runtimes-for-long-running-agents).

## Credentials stay outside the generated code's workspace

If the spreadsheet comes from a connected account, a permitted request still needs authentication. Perplexity says SPACE keeps platform-managed credentials outside the sandbox, applying authentication at the network layer or through browser autofill when needed. Host-level rules also restrict where the task can connect.

The intended effect is to avoid leaving a reusable account secret in an environment variable or configuration file that generated code can read. That is a narrower claim than making the agent harmless. An authorized connection can still carry sensitive data, so the permissions attached to it matter as much as where its credentials are stored.

> Isolation limits where code runs. Authorization limits what that code may reach.

The distinction also appears in [AWS's Strands Box sandbox and policy controls](/news/aws-strands-box-ai-agent-sandbox/), which use a different runtime architecture. In both cases, the restrictions are enforced outside the agent's own instructions.

## Saved work creates another routing problem

The spreadsheet task might pause for approval or need a follow-up tomorrow. Perplexity describes snapshots that preserve session state, allowing work to resume or branch without keeping the same VM running throughout. The temporary machine and the saved work have different lifetimes, as its [SPACE announcement](https://www.perplexity.ai/hub/blog/secure-sandboxes-for-agents) explains.

That flexibility creates another security concern. Once a sandbox resumes elsewhere, an old route could send a file operation to the wrong execution. In a [later routing explanation](https://www.perplexity.ai/hub/blog/how-space-routes-requests-to-the-right-sandbox-execution), Perplexity describes signed, short-lived permissions tied to the selected execution. The receiving worker checks that identity before forwarding the operation.

Perplexity's posts describe the intended controls, rather than an independent test of their effectiveness. The design nevertheless shows why the services around a sandbox deserve as much attention as the VM itself.

For the original report, the boundaries are specific: let the script process the spreadsheet, keep reusable account credentials outside its workspace, and reconnect later to the correct saved session. A finished report is the visible result. The less visible question is how much access the agent needed to produce it—and how much of that access it could have misused.

Sources: [Perplexity's SPACE launch](https://www.perplexity.ai/hub/blog/secure-sandboxes-for-agents), [architecture and runtime design](https://www.perplexity.ai/hub/blog/making-space-secure-and-efficient-runtimes-for-long-running-agents), [execution routing](https://www.perplexity.ai/hub/blog/how-space-routes-requests-to-the-right-sandbox-execution), and [Firecracker's architecture](https://firecracker-microvm.github.io/).
