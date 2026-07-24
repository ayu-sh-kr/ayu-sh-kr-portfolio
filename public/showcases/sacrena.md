---
slug: sacrena
title: Sacrena
tagline: The core backend and infrastructure of a growing dating app.
kind: backend
year: 2025
status: active
stack: [Kotlin, AWS, Redis]
---

Sacrena is the work I point to when I say I own a backend end to end. APIs, data modeling, deployments, infrastructure, security, and the operational details all meet in the same system.

<showcase-metrics items="1|backend owner,24/7|production responsibility"></showcase-metrics>

## One engineer, one system

The useful constraint was ownership. There was no platform team to hand reliability to and no separate group to absorb the awkward edges. Every choice had to be understandable six months later, when the next incident arrived at an inconvenient time.

## Reliability is a collection of small decisions

Postgres holds the durable model. Redis handles carefully chosen caches and coordination. AWS provides the deploy and messaging primitives. The important part is not the service list; it is knowing what can fail, what can be retried, and what must be made idempotent before it reaches a user.

<showcase-aside kind="warn">A queue, cache, or extra service is not reliability by itself. Each one adds a failure mode that needs an owner and a recovery story.</showcase-aside>

## Security belongs in the shape of the product

Authentication and authorization are boundary concerns, but the decisions they protect belong to the domain. Rate limits, token lifetimes, access checks, and audit-friendly behavior are designed together rather than bolted on after the API exists.

## Keep the pager quiet

The best backend work is often invisible: safe migrations, useful logs, cost-aware infrastructure, and a deployment path that can be repeated without drama. That is the work that lets product features keep moving.
