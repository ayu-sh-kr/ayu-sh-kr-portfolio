# AWS Emulator vs LocalStack: local AWS testing compared

Testing an S3 upload or a DynamoDB write should not require a deployment for every change. LocalStack already gives developers a local version of AWS services. Now AWS is offering its own: **AWS Emulator**, launched on November 11, runs existing SDK and CLI calls against your computer without an AWS account.

The Rust implementation runs local tests without provisioning cloud resources. Its [launch announcement](https://aws.amazon.com/about-aws/whats-new/2026/11/aws-emulator-now-available/) describes in-memory state and a CC0 public-domain dedication.

## AWS Emulator vs LocalStack: capabilities and limits

AWS’s [technical walkthrough](https://aws.amazon.com/blogs/aws/test-your-applications-against-aws-locally-with-aws-emulator/) demonstrates S3 bucket uploads and DynamoDB reads and writes through a local HTTPS endpoint. Rust tests can also embed isolated emulator instances directly.

| Capability | AWS Emulator | LocalStack’s current plans |
| --- | --- | --- |
| API coverage | Generated from AWS API models; unimplemented operations return HTTP 501 | 30+ services in Hobby, 55+ in Base, 110+ in Ultimate |
| Saved state | Resources held in memory | Persistence in Base and above |
| IAM policy testing | No policy enforcement | Basic in Base; advanced in Ultimate |
| Cost and access | No AWS account or additional service fee; CC0 source | Free Hobby for non-commercial use; paid plans for commercial use |

LocalStack details come from its [current plan comparison](https://www.localstack.cloud/pricing). **Service counts do not establish API parity**: check the operations your application needs. AWS Emulator also lacks cross-account and cross-Region behavior; production validation still belongs on AWS.

For tests using [Testcontainers](https://testcontainers.com/modules/localstack/), the LocalStack module manages the container lifecycle, while LocalStack emulates AWS. [Moto](https://github.com/getmoto/moto) remains another option for Python tests under Apache 2.0.

## Built for coding agents, and by them

AWS’s [stated rationale](https://aws.amazon.com/blogs/aws/test-your-applications-against-aws-locally-with-aws-emulator/) emphasizes faster iteration for developers and coding agents. It also describes an **AI-agent development pipeline**: agents identify gaps, write tests and implement changes, with fidelity tests comparing behavior against real AWS before release.

Alongside [Lambda Web Functions simplifying deployment](/news/aws-lambda-web-functions/), this suggests AWS is reducing the work around using its cloud: **test locally, then deploy through a shorter path**. That broader connection is an interpretation, not an announced motive to displace LocalStack.
