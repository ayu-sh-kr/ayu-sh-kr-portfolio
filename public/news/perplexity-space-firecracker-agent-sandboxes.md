# Perplexity SPACE: How Firecracker sandboxes isolate AI agents

An agent asked to turn a private spreadsheet into a report needs somewhere to run code. It also needs limits: opening that spreadsheet should not give its generated script access to another user's files or the account credentials used to fetch it.

**SPACE**, Perplexity's sandbox platform for Computer, separates those responsibilities across three layers: a control plane, services on the host machine, and an isolated workspace. Perplexity introduced it on July 15, 2026, with support for pausing, resuming and branching work. The architecture explains how an agent can keep working over time while its execution environment remains disposable.

## Firecracker supplies the isolated workspace

The foundation is **Firecracker**, the open-source virtualization technology developed at AWS. A microVM is a lightweight virtual machine: it runs a guest operating system with its own kernel, the core that manages processes, memory and devices.

Ordinary containers share the host's kernel. Giving each workload a guest kernel adds a separate VM boundary between its code and the host. Firecracker uses Linux's hardware virtualization support and a small set of emulated devices to keep that boundary relatively lightweight. It is the technology behind AWS Lambda, but using Firecracker does not mean SPACE is a Lambda service.

For the spreadsheet task, this is the room in which code runs. The surrounding platform still decides which files enter, which connections leave, and when the room can be reclaimed.

## Three layers divide decisions, permissions and execution

The illustration separates the three software layers and shows an example with two parallel sandbox tasks. **Solid paths** carry instructions through the host manager and branch to both guests. **Dashed paths** bring their network requests back through host controls; **dotted paths** show checkpoints reaching storage. Credentials remain outside the guests. The paths explain responsibility and direction, rather than physical wiring or measured timing.

![Centered isometric SPACE architecture with control-plane modules above node services and two isolated Firecracker guests. Instructions branch to both guests concurrently; distinct dashed network paths return through the host gate, while dotted checkpoint paths reach storage. Credentials remain on the host layer.](/news/assets/perplexity-space-firecracker-agent-sandboxes/space-architecture.svg)

**The control plane decides what should run and where.** Its API checks access and records the requested state in a shared database. A stateless service keeps those records separate from its own process, allowing another instance to continue coordination after a restart. Here, the desired state is a running sandbox assigned to a worker.

**Node-level services make that decision happen.** A node is the host machine running the guests. Its sandbox manager tracks their live state; a separate privileged node manager performs operations requiring root access. Storage services handle snapshots, while a network gateway controls outbound traffic. Splitting those jobs reduces how much authority any one service needs.

**The in-sandbox layer runs the task.** Inside each VM, the Space Daemon handles platform operations such as file access and process management through a private host-to-guest channel. Generated code gets a working environment; platform commands follow a controlled route into it. Perplexity's [engineering account](https://www.perplexity.ai/hub/blog/making-space-secure-and-efficient-runtimes-for-long-running-agents) documents this separation.

## Using an account without handing over its keys

For the example report, imagine the spreadsheet comes from an approved connected account. Perplexity says SPACE keeps platform-managed credentials outside the sandbox and supplies authentication at the network layer or through browser autofill when required. The node-level controls also restrict where the workload can connect.

That changes what a hostile script can steal: the workspace does not need a reusable account secret sitting in an environment variable or configuration file. **Permission to use an integration is still permission**, however. A permitted request can expose data within its authorized scope; hiding the credential does not make every action harmless.

> Isolation limits where code runs. Authorization limits what that code may reach.

This is the same distinction behind the [Strands Box sandbox and policy controls](/news/aws-strands-box-ai-agent-sandbox/), although SPACE uses a different runtime architecture.

## Continuing the work without keeping one VM alive

The report may need a follow-up tomorrow. SPACE preserves sessions through snapshots, allowing work to resume or branch even when an individual sandbox is destroyed. Perplexity also describes encrypted storage, customer-managed encryption keys, and on-premises or offline operation in its [SPACE announcement](https://www.perplexity.ai/hub/blog/secure-sandboxes-for-agents).

Resuming creates another problem: requests must reach the current execution. In a [later routing explanation](https://www.perplexity.ai/hub/blog/how-space-routes-requests-to-the-right-sandbox-execution), Perplexity describes signed, short-lived permissions tied to a particular execution. A worker checks that identity before forwarding an operation. Knowing the sandbox's name is insufficient if an old address now points at the wrong runtime.

For the spreadsheet task, the responsibilities now fit together: the control plane arranges the workspace, host services govern access, and the guest runs the script. Session state lets work continue. These are documented design claims rather than a hands-on security assessment, but the useful engineering lesson is concrete: safe agent execution requires controls around the VM as well as isolation inside it.

Sources: [Perplexity's SPACE launch](https://www.perplexity.ai/hub/blog/secure-sandboxes-for-agents), [architecture and runtime design](https://www.perplexity.ai/hub/blog/making-space-secure-and-efficient-runtimes-for-long-running-agents), [execution routing](https://www.perplexity.ai/hub/blog/how-space-routes-requests-to-the-right-sandbox-execution), and [Firecracker's architecture](https://firecracker-microvm.github.io/).
