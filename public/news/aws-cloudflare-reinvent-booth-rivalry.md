# Cloudflare CEO says AWS cancelled its re:Invent 2026 booth

Cloudflare had a booth at AWS re:Invent last year. This year, its CEO says Amazon cancelled it. A rivalry usually fought over cloud bills and developer tools has reached the conference floor.

On **October 16, 2026**, Matthew Prince [said on X](https://x.com/eastdakota/status/2111209566499184883) that AWS had unilaterally cancelled Cloudflare's re:Invent booth. He framed it as a sign that Amazon sees a growing threat and said Cloudflare would attend Las Vegas and host side events instead. [Dealroom's October 17 reporting](https://dealroom.co/news/163434-cloudflare-vs-aws-feud-how-cloudflares-push-into-serverless-compute-and/) says AWS had not commented publicly; the reason for the cancellation remains unconfirmed.

The timing gives the dispute an audience: [re:Invent runs November 30–December 4](https://aws.amazon.com/events/reinvent/), roughly six weeks after Prince's post. Cloudflare's own [2025 event page](https://www.cloudflare.com/aws-reinvent-2025/) advertised **Booth 1384**, alongside developer sessions. Its presence at Amazon's conference had previously been part of doing business.

## From protecting applications to hosting them

Cloudflare became familiar as a network that **delivers websites faster** and **filters malicious traffic**. Its expansion into application hosting makes the competitive overlap easier to see:

- **The foundation:** [Workers](https://developers.cloudflare.com/workers/) runs application code, overlapping with Lambda; [R2](https://developers.cloudflare.com/r2/pricing/) stores objects, competing with S3. Workers AI adds hosted AI model responses, another area served by AWS through Bedrock. For example, an application can run its API on Workers, keep uploaded images in R2 and call an AI model without moving those jobs onto AWS. These products predate the latest announcements.
- **September 28 — broader infrastructure control:** The [cf CLI open beta](/news/cloudflare-cf-cli-wrangler-migration/) extends beyond Worker deployment to more than 3,000 API operations. Like the AWS CLI within Amazon's ecosystem, it gives developers and coding agents a common tool for managing services. Its structured output and command search help agents discover operations and read their results, extending the workflow beyond deploying code.
- **October 1 — repositories to deployment:** [Artifacts entered open beta](/news/cloudflare-artifacts-next-git-platform/), alongside a challenge to build agent-focused Git platforms. It supplies programmable repositories, while Workers Builds connects code pushes to deployments and previews. The opportunity is to keep repository management, review workflows and application delivery close together, with developers building their own coordination layer above Artifacts.

Together, these pieces let Cloudflare compete for **more of the application workflow**, from storing code to running it. That puts more of the same developer spending in reach of both companies.

## AWS is shortening its own deployment path

AWS's effort started before those late-September Cloudflare announcements. On **September 16**, it [introduced a simplified getting-started experience](https://aws.amazon.com/blogs/aws/aws-reimagines-the-getting-started-experience/) with **Google, GitHub, Apple and Amazon sign-in**, preconfigured projects and easier invitations for collaborators. AWS is gradually rolling it out to new customers; it is not yet available to everyone.

The same announcement puts the **AWS CLI and Agent Toolkit** at the center of agent-assisted setup. A supplied prompt installs and configures the tools so a coding agent can work with the project. AWS demonstrates an agent creating a Lambda function, DynamoDB table and API Gateway endpoint. That is an AWS demonstration, rather than an independent speed comparison, but it shows the direction: let the agent provision and deploy the services behind an application.

On **October 12**, four days before Prince's booth announcement, AWS launched [Lambda Web Functions](/news/aws-lambda-web-functions/). Developers can deploy a standard Node.js HTTP server without converting its routes into event handlers. AWS handles scaling and multi-region routing, with active CPU and memory billed separately.

The [launch](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-web-functions-for-fast-consistent-web-app-performance-anywhere/) brings AWS closer to the deployment convenience associated with Workers, although the runtimes and infrastructure differ. Teams already keeping data and backend services on AWS gain another reason to keep their web application there.

## The race is from agent-written code to a live application

As AI agents take on more coding, the next hurdle is getting that code online and operating it safely. Cloudflare is pushing a connected path: repositories, deployment tools, application hosting and the network protection it was already known for.

That last part strengthens its pitch. Applications can use Cloudflare's [web application firewall](https://developers.cloudflare.com/waf/concepts/) to filter unwanted requests and [bot controls](https://developers.cloudflare.com/bots/get-started/bot-management/) to challenge or block abusive automated traffic. Available protections depend on the plan and configuration, but developers can manage hosting and those defenses within the same platform.

**Cloudflare is pressing ahead with a broader build, deploy and protect workflow.** AWS's Web Functions shortens its own route to deployment. The contest is increasingly about which platform lets a developer and their agents bring the next application online with less setup, then keep it running under real traffic.

That makes Cloudflare a more direct competitor at re:Invent. Prince reads the cancelled booth as evidence that AWS feels threatened; Amazon's reason remains unconfirmed. Outside the expo hall, the more consequential race continues: **who makes the journey from generated code to a live, protected application simpler?**
