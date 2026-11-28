# Poly gives monorepos one CLI for dependency updates

In a monorepo, the web app might use pnpm while the Python API uses uv. Adding a dependency means switching commands as you move between projects. [Poly](https://github.com/RitualDev-Lab/poly), which its makers [shared on Hacker News on November 27](https://news.ycombinator.com/item?id=50670715), gives both projects the same command format and leaves version resolution to their existing package managers.

## Adding dependencies with Poly

Start at the repo root with [Poly v0.6.2](https://github.com/RitualDev-Lab/poly/releases/tag/v0.6.2), pnpm and uv installed. This example uses an existing pnpm app in `apps/web` and a uv project in `services/api`:

```bash
# Add Zod to the web app
cd apps/web
poly add "npm:zod"

# Add FastAPI to the Python API
cd ../../services/api
poly add "pypi:fastapi"
```

Run each `poly add` from the folder whose dependencies you want to change. The prefix tells Poly which package ecosystem to use. Poly’s [Node adapter](https://github.com/RitualDev-Lab/poly/blob/v0.6.2/src/engines/node.ts) detects the pnpm lockfile and runs `pnpm add zod`. Its [Python adapter](https://github.com/RitualDev-Lab/poly/blob/v0.6.2/src/engines/python.ts) delegates to `uv add fastapi` when uv is available. Each tool still manages its own dependencies and lockfile.

## What Poly’s lockfile checks

Back at the repo root, run `poly sync` with both projects listed in `poly.toml` to install dependencies across the workspace. Poly records hashes of the projects’ dependency declarations and detected lockfiles in **`poly.lock`**. If those files no longer match the snapshot, `poly install --frozen` stops before installing.

> **For CI:** Poly’s [v0.6.2 workspace code](https://github.com/RitualDev-Lab/poly/blob/v0.6.2/src/workspace/dispatcher.ts) checks the snapshot, then runs each package manager’s normal install. Use your package managers’ own frozen-install options if CI needs to prevent lockfile changes.

[Dependabot](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/manage-dependabot-prs) opens update PRs for you. Poly fits the changes you make yourself: add a package where it belongs, then sync the frontend and API from the same workspace without giving up either tool’s lockfile.
