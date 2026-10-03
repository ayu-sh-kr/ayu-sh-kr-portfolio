# Cloudflare launches cf CLI: what changes for Wrangler?

**Cloudflare has launched cf in open beta**, giving developers and coding agents a command-line tool for more than 3,000 Cloudflare API operations. The September 28 release reaches beyond Wrangler's roughly 280 command paths, covering services around an application as well as the Worker that runs it.

For developers familiar with Wrangler, the announcement raises an immediate question: **does cf replace it?** Cloudflare is moving toward cf as its main CLI, but Wrangler remains part of the transition. Some builds will still run through Wrangler, and its maintenance period starts only after the cf beta ends.

## Why Cloudflare is moving beyond Wrangler

Wrangler grew around building and deploying **Cloudflare Workers**, the platform's serverless applications. Running an application can involve more services: a database to save submissions, an access policy to restrict an admin page, or firewall rules to protect an endpoint. Cloudflare wants those operations available through the same CLI.

The growing use of coding agents helped drive that decision. Cloudflare says agents accounted for **48% of Wrangler use** in the week before the announcement, up from 25% in March 2026. The figures describe Wrangler usage, rather than the share of Cloudflare customers using agents.

Expanding the tool also meant changing how its commands are built. Cloudflare's Forge pipeline generates cf commands from the API definitions used for its documentation and software libraries. That replaces the need to write a separate command by hand for every operation and gives the CLI a more consistent structure across products.

## How cf helps agents find and read commands

With thousands of operations available, an agent needs a way to find the right one. **`cf cli search`** takes a description in ordinary language and returns matching commands based on their API descriptions and parameters. The CLI tells agents about this search when they first request help.

Finding the command is one step; understanding its result is another. **JSON is the default output** in cf, giving scripts and agents structured fields they can filter. For example, an agent checking a resource can extract its identifier or status without interpreting a table designed for a person reading a terminal.

The tool still includes guided forms for people completing operations with several inputs. Its agent features change how commands are discovered and results are read; developers still need to decide which account changes an agent should be allowed to make.

## TypeScript configuration and Vite become the new path

Alongside the CLI, Cloudflare introduces **`cloudflare.config.ts`**, starting with Worker configuration. TypeScript lets editors check settings and suggest valid options while developers or agents edit the file.

The format brings together bindings and triggers. A binding connects a Worker to a service such as a D1 database, R2 storage or a queue. A trigger defines what starts the Worker, such as an HTTP request or a schedule. Configuration can also use code to share settings between development and production environments.

Cloudflare intends to extend that format to other products, including DNS and zones. That broader configuration is still planned; the launch begins with Workers.

**Vite is cf's default development and build path**, using the Cloudflare Vite plugin. For an existing Vite-based Worker, `cf migrate` converts its configuration to the new format. New projects can start with `cf init`.

## What happens to Wrangler after cf launches?

Wrangler continues to handle development and deployment for JavaScript Workers that need its esbuild path, as well as Rust and Python Workers. In those cases, **cf delegates to Wrangler**. Installing the new CLI therefore does not automatically change how every Worker is built.

After the open beta, Cloudflare plans a final major Wrangler release that directs users toward cf. The company promises **18 months of Wrangler maintenance after the beta ends**. The announcement gives no beta end date, so that support window cannot yet be translated into a calendar deadline.

For an existing project, the build path is the useful starting point. A Vite-based Worker has a migration route to try and test; a project relying on Wrangler can continue through cf's delegated path. Cloudflare is broadening what its CLI can manage while giving developers time to move their Worker workflows across.

Source: [Cloudflare's September 28 announcement](https://blog.cloudflare.com/cloudflare-cf-cli-launch/).
