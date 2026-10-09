# Weft brings live coordination to AI coding agents working with Git

Two agents work on the same application: one changes a function, while the other builds a feature that calls it. Both can keep making progress without knowing that their changes no longer fit together. Finding the mismatch later means going back through work that already looked finished.

**[Weft](https://github.com/celador/weft) brings that feedback into the coding session.** Built by John Nelson for Cloudflare’s [next Git platform competition](https://blog.cloudflare.com/next-git-platform-on-cloudflare/), it coordinates parallel coding agents while they edit. When one agent’s work affects another, Weft can return a warning or error explaining the conflict before it reaches a pull request.

The platform uses Git-compatible storage and supports adapters for Claude Code, Codex, OpenCode and Hermes. Its focus is the work happening between commits: which agent changed a function, which other agent depends on it, and what needs to be revisited.

## Why agent collaboration needs more than separate branches

Giving each agent a branch or fork keeps their files apart, but their tasks can still depend on the same code. Consider an order service written in TypeScript. One agent updates `calculateTotal(items)` to require a currency argument. Another adds a checkout flow using the earlier call.

The agents have changed different files. Git may combine those files without a text conflict, even though the checkout code now calls the function incorrectly. A compiler or test can catch that later; the opportunity Weft pursues is to tell the second agent while it is still working on checkout.

This sits alongside the problem covered in our [report on GitHub’s Git infrastructure rebuild](/news/github-git-infrastructure-agent-scale/). GitHub is redesigning storage and coordination because adding read replicas also increases write overhead. Weft addresses a different part of growing agent activity: helping concurrent changes remain compatible before they are submitted.

Cloudflare’s competition asks developers to build that collaboration layer using **Workers and Artifacts**. Workers runs application services; Artifacts supplies programmable Git repositories and forks. Weft builds its coordination around those foundations, retaining commits, rebases and a shared main branch.

## A workspace is where the agent actually changes code

Start with the task, such as adding checkout support. The agent needs project files to read, a place to edit them, and tools for running commands. Together, that working copy and execution environment form its **workspace**.

In Weft’s [platform design](https://github.com/celador/weft/blob/main/docs/design.md), an agent’s attempt gets an isolated fork in Artifacts. The workspace runs the coding agent with the task context, project instructions and Weft integration. Another agent can work on a separate attempt without overwriting those local files.

Isolation gives each agent room to work. Coordination tells it what is happening outside that room.

## The adapter turns an edit into a shared update

Agents change files through tools: applying a patch, replacing text or running a command. Their coding applications expose hooks—places where an integration can run before or after those tool actions.

Weft’s **adapter** connects to those hooks. It is the bridge between the coding application and Weft, rather than another agent writing the feature. An analyzer examines the edit to identify code symbols, such as functions and types, that it changes or references.

For the order-service example, the useful information is more specific than “checkout.ts changed.” It includes that checkout calls `calculateTotal`, while the other agent changed that function’s signature: the arguments callers must provide.

The adapter packages this information into an event using the [Weft Coordination Protocol (WCP)](https://github.com/celador/weft/blob/main/docs/protocol/wcp-v0.md). The event includes the version of the shared event history the agent was working from. That lets Weft distinguish a current edit from one built on an older assumption.

The illustration follows that feedback loop. Each workspace reports edits through its adapter; both reach the same coordinator, which can send a diagnostic back to the affected agent.

![Two isolated agent workspaces send symbol changes through adapters and a gateway to one ordered coordinator; a diagnostic returns to the agent that needs to revise its code.](/news/assets/weft-ai-coding-agent-coordination/coordination-architecture.svg)

## One coordinator compares work from both agents

The events enter through a gateway, the service receiving WCP requests. It forwards them to the coordinator for that project. Weft uses a **Cloudflare Durable Object with SQLite** to keep a shared, ordered record of events for each repository.

Ordering gives the coordinator a way to answer a concrete question: what changed after this agent’s starting point? It compares the incoming event’s referenced and modified symbols with newer accepted changes.

If a referenced function’s signature changed after that starting point, WCP can return a `stale_assumption` error. If only its internal implementation changed, the feedback can be a warning. The diagnostic identifies the affected symbol and the event responsible, giving the agent context for its next edit.

The adapter brings that feedback into the coding session. Depending on the integration’s capabilities, it can observe changes, inject context, block an action or enforce a completion gate. Agents therefore share one coordination protocol while retaining different tool interfaces.

## Accepted edits still need tests and a path to main

The live feedback loop is only part of the architecture. Once an agent pushes a revision, Queues and Workflows organize the longer processing steps. A queue holds pending jobs; a workflow tracks their progress through operations such as updating the candidate against main, running tests and selecting a change to land.

Sandbox containers provide isolated environments for Git operations and tests. Artifacts holds the candidate forks and main repository. Supporting stores keep the work inspectable: D1 indexes tasks and evidence, while R2 retains artifacts such as logs and screenshots. Human clients expose the event feed and controls including approval, pause and undo.

> Early conflict feedback helps an agent revise its work; tests and review still decide whether the result is ready to land.

Weft remains a research/demo implementation, with initial symbol analysis focused on TypeScript. Nelson reports that it caught 59 collisions in its first 11 hours while helping coordinate its own development. That is an early result reported by its creator, rather than a general performance benchmark.

For the two agents working on checkout, the useful change is straightforward: the second agent can learn that `calculateTotal` changed while it is still writing the caller. Git preserves the resulting history; Weft aims to keep the work leading up to that history in step.
