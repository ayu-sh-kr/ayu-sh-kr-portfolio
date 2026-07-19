# What the new Lambda pricing means if you run infra alone

Pricing announcements are easiest to understand when you translate them into the shape of your workload. A headline rate is not a decision until it meets invocation volume, duration, memory, and the cost of everything around the function.

## Start with the monthly envelope

Write down the workload in one line:

```text
monthly cost = requests × duration × memory rate + requests × request rate
```

Then add logs, NAT gateways, queues, databases, and the idle resources that your Lambda function depends on. The function is often not the largest line item.

## The solo-operator lens

The best architecture is the one you can explain during an incident. A small service with a predictable traffic pattern may be cheaper and easier to operate on a container. A bursty, event-driven job may benefit from Lambda even when the per-millisecond number looks less attractive.

Watch the 95th percentile duration and the number of downstream calls before changing providers. A pricing change is a prompt to measure, not an instruction to migrate.
