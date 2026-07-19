# TIL: EventBridge scheduler quirks

EventBridge Scheduler is a great fit for “run this later”, but it is not a drop-in replacement for every cron job.

## Three details worth remembering

1. The schedule’s timezone should be explicit. Do not leave daylight-saving behaviour to an assumption hidden in a deployment script.
2. A retry policy is part of the job design. If the target is not idempotent, retries can turn a transient failure into duplicate work.
3. The schedule can outlive the feature that created it. Treat schedules as resources with an owner and a cleanup path.

```text
create schedule → invoke target → record outcome → disable or delete
```

That small lifecycle is enough to avoid a surprising number of orphaned jobs.
