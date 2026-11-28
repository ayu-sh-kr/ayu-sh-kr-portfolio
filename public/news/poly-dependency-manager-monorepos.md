# Poly gives monorepos one CLI for dependency updates

A monorepo can have a web app using pnpm and a Python API using uv. Adding a dependency means knowing which project owns it and which tool to run there. [Poly](https://github.com/RitualDev-Lab/poly), which its makers [showed on Hacker News on November 27](https://news.ycombinator.com/item?id=50670715), gives both projects the same command syntax while leaving version resolution to their existing package managers.

## One command format, native package managers

The prefix names the ecosystem: `npm:zod` for the frontend and `pypi:fastapi` for the API. Run the command from the relevant project directory. In Poly’s [v0.6.2 Node adapter](https://github.com/RitualDev-Lab/poly/blob/v0.6.2/src/engines/node.ts), a project with a pnpm lockfile gets `pnpm add zod` when pnpm is available. The [Python adapter](https://github.com/RitualDev-Lab/poly/blob/v0.6.2/src/engines/python.ts) can hand the FastAPI request to `uv add fastapi`. Rust and Go have adapters too. Your native tools still need to be installed.

## What Poly’s lockfile checks

A `poly.toml` workspace lets `poly sync` run installs across member projects. Poly records hashes of their manifests and detected native lockfiles in **`poly.lock`**. If someone edits a tracked manifest without refreshing that snapshot, `poly install --frozen` catches the mismatch before starting the installs.

> **What “frozen” means here:** The [v0.6.2 workspace code](https://github.com/RitualDev-Lab/poly/blob/v0.6.2/src/workspace/dispatcher.ts) checks the snapshot first, then calls each package manager’s normal install command. Keep native frozen-install checks where CI must prevent lockfile changes during installation.

[Dependabot](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/manage-dependabot-prs) raises update PRs; Poly is useful when someone is already working in the repository and wants to make or sync a dependency change. For the frontend and API, that gives you one command format and one workspace check while keeping both native lockfiles.
