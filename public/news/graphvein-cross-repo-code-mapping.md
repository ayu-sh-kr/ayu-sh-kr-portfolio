# Graphvein maps API routes across repositories without an LLM

Before changing what an API returns, you need to know who calls it. That can mean finding the route in one repository, its callers in another, and the tables its handler reads. [Graphvein’s first public preview](https://github.com/graphvein/graphvein/releases/tag/v0.1.0) puts those links in one place. It builds the map locally from source code, without an LLM.

## How Graphvein connects callers, handlers and tables

Graphvein uses **static analysis**: it reads the source without running the app. In the project’s [FastAPI example](https://github.com/graphvein/graphvein#status), the map links `GET /api/v1/items/` to the generated TypeScript client that calls it. You can follow an endpoint to its handler and, where the database access is recognizable, to the tables it reads or writes. Start with a table instead and you can work back toward the routes that depend on it.

The same index powers the local web UI, command line and a [read-only MCP server](https://github.com/graphvein/graphvein/blob/main/docs/cli/mcp.md). A coding agent can ask which clients call a route and go straight to the relevant source. Where a tool like [Jevgrep](/news/jevgrep-jev-agent-code-search/) helps find code relevant to a question, Graphvein helps follow a specific connection once you know where to start.

## What the code map can miss

When Graphvein connects two repositories, it **labels the link as inferred** and shows how it matched them. Calls made through an unsupported wrapper or assembled dynamically can remain unresolved. In the team’s [published tests](https://github.com/graphvein/graphvein/blob/main/docs/evidence/link-precision.md), all 363 route-to-caller links it reported across three open-source projects were correct after fixes, but it still missed real callers. Owncast’s admin console, for example, used a helper the tool didn’t recognize.

The useful part of **no LLM** is that Graphvein builds the map on your machine without asking a model to read your code. You can follow the links back to the source yourself, or let a coding agent query the same map through MCP. Either way, you have a place to start before changing an API.
