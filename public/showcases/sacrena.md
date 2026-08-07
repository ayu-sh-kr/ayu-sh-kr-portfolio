---
slug: sacrena
title: Sacrena
tagline: The core backend and infrastructure of a growing dating app.
kind: backend
year: 2025
status: active
stack: [Kotlin, AWS, Redis]
---

[Sacrena](https://sacrena.com) is a dating application supported by a production backend for secure onboarding, user-facing APIs, scheduled workflows, and the operational systems around them. The case study shows how product constraints shaped decisions across Kotlin, Spring Boot, Postgres, Redis, and AWS.

## Product context

A dating app needs a low-friction onboarding path without making OTP delivery an unprotected source of cost. It also needs consistent behaviour when multiple application instances process the same work, and a backend that remains responsive as operational load changes. Those constraints made security, durability, and performance part of product delivery rather than separate infrastructure concerns.

## Durable state, deliberate coordination

Postgres holds the durable model. Redis handles carefully chosen caching and coordination, while AWS provides the deployment and messaging primitives. The implementation keeps failure boundaries visible: writes are durable, repeatable operations are idempotent, and coordination is introduced only where duplicate work could affect state or repeat an external side effect.

<showcase-aside kind="warn">A queue, cache, or extra service is not reliability by itself. Each one adds a failure mode that needs an owner and a recovery story.</showcase-aside>

## Protect onboarding and control abuse

A bot-driven flood against an OTP endpoint can consume paid provider credits even when no account is compromised. Rate limiting therefore protects both the authentication flow and the product's operating cost. It helps contain application-level abuse and makes spend exposure visible, while broader edge and availability controls remain necessary for DDoS protection.

Device integrity checks and app attestations add another signal before sensitive flows proceed. Authentication and authorization remain server-side responsibilities, but the backend can use the trust established by the client environment when deciding how much confidence to place in an OTP request.

## Make distributed work predictable

In a distributed monolith, several application instances may observe the same job. Distributed locks coordinate the workflows where duplicate execution could create conflicting state or repeat an external side effect. They complement idempotency rather than replace it, giving one active worker responsibility without making the whole system depend on a lock.

## Match compute to the workload

Some short-lived Lambda functions needed a smaller startup path than a full JVM process could provide. Spring Boot services that fit the native-image constraints were compiled to native executables with GraalVM and deployed to AWS Lambda. This gave those functions a more appropriate cold-start and resource profile, while the regular JVM remained available where its flexibility was more valuable.

The choice stayed workload-specific. Native compilation introduces build and reflection constraints, so the performance benefit had to be weighed against maintenance and testing costs.

## Keep scheduled work and configuration explicit

AWS EventBridge Scheduler handled timed work that did not need a continuously running process. Separating scheduling from execution reduced idle infrastructure and gave recurring jobs a clear delivery boundary; the consuming service still owned idempotency and failure handling.

AWS AppConfig provided a controlled home for runtime configuration that needed to change independently of application deployment. This separated operating decisions from code releases and gave the backend a clearer path for reviewing, applying, and reversing configuration changes.

## A backend that supports the product

Together, these decisions keep product behaviour clear: durable writes in Postgres, short-lived coordination in Redis, compute selected for the workload, and operational controls in AWS. The result is a backend designed to remain maintainable, observable, and responsive as the product and its operating requirements change.
