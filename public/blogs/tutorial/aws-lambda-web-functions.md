# AWS Lambda Web Functions: Frameworks, Pricing and Performance

An order-status API might spend more time waiting for PostgreSQL than building its response. The customer waits for both, but the server's CPU is busy for only part of that request. Hosting choices decide how that waiting affects capacity and cost.

**AWS Lambda Web Functions**, announced on October 12, 2026, bring a different model to Lambda: deploy a normal Node.js HTTP server, share an execution environment across concurrent requests, and pay for active CPU separately from memory. The change matters for APIs, server-rendered pages and streaming applications.

This guide explains which frameworks fit, where the speed improvements can come from, and how to read the bill. It is based on AWS's announcement and documentation; the examples below are explanatory, not a deployment benchmark.

## What changes from ordinary Lambda?

The familiar Lambda model now has the name **Event Functions**. Code receives an event in a handler, performs work and returns a result. Web Functions instead run a server listening on a network port, with an HTTPS endpoint managed by Lambda.

For our order API, routing and middleware stay inside the web framework. There is no event-to-HTTP adapter to translate an invocation into a request. AWS also provides immutable revisions and endpoints that can divide traffic between releases, making gradual rollouts possible.

The distinction is about workload. A browser asking for an order belongs on the HTTP path. A queue message requesting invoice generation still belongs in an Event Function. Both can remain part of the same application. [AWS's launch announcement](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-web-functions-for-fast-consistent-web-app-performance-anywhere/) explains the new form factors.

## Which frameworks and languages are supported?

At launch, Web Functions use **Node.js 24 on Arm64**. AWS documents support for Node.js frameworks that start an HTTP server, rather than a closed list of framework integrations.

| Framework or stack | How it fits |
| --- | --- |
| Express, Fastify and Koa | Run their standard Node.js HTTP servers. |
| Hono and React Router | AWS names them among supported web framework choices; use a Node.js server setup. |
| Next.js | Supported; standalone servers need their listen settings mapped to Lambda's supplied address. |
| Java / Spring Boot, Python and .NET | Not supported by this Web Functions launch. Use an appropriate Event Functions deployment instead. |

The important compatibility check is the **server runtime**, not the UI library. A React or Angular frontend does not become a server merely by being deployed here. Static builds can stay on object storage and a CDN; applications rendering HTML per request need a compatible Node.js server. Our [SSR and SSG guide](/blog/ssr-vs-ssg-rendering-hydration-dom/) explains that choice.

Each environment has 2 GB of memory, shared by the runtime and concurrent requests. Native dependencies must match Arm64. See AWS's [runtime and framework documentation](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-runtimes.html) before moving an existing application.

## Where the performance improvement comes from

Return to the order lookup. While one request awaits PostgreSQL, Node.js can handle another. Web Functions allow up to **128 concurrent requests per environment**; the documented default upper bound is 64. Lambda adjusts concurrency dynamically, so these are limits rather than guaranteed throughput.

Sharing warm capacity means a small traffic increase may fit into existing environments. Requests beyond available warm capacity can still wait for new environments to start. When traffic stops, Lambda scales to zero; the next request cold-starts.

Concurrency helps waiting-heavy work. Synchronous CPU work blocks Node's event loop and delays neighbouring requests. Raising concurrency can therefore make latency worse for expensive rendering or large payload processing. Measure response-time percentiles under realistic traffic, including the first request after idle, before selecting settings. AWS's [scaling guide](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-scaling.html) describes these trade-offs.

Regional deployment addresses a separate delay: network distance. At launch, the regions are Northern Virginia, Ohio, Oregon, Tokyo and Ireland. A multi-region deployment uses one global URL with best-effort latency-based routing. Mumbai is absent from that launch list, which matters for Indian audiences.

A nearby server can still wait on a distant database. Code replication does not establish a replicated data architecture. The announcement provides no universal millisecond response-time guarantee or comparative speed benchmark.

> Concurrency can reduce waiting for capacity; it cannot remove waiting for data.

## Pricing: CPU waiting and memory waiting are different

AWS prices Web Functions using requests, active CPU, consumed memory and data transfer. Its US East (Northern Virginia), Arm examples use these rates:

| Meter | Example rate |
| --- | --- |
| Requests | $0.30 per million |
| Active CPU | $0.0000276944 per vCPU-second |
| Memory | $0.0000036667 per GB-second |

Compute is metered at one-millisecond granularity. Waiting on a database uses little CPU, but **memory remains billable while the environment exists**, including gaps between requests. Concurrent requests share that environment's memory charge.

AWS's SSR example assumes 15 million monthly requests, 40 ms active CPU per request and one environment consuming 0.49 GB throughout a 30-day month. CPU costs $16.62, memory $4.66 and requests $4.50: **$25.78**, excluding free tier and transfer.

That is an illustrative workload, not a quote for every application. Bursts, multiple regional pools and larger memory footprints change the calculation. Database, logging and CDN costs also belong in the application's budget. Check the [Web Functions pricing section](https://aws.amazon.com/lambda/pricing/) for current regional rates.

## What deployment looks like

The server must listen on the address in `AWS_LAMBDA_HTTP_ENDPOINT`. For an existing Express application, the listen step looks like this:

```js
const endpoint = process.env.AWS_LAMBDA_HTTP_ENDPOINT ?? '127.0.0.1:3000';
const [host, port] = endpoint.split(':');

app.listen(Number(port), host);
```

With AWS credentials, permissions and tooling that includes the announced command, AWS shows this deployment flow:

```bash
aws lambda-web deploy --name order-api --code ./my-app
```

The command packages the app and returns an HTTPS endpoint. AWS reports under a minute for its demonstration; that is deployment turnaround, not request latency. We have not run this deployment.

Your server must begin listening within ten seconds. Keep startup small, and put durable order data in an external store: environments can disappear, taking local state with them. Request-specific data must also stay out of shared globals. AWS's [environment lifecycle guide](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-env-lifecycle.html) explains startup and shutdown behaviour.

## When Web Functions make sense

The strongest fit is an HTTP application with variable traffic and substantial asynchronous waiting: order APIs, personalized SSR pages, GraphQL services and endpoints streaming output from an external AI model. Streaming a model's response is distinct from hosting the model itself.

For public sites, CloudFront can cache static assets while forwarding dynamic requests. Custom domains and AWS WAF protection go through CloudFront; endpoint authentication and application authorization still need deliberate configuration. AWS's [Web Functions overview](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html) covers these capabilities.

For the order service, I would evaluate the HTTP API here, keep invoice jobs event-driven, and measure database round trips before adding regions. A Java backend has a different decision because the launch does not support its runtime.

Web Functions make a normal Node.js server easier to operate on Lambda. Their practical value comes from sharing capacity during I/O waits and billing CPU activity separately. Choose them when those properties match the workload, then verify latency and total cost with the application that will actually run.
