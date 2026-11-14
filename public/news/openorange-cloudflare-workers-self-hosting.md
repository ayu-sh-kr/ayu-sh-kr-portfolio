# OpenOrange brings Cloudflare Workers to your own cloud

Ever thought about moving your Cloudflare Workers out of Cloudflare? For many developers, the answer might be: ‘Why would I?’ Cloudflare already provides the runtime and infrastructure to deploy them. But some teams may want to run the same application in their own cloud account or on their own servers. That’s the choice Rivet is aiming to offer with OpenOrange.

Cloudflare’s [workerd runtime](https://github.com/cloudflare/workerd) was already open source. But running an application elsewhere can also mean replacing the databases, storage and background services it relies on.

OpenOrange brings those pieces together for supported applications. [Released under Apache 2.0](https://github.com/rivet-dev/open-orange), it pairs an alternative runtime with deployment tools for AWS, Google Cloud, Azure or your own servers. It reads the project’s Wrangler configuration and supplies alternatives for supported services. How much of an application can move depends on which services it uses.

## How Workers run on Rivet

OpenOrange implements Workers APIs on **Node.js** rather than workerd. A **Durable Object**, which keeps application code and persistent state together, becomes a Rivet Actor. For a chat room, Rivet locates the room’s actor, starts it when needed and routes requests to it. The code accesses SQLite through the familiar storage API.

The [architecture](https://openorange.dev/docs/architecture/) packages the Worker and runtime in Docker containers, with Rivet coordinating actors and S3 backing storage. You can operate this infrastructure yourself or use Rivet’s managed deployment options.

Bindings connect a Worker to other services:

| Cloudflare capability | OpenOrange implementation |
| --- | --- |
| Worker request handlers | Node.js in your container |
| Durable Objects | Rivet Actors with per-object SQLite |
| D1 and KV | Actor-backed databases and key-value namespaces |
| R2 storage | Actor-backed bucket or configured S3-compatible store |

[Compatibility gaps](https://github.com/rivet-dev/open-orange/tree/main/docs/modules) include Durable Object point-in-time recovery, D1 read replicas and unsupported bindings such as Images. Capacity depends on your machines; self-hosting does not remove resource limits.

## What the pricing figures mean

Rivet’s [November 12 announcement](https://rivet.dev/changelog/2026-11-12-introducing-openorange/) advertises **4.8× cheaper compute and 8.7× cheaper storage** for Durable Objects: memory-duration charges and SQLite storage. Its separate comparison for ordinary Workers CPU is **1.4×**.

> **Behind the figures:** Rivet calculated these ratios from Cloudflare list rates and on-demand AWS Graviton and S3 prices in `us-east-1`, checked October 8, with 40% compute headroom. Your application’s savings will depend on utilization, network costs and the cost of operating or paying someone to manage the infrastructure.

As with [low-cost agent hosting](/news/ai-agent-cloud-hosting-costs/), cheaper resources are only part of the bill.

## What moves with the application

The [migration guide](https://openorange.dev/docs/migrate/) describes live migration for SQLite-backed Durable Objects. **D1 migration interrupts writes**, and queries fail during Cloudflare’s export. KV and R2 need separate transfers; `orange migrate` does not copy them. Writes after migration do not automatically sync back to Cloudflare.

The `orange doctor` command checks which bindings work, need another service or are unsupported. For the chat room, testing must cover both its behavior and saved history before switching traffic.

OpenOrange gives teams a way to keep supported Workers APIs while running the application on infrastructure they choose. If that control matters to you, start with compatibility and a migration rehearsal, then compare the full operating cost.

## Sources

- [Rivet’s November 12 announcement](https://rivet.dev/changelog/2026-11-12-introducing-openorange/) and [OpenOrange project](https://github.com/rivet-dev/open-orange).
- [Architecture](https://openorange.dev/docs/architecture/), [compatibility results](https://openorange.dev/docs/compatibility/) and [migration guide](https://openorange.dev/docs/migrate/).
- [Published pricing calculation](https://github.com/rivet-dev/open-orange/blob/1cabf2e9db300361c9f0b751c7723da7eb706f5e/website/src/data/site.ts#L126-L231) and [Cloudflare’s workerd runtime](https://github.com/cloudflare/workerd).
