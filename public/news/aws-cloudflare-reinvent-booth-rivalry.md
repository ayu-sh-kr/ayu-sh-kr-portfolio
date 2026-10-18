# AWS and Cloudflare rivalry reaches the re:Invent booth

Cloudflare had a booth at AWS re:Invent last year. This year, its CEO says Amazon cancelled it. A rivalry usually fought over cloud bills and developer tools has reached the conference floor.

On **October 16, 2026**, Matthew Prince [said on X](https://x.com/eastdakota/status/2111209566499184883) that AWS had unilaterally cancelled Cloudflare's re:Invent booth. He framed it as a sign that Amazon sees a growing threat and said Cloudflare would attend Las Vegas and host side events instead. [Dealroom's October 17 reporting](https://dealroom.co/news/163434-cloudflare-vs-aws-feud-how-cloudflares-push-into-serverless-compute-and/) says AWS had not commented publicly; the reason for the cancellation remains unconfirmed.

The timing gives the dispute an audience: [re:Invent runs November 30–December 4](https://aws.amazon.com/events/reinvent/), roughly six weeks after Prince's post. Cloudflare's own [2025 event page](https://www.cloudflare.com/aws-reinvent-2025/) advertised **Booth 1384**, alongside developer sessions. Its presence at Amazon's conference had previously been part of doing business.

## From protecting applications to hosting them

Cloudflare became familiar as a network that **delivers websites faster** and **filters malicious traffic**. Its expansion into application hosting makes the competitive overlap easier to see:

- **The foundation:** [Workers](https://developers.cloudflare.com/workers/) runs application code, overlapping with Lambda; [R2](https://developers.cloudflare.com/r2/pricing/) stores objects, competing with S3. Workers AI adds hosted AI model responses, another area served by AWS through Bedrock. These products predate the latest announcements.
- **September 28 — broader infrastructure control:** The [cf CLI open beta](/news/cloudflare-cf-cli-wrangler-migration/) extends beyond Worker deployment to more than 3,000 API operations. Like the AWS CLI within Amazon's ecosystem, it gives developers and coding agents a common tool for managing services.
- **October 1 — repositories to deployment:** [Artifacts entered open beta](/news/cloudflare-artifacts-next-git-platform/), alongside a challenge to build agent-focused Git platforms. It supplies programmable repositories, while Workers Builds connects code pushes to deployments and previews.

Together, these pieces let Cloudflare compete for **more of the application workflow**, from storing code to running it. That puts more of the same developer spending in reach of both companies.

## AWS is shortening its own deployment path

On **October 12**, four days before Prince's booth announcement, AWS launched [Lambda Web Functions](/news/aws-lambda-web-functions/). Developers can deploy a standard Node.js HTTP server without converting its routes into event handlers. AWS handles scaling and multi-region routing, with active CPU and memory billed separately.

The [launch](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-web-functions-for-fast-consistent-web-app-performance-anywhere/) brings AWS closer to the deployment convenience associated with Workers, although the runtimes and infrastructure differ. Teams already keeping data and backend services on AWS gain another reason to keep their web application there.

## The competition is for the next application

Cloudflare's pitch now combines development tools, hosting and storage. R2's zero-egress pricing adds a delivery-cost argument, although storage and operations remain billable. AWS counters with a simpler deployment path inside its established ecosystem.

The stakes are clearer than the motive behind the booth decision: **both providers want to be where the next application gets built**. Winning that choice can bring the runtime, storage and supporting services with it.

Prince reads the cancellation as a sign that AWS feels threatened; Amazon's reason remains unconfirmed. But the recent releases explain why Cloudflare is becoming a more direct competitor at AWS's own conference. With Cloudflare taking its pitch outside the expo hall, which platform will make the stronger case through its products?
