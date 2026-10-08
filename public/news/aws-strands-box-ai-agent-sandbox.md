# AWS launches Strands Box: AI agent sandbox with history-aware policies

An AI agent may need to read customer data to investigate a problem. Should it still be allowed to send network requests afterwards? **AWS’s Strands Box** makes that sequence something developers can control through enforced rules.

Announced on October 7, Strands Box is an **Apache 2.0 open-source sandbox**, now in developer preview on macOS. It combines operating-system isolation with Dogwood, a policy language that can decide whether an action is allowed based on the agent’s recorded history.

## Permissions that change as the agent works

A conventional access rule might allow a directory or a network destination. Dogwood adds conditions about earlier actions, their order and timing.

AWS gives the example of blocking outbound HTTP after an agent reads from a customer-data directory. Box’s shell, Python and network controls share event history, so a read through one interpreter can affect a later request through another.

Another example limits an incident-response agent to three successful Slack updates in ten minutes. It can continue investigating while further posts are refused. These are policies developers define, rather than instructions the model must remember.

## Local isolation, with credentials kept outside the agent

Box runs beside existing development tools without a separate guest operating system. On macOS, Seatbelt restricts the files and programs a process can reach. Policy then checks operations passing through Box’s shell and Python interpreters, network gateway and Model Context Protocol (MCP) broker, which mediates access to connected tools.

The configuration lives in two files: `box.toml` defines the environment and available tools; `policy.dw` holds the rules. Policy is **deny-by-default**: an operation needs a matching permit.

For configured API routes, the agent can receive a placeholder instead of a real token. The gateway attaches the secret to an approved request; it can also sign AWS requests using credentials held outside the agent.

## What the preview covers

Box is designed for different agent programs, with documentation for Strands, Claude Code and Codex CLI. Integration still needs configuration.

There is an important boundary: built-in file tools that read directly from granted directories are constrained by OS isolation, but those reads do not enter Dogwood’s policy history. History-dependent rules therefore rely on routing relevant operations through Box’s enforcement points.

AWS plans broader OS support, simpler setup and deployment options. For now, the customer-data example captures the value and the requirement: permissions can change after a sensitive read, provided Box observes that read.

Sources: [AWS launch announcement](https://aws.amazon.com/blogs/opensource/introducing-strands-box-ai-agent-sandboxes-powered-by-dogwood/), [Strands Box documentation](https://strandsagents.com/docs/user-guide/box/) and [source code](https://github.com/strands-agents/box).
