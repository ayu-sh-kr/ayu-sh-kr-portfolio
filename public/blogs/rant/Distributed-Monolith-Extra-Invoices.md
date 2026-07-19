# Your microservices are a distributed monolith with extra invoices

If every service has to deploy in lockstep, shares a database schema, and calls four other services before it can render one screen, the diagram may say microservices while the system behaves like a monolith.

That is not automatically bad. A modular monolith can be an excellent architecture. The expensive part is pretending the boundaries buy you independent delivery when they do not.

## The smell is coordination

The strongest signal is not the service count. It is the amount of coordination required to make a small change:

- one ticket becomes five pull requests;
- one migration needs a meeting with three teams;
- local development requires a small data centre;
- an incident needs a map of synchronous calls before anyone can roll back.

If the boundary does not let a team own a decision, it is mostly a network hop with a logo.

## Earn the split

Split a system when a boundary has a real reason to exist: different scaling behaviour, a clear ownership boundary, independent deployment, or an isolation requirement. Otherwise, keep the modules close and make the dependency explicit in code.

The boring choice often gives you the faster team and the smaller invoice.
