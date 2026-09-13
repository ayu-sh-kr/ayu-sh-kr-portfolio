# Sacrena's match feed now serves from a Redis read-through cache

The match feed used to assemble every page from three database queries. Each query looked reasonable in isolation, but together they repeated the same eligibility work and pushed p95 response time to 310ms as the active set grew.

The read-through cache now stores the final projection for the short period in which it is safe to reuse. A mutation evicts the affected member keys, and a cache miss follows the same repository path that existed before. That kept the change reversible and made the first production comparison honest.

## The useful result

p95 settled at 41ms. More importantly, the cache made three “optimised” query variants unnecessary. Deleting them removed branching repository code, duplicated tests, and an index that only one variant needed.

The operational rule is simple: cache the stable answer, not fragments that every caller must reassemble. If invalidation becomes difficult to state, the cached boundary is probably too low in the stack.

The next measurement is hit rate during low-traffic hours. A fast cache with constant misses is just another moving part, so it stays only while the production numbers justify it.
