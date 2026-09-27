# Jevgrep targets coding agent costs with smarter code search

A developer asks a coding agent to change the message shown when someone enters the wrong password. In an unfamiliar project, even that small task starts with a search: which file handles login, which checks the password, and which displays the error? The agent can open several unrelated files before finding the code it needs.

Developer **David Zhang** has introduced **Jevgrep**, an open-source tool built for that search. It uses TypeSafe AI’s **Jev** to judge which parts of a repository are worth investigating, then hands the coding agent relevant file locations and source excerpts. The aim is to spend less of the main model’s context and budget getting oriented.

## How Jevgrep chooses what an agent should read

The command is `jg`. Give it a question about what the code does and a folder to search. Jevgrep explores the directory structure, examines previews of promising files, and selects useful functions, classes, or other source sections.

Jev supplies the relevance decisions along the way. A folder needs further exploration; a file looks useful; a particular section deserves to be included. That is the conditional step behind the tool: **decide what looks relevant before sending a larger body of code to the coding agent**.

Take the login example. Searching for “login” might return the login page, styling, documentation, and tests. The password check could be in a file called `account-service.ts`. Jevgrep can judge whether that code answers the question even when the filename does not contain the search word. These are illustrative filenames; the results depend on the project.

It returns source copied from the repository, with paths and line references. Those details let the agent follow the result back to the original file. Some results are only pointers for further reading, and selections can be incomplete. The agent still has to understand the surrounding code, make the change, and test it.

When the exact function or filename is already known, a direct read or `rg` search remains the shorter route. Jevgrep’s useful territory is **knowing what to look for without knowing where it lives**.

## Three everyday tasks to try

These example questions show how to describe a task without knowing the filenames. The dot at the end means **search the current project folder**.

**Find the login check.** Before changing a wrong-password message, ask where that decision happens:

```sh
jg "Where does this app check a user's password and return a login error?" .
```

A useful result would point toward the password check and the code that returns the error. The coding agent can start with those sections, then follow how the message reaches the screen.

**Find where a form saves data.** Suppose a contact form has a new phone-number field and the backend needs to store it:

```sh
jg "Where are contact form submissions saved to the database?" .
```

This asks for the saving behavior directly. It gives the agent a way to look for the relevant code without guessing whether the project calls it a controller, service, repository, or something else.

**Find the welcome email.** To update the email sent after signup, ask:

```sh
jg "Where is the welcome email built and sent after a user signs up?" .
```

The email template and the sending code may live in different files. The question asks for both parts. If the relevant package is already known, replace `.` with its folder to narrow the search.

These commands retrieve code for the agent to examine. They do not change the login message, save the new field, or edit the email themselves.

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

Return to that wrong-password message. The task is small; finding the right place to change it can take longer than the edit. Jevgrep aims to shorten that search by giving the coding agent useful code first. The practical test is whether the agent reaches the right file with fewer detours and still delivers a working change.

Sources: [Jevgrep documentation and source](https://github.com/dzhng/jevgrep), [CLI setup](https://github.com/dzhng/jevgrep/blob/main/apps/cli/README.md), [architecture](https://github.com/dzhng/jevgrep/blob/main/docs/architecture.md), [benchmark results](https://github.com/dzhng/jevgrep/blob/main/specs/done/jevgrep/assets/variance-repeat.md), and [Zhang’s announcement](https://x.com/dzhng/status/2103920741481848861).
