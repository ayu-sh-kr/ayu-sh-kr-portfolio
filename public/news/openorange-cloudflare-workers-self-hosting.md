# OpenOrange brings Cloudflare Workers to your own cloud

Moving a Cloudflare application is rarely just moving its JavaScript. Its database, stored objects and background jobs may depend on Cloudflare too. **OpenOrange**, launched by Rivet on November 12, aims to move that whole application without rewriting its code around another cloud’s APIs.

The [Apache-2.0 project](https://github.com/rivet-dev/open-orange) reads existing Wrangler configuration and runs supported Workers applications on AWS, Google Cloud, Azure or your own servers. It offers a way to keep the Workers programming model while choosing where the application lives, including beside a database already running elsewhere.

## Same APIs, different machinery

Cloudflare already publishes [workerd](https://github.com/cloudflare/workerd), the open-source runtime behind Workers, for local development and self-hosting. OpenOrange takes another route: it implements Workers APIs on **Node.js** and uses Rivet to coordinate stateful services across machines.

A **Durable Object** combines application code with its own persistent state, useful for something like a chat room. On OpenOrange, that room becomes a Rivet Actor: a unit of code and state that Rivet locates, starts and routes requests to. The [deployment architecture](https://openorange.dev/docs/architecture/) packages application code into Docker containers, with Rivet managing actors and S3 backing their storage.

Bindings are the connections through which a Worker accesses a database, bucket or other service. OpenOrange maps those connections onto different implementations:

| Cloudflare capability | Where it runs on OpenOrange |
| --- | --- |
| Worker request handlers | A Node.js process in your container |
| Durable Objects | Rivet Actors with per-object SQLite databases |
| D1 and KV | Actor-backed databases and key-value namespaces |
| R2 object storage | An actor-backed bucket or a configured S3-compatible store |

That mapping is broader than moving a runtime, but it is not complete equivalence. The [module documentation](https://github.com/rivet-dev/open-orange/tree/main/docs/modules) lists gaps: Durable Object point-in-time recovery is missing, D1 lacks read replicas, and unsupported bindings such as Images throw when called. Node.js removes Cloudflare’s particular runtime limits; **your hardware and deployment still impose limits**.

## What the cheaper-compute claim compares

Rivet’s [launch announcement](https://rivet.dev/changelog/2026-11-12-introducing-openorange/) advertises **4.8× cheaper compute and 8.7× cheaper storage**. Both headline ratios refer specifically to Durable Objects: memory-duration charges and SQLite storage. Its separate comparison for ordinary Workers CPU is **1.4×**, not 4.8×.

> **Cost-model context:** Rivet compares Cloudflare list rates with raw on-demand AWS Graviton and S3 prices in `us-east-1`, allowing 40% compute headroom and using prices checked October 8. These are unit-cost calculations, not an independent benchmark of an identical production application. Capacity utilization, network charges, operations and any managed-service fees still belong in your own estimate.

As with [low-cost agent hosting](/news/ai-agent-cloud-hosting-costs/), a cheaper resource unit is useful evidence, but not the whole bill.

## Moving code is only part of moving an app

The [migration guide](https://openorange.dev/docs/migrate/) is more specific than the launch slogan. SQLite-backed Durable Objects have a live-migration path. **D1 migration interrupts writes**, and queries fail during Cloudflare’s export. KV and R2 data are not copied by `orange migrate`; they need a separate transfer. Writes made after moving to OpenOrange do not automatically sync back to Cloudflare.

For the chat-room example, that means checking both the room’s behavior and its saved history before switching traffic. The documented `orange doctor` command reports bindings that work, need another service or are unsupported; a staging rehearsal must then cover the application and its data.

OpenOrange makes the hosting choice less tied to the API choice. That is valuable for teams that want Workers-style development near their existing infrastructure or on their own servers. The decision is not simply whether the code starts elsewhere: it is whether the application stays correct, its data moves safely, and the new operating costs justify the move.

## Sources

- [Rivet’s November 12 announcement](https://rivet.dev/changelog/2026-11-12-introducing-openorange/) and [OpenOrange project](https://github.com/rivet-dev/open-orange).
- [Architecture](https://openorange.dev/docs/architecture/), [compatibility results](https://openorange.dev/docs/compatibility/) and [migration guide](https://openorange.dev/docs/migrate/).
- [Published pricing calculation](https://github.com/rivet-dev/open-orange/blob/1cabf2e9db300361c9f0b751c7723da7eb706f5e/website/src/data/site.ts#L126-L231) and [Cloudflare’s workerd runtime](https://github.com/cloudflare/workerd).
