# AWS Emulator brings the cloud testing loop to your laptop

A coding agent can change your application in seconds. Testing its next S3 upload or DynamoDB write should not mean waiting for another cloud deployment. **AWS Emulator** brings that feedback loop onto your own computer.

[Launched on November 11](https://aws.amazon.com/about-aws/whats-new/2026/11/aws-emulator-now-available/), it is AWS’s local implementation of its service APIs. Existing SDKs and CLI commands connect to a local endpoint instead of a live AWS account. There is no additional service fee, and the source carries a CC0 public-domain dedication.

## What you can test locally

AWS’s [walkthrough](https://aws.amazon.com/blogs/aws/test-your-applications-against-aws-locally-with-aws-emulator/) demonstrates a practical development loop:

| Capability | What it lets you do |
| --- | --- |
| S3 storage | Create a bucket, upload an object and list it |
| DynamoDB | Create a table, write an item and read it back |
| CLI and SDK integration | Use familiar API calls against a local HTTPS endpoint |
| Embedded Rust tests | Run isolated instances inside test processes without a shared server |

> **Download and speed:** AWS’s [Linux x86-64 RPM](https://downloads.aws.com/aws-emulator/packages/aws-emulator/LTS/latest/aws-emulator-x86_64.rpm) reported a 166,735,193-byte download, about **167 MB**, when checked on November 12. This is package size, not the installed binary or Docker image. AWS describes API responses in milliseconds; that is not a cold-start benchmark. The launch sources do not specify a measured service startup time.

The [CLI setup](https://docs.aws.amazon.com/emulator/latest/userguide/point-sdk-to-emulator.html) sets `AWS_ENDPOINT_URL` to localhost and uses emulator-generated credentials and certificates, with real credentials removed. This redirects requests; it does not mirror your existing cloud infrastructure. You create emulated resources, and [their in-memory state disappears when the emulator stops](https://docs.aws.amazon.com/emulator/latest/userguide/what-is-service.html#limitations).

## Built for coding agents, and by them

AWS also uses AI agents to develop the emulator: they identify gaps, write tests and implement changes. Published fidelity tests compare its behavior with real AWS before release. That makes the agent-built process inspectable, not automatically complete.

Unsupported operations return **HTTP 501**. IAM policy enforcement and cross-account or cross-Region behavior are absent. Passing locally is still a step toward testing on AWS, not proof your production setup is correct.

Local testing already has options. [LocalStack](https://www.localstack.cloud/pricing) offers persistence and IAM testing on paid tiers; its free Hobby plan is non-commercial. [Testcontainers](https://testcontainers.com/modules/localstack/) can manage LocalStack containers, while [Moto](https://github.com/getmoto/moto) provides Python mocks. AWS adds a first-party choice, not a new category.

Alongside [Lambda Web Functions simplifying deployment](/news/aws-lambda-web-functions/), this points toward **less setup between writing code and seeing it work**. That is a reading of AWS’s direction, not an announced roadmap. The practical change is simpler: developers and agents can catch more mistakes before deployment, while real AWS remains the final check for permissions, integration and production behavior.
