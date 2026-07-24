---
slug: restaurant-oms
title: Restaurant OMS
tagline: Order management that speeds up serving from table to kitchen and back.
kind: product
year: 2025
status: shipped
stack: [Spring Boot, Postgres, Nuxt]
---

Restaurant software has a short feedback loop. A slow screen is not an abstract performance problem when a server is waiting for the next table, and a confusing state is not a minor UX issue when the kitchen is already moving.

## Start with the service flow

The system was shaped around how orders actually move: capture at the table, confirm availability, send the right work to the kitchen, and keep the front of house aware of what changed. The API followed that flow instead of mirroring a database diagram.

## Make state visible

An order management system is mostly state transitions. Pending, accepted, preparing, ready, and served need to be clear to both people and code. The backend treated transitions as explicit operations, validated the allowed moves, and returned enough context for the client to render the next decision.

<showcase-aside kind="quote">When the person using the system can explain why an order is in a state, the domain model is probably doing its job.</showcase-aside>

## Ship the boring parts well

Postgres kept the transactional core straightforward. Spring Boot provided the boundary for the business rules, while Nuxt made the day-to-day screens quick to iterate on. The useful work was in the seams: predictable errors, idempotent actions, and a UI that never made staff guess whether a tap had worked.

The product shipped because the implementation stayed close to the room it served.
