# AWS Lambda Web Functions: Frameworks, Pricing and Performance

Deploying a web app to AWS Lambda has often meant adapting it to Lambda's event-handler model or adding an adapter to run an existing HTTP server. For developers who want to deploy their app and let AWS handle the hosting, that is extra setup before the app can serve its first page.

**AWS Lambda Web Functions**, announced on October 12, 2026, remove that adaptation step for Node.js applications. An Express, Fastify or Next.js server can run as a standard HTTP server, while Lambda provides an HTTPS endpoint, scales capacity with traffic and supports deployment across multiple regions.

The launch also changes how web requests use and pay for compute. Several requests can share one running environment, and CPU is billed for active processing rather than the entire time a request stays open. Memory has a separate charge.

The appeal is straightforward: **keep the web framework, deploy the server, and let Lambda manage the execution environments**. There are still runtime limits and application responsibilities, but developers no longer need to reshape HTTP routes into Lambda handlers.

## A web server instead of an event handler

AWS now calls the familiar Lambda model **Event Functions**. These receive an event in a handler, process it and return a result. Web Functions introduce an HTTP-native model: the application listens on a port and receives ordinary web requests directly.

Routing and middleware stay inside the framework. No event-to-HTTP adapter is required, and the deployment flow creates the Web Function and its endpoint without prior resource setup. AWS also provides immutable revisions, with traffic splitting between releases for gradual rollouts.

Event Functions remain the fit for queue consumers and other AWS service events. This launch gives web applications their own deployment model alongside that existing capability. [AWS's announcement](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-web-functions-for-fast-consistent-web-app-performance-anywhere/) sets out the distinction.

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

## What deployment looks like

The server must listen on the address in `AWS_LAMBDA_HTTP_ENDPOINT`. For an existing Express application, the main connection to Lambda is its listen address:

```js
const endpoint = process.env.AWS_LAMBDA_HTTP_ENDPOINT ?? '127.0.0.1:3000';
const [host, port] = endpoint.split(':');

app.listen(Number(port), host);
```

With AWS credentials, permissions and tooling that includes the announced command, AWS shows this deployment flow:

```bash
aws lambda-web deploy --name my-web-app --code ./my-app
```

The command packages the app and returns an HTTPS endpoint. AWS reports under a minute for its demonstration; that is deployment turnaround, not request latency. We have not run this deployment.

Your server must begin listening within ten seconds. Application startup and persistent data remain the developer's responsibility. Environments can disappear, taking local state with them, so important data needs an external store. Request-specific data must also stay out of shared globals. AWS's [environment lifecycle guide](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-env-lifecycle.html) explains startup and shutdown behaviour.

## Where the performance improvement comes from

The performance change starts with how Lambda uses running capacity. While one request waits on a database or external service, the server can handle another. Web Functions allow up to **128 concurrent requests per environment**; the documented default upper bound is 64. Lambda adjusts concurrency dynamically, so these are limits rather than guaranteed throughput.

Sharing warm capacity means a small traffic increase may fit into existing environments. Requests beyond available warm capacity can still wait for new environments to start. When traffic stops, Lambda scales to zero; the next request cold-starts.

Concurrency helps waiting-heavy work. Synchronous CPU work blocks Node's event loop and delays neighbouring requests. Raising concurrency can therefore make latency worse for expensive rendering or large payload processing. The benefit therefore depends on how much time an application spends waiting versus doing CPU work. AWS's [scaling guide](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-scaling.html) describes these trade-offs.

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

## When Web Functions make sense

The strongest fit is an HTTP application with variable traffic and substantial asynchronous waiting: API backends, personalized SSR pages, GraphQL services and endpoints streaming output from an external AI model. Streaming a model's response is distinct from hosting the model itself.

For public sites, CloudFront can cache static assets while forwarding dynamic requests. Custom domains and AWS WAF protection go through CloudFront; endpoint authentication and application authorization still need deliberate configuration. AWS's [Web Functions overview](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html) covers these capabilities.

For developers who wanted Lambda's scaling without converting a web server into handlers, this is the main change: the server itself becomes the deployment unit. Framework routing stays familiar, while AWS takes care of starting, distributing and removing execution environments.

At launch, that simpler path is available to Node.js applications. Java and Spring Boot projects still need another deployment approach. And while Web Functions reduce the hosting setup, database placement, application authentication and efficient server code still determine the experience users receive.
