# AWS and Cloudflare rivalry reaches the re:Invent booth

Cloudflare had a booth at AWS re:Invent last year. This year, its CEO says Amazon cancelled it. A rivalry usually fought over cloud bills and developer tools has reached the conference floor.

On **October 16, 2026**, Matthew Prince [said on X](https://x.com/eastdakota/status/2111209566499184883) that AWS had unilaterally cancelled Cloudflare's re:Invent booth. He framed it as a sign that Amazon sees a growing threat and said Cloudflare would attend Las Vegas and host side events instead. [Dealroom's October 17 reporting](https://dealroom.co/news/163434-cloudflare-vs-aws-feud-how-cloudflares-push-into-serverless-compute-and/) says AWS had not commented publicly; the reason for the cancellation remains unconfirmed.

The timing gives the dispute an audience: [re:Invent runs November 30–December 4](https://aws.amazon.com/events/reinvent/), roughly six weeks after Prince's post. Cloudflare's own [2025 event page](https://www.cloudflare.com/aws-reinvent-2025/) advertised **Booth 1384**, alongside developer sessions. Its presence at Amazon's conference had previously been part of doing business.

## From protecting applications to hosting them

Cloudflare became familiar as a network that delivers websites faster and filters malicious traffic. Its developer platform now competes for more of the application itself.

[Workers](https://developers.cloudflare.com/workers/) runs application code without developers managing servers, overlapping with AWS Lambda. R2 stores files and other objects, competing with Amazon S3. [Workers AI](https://developers.cloudflare.com/workers-ai/) adds hosted model inference: running a trained model to generate a response. That puts Cloudflare into another area served by AWS, including Amazon Bedrock, although their model catalogs and surrounding services differ.

Consider a small application that runs an API, stores uploaded images and calls an AI model. Cloudflare can now pitch several parts of that workload together. That is the competitive shift: a provider once used in front of an AWS application can also seek the spending behind it. The services still need comparing on runtime support, integrations and operational requirements.

## The bill that kept the rivalry going

**Egress fees** are charges for sending data out of a provider's network. For an image-heavy application, repeated downloads make that a recurring cost.

Cloudflare made those charges a public battleground. Its July 2021 [AWS's Egregious Egress](https://blog.cloudflare.com/aws-egregious-egress/) post argued that wholesale bandwidth costs had fallen much faster than AWS's transfer prices, making it expensive to use other providers alongside AWS.

AWS [introduced a migration waiver in March 2024](https://aws.amazon.com/blogs/aws/free-data-transfer-out-to-internet-when-moving-out-of-aws/), citing customer choice and the EU Data Act's direction. Eligible customers moving data off AWS can request transfer credits through support, subject to the program's terms. **A migration waiver and free everyday delivery solve different problems.** R2's [pricing documentation](https://developers.cloudflare.com/r2/pricing/) lists no egress bandwidth charge, while storage, operations and some retrievals remain billable.

That difference keeps Cloudflare's argument relevant after AWS's concession. For the small application, the question is both what it costs to leave and what it costs to keep serving users.

The cancelled booth gives Prince a new way to tell that story outside Amazon's expo hall. It does not establish who is winning. As both providers compete for more of the same application, will developers see better prices and simpler deployment—or mostly a louder rivalry?
