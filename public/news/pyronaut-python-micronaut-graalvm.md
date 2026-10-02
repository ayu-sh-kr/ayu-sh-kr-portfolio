# Pyronaut launches Python services on Micronaut and GraalVM

The Micronaut team has announced **Pyronaut**, a framework for building Python services on its existing Java platform. Released on October 2, it brings Micronaut’s web server, database access, validation and cloud integrations to Python. GraalVM supplies the runtime technology, including a deployment option that reuses a native base instead of requiring a lengthy native build after every code change.

## How Python connects to Micronaut

The connection starts before the application runs. Pyronaut reads Python source and uses decorators and type annotations—the labels attached to functions, classes and values—to connect it to Micronaut’s Java framework. This lets it prepare HTTP routes, wire dependencies, generate database queries and build the code that converts application objects to and from JSON.

Moving that work into the build also catches some mistakes earlier. For example, a database repository method that searches by a field called `titel` when the entity defines `title` can fail during processing. Developers get feedback before the service starts, rather than discovering the problem when someone calls the endpoint.

Once running, the service uses **Netty**, the HTTP server technology behind Micronaut. **GraalPy**, GraalVM’s Python implementation, executes the Python code. The **Graal Just-in-Time compiler** then optimizes frequently executed code while the application runs. Pyronaut connects Python’s `async` and `await` to Netty’s event loop, allowing handlers to wait for asynchronous operations while the server continues handling other work.

## GraalVM Crema changes the native build step

That runtime design leads to two main deployment choices. Pyronaut offers a JVM option for teams prioritizing peak throughput after the application has warmed up. For quicker startup and lower memory use, the team offers a path based on **GraalVM Crema**, a precompiled native base image.

With Crema, the reusable base is built using GraalVM Native Image. Later application builds add their processed classes and dependencies as a thin layer on top. The expensive native compilation step therefore belongs to the shared base, reducing the need to repeat it whenever application code changes. Developers can also choose a full native image build for their application.

This is the central GraalVM detail: Pyronaut combines Python execution through GraalPy, runtime optimization through the Graal compiler, and a reusable native base for the Crema deployment path.

## Performance claims and the remaining limits

In its own benchmark, Pyronaut sustained **35,351 requests per second**, compared with 13,576 for FastAPI with Granian and 5,453 for Flask with Gunicorn. The team used the same virtual machine with three Oracle CPU units, HTTPS/HTTP2 and Hyperfoil’s load generator. Only throughput meeting its latency thresholds counted. The results describe that test setup; they cannot predict every application’s performance.

Python also retains its **Global Interpreter Lock (GIL)**, which restricts parallel execution of Python code across threads. The announcement identifies work to remove it and improve native-library support as ongoing.

Pyronaut gives Python developers access to Micronaut’s application model and Java libraries, with earlier error checks and a choice of deployment paths. Its first release makes that combination available; compatibility with a team’s Python dependencies and measurements on its own workload will determine whether it fits.

Sources: [Pyronaut launch announcement](https://pyronaut.io/2026/10/02/introducing-pyronaut/) · [Benchmark methodology](https://pyronaut.io/performance/)
