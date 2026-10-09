---
name: technical-blog-writing
description: Write or revise clear, connected, developer-friendly technical blogs with problem-first sections, crisp definitions, contrasts, delivery contracts, concrete examples, diagrams, boundaries, and memorable takeaways. Use for engineering Markdown across backend, architecture, distributed systems, databases, messaging, performance, and DevOps topics.
---

# Technical Blog Writing

Use this skill for engineering articles that need a connected narrative rather than a collection of notes.

## Global principle

Define the responsibility first, then explain the mechanism that upholds it. Write for a developer who needs to make a decision and understand the consequence of getting it wrong.

## Original evidence and reproducibility

Choose a concrete reader task within backend reliability, AI developer infrastructure, or deployment unless another topic is requested. Include an original contribution such as a runnable example, failure demonstration, inspected implementation, or measured comparison. Distinguish tested behavior from documented behavior and author judgement; do not claim production experience without evidence.

For runnable examples, state versions and prerequisites, show setup and execution in order, explain expected output, and include cleanup when resources or privileges are created. Test the important success and failure paths when an environment is available; otherwise state what remains unverified. For benchmarks, record hardware/runtime, workload, method, and limits rather than publishing an isolated number.

Build concepts in dependency order. Use diagrams to expose ownership, sequence, or a failure that prose alone makes hard to follow; apply the repository's SVG skills when needed. Link related guides and project evidence only where they answer the reader's next question. Finish when the task is complete, and estimate reading time from actual content without padding.

## Section sequence

Shape each major section in this order when the topic supports it:

1. Start with the problem the reader is trying to solve.
2. Define the concept in one short, memorable sentence.
3. Contrast it with the nearest confusing alternative.
4. State the delivery contract or responsibility: what it guarantees, what it does not, and what failure looks like.
5. Use a small, familiar example from caching, messaging, API fleets, workflows, or user-facing behaviour.
6. Add a compact Mermaid or project-styled SVG diagram only when flow, ownership, timing, or branching is easier to see.
7. State the boundary: “This is correct only when…”, “Move to a durable store when…”, or “Do not rely on this for correctness.”
8. End with one sentence that readers can remember, then transition to the next idea.

Do not force every step into a long section. Keep the sequence visible through prose and use the smallest safe explanation.

## Explanation patterns

Use concrete contrasts such as ephemeral versus durable, broadcast versus queue, coordination versus correctness, state versus activity, and retryable versus best-effort.

Explain unfamiliar terms at first use. For example:

- Ephemeral signals are activity updates that matter only now.
- Fan-out distributes one event to multiple consumers.
- Fan-in collects independent results into one outcome.
- A durable workflow is work that must survive crashes and retries.
- Ephemeral coordination helps live processes align without becoming durable business state.

## Examples and diagrams

Choose one familiar domain and carry it through the article. Establish its actors, initial state, and intended task before introducing code. Extend the same example step by step instead of switching between unrelated snippets. For PostgreSQL permissions, build one order-service role from connection through schema usage, table grants, sequences, default privileges, and RLS where needed. Explain each newly observed failure before adding its remedy.

Keep diagrams directional and compact. Show the actors, the message or state transition, and the failure or recovery branch. Do not use diagrams as decoration.

Keep implementation snippets short. Show the shape that proves the contract, not production boilerplate. Explain the framework or language immediately before the snippet. Never allow code to replace the reasoning.

## Voice and pacing

Use direct, conversational, precise prose. Prefer short paragraphs of two to five sentences. Use first person for defensible engineering judgement and second person to connect the decision to the reader's system.

Avoid academic framing, marketing claims, unsupported certainty, inflated scale, and false intimacy. Explain trade-offs and limits plainly. Do not stack bullets where a connected paragraph teaches the decision better.

## Ending

Close by resolving the opening task with a practical rule that maps each major problem to its responsible mechanism. Leave the reader with a boundary they can apply to a new system, not a sales pitch.

## Review checklist

- Does every major section begin with a problem or decision?
- Is each concept defined in one crisp sentence?
- Is the nearest contrast explicit?
- Is the guarantee and failure mode clear?
- Does the example explain why the concept matters?
- Are diagrams and code smaller than the explanation?
- Does each section state when the mechanism is not enough?
- Does each section end with a memorable takeaway?

