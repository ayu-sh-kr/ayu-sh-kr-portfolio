# Jevgrep targets coding agent costs with smarter code search

A bug report says requests stop retrying after a timeout. It does not say which file owns the retry loop, where the timeout is handled, or which test captures the failure. Before a coding agent can fix anything, it has to find those pieces—and every wrong turn adds more text to read.

Developer **David Zhang** has introduced **Jevgrep**, an open-source tool built for that search. It uses TypeSafe AI’s **Jev** to judge which parts of a repository are worth investigating, then hands the coding agent relevant file locations and source excerpts. The aim is to spend less of the main model’s context and budget getting oriented.

## How Jevgrep chooses what an agent should read

The command is `jg`. Give it a question about what the code does and a folder to search. Jevgrep explores the directory structure, examines previews of promising files, and selects useful functions, classes, or other source sections.

Jev supplies the relevance decisions along the way. A folder needs further exploration; a file looks useful; a particular section deserves to be included. That is the conditional step behind the tool: **decide what looks relevant before sending a larger body of code to the coding agent**.

For the retry bug, this can help when the right function has an unexpected name. A search for “retry” may find dozens of log messages while missing the code that decides whether another attempt is allowed. Jevgrep searches by the behavior described in the question, so it can surface candidates that a single keyword would overlook.

It returns source copied from the repository, with paths and line references. Those details let the agent follow the result back to the original file. Some results are only pointers for further reading, and selections can be incomplete. The agent still has to understand the surrounding code, make the change, and test it.

When the exact function or filename is already known, a direct read or `rg` search remains the shorter route. Jevgrep’s useful territory is **knowing what to look for without knowing where it lives**.

## Three quick ways to use it

Start with the timeout example. This query asks for tests around the failing behavior:

```sh
jg "Which tests cover retry behavior when a request times out?" .
```

The results give the agent places to investigate before adding a regression test. They do not prove that those tests cover every timeout case. The next step is to read the returned code and compare it with the bug report.

For a connection leak, focus the question on the connection’s lifecycle. Searching `./src` keeps the request within application source:

```sh
jg "How are database connections created, pooled, and closed?" ./src
```

This is useful when opening and closing happen in different files. The question names the relationship the agent needs to trace, rather than guessing a class name.

Before changing authentication, ask where a request is checked on its way into the application:

```sh
jg "Where is authentication checked before a request reaches a handler?" .
```

Here the goal is to locate the existing check before adding another one in the wrong place. In each example, a narrower search folder helps when the likely part of the repository is already known.

## Getting it into a coding workflow

Jevgrep requires **Node.js 22 or newer**, macOS or Linux, and a key for a supported provider. Install the CLI, configure access, then install its agent skill from the project where the agent works:

```sh
npm install -g @dzhng/jevgrep
jg auth
jg skill
```

The documented providers are Vercel AI Gateway, TypeSafe, OpenRouter, and OpenCode Zen. The skill teaches an agent when to use `jg`, how to read its results, and when ordinary search is enough. Installing the executable alone does not teach the agent that workflow.

Searches send eligible source content to the chosen provider. Jevgrep filters common generated, dependency, binary, hidden, and obvious credential files, but those filters are not a guarantee that all sensitive material is removed. That makes the chosen search folder part of the setup decision.

## What the 40% cost claim actually shows

Zhang’s announcement reports roughly **40% lower coding-agent cost** on SWE-bench. The project’s published repeat used ten Python tasks and the Sol coding agent: its total Sol bill fell from **$7.62 to $4.52**, including failed tasks. Jev charges were excluded.

There was also a quality difference. Jevgrep’s run solved **7 of 10 tasks**, compared with **8 of 10** for the saved baseline. An earlier run solved 6 of 10. These results show a promising cost reduction in a small experiment, with a trade-off in completed work. They do not establish a universal token saving or an equivalent result for every agent.

That brings the story back to the timeout bug. Finding the right retry loop and its tests sooner can spare an agent several unhelpful reads. Jevgrep puts a dedicated relevance check at that point in the workflow. Its value will come from helping agents reach the right code with less searching—and still finish the fix correctly.

Sources: [Jevgrep documentation and source](https://github.com/dzhng/jevgrep), [CLI setup](https://github.com/dzhng/jevgrep/blob/main/apps/cli/README.md), [architecture](https://github.com/dzhng/jevgrep/blob/main/docs/architecture.md), [benchmark results](https://github.com/dzhng/jevgrep/blob/main/specs/done/jevgrep/assets/variance-repeat.md), and [Zhang’s announcement](https://x.com/dzhng/status/2103920741481848861).
