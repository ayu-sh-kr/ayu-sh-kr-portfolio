# Claude Code adds mods: TypeScript hooks that change how it behaves

Suppose you want Claude Code to pause before it runs `git push --force`, show what the command would change, and wait for a button press. Until now, the closest option was a settings hook: a script that could allow or block the command but could not draw anything in Claude Code's interface. On **October 1, 2026**, Anthropic introduced **mods**: small JavaScript or TypeScript functions that run inside Claude Code and can change both what it does and what it draws.

Mods ship inside **plugins**, the same package format that already carries skills, slash commands, agents, settings hooks, and MCP servers. A mod is the plugin's code component, and it is available in the **Claude Code CLI and the Code tab of the Claude Desktop app**.

## How a mod handles an event

Every Claude Code action emits an event: a submitted prompt, a tool call, a permission request, a turn, or a part of the interface being drawn. A mod registers functions for the events it cares about. Claude Code runs each function **before it acts on the event**, so the mod can observe it, rewrite it, or answer it so the usual behavior does not run. Several mods can handle the same event; they run in load order.

The documentation's first example counts the tool calls Claude makes and appends the count to the spinner. One handler listens for `tool.call` and increments a counter; a second listens for `ui.render` on the spinner and adds the number to its text. Because both functions live in the same file, what one records the other can show.

That shared, in-process state is what separates mods from the extensions Claude Code already had. A settings hook runs a shell command, a skill gives Claude instructions, and an MCP server gives it tools. None of them can draw a **pane beside the transcript**, a band above the prompt, or a replacement for a built-in row. A mod can. It can also add a `/command` that runs your function immediately, without a Claude turn, or send a single request to a different model.

## Built-in features are becoming mods

Anthropic has started moving Claude Code's own features to the same system. **`/diff` now ships as a built-in mod**, so it can be disabled or replaced with your own version, and loading `AGENTS.md` as project instructions is also a mod. The source of several built-in mods is public in the Claude Code repository.

You can write a mod yourself or describe what you want in a session and ask Claude to write it. Finished mods install like any plugin, for example with `/plugin install token-chart@your-org`. Anthropic's sample mods include `blast-radius`, which holds a risky shell command and offers buttons to proceed or cancel: the situation from the opening.

## What a mod can reach

**Mods are not sandboxed.** Anthropic's documentation says that a mod runs with your user account's permissions: it can read and write files, start processes, make network requests, read environment variables, see every prompt and tool call, and approve a tool call before you are asked. Claude Code's Bash sandbox does not contain a process that a mod starts.

Install mods only from sources you trust. Before installing one, `claude plugin validate ./some-mod` lists the events it handles and the API calls it makes without running it. `--safe-mode` disables installed mods for a session, and Anthropic says Team and Enterprise organizations load a built-in `sec-default` mod first so that user-installed mods cannot override managed security rules. Mods require Claude Code v2.1.287 or later and are on by default.

For the `git push --force` case, the practical change is clear: the safeguard no longer has to be a yes-or-no script outside the tool. It can be a small piece of code inside Claude Code that shows the risk and lets you decide, provided you treat that code with the same care as anything else running on your machine.

Sources: [Claude blog — Customize Claude Code with mods in TypeScript](https://claude.com/blog/claude-code-mods) · [Claude Code Docs — Mods overview](https://code.claude.com/docs/en/plugins/mods/overview) · [Claude Code Docs — Create a mod](https://code.claude.com/docs/en/plugins/mods/create) · [Claude Code Docs — Manage mods for your organization](https://code.claude.com/docs/en/plugins/mods/admin)
