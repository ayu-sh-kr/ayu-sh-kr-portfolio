# AWS Emulator enters LocalStack’s local-testing territory

Testing an S3 upload or a DynamoDB write should not require a deployment for every change. LocalStack already gives developers a local version of AWS services. Now AWS is offering its own: **AWS Emulator**, launched on November 11, runs existing SDK and CLI calls against your computer without an AWS account.

The Rust implementation keeps resources in memory and charges no additional service fee. Its source carries a **CC0 public-domain dedication**. Point your tools at its local endpoint, create a bucket or table, and test the interaction before deploying. See the [AWS announcement](https://aws.amazon.com/about-aws/whats-new/2026/11/aws-emulator-now-available/).

## An established space, with a new first-party option

If you have used AWS services through Testcontainers, you may recognize its [LocalStack module](https://testcontainers.com/modules/localstack/): Testcontainers manages the container’s lifecycle, while LocalStack emulates the services. LocalStack’s current [Hobby plan](https://www.localstack.cloud/pricing) is free for non-commercial use; commercial use requires a paid plan. [Moto](https://github.com/getmoto/moto) is another established, Apache-2.0-licensed option for mocking AWS interactions in Python tests.

AWS’s entry adds a first-party implementation, rather than establishing local cloud testing. Coverage still matters: unsupported operations return **HTTP 501**, behavior varies by service, and AWS Emulator does not reproduce IAM policy enforcement or cross-account and cross-Region behavior. Passing locally remains a reason to continue testing on AWS, not proof of production correctness.

## Why this fits AWS’s wider direction

AWS’s [stated rationale](https://aws.amazon.com/blogs/aws/test-your-applications-against-aws-locally-with-aws-emulator/) emphasizes faster iteration for developers and coding agents. It also says agents build and maintain the emulator, comparing behavior with real AWS through published fidelity tests. That describes its development process, not a guarantee of complete compatibility.

Alongside [Lambda Web Functions simplifying deployment](/news/aws-lambda-web-functions/), this suggests AWS is reducing the work around using its cloud: test locally, then deploy through a shorter path. That broader connection is an interpretation, not an announced motive to displace LocalStack. For developers, the useful change is another option for testing AWS interactions before paying for, configuring and waiting on cloud resources.
