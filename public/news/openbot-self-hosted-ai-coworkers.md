# CopilotKit OpenBot: self-hosted AI coworkers and agent controls

If you haven't seen any Grok Bot ad across Instagram, X, or YouTube, you are one lucky fella. For everyone else, the pitch is now painfully familiar: give an AI a browser, a task, and a bit too much confidence; watch it become your colleague.

The community response is not another ad. It is [OpenBot](https://github.com/CopilotKit/openbot), an open-source project from CopilotKit that takes the same broad idea — AI coworkers that can use a computer — and makes the infrastructure, controls, and trade-offs visible.

## The useful difference is ownership

OpenBot is a template you clone and run on your own infrastructure, not a hosted bot you sign up for. It uses Docker Compose and PostgreSQL, lets each bot have its own browser profile, files, and workspace, and can connect to any agent that speaks the AG-UI protocol. The repository is explicit that it is alpha, so this is not a claim that the hard parts of autonomous work have been solved between two autoplaying reels.

What makes the project worth watching is the control plane. Browser, file, shell, MCP, and component actions go through a gateway that evaluates policy before acting and writes an audit record either way. A bot can be refused a domain, command, or tool; when it hits login or 2FA, a person can take the wheel. The design is trying to answer the question the ads skip: what exactly is this agent allowed to do, and how would you know afterward?

> Giving an agent a browser is easy. Giving it bounded authority is the product.

## A more honest shape for the category

The Grok-style promise sells the outcome: an assistant that gets things done. OpenBot exposes the machinery required to make that statement remotely responsible: isolated computers, credentials encrypted at rest, explicit grants, audit trails, and a fail-closed policy model.

That will sound less magical to anyone waiting for the next heroic AI montage. It should. The interesting part of AI coworkers is no longer whether a model can click a button. It is whether teams can let it click one without turning every browser session into an incident report.

Source: [CopilotKit/OpenBot on GitHub](https://github.com/CopilotKit/openbot)
