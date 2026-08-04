# When microservices become a distributed monolith

Microservices are useful when a system has boundaries that can be owned,
deployed, and operated independently. They are costly when services are split
without those boundaries. The result can look like a microservice architecture
on a diagram while behaving as one tightly coupled system over the network.

This is not an argument that a modular monolith is a lesser starting point. A
well-structured monolith can provide clear module boundaries, one deployment,
one debugging surface, and transactional consistency where it is useful. The
question is whether extracting a service removes a meaningful coordination
constraint or merely turns an in-process call into a network dependency.

## Look for operational evidence, not service count

The useful evidence is in ordinary delivery and incident work. Sample a few
recent changes and ask:

- Did a small feature require synchronized pull requests and releases across
  several services?
- Does a service own its schema and migration decisions, or does it share a
  database contract with other services?
- Can a developer run the dependency path locally with a small, documented
  setup, or is a large environment required for a basic change?
- During an incident, can one service be rolled back or degraded without
  breaking the user journey through synchronous calls?
- Do dashboards show a clear owner and service-level objective for each
  dependency, including timeouts and retry behaviour?

One affirmative answer does not prove a distributed monolith. A repeated
pattern does show that the architecture is charging a coordination cost. Track
that cost with deployment lead time, change-failure data, incident timelines,
and the number of services touched per change. Those measurements are more
useful than an opinion about whether a system has “enough” services.

## The hidden cost is synchronous coupling

Consider an API request that calls an account service, a pricing service, an
entitlement service, and an order service before it can return a screen. Each
service may have a separate deployment, but the user-facing operation now
depends on all four being available, compatible, and within their latency
budget. Retries can multiply load, partial failures require compensation, and
an interface change needs coordination across owners.

Some synchronous dependencies are justified. A service may need an immediate
fraud decision or an authoritative permission check. The point is to make the
dependency explicit: set timeouts, define the fallback, publish an owner,
measure the error path, and decide which result the caller can safely cache or
defer. A network call is not a neutral replacement for a method call.

## Earn a service boundary

Extract a service when it has a durable reason to exist. Common reasons
include an independently owned domain, a distinct scaling profile, a security
or compliance isolation need, a separately deployable lifecycle, or an
integration boundary that benefits from a stable contract.

The boundary must include data ownership. If every service writes the same
tables or relies on unversioned schema changes, independent deployment remains
an aspiration. Prefer an API, an event contract, or an owned data model over a
shared database write path. When the transition spans services, design for
eventual consistency with an outbox, idempotent consumers, and a visible
recovery process rather than pretending a distributed call chain is one local
transaction.

## Start with a modular monolith when the evidence is not there

Keep modules close when the same team owns the same release cadence and the
same data decisions. Make module interfaces explicit, prevent unnecessary
cross-module data access, and keep side effects behind a boundary. This work
is not discarded if a later extraction is justified; it creates the contract
and ownership information the new service will need.

When a module does need to be extracted, choose one narrow capability, assign
an owner, move its write model deliberately, and migrate callers in stages.
Measure whether the extraction improved deployment independence, failure
isolation, or scaling before splitting the next boundary.

The practical rule is to pay the distributed-systems cost only for a boundary
that produces a corresponding operational benefit. A smaller number of
well-owned modules is often easier to change and recover than a larger number
of services that must still move together.
