# Jevgrep uses Jev to find code before a coding agent reads it

Ask a coding agent to fix a bug in an unfamiliar repository and it may spend the first several turns opening files that have nothing to do with the bug. Those reads fill its context window and add to the bill before any code changes. Developer David Zhang’s **Jevgrep** asks a smaller model to narrow the search first.

The open-source command-line tool takes a plain-English question about a repository and returns likely files, useful locations within them, and selected **verbatim source excerpts**. It is a research step for an existing coding agent, rather than an agent that writes the patch itself.

## How it decides what is worth reading

Jevgrep calls **Jev**, TypeSafe AI’s model for structured decisions, to judge relevance. The tool walks through a repository’s folders, examines promising files using content previews, and looks for useful declarations and source. The central question at each stage is simple: *Does this part of the code help answer what the agent is looking for?*

That is different from matching an exact word. Suppose a task says, “Find where a request is rejected before it reaches a handler.” The relevant code might live in a middleware class with no function named “reject.” A text search for that word could miss it. Jevgrep can consider what a file or function does, then return the location for the coding agent to inspect.

The output begins with a summary and file locations, then adds reading leads and selected excerpts with line references. A file can still appear as a lead when Jevgrep is unsure which excerpt to include. Its decisions are **search hints**, not proof that every relevant file has been found. The agent must read the evidence, follow missing links, edit the code, and run tests.

## Three quick uses

For an authentication change, try `jg "Where is authentication checked before a request reaches a handler?" .`. That question asks for the behavior, even if the repository uses unfamiliar class names. The answer can point an agent toward the gate and nearby tests before it starts changing routes.

For a connection leak, `jg "How are database connections created, pooled, and closed?" ./src` narrows the search to application source. For a retry bug, `jg "Which tests cover retry behavior when a request times out?" .` looks for relevant tests as well as the implementation. The project recommends passing a narrower folder when the likely area is already known.

The CLI is installed with `npm install -g @dzhng/jevgrep`. Run `jg auth` to choose and configure a supported Jev provider, then `jg skill` to teach a coding agent when to call it. The documented setup requires **Node.js 22 or newer** on macOS or Linux and access through Vercel AI Gateway, TypeSafe, OpenRouter, or OpenCode Zen. Installing the CLI alone does not add the agent instructions.

If the exact symbol or path is already known, `rg` or a direct file read is simpler. Jevgrep is aimed at the earlier moment when the behavior is clear but its location is not.

## Does it actually save tokens and money?

Zhang’s announcement says Jevgrep cut coding-agent cost by about **40%** on SWE-bench. The repository documents the narrower result: in one ten-task repeat using the Sol coding agent, its total Sol bill fell from **$7.62 to $4.52**. That total included failed tasks, but **excluded Jev charges**. The Jevgrep run solved **7 of 10**, while the saved baseline solved **8 of 10**. An earlier run of the corrected package solved 6 of 10 at a different cost.

So the measured saving came with a quality trade-off in a small, tuned Python subset. It does not establish a general 40% saving, equal solve quality, or faster completion for other agents and languages. A missed file can cost more than a few extra reads if it causes an incorrect patch.

Jevgrep also sends eligible code excerpts to the selected Jev provider. Its default filters skip common dependency, build, binary, hidden, and obvious credential files, but the project says those filters cannot guarantee that sensitive content is absent. Choose a search root you are comfortable sending.

The promising idea is a **cheap decision before an expensive read**. When an agent has to learn a large, unfamiliar codebase, Jevgrep can give it a smaller starting map. Whether that map improves the whole task still depends on what it finds, what it misses, and whether the agent checks its work afterward.

Sources: [Jevgrep documentation and source](https://github.com/dzhng/jevgrep), [architecture](https://github.com/dzhng/jevgrep/blob/main/docs/architecture.md), [benchmark repeat](https://github.com/dzhng/jevgrep/blob/main/specs/done/jevgrep/assets/variance-repeat.md), and [Zhang’s announcement](https://x.com/dzhng/status/2103920741481848861).
