# Pyronaut brings Python to Micronaut with GraalVM

Python now has a route into Micronaut’s JVM platform. Announced on October 2, **Pyronaut** lets developers write services in Python while using Micronaut’s HTTP server, data access, dependency injection, validation and cloud integrations. The design leans on GraalVM, but that does not mean every application must be compiled into its own native executable.

## Python source, processed before startup

Pyronaut analyzes Python source during the build. Its processor connects Python decorators and type annotations to Micronaut’s Java framework, preparing routes, dependency injection, serialization and database queries before the service starts. A repository method with a misspelled entity field, for example, can fail during processing instead of surfacing as a broken query in production.

At runtime, requests go through Micronaut’s **Netty-based HTTP server**. Pyronaut runs Python with **GraalPy** and the **Graal Just-in-Time (JIT) compiler**, which optimizes frequently used code as it executes. Python’s `async` and `await` are wired into Netty’s event loop, so the service can handle asynchronous work without starting a separate Uvicorn server. Python code can also call Java libraries and use Micronaut’s existing integrations.

## GraalVM does not mean one deployment format

Pyronaut offers a JVM deployment for teams prioritizing peak throughput after warm-up. For a faster-starting, lower-memory option, the team describes **GraalVM Crema**: a precompiled native base image that applications can reuse.

That changes where native compilation happens. With Crema, the shared base is compiled ahead of time; each application build adds its processed classes and dependencies as a thinner layer. Developers avoid rebuilding a full native image for every code change. A full per-application native image remains an option, but Pyronaut says it is not required.

So the GraalVM story is a combination of GraalPy and JIT optimization at runtime, plus a reusable native base for one deployment path. It is not simply “Python compiled to a native binary.”

## What the performance numbers show

Pyronaut reports **35,351 requests per second**, compared with 13,576 for FastAPI with Granian and 5,453 for Flask with Gunicorn. The team says it tested all three over HTTPS/HTTP2 on the same three-OCPU virtual machine with Hyperfoil, counting only throughput that met its latency thresholds. These are the project’s own results, not an independent comparison across varied applications and infrastructure.

The announcement also names a constraint: Python still runs under the Global Interpreter Lock (GIL), limiting parallel execution. The team expects GraalPy work to remove that limit to improve throughput, but that is future work.

Pyronaut’s interesting bet is that Python teams may want Micronaut’s build-time checks and JVM ecosystem without adopting Java as their application language. The benchmarks make that bet visible; real adoption, library compatibility and the GIL will determine how far it goes.

Sources: [Pyronaut announcement](https://pyronaut.io/2026/10/02/introducing-pyronaut/) · [Performance methodology](https://pyronaut.io/performance/)