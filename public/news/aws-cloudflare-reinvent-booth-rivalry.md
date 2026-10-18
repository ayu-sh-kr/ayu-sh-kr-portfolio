# AWS and Cloudflare rivalry reaches the re:Invent booth

Cloudflare had a booth at AWS re:Invent last year. This year, its CEO says Amazon cancelled it. A rivalry usually fought over cloud bills and developer tools has reached the conference floor.

On **October 16, 2026**, Matthew Prince [said on X](https://x.com/eastdakota/status/2111209566499184883) that AWS had unilaterally cancelled Cloudflare's re:Invent booth. He framed it as a sign that Amazon sees a growing threat and said Cloudflare would attend Las Vegas and host side events instead. [Dealroom's October 17 reporting](https://dealroom.co/news/163434-cloudflare-vs-aws-feud-how-cloudflares-push-into-serverless-compute-and/) says AWS had not commented publicly; the reason for the cancellation remains unconfirmed.

The timing gives the dispute an audience: [re:Invent runs November 30–December 4](https://aws.amazon.com/events/reinvent/), roughly six weeks after Prince's post. Cloudflare's own [2025 event page](https://www.cloudflare.com/aws-reinvent-2025/) advertised **Booth 1384**, alongside developer sessions. Its presence at Amazon's conference had previously been part of doing business.

## From protecting applications to hosting them

Cloudflare became familiar as a network that delivers websites faster and filters malicious traffic. Its developer platform now competes for more of the application itself.

[Workers](https://developers.cloudflare.com/workers/) runs application code without developers managing servers, overlapping with AWS Lambda. R2 stores files and other objects, competing with Amazon S3. [Workers AI](https://developers.cloudflare.com/workers-ai/) adds hosted model inference: running a trained model to generate a response. That puts Cloudflare into another area served by AWS, including Amazon Bedrock, although their model catalogs and surrounding services differ.

The recent releases make that expansion easier to see. My [cf CLI coverage](/news/cloudflare-cf-cli-wrangler-migration/) followed Cloudflare's September 28 open beta: one command-line tool reaching beyond Worker deployment to more than 3,000 API operations. Developers and coding agents can manage more of the infrastructure around an application through the same interface.

Then came the October 1 [Artifacts open beta and Git-platform challenge](/news/cloudflare-artifacts-next-git-platform/). Artifacts supplies programmable repositories; Workers Builds connects code changes to deployments and previews. These are different pieces of a broader offer: **write, store, deploy and operate an application on Cloudflare**. They extend the competition beyond individual compute or storage services into the developer's everyday workflow.

Consider a small application with an API, uploaded images and an AI feature. Cloudflare can pitch the runtime, storage, inference and development workflow together. A provider once placed in front of an AWS application can now seek more of the spending behind it. That does not make the platforms interchangeable; runtime support, integrations and operational requirements still matter.

## AWS is shortening its own deployment path

AWS's recent launch belongs in that context too. On **October 12**, four days before Prince's booth announcement, AWS introduced [Lambda Web Functions](/news/aws-lambda-web-functions/). As I covered in that dispatch, developers can deploy a standard Node.js HTTP server without converting its routes into Lambda event handlers. AWS handles scaling and multi-region routing, and meters active CPU separately from memory.

The [AWS announcement](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-web-functions-for-fast-consistent-web-app-performance-anywhere/) shows Amazon reducing the work between application code and a live endpoint. Workers approaches that same convenience through Cloudflare's distributed runtime and integrated static assets; Web Functions uses regional Node.js environments with CloudFront available for cached delivery. The architectures differ, but **simpler deployment is becoming shared competitive ground**.

For that small application, AWS now offers another reason to keep the web layer alongside existing AWS services. Cloudflare offers a growing set of reasons to build more of it elsewhere. That is the commercial pressure behind the rivalry, even though the timing alone cannot establish why either company made a particular decision.

## The competition is for the next application

For the small application, the decision now reaches beyond which service runs its API. It includes how the code gets deployed, where uploaded images live, how AI features are connected and what serving users will cost. Cloudflare's recent releases make more of that workflow available within its platform; Web Functions makes staying on AWS easier for teams already using its services.

**Delivery costs remain part of that choice.** R2's [pricing documentation](https://developers.cloudflare.com/r2/pricing/) lists no egress bandwidth charge for sending stored objects to users. Storage and operations remain billable. That can matter for an application serving images repeatedly, but it does not establish that the entire application will cost less on Cloudflare. Compute, databases, requests and the surrounding services still shape the total.

The stronger competitive pitch is the combination: a shorter deployment path, connected services and a bill that fits the workload. Cloudflare is assembling more of those pieces around Workers. AWS is bringing a simpler web deployment model to an ecosystem where many teams already keep their data and backend services. Each has a reason to win the application early, before its dependencies make a later move more work.

That is why the recent launches give the booth dispute more context. Cloudflare is seeking a larger role in building and running applications, putting it in more direct competition with the host of re:Invent. Prince reads the cancellation as a sign that AWS feels threatened; the growing overlap explains the competitive stakes, while Amazon's reason remains unconfirmed.

Cloudflare can still take that pitch to Las Vegas, even outside the expo hall. For developers, the more consequential contest is already happening in the products: **which platform makes the next application easier to build, operate and afford?**
