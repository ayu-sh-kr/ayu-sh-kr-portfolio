# Weft coordinates AI coding agents before Git merge conflicts

Two coding agents can finish their tasks and still produce a broken application. One changes a function; the other keeps calling its old version. Their edits may sit in different files, so the problem is not always an obvious fight over the same lines.

Weft is an open-source project exploring how to catch that kind of disagreement while agents are working. Its public repository describes the **Weft Coordination Protocol**, or WCP, and a Cloudflare-backed implementation. The project is real, but its README explicitly labels it a **research/demo implementation**. WCP v0.1 is a draft, not an established industry standard. [Repository and status](https://github.com/celador/weft)

## A Git alternative, with an important distinction

The launch post presents Weft as something coding agents need beyond Git. That is a useful starting point, but “Git replacement” would overstate what the project delivers. Weft’s design still includes Git commits, forks, rebases, tests, and landing changes on a shared main line. Its focus is an additional coordination layer that sees work before the pull request stage. [Design and limitations](https://github.com/celador/weft/blob/main/docs/design.md)

The Cloudflare connection also checks out. Cloudflare has announced a competition to build the next Git platform using Workers and Artifacts. Artifacts provides programmable repositories and forks while retaining Git operations. Weft’s design identifies that competition as its target. That establishes the context; it does not establish a Cloudflare endorsement or competition win. [Design and limitations](https://github.com/celador/weft/blob/main/docs/design.md)[Cloudflare competition](https://blog.cloudflare.com/next-git-platform-on-cloudflare/)

## The conflict can start before the merge

Imagine an order service. Agent A changes `calculateTotal(items)` to `calculateTotal(items, currency)`. Meanwhile, Agent B adds a checkout flow using the earlier call. This is an illustrative example, not a reported Weft incident.

A merge that accepts both files does not prove the two changes work together. A compiler or test may catch the mismatch later, but the second agent has already built on an outdated assumption. Weft tries to shorten that feedback loop.

Its protocol tracks the code symbols an edit references and changes: functions, types, and other declarations. An event also carries the agent’s base sequence—the point in the shared history it was working from. The coordinator compares that event with newer accepted work and can return a diagnostic identifying the conflicting symbol and the event responsible. [WCP draft specification](https://github.com/celador/weft/blob/main/docs/protocol/wcp-v0.md)

## How Weft’s architecture connects the pieces

The flow begins inside an agent’s workspace. An adapter translates tool hooks into WCP requests, while an analyzer extracts symbol information from edits. The README lists Claude Code, Codex, OpenCode, and Hermes in its architecture. [Repository and status](https://github.com/celador/weft)

Requests enter through a gateway and reach a repository coordinator: a Cloudflare Durable Object backed by SQLite. Each repository gets one authoritative event order, giving concurrent edits a common reference point. Verdicts and diagnostics travel back toward the agent. [Repository and status](https://github.com/celador/weft)

The platform also has a path from proposed changes to tested code. Queues and Workflows coordinate processing, selection, landing, and revert operations. Sandboxes perform Git and test work; Artifacts holds repositories and candidate forks. D1 indexes tasks and evidence, while R2 retains run artifacts. Human clients observe events and expose controls such as approval and pause. [Repository and status](https://github.com/celador/weft)

The distinction matters: an accepted coordination event is not the same thing as a tested change landing on main. The diagram separates the immediate feedback loop from that later execution path.

![Agent edits reach a shared repository coordinator; diagnostics return to agents, while workflows test and land changes separately.](/news/assets/weft-ai-coding-agent-coordination/coordination-architecture.svg)

## Warnings depend on what changed

WCP distinguishes a changed function contract from a changed implementation body. A reference to a signature that changed after an agent’s base can produce a stale-assumption error; a body-only change can produce a warning. That gives the agent more specific feedback than “something changed in this file.” [WCP draft specification](https://github.com/celador/weft/blob/main/docs/protocol/wcp-v0.md)

The design also describes different adapter capabilities, ranging from observing changes to injecting feedback, blocking edits, and enforcing completion or commit gates. A named integration therefore should not be read as a promise that every tool has identical enforcement. The initial symbol analysis is scoped to TypeScript, another reason to avoid claims that Weft understands every language or catches every conflict. [Design and limitations](https://github.com/celador/weft/blob/main/docs/design.md)

> An accepted coordination event is not a tested change landing on main.

## What the launch claims actually establish

In a launch post, John Nelson says Weft caught 59 collisions during its first 11 hours and was used to coordinate its own development. That is an author-reported result. This review did not independently reproduce the count or establish how many were distinct bugs prevented.

The repository does provide a documented local route: Git, Node.js 22 or newer, and pnpm 9, followed by dependency installation and protocol tests. Those tests exercise schema validation and reference-coordinator conformance scenarios without Cloudflare credentials. They are a way to inspect protocol behavior, not proof of production performance under a large agent fleet. [Local testing guide](https://github.com/celador/weft/blob/main/docs/try-it.md)

## Moving feedback closer to the edit

Weft’s interesting idea is the timing of coordination. If an agent learns that a dependency changed while it is still writing the caller, it has an opportunity to adjust before the mistake spreads through more work.

For now, the accurate description is an experimental coordination platform for parallel coding agents, built around Git-compatible infrastructure. Its next test is whether that earlier feedback stays useful as projects, languages, and agent workloads become more varied.
