# What Lambda pricing means when you operate infrastructure alone

Before adjusting an architecture after a Lambda pricing change, establish which
Lambda product the change concerns. AWS prices Lambda Functions and
[Lambda MicroVMs](https://aws.amazon.com/about-aws/whats-new/2026/06/aws-lambda-microvms/)
as separate execution options. MicroVMs are intended for workloads that need
isolated environments for user- or AI-supplied code; they do not change the
basic billing model for Lambda Functions.

That distinction matters for a small team or a solo operator. A product that
needs to run untrusted code for each user has a different isolation problem
from an API that handles normal application requests. Treating both as a
generic “Lambda price change” makes it easy to compare the wrong costs and
choose the wrong operational model.

## Start with the workload, not the headline

For Lambda Functions, AWS charges primarily for requests and execution
duration measured in GB-seconds. Memory allocation affects the duration cost
and also changes the CPU and other resources available to the function. The
[Lambda pricing page](https://aws.amazon.com/lambda/pricing/) documents the
current request, duration, architecture, and free-tier rules; use it as the
source for a budget rather than copying a rate from an announcement.

A useful first approximation is:

```text
monthly function cost = request volume × request price
                      + duration in GB-seconds × duration price
```

It is only the function line item. The monthly envelope should also include
the services that make the function useful: log ingestion and retention,
queues, databases, object storage, network egress, NAT gateways, and any
always-on resources. In a small system, one shared network component or an
over-retained log group can cost more than the function executions.

## Gather the measurements that change the decision

An estimate should be built from observed workload data, not from average
traffic alone. For each function, record:

- monthly invocation count, including retries and asynchronous deliveries;
- configured memory and architecture;
- p50, p95, and p99 duration, rather than only the mean;
- event size and invocation path, especially for asynchronous payloads;
- downstream calls, connection behaviour, and error rate; and
- the cost and ownership of the services around the function.

The percentile view is important. A function can have a low average duration
while a small number of slow database calls determine concurrency, timeout
risk, and tail cost. Equally, increasing memory can reduce total duration
enough to lower the final duration charge. Test that change with production-
representative inputs and compare both duration and cost; lower memory is not
automatically cheaper.

AWS also prices Lambda duration tiers separately by architecture and Region.
Confirm the architecture of the functions that actually run before modelling a
migration to Arm. A benchmark is evidence; an assumption that one architecture
will be faster for every dependency is not.

## Decide whether Lambda Functions still fit

Lambda Functions are often a good fit for bounded request handling,
event-driven work, scheduled jobs, and workloads with uneven demand. The
service removes server patching and allows concurrency to follow the incoming
work, but it does not remove operational responsibilities. Timeouts, retry
behaviour, concurrency limits, permissions, alarms, deployment rollback, and
data ownership still need to be designed and operated.

A continuously busy process with stable throughput may be simpler to operate
on a container or another long-lived compute model. A job that needs a
dedicated isolated environment per user may justify evaluating Lambda
MicroVMs. These are separate decisions. Compare the full operating cost,
failure modes, deployment process, and security boundary—not only the
per-millisecond price.

## Treat cost review as an operating practice

For each meaningful function, keep a small cost record next to its service
documentation: its owner, trigger, memory setting, timeout, concurrency rule,
expected duration, downstream dependencies, and budget line. Review it after
a material traffic change, a dependency change, or a change in retry volume.

The practical rule is straightforward: use the Lambda Functions price model
for Function workloads, use the MicroVM model only for the isolation problem it
solves, and include the surrounding infrastructure in either calculation. A
pricing announcement is useful when it prompts a measurement and a deliberate
architecture decision; it is not, by itself, a reason to migrate.
