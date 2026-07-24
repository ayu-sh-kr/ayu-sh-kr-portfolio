---
slug: event-pipeline
title: Event pipeline
tagline: SQS/SNS and EventBridge fan-out for production notifications.
kind: backend
year: 2025
status: shipped
stack: [AWS, SQS, SNS]
---

Notifications become difficult when every product action has to know every downstream consequence. The event pipeline moved those consequences behind a dependable asynchronous boundary.

## Separate the moment from the work

The request that changes product state should finish when the state is safe. Sending notifications, updating secondary projections, and triggering integrations can happen after that point without making the user wait for every consumer.

## Use the right delivery shape

SQS provides a durable queue for work that needs a consumer. SNS and EventBridge provide the fan-out and routing paths for subscribers with different responsibilities. The design stayed explicit about which messages could be retried and which consumers had to be idempotent.

```text
product action → durable event → subscribers → observable work
```

<showcase-aside kind="warn">Asynchronous does not mean invisible. Every consumer needs a failure path, a retry policy, and enough context to explain what happened.</showcase-aside>

## Make operations part of the contract

Dead-letter handling, structured logs, and correlation identifiers made the pipeline operable rather than merely distributed. When a notification was delayed, the system could show where it was waiting and why.

The result was a quieter product boundary and a more honest operational story.
