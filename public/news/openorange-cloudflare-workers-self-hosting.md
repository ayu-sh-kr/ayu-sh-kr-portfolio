# OpenOrange brings Cloudflare Workers to your own cloud

A Cloudflare Worker can be a small piece of JavaScript, but moving it also means finding a home for the services it uses. **Rivet launched OpenOrange on November 12** to run supported Workers applications outside Cloudflare while retaining their existing application code and configuration.

The [Apache-2.0 project](https://github.com/rivet-dev/open-orange) provides a runtime and deployment tools for AWS, Google Cloud, Azure or your own servers. It reads the project’s Wrangler configuration and supplies alternatives for supported databases, storage and background services. The scope depends on which of those services your application uses.

## How Workers run on Rivet

Cloudflare already publishes [workerd](https://github.com/cloudflare/workerd), the open-source runtime behind Workers, for local development and self-hosting. OpenOrange takes another route: it implements Workers APIs on **Node.js** and uses Rivet to coordinate stateful services across machines.

A **Durable Object** combines application code with its own persistent state, useful for something like a chat room. OpenOrange maps each object to a Rivet Actor. When a request needs that room, Rivet locates its actor, starts it if necessary and routes the request to it. The room’s code accesses its SQLite database through the familiar storage API.

The [deployment architecture](https://openorange.dev/docs/architecture/) packages the Worker and runtime into Docker containers. Rivet coordinates the actors, with S3 backing their storage. You can operate that infrastructure yourself or use Rivet’s managed deployment options.

Bindings are the connections through which a Worker accesses a database, bucket or other service. OpenOrange maps those connections onto different implementations:

| Cloudflare capability | Where it runs on OpenOrange |
| --- | --- |
| Worker request handlers | A Node.js process in your container |
| Durable Objects | Rivet Actors with per-object SQLite databases |
| D1 and KV | Actor-backed databases and key-value namespaces |
| R2 object storage | An actor-backed bucket or a configured S3-compatible store |

The implementations have differences. The [module documentation](https://github.com/rivet-dev/open-orange/tree/main/docs/modules) lists gaps: Durable Object point-in-time recovery is missing, D1 lacks read replicas, and unsupported bindings such as Images throw when called. Memory and execution capacity depend on your machines rather than Cloudflare’s Workers quotas; **the deployment still has resource limits**.

## What the cheaper-compute claim compares

Rivet’s [launch announcement](https://rivet.dev/changelog/2026-11-12-introducing-openorange/) advertises **4.8× cheaper compute and 8.7× cheaper storage**. Both headline ratios refer specifically to Durable Objects: memory-duration charges and SQLite storage. Its separate comparison for ordinary Workers CPU is **1.4×**, not 4.8×.

> **Cost-model context:** Rivet compares Cloudflare list rates with raw on-demand AWS Graviton and S3 prices in `us-east-1`, allowing 40% compute headroom and using prices checked October 8. These are unit-cost calculations, not an independent benchmark of an identical production application. Capacity utilization, network charges, operations and any managed-service fees still belong in your own estimate.

As with [low-cost agent hosting](/news/ai-agent-cloud-hosting-costs/), a cheaper resource unit is useful evidence, but not the whole bill.

## Moving code is only part of moving an app

The [migration guide](https://openorange.dev/docs/migrate/) describes different paths for different data. SQLite-backed Durable Objects have a live-migration path. **D1 migration interrupts writes**, and queries fail during Cloudflare’s export. KV and R2 data are not copied by `orange migrate`; they need a separate transfer. Writes made after moving to OpenOrange do not automatically sync back to Cloudflare.

For the chat-room example, that means checking both the room’s behavior and its saved history before switching traffic. The documented `orange doctor` command reports bindings that work, need another service or are unsupported; a staging rehearsal must then cover the application and its data.

For a team that wants its Workers application near an existing database or on its own servers, OpenOrange offers another deployment path. The useful change is the ability to retain supported application APIs while replacing the infrastructure behind them. Whether that move is worthwhile comes down to the services the application needs, the data it must carry over and the cost of operating its new home.

## Sources

- [Rivet’s November 12 announcement](https://rivet.dev/changelog/2026-11-12-introducing-openorange/) and [OpenOrange project](https://github.com/rivet-dev/open-orange).
- [Architecture](https://openorange.dev/docs/architecture/), [compatibility results](https://openorange.dev/docs/compatibility/) and [migration guide](https://openorange.dev/docs/migrate/).
- [Published pricing calculation](https://github.com/rivet-dev/open-orange/blob/1cabf2e9db300361c9f0b751c7723da7eb706f5e/website/src/data/site.ts#L126-L231) and [Cloudflare’s workerd runtime](https://github.com/cloudflare/workerd).
