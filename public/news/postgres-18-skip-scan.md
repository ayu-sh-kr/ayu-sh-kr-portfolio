# Postgres 18's skip scan is quietly a big deal for composite indexes

A composite index on `(tenant_id, created_at)` has traditionally been easy to use when the query supplies `tenant_id`, and much less useful when it only constrains `created_at`. Skip scan gives the planner another option: probe distinct leading values rather than scanning the whole index as one continuous range.

That sounds like planner trivia. In practice it covers a recurring class of “we need another index” requests in multi-tenant systems, especially when the leading column has relatively few distinct values.

## What I would test

The feature does not make column order irrelevant. Cardinality, selectivity, table size, and the number of leading values still decide whether repeated probes beat a sequential scan. I would compare `EXPLAIN (ANALYZE, BUFFERS)` on production-shaped data before removing any purpose-built index.

The valuable change is optionality. Some read paths can now reuse an index already required by the primary access pattern, reducing write amplification and maintenance overhead. That is worth checking before adding another nearly identical index to a busy table.

Read the planner output, not just the release headline. The plan is the contract that matters.
