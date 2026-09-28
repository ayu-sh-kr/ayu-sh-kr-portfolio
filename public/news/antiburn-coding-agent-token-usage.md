# AntiBurn tracks coding-agent tokens and signals when to pause

A coding agent makes a change, reads the same files again, then tries another approach without getting closer to a working result. The next prompt may help, but it also carries more of the session's history. **AntiBurn**, a free, open-source desktop app, gives developers a way to see where those tokens went after the work.

It reads local session logs from coding tools including Claude Code, Codex, Cursor, and OpenCode. Its tray app shows token use, estimated cost, and findings about the way an agent worked. This is another kind of token control alongside tools such as code search that narrow what an agent reads at the start: AntiBurn helps review the session that actually happened.

## What the session record can tell you

AntiBurn charts context growth and separates input, output, and cache use where the logs allow it. It can flag an unusually deep session, excess reasoning, an overpowered subagent, or repeated cache rehydration. It also looks for tools, skills, and MCP integrations that were available but went unused. Those findings point to different choices: start a fresh session, use a smaller model for a bounded task, or remove an integration that is adding context without helping.

For example, if an agent spends a long session exploring a repository, the next small edit can inherit a large conversation. AntiBurn's **session overdepth** check flags a request above its fixed 400,000-token cap; its documentation suggests compaction earlier, around 200,000 tokens. That threshold is the product's rule, not a universal limit for every task or model.

The app calculates **API-equivalent cost estimates** from transcript tokens and model prices. They are not the amount a subscription user was billed. Where supported and enabled, it can separately show provider quota information from the user's existing credentials. Coverage varies by agent and by what its logs record, so a check may say “not assessed” instead of declaring a session clean.

## A stopping point is a coding decision

These measurements matter because coding with an agent changes the rhythm of a task. It is easy to keep asking for one more attempt after progress has stalled. A useful stopping rule is to pause when retries repeat the same mistake or the agent keeps rereading the same material without new evidence. Inspect the diff, run the relevant checks, and decide whether the problem needs a narrower prompt, a fresh session, or a human decision about the design.

AntiBurn supplies evidence for that review; its documented findings are advisory, with fixed checks rather than a configurable stop switch. It cannot tell whether a difficult problem justifies a long session. Back at the stalled edit, the useful question is whether the next agent turn has a specific new test or hypothesis. If it does not, stop the loop and examine the work already done.

Sources: [AntiBurn overview](https://antiburn.com/), [documentation](https://antiburn.com/docs/), [tokens, cost and quota](https://antiburn.com/docs/concepts/tokens-cost-and-quota/), [hygiene findings](https://antiburn.com/docs/concepts/hygiene-score-and-findings/), and [session overdepth](https://antiburn.com/docs/findings/session-overdepth/).
