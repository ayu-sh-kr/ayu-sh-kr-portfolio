# Cloudflare introduces cf: what happens to Wrangler?

Cloudflare has released **cf**, a new command-line tool for its platform, in open beta. It covers more than 3,000 Cloudflare API operations, while the familiar **Wrangler** CLI has commands for about 280. The September 28 announcement is a change in how developers and coding agents manage Cloudflare, from deploying a Worker to configuring the services around it.

The distinction matters if your application needs more than a deployment. A Worker might also need a D1 database, an Access policy and a WAF rule. Wrangler has been useful for building and deploying Workers, but Cloudflare's wider API has outgrown its hand-written command set. With `cf`, the company wants those operations reachable through one CLI.

## Why Cloudflare built a second CLI

Cloudflare says coding agents accounted for **48% of Wrangler use** in the week before its announcement, up from a quarter in March 2026. Those are Cloudflare's usage figures, not a measure of all Cloudflare customers. Agents also use more distinct commands per day, making gaps and inconsistent command names more noticeable.

Rather than adding thousands of hand-written Wrangler commands, Cloudflare generates `cf` commands from the API schemas used for its documentation and SDKs. Its Forge pipeline provides that generation path. This explains the jump in coverage, but API access through a CLI does not mean every operation is safe for an agent to perform without review.

Finding one command among thousands presents another problem. `cf cli search` accepts a natural-language description and returns likely commands based on their API descriptions and parameters. Cloudflare says the CLI introduces this search to an agent when it first runs help. **JSON is the default output**, so scripts and agents can select fields without parsing a terminal table; humans can still use guided forms for operations that need several inputs.

## A typed Worker configuration and Vite

The launch also introduces `cloudflare.config.ts`, a TypeScript configuration format beginning with Workers. It puts a Worker's settings, bindings and triggers into code that an editor can check and complete. A binding is the connection a Worker uses to access something such as D1, R2 or a queue. Cloudflare plans to extend this configuration to more products, including zones and DNS; that wider configuration is a plan, not part of today's Worker-focused starting point.

**Vite is the default build and development path** in `cf`. Cloudflare recommends its Vite plugin for Workers and says `cf migrate` converts existing Vite-based Workers to the new configuration. For a new project, `cf init` creates a starting point. These are migration options, so an existing project deserves a test build before changing its deployment process.

## Is Wrangler going away?

Wrangler still has a role. Cloudflare says `cf` delegates development and deployment to Wrangler for JavaScript Workers that continue to use esbuild, as well as Rust and Python Workers. A Worker that depends on Wrangler's build path will not suddenly switch to Vite merely because its developer installs `cf`.

Cloudflare plans a final major Wrangler release after the open beta that points users toward `cf`. It promises **18 months of Wrangler maintenance support after the beta ends**; it has not supplied an end date for the beta in this announcement. That makes the timeframe relative, rather than a fixed shutdown date.

For now, `cf` expands the commands available to developers and agents, while Wrangler continues to carry builds that have not moved to the Vite path. If your Worker already uses Vite, `cf migrate` is the direct route to evaluate. If it relies on Wrangler's existing build behavior, the useful question is whether `cf` can manage the surrounding Cloudflare services while Wrangler keeps that build working.

Source: [Cloudflare's September 28 announcement](https://blog.cloudflare.com/cloudflare-cf-cli-launch/).
