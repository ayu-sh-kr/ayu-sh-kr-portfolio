# Operating EventBridge Scheduler with explicit delivery rules

Use EventBridge Scheduler when a system needs to invoke a target at a future
time or on a recurring schedule. It is a managed scheduler, not a guarantee
that a business action happens exactly once at an exact second. That boundary
should shape the target design before a schedule is created.

AWS supports one-time, rate-based, and cron-based schedules, each with an
explicit time zone and optional start and end dates. The
[schedule types documentation](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
also describes how daylight-saving changes affect cron schedules. Make the
time zone an authored product decision, not an omitted deployment default.

## Choose the schedule contract first

Start by writing down what the schedule is meant to guarantee:

- “Run this cleanup after a 24-hour retention period” is usually a one-time
  schedule with an explicit cleanup action.
- “Start this report at 09:00 in the customer’s local time” needs a named time
  zone and a documented daylight-saving policy.
- “Reconcile this data periodically” may be a rate-based job whose target can
  tolerate a small delay and a repeated invocation.

Do not use a schedule as a second-level timer. Scheduler invocations can be
delayed, and flexible time windows intentionally allow delivery within a
configured window. If a business rule needs an exact deadline, persist the
deadline in durable state and make the target validate it when it runs.

## Make the target safe to invoke again

Delivery retries are part of the scheduler contract. A target can receive an
attempt after a timeout, after a transient AWS error, or after the first
attempt reached the target but its response was lost. The target therefore
needs an idempotency rule independent of the schedule.

Pass a stable operation identifier in the target input, record the durable
state transition under a unique constraint or idempotency key, and treat a
repeat invocation as a safe no-op or a resume. Do not rely on a Boolean such
as `alreadyRan` in application memory; another instance may receive the retry.

For example, a reminder target can use a key made from the reminder ID and its
planned delivery time. The service writes that key before sending the
notification, so a retry can detect a completed delivery without sending a
second message.

## Configure failure handling deliberately

Scheduler lets a schedule define a retry policy and a dead-letter queue (DLQ).
The [management guide](https://docs.aws.amazon.com/scheduler/latest/UserGuide/managing-schedule.html)
explains that the policy controls retry attempts and event age; the target
should decide values from the business deadline, not from the default maximum.
An expired password-reset request and a delayed nightly report have different
acceptable retry windows.

Use a DLQ when a failed invocation requires investigation or recovery. The
[DLQ documentation](https://docs.aws.amazon.com/scheduler/latest/UserGuide/configuring-schedule-dlq.html)
describes the delivery details that are captured after retries are exhausted.
Give the queue an owner, an alarm, and a replay procedure. A DLQ without an
operational response is only delayed visibility into a failure.

## Treat schedules as owned resources

A schedule has a name, target, execution role, state, retry policy, and
potentially a DLQ. These are application resources and need a lifecycle:

```text
create schedule → invoke idempotent target → record outcome → disable or delete
```

For one-time work, configure deletion after completion when the schedule is no
longer useful. For recurring work, make the owning service and purpose visible
in its name, group, tags, and documentation. When a feature is retired, remove
or disable its schedules as part of the same change.

The execution role deserves the same review as any service role. Restrict it
to the target operation and the DLQ permissions it needs. Avoid using a broad
application role merely because it is already available.

## Observe the delivery path

Monitor schedule creation failures, invocation attempts, target errors, DLQ
deliveries, and the age of unprocessed work. The AWS
[troubleshooting guide](https://docs.aws.amazon.com/scheduler/latest/UserGuide/troubleshooting.html)
lists useful CloudWatch metrics, including `InvocationAttemptCount`,
`TargetErrorCount`, and `InvocationsSentToDeadLetterCount`.

The practical rule is to use Scheduler for managed, minute-level orchestration
with an idempotent target and an explicit recovery path. It is a strong
replacement for many self-managed cron jobs, provided timing, retries, and
resource cleanup are treated as part of the feature rather than as console
settings added after launch.
