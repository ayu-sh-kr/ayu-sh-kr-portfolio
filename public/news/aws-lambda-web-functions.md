# AWS Lambda Web Functions: Simpler Deployment, SSR and Active CPU Pricing

Deploying a web app to Lambda has often meant converting it into event handlers or adding an adapter around its HTTP server. **AWS Lambda Web Functions**, announced on October 12, 2026, removes that adaptation step for Node.js applications. Deploy the server, and Lambda provides an HTTPS endpoint, scaling and multi-region routing.

The launch brings server-rendered pages, APIs and streaming responses into a web-specific Lambda model. It also changes the bill: multiple requests can share one environment, with CPU charged for active processing and memory charged separately.

## Deploy the server instead of rewriting its routes

The familiar Lambda model is now called **Event Functions**: a handler receives an event, processes it and returns a result. Web Functions runs a standard HTTP server, keeping framework routing and middleware in place without an event-to-HTTP adapter.

AWS demonstrates deployment with this command:

```bash
aws lambda-web deploy --name my-web-app --code ./my-app
```

It packages the application, creates the Web Function and returns an HTTPS endpoint. The server must listen on the address supplied in `AWS_LAMBDA_HTTP_ENDPOINT`, so an existing app may still need its listen settings adjusted. AWS reports under a minute for its demonstration; that is deployment turnaround, not request latency.

Revisions preserve deployed versions, and endpoint traffic can be split between them for gradual rollouts. Event Functions remains the model for queue consumers and other AWS service events. See the [AWS launch announcement](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-web-functions-for-fast-consistent-web-app-performance-anywhere/).

## Which frameworks does it support?

At launch, Web Functions supports **Node.js 24 on Arm64**. Express, Fastify, Koa and Next.js can run their HTTP servers; AWS also names Hono and React Router. Next.js standalone deployments need their listen address mapped to Lambda's supplied value.

Each execution environment has 2 GB of memory, shared by the runtime and concurrent requests. Java and Spring Boot, Python and .NET are outside this launch's supported runtimes. This is a simpler deployment path for Node.js web applications, rather than a replacement for every Lambda runtime. AWS's [runtime documentation](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-runtimes.html) details the requirements.

## SSR, static content and CloudFront

**Server-side rendering (SSR)** builds HTML when a request arrives. Web Functions runs the framework's production server, making it useful for personalized pages, frequently changing content and API routes. Response streaming also fits services that forward output from an external AI model as it arrives.

Static files—images, CSS and browser JavaScript—can be cached through **CloudFront**, while dynamic requests reach the Web Function. AWS also supports CloudFront origin access control, allowing the endpoint to accept requests signed by the distribution. Custom domains and AWS WAF protection go through CloudFront.

The practical split is simple: cache reusable files near visitors and run application code for requests that need it. A purely static site does not need a Web Function to serve every page. My [SSR and SSG guide](/blog/ssr-vs-ssg-rendering-hydration-dom/) explains that choice, and AWS's [Web Functions overview](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html) covers the hosting capabilities.

## Speed comes from shared capacity and regional routing

One environment can handle up to **128 concurrent requests**, with a documented default upper bound of 64. While a request waits on a database or external API, the server can handle others. Existing warm capacity can absorb smaller traffic increases without immediately starting another environment.

Cold starts remain: Lambda scales to zero when idle, and incoming requests can wait for new environments to initialize. Heavy synchronous CPU work can also delay neighbouring requests. AWS has not published a comparative benchmark proving a universal speed advantage. The [scaling guide](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-scaling.html) explains the limits.

The launch regions are Northern Virginia, Ohio, Oregon, Tokyo and Ireland. Multi-region deployments use one global URL with best-effort latency-based routing. Mumbai is absent from that list. Moving application code nearer a visitor can reduce network delay, but a distant database may still dominate response time.

## Pricing: active CPU, plus memory and requests

AWS charges for requests, active CPU, consumed memory and data transfer. Its Northern Virginia Arm examples use these rates:

| Meter | Rate |
| --- | --- |
| Requests | $0.30 per million |
| Active CPU | $0.0000276944 per vCPU-second |
| Memory | $0.0000036667 per GB-second |

Waiting on an external service consumes little CPU. **Memory remains billable while the environment exists**, including gaps between requests; concurrent requests share that memory charge.

AWS's SSR example totals **$25.78 monthly** for 15 million requests, 40 ms active CPU per request and one environment consuming 0.49 GB throughout a 30-day month. It excludes free tier and data transfer. Bursty traffic, additional environments, regional pools and CloudFront can change the total, so this is an illustration rather than a budget for every app. See [AWS pricing](https://aws.amazon.com/lambda/pricing/) for the assumptions.

## Is AWS moving toward a rapid deployment ecosystem?

Simpler deployment, SSR, static delivery and global routing are also familiar parts of **Cloudflare Workers**. Cloudflare combines Worker code and [static assets](https://developers.cloudflare.com/workers/static-assets/) in one deployment. Its recent [cf CLI](/news/cloudflare-cf-cli-wrangler-migration/) and [Artifacts beta](/news/cloudflare-artifacts-next-git-platform/) add tools around configuration, repositories, builds and previews.

AWS approaches the same web-hosting needs through a standard Node.js server in selected Lambda regions, with CloudFront handling cached delivery. Workers uses Cloudflare's distributed runtime and integrated asset hosting. Both reduce deployment work, but the runtime, placement and surrounding services differ.

Billing has common ground too: Workers already separates CPU usage from request duration. Its [Standard plan](https://developers.cloudflare.com/workers/platform/pricing/) starts at $5 monthly with included requests and CPU usage. AWS meters requests, active CPU and memory separately, so the total depends on the workload and delivery setup.

Web Functions brings deployment, HTTPS, scaling and regional routing into a shorter path on AWS. CloudFront remains a separate part of the setup, and the launch supports only Node.js. Does this feel like Lambda gaining a more convenient web interface, or a step toward a **rapid deployment ecosystem** where getting an application online matters as much as configuring the infrastructure beneath it?
