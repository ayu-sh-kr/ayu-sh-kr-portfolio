# Self-hosted GitHub runners on a t4g.medium paid for themselves in nine days

Native builds made hosted CI minutes visible very quickly. A small Graviton instance running an ephemeral self-hosted GitHub Actions runner crossed its break-even point after nine days of the existing build schedule.

The instance is provisioned with CloudFormation, registers only for a job, and is replaced rather than repaired. There is no inbound security-group rule and no SSH key. Session Manager is available for the rare diagnostic run, with access logged through the AWS account.

## The sizing note

These builds are memory-bound before they are CPU-bound. Two vCPUs are enough for the current pipeline, but four gigabytes is the practical floor for native-image compilation. A smaller runner fails late and turns the apparent saving into rerun time.

The runner also has a narrow IAM role, a clean workspace per job, and a scheduled shutdown backstop. Self-hosting only wins when the machine is treated as disposable infrastructure rather than a pet build server accumulating credentials and state.

The cost comparison includes storage and idle time, not just the EC2 headline rate. That is the number worth using.
