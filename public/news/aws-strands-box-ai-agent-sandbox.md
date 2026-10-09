# AWS Strands Box adds policy controls to AI agent sandboxing

Giving an AI agent access to files and tools helps it investigate a bug. It also raises a practical question: how can it read what it needs without deleting files, exposing credentials or sending sensitive data elsewhere? **AWS’s Strands Box** puts the agent inside a local sandbox and checks its actions against rules developers define.

AWS announced the **Apache 2.0 open-source project** on October 7. It is starting in developer preview on macOS, combining operating-system isolation with Dogwood, a policy language that can account for what an agent has already done.

## A sandbox sets the boundary; policies control actions

A sandbox restricts what a program can reach. Box uses macOS Seatbelt to establish that boundary around files, programs and network access, while running beside existing development tools without a separate guest operating system.

Inside that boundary, access still needs finer control. An agent might be allowed to inspect a directory while being forbidden from deleting its contents. Box checks operations through its shell and Python interpreters, network gateway and Model Context Protocol (MCP) broker, which mediates calls to connected tools.

For example, a shell deletion can trigger a check for each file it would remove. A rule forbidding deletion can stop the operation before those files disappear. **Deny-by-default** means an operation passing through policy needs a matching permit to proceed.

## Those rules can also depend on earlier actions

Dogwood extends that decision beyond a single request. Its rules can consider earlier actions, their order and how recently they happened.

AWS describes blocking outbound HTTP after an agent reads a customer-data directory. The shell, Python and network controls share event history: a sensitive read through one can change permission for a later request through another. Another example caps successful Slack updates at three in ten minutes, while allowing the investigation to continue.

The distinction is useful: these limits are enforced outside the agent’s own decision-making. They do not depend on the model remembering an instruction as it works.

## Approved requests can use credentials without revealing them

That network gateway also handles authentication. For configured API routes, the agent receives a placeholder token; the gateway replaces it with the real secret when forwarding a permitted request. It can also sign AWS requests using credentials obtained outside the agent.

Developers configure the environment, tools and credential bindings in `box.toml`, then write Dogwood rules in `policy.dw`. Declaring a credential does not itself grant network permission. Documentation covers Strands, Claude Code and Codex CLI, though each integration needs setup.

## The preview depends on which actions Box can observe

Direct file reads by an agent’s built-in tools remain subject to OS restrictions, but do not enter Dogwood’s policy history. A rule that reacts to a sensitive read therefore needs that read to pass through Box’s enforcement points.

AWS plans broader OS support, easier configuration and deployment options. The immediate offer is concrete: give an agent useful access, then constrain what it does with that access. The preview’s observation boundary determines how far those controls currently reach.

Sources: [AWS launch announcement](https://aws.amazon.com/blogs/opensource/introducing-strands-box-ai-agent-sandboxes-powered-by-dogwood/), [Strands Box documentation](https://strandsagents.com/docs/user-guide/box/) and [source code](https://github.com/strands-agents/box).
