# AntiBurn shows where AI coding agents spend their tokens

“Try again” is a small instruction that can extend a coding session well beyond the original task. An agent rereads files, retries a failing test, and carries more conversation into the next attempt. **AntiBurn**, a free, open-source desktop app, helps developers see where those tokens are going and decide what to change.

The app reads local session logs from tools including **Claude Code, Codex, Cursor, and OpenCode**. It shows token use, estimated costs, and patterns that may be making sessions more expensive. Alongside tools such as [Jevgrep](/news/jevgrep-jev-agent-code-search/), which helps agents find relevant code before reading it, AntiBurn adds a way to review how the work unfolded.

## Where the tokens go

A prompt is only part of what a model receives. Its **context** can also include previous messages, file contents, and tool results. As a task continues, that accumulated material can make even a short follow-up expensive to process.

AntiBurn charts that growth and, where the logs support it, separates tokens used for input, generated output, and reused cached context. Its checks look for long sessions, heavy reasoning, and subagents using more capable models than the task may need. It also identifies tools, skills, and external integrations that were loaded but went unused.

Those findings give developers something specific to review. An unused integration might be removable; a small delegated task might suit a cheaper model. A session filled with earlier exploration might benefit from a fresh start with only the relevant findings.

AntiBurn applies fixed rules to make these judgments. Its long-session check flags a request above **400,000 tokens**, while its documentation suggests summarizing the conversation earlier, around 200,000 tokens. These are the app's guidelines, and the right choice still depends on the model and the work. Some checks cannot run when an agent's logs lack the necessary detail.

## What the cost figure means

The app estimates what recorded token use would cost at the model's API prices. A developer on a subscription should read that as a comparison measure, rather than a bill. Where supported and enabled, AntiBurn separately retrieves remaining quota and reset information from the provider.

That distinction helps keep the review useful: a costly session may have solved a difficult problem, while a cheap one may have produced nothing usable. Token counts need to be read alongside the result.

## Knowing when to stop the agent

This is where token tracking meets a change in coding habits. A developer directing an agent also needs to set the task's boundary: what should change, how to check it, and when another attempt is unlikely to help.

A practical pause point is **repetition without new evidence**. If the same failure keeps returning, inspect the code changes and test output before sending another prompt. A fresh session can reduce accumulated context, but an unclear requirement or design decision still needs resolving.

AntiBurn's findings support that review; they do not automatically stop the agent. Before another “try again,” name what the next attempt will test or change. If that is unclear, pause and examine the work already done. That is where a token counter becomes useful to the coding process.

Sources: [AntiBurn overview](https://antiburn.com/), [documentation](https://antiburn.com/docs/), [tokens, cost and quota](https://antiburn.com/docs/concepts/tokens-cost-and-quota/), [hygiene findings](https://antiburn.com/docs/concepts/hygiene-score-and-findings/), and [session overdepth](https://antiburn.com/docs/findings/session-overdepth/).
