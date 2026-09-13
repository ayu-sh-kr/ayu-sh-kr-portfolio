# The Kotlin context parameters proposal, read twice

On the first read, context parameters looked like a clever language feature for passing ambient capabilities. On the second, the practical value became clearer: they can remove a category of constructor plumbing where a service needs an execution capability but does not own it.

That could make transaction scopes, tracing contexts, and request-local policies read closer to the operation that requires them. The dependency remains part of the function contract, while callers inside the established context avoid forwarding it through every intermediate layer.

## The constraint I care about

Implicit availability can hide architecture just as easily as it can remove noise. I would keep context values narrow, capability-shaped, and visible at module boundaries. A database handle or authorization scope has a clear role; a giant application context recreates a service locator with better syntax.

The proposal is worth reading as a design tool, not a reason to refactor working code immediately. The test is whether it makes required capabilities easier to see at the point of use without making their origin mysterious.
