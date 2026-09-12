# GraalVM vs Project Leyden: Java Native Builds and AOT Caching

Your Java service handles a request in milliseconds. A fresh instance can take seconds before it handles one at all.

That gap becomes visible when a deployment replaces your containers, a traffic spike needs new capacity, or the first visitor wakes a service that scaled to zero. Your application code may be fast. The user still waits.

**How much of that waiting can you move out of the request path?** GraalVM Native Image and Project Leyden approach that question from different directions. Native Image compiles Java ahead of time into a native executable. Leyden brings ahead-of-time (AOT) caching to the JVM, allowing a later process to reuse work prepared earlier.

The opportunity is compelling: keep the Java application and libraries you have invested in, while changing how much preparation happens at startup. For a Spring Boot service, a CLI, or a serverless function, that can change whether a deployment model meets your latency and memory budget.

But a faster start is only part of the decision. Native builds introduce reachability constraints and a different build pipeline. A JVM AOT cache retains the JVM, with capabilities and compatibility requirements that depend on your JDK. Neither removes database connections, application initialisation, or the need to measure real traffic.

We will separate Java startup from JIT warm-up, follow what each approach moves ahead of execution, and work out when the payoff justifies the effort. If compilation and linking are new territory, start with [what a native build actually contains](/blog/what-is-a-native-build/).

> Choose the runtime by the time and memory your workload can afford, then measure the cost of meeting that budget.

---

## Part 1 — Why JVM startup takes time

Before fixing it, look at the bill itemised. It is more interesting than "Java is slow."

When you run `java -jar app.jar`, the JVM does not have a program yet. It has a zip file full of class definitions. Before a single line of your logic runs, it must **find each class, read it, check the bytecode inside is legal and safe, resolve every name it mentions to a real thing in memory, and run its static setup code**. That last step is sneakier than people expect — a static initialiser can read config, build a lookup table, open a connection pool, or scan your classpath.

Now multiply. A mid-sized Spring Boot app touches roughly **fifteen to twenty-five thousand classes** before it is ready to answer anything.

![A horizontal bar split into five segments showing where JVM startup time goes: finding and reading classes, checking bytecode, resolving names, running static setup, and a tiny sliver for the code you wrote](/blogs/tutorial/assets/java-native-builds-graalvm-vs-leyden/01-where-startup-time-goes.svg)

That sliver on the right is you. The rest is the framework, the JDK, your JSON library, your database driver, your HTTP client, your metrics library, and the eight things each of those dragged along.

Here is the part worth being annoyed about: **none of it varies.** Same classes, same order, same resolved addresses, every run. It is the most cacheable work imaginable, and for most of Java's life nothing cached it.

> **Note — this is not dependency bloat.** People assume a slow start means their dependency tree is out of hand. Sometimes it is. But even a lean app pays most of this, because a large share of those classes come from the JDK itself. You cannot diet your way out of this one.

That is half the story. The other half is stranger, because it is the half where Java is slow deliberately.

---

## Part 2 — JVM warm-up: how JIT compilation improves performance

Your classes are loaded, the app is up, so you would expect full speed now. You do not get it.

Java bytecode is not machine code — your CPU cannot execute it. So the JVM begins by **interpreting**: reading one instruction at a time and doing what it says. It works, and it is slow, roughly the way reading a recipe aloud sentence by sentence is slower than having cooked the dish a hundred times.

While it interprets, it is also **counting**. How often is this method called? How often does this loop go round? Which branch of this `if` actually gets taken? Which concrete class actually turns up behind this interface?

Once a method has been called enough times, the JVM compiles it to real machine code and swaps the fast version in while your app keeps serving traffic.

![A line chart showing speed rising over time: a low flat section while the JVM interprets, a step up as hot code is compiled, and a plateau at full speed, with the rising region shaded and labelled warm-up](/blogs/tutorial/assets/java-native-builds-graalvm-vs-leyden/02-jvm-warmup-curve.svg)

The counting is the whole trick. Because the JVM watched your **actual traffic**, it knows things a build-time compiler never could:

- This interface has five implementations, but in production only one ever shows up here — so skip the lookup and inline the body directly.
- This null check has not failed once in two million calls — so compile a version without it, and keep a safety net in case that ever changes.
- This object never leaves the method that created it — so do not put it on the heap at all; keep the fields in CPU registers.

These are **guesses backed by evidence**. When one turns out wrong — a second implementation finally appears, that null finally arrives — the JVM notices, discards the optimised version, drops back, and recompiles with better information. Nothing breaks, and you never see it happen.

This is Java's real superpower, and it is why "just compile it ahead of time like C" is not the free win it sounds like. A build-time compiler has no traffic to learn from. It has to be conservative about everything.

> **Note — two problems, not one.** Startup cost is about **loading**. Warm-up cost is about **optimising**. They are separate, they have separate fixes, and a solution can attack one without touching the other. Most confusion in this area comes from mashing them together — keep them apart as you read on.

---

## Part 3 — GraalVM Native Image vs Project Leyden: the core difference

So: one cost that is pure repeated waste, and one that is the price of an excellent optimisation strategy. Any fix has to pick which it is attacking, and what it will give up to get there.

![Three rows compare preparation, deployment artifacts, and runtime work for the plain JVM, GraalVM Native Image, and Project Leyden's AOT cache](/blogs/tutorial/assets/java-native-builds-graalvm-vs-leyden/03-three-roads.svg)

Read each row from preparation through deployment to execution. The key distinction is what each approach carries into the next launch.

**Native Image changes what you ship.** The application becomes a native executable with its runtime. Much of the preparation happens during the build, although the executable still has to start and initialise the application.

**Leyden changes what your JVM has to do on the way up.** Still bytecode, still a JVM. It just hands that JVM a file saying "here is all the boring work, already done, from last time."

One is a different destination. The other is a shortcut on the same road. The dramatic one first.

---

## Part 4 — How GraalVM Native Image builds a native executable

GraalVM is a JDK you can drop in where yours is. Most of it feels ordinary. The part that matters is a tool called **Native Image**, and what it does is close to audacious.

You point it at your app and say: here is `main`. It works outwards, asking repeatedly, *what can this reach?* `main` calls `startServer`, so that is in. `startServer` constructs a `TomcatFactory`, so that is in, along with everything it touches. It keeps following until it has a complete map of everything your program could conceivably need.

Then it does the bold thing.

![Two grids of squares: the left is completely filled and labelled everything available, an arrow labelled trace points to the right grid where only a fifth of the squares remain, with a warning that anything reached by name at runtime gets deleted too](/blogs/tutorial/assets/java-native-builds-graalvm-vs-leyden/04-what-native-build-deletes.svg)

**Everything off the map is deleted.** Not excluded from the classpath — genuinely not present in the output. The JDK classes you never call, the half of your logging library you do not touch, the four database drivers that came along for the ride: gone. What survives gets compiled to machine code and packaged with a small runtime into one executable file.

The result is a different kind of artifact:

- It starts in **tens of milliseconds**, because the loading work is already finished.
- It uses a **fraction of the memory**, often three to five times less.
- It needs **no Java installed** on the target machine — drop it in an empty container and it runs.
- Its **attack surface is smaller**, because you cannot exploit code that does not exist.

For a command-line tool that is not an improvement, it is the difference between usable and not. Nobody tolerates a pause before every invocation. For a serverless function, cold start *is* your latency story. For scale-to-zero, it decides whether scale-to-zero is a real option or a nice idea.

### The catch, and it is a big one

All of that rests on one assumption: **the map is complete.** It has to be, because at run time there is no compiler left to correct a mistake.

Java, famously, does not work that way:

```java
Class.forName(config.get("handler.class"))
     .getDeclaredConstructor()
     .newInstance();
```

Which class does that load? **Nobody knows until it runs.** The name lives in a config file. Nothing in your compiled code points at it. So it never reaches the map, and it gets deleted. Your binary builds cleanly, deploys cleanly, then fails at run time complaining about a class sitting right there in your source tree.

This is not an edge case. Dependency injection, JSON serialisation, entity mapping, dynamic proxies, service discovery, annotation scanning — a large slice of the Java ecosystem works exactly this way, and all of it is invisible to a build-time map.

So you have to **declare the invisible parts.** That is the tax.

---

## Part 5 — Native Image reachability metadata and build trade-offs

The declarations are called **reachability metadata** — JSON files riding along in your jar that say "keep this class, and its constructor, and this method, because something will reach them in a way you cannot see."

A few other categories vanish for the same reason. Worth recognising the failures when they arrive:

| What gets stripped | Why the builder misses it | What you see |
| --- | --- | --- |
| Reflected classes and methods | The name is a runtime string | `ClassNotFoundException` for a class you can see in your IDE |
| Resource files | Resources aren't code, and the path may be built at runtime | A template, migration or `.properties` file silently missing |
| Dynamic proxies | Each interface combination must be generated ahead of time | Proxy creation blows up on startup |
| Serialised types | Serialisation reaches fields reflectively | Deserialisation fails on a class that works fine on the JVM |

The good news: you will rarely write these by hand. Three sources stack up.

**Your framework generates most of it.** Modern Spring Boot has a build step that inspects your beans, configuration properties, controller signatures and entities, works out what needs declaring, and writes the metadata. In places it goes further and replaces reflection with generated code, so there is nothing to declare at all. Quarkus and Micronaut sidestep even more by doing their wiring at compile time by design. If you are on one of these, a large fraction of the work is done before you start.

**A shared repository covers popular libraries.** There is a community-maintained collection of metadata for widely used libraries that ship none of their own, and the build plugins pull from it automatically. That handles a surprising amount of the middle of your dependency tree.

**An agent covers the rest.** For your own reflection and for obscure dependencies, run the app on a normal JVM with a tracing agent attached. It watches what actually gets reflected on and writes the metadata out.

> **Note — the agent's trap, and it will bite you.** The agent only records paths you actually execute. Click through your app by hand for two minutes and you get the happy path. That error branch that reflectively builds a fallback handler? Never ran, never recorded, deleted from your binary, fails in production at 2 a.m. **Drive the agent with your integration test suite, not with your hands**, and merge results across runs.

### Frameworks make this pleasant

On Spring you rarely touch the JSON. There is a typed API for the same job: you describe what you need in Java, and the build step writes the metadata. The practical win is not brevity — it is that **a rename breaks your build instead of your binary**. A class name in a JSON file is a string nobody checks. The same name in a typed registration is a reference your compiler will defend.

There is also a shortcut for the case you will hit most. Nearly all reflection in a typical web service is **data binding** — your JSON library reflecting over request and response objects. Spring has one annotation for that, and pointing it at your top-level request and response types pulls in the nested types and generics underneath automatically.

You only need to get involved by hand when:

- You do your own `Class.forName` with a computed name
- You load a file whose path is assembled at runtime
- A data object only appears behind a generic wrapper, so nothing in the signature reveals its real type
- A library ships no metadata and is not in the shared repository

> **Note — do not write these speculatively.** Blanket-declaring "just in case" keeps code alive that would otherwise be deleted, inflating your binary and undoing part of why you came. **Build the binary, run your integration tests against the binary, and let the failures tell you what is missing.** Metadata found by a failing test is correct by construction. Metadata you guessed at is just weight.

### Tuning the build, at the level you actually need

You will pass the builder some options. You do not need all of them; a handful change your day.

| What you want | Roughly how | Worth knowing |
| --- | --- | --- |
| Builds that don't eat an afternoon | Quick-build mode, plus a memory ceiling for the builder | Roughly halves build time by skipping deep optimisation. Great locally, never ship it |
| Better runtime performance | Higher optimisation level, and a real garbage collector | The default collector suits short-lived tools and is wrong for a busy service |
| A smaller binary | Optimise for size, strip monitoring you aren't using | With a fully static build you get something that runs in an empty container |
| To find out why the build failed | Diagnostic modes and a build report | The report shows which packages ate your binary size — usually one dependency dragging in half a world |
| **To not ship a broken binary** | **Turn fallback mode off** | See below. Not optional |

That last row needs its own paragraph. By default, when the builder hits something it cannot resolve, it does not fail. It quietly produces a **fallback image** — a wrapper that bundles a whole JVM and requires Java on the target machine. Your build goes green. Your CI is happy. You deploy a 200 MB "native binary" that starts slowly and needs the runtime you thought you had eliminated, and you discover this in production. **Disable fallback and the build fails instead**, which is what you wanted.

Put your options in a build config file rather than a command line, so they travel with the project and everyone gets the same binary.

### What you give up

Remember all those clever runtime guesses from Part 2? A build-time compiler cannot make them. It has no traffic to learn from. So for a **long-running service under steady load, a native binary can be measurably slower at peak than the same app on a warmed-up JVM.**

There is a partial fix: build an instrumented binary, run it under a realistic workload, capture the profile, feed it into a second build. That is borrowing the JIT's trick offline, and it recovers a good chunk of the gap. It is also a commercial feature rather than part of the free distribution, and your pipeline now has three stages.

Total cost of this road: metadata to maintain forever, builds measured in minutes and gigabytes, a throughput penalty unless you add profiling, and anything doing runtime code generation simply will not work. For a CLI or a function, you pay that happily. For a service that has been up three weeks, ask what you are buying.

Someone at OpenJDK asked exactly that.

---

## Part 6 — How Project Leyden's AOT cache reduces JVM startup work

Back to the itemised bill. Twenty thousand classes, loaded identically every start, discarded on exit.

Native Image's answer is: *don't have a JVM, then.* Drastic, effective, expensive.

**Project Leyden** asks the quieter question. If the work is identical every time — why not do it once, write the result to a file, and read the file next time?

That is the **AOT cache**. You do a **training run**: start your app once, normally, and it records what got loaded and linked. From that recording it builds a cache file. Every run afterwards points at the cache and skips straight past the work.

```bash
java -XX:AOTCacheOutput=app.aot -jar app.jar   # rehearse, and build the cache
java -XX:AOTCache=app.aot -jar app.jar         # every real run from now on
```

Now look at what you did **not** do:

- You did not write any metadata.
- You did not give up reflection, or dynamic proxies, or runtime code generation.
- You did not give up the JIT — it is all still there, still watching, still optimising.
- You did not change a line of your code.

It has arrived one piece at a time across recent Java releases. Class loading and linking first. Then a simpler workflow. Then the piece that matters most: **the training run also records profiles**, so the optimising compiler can start work immediately instead of gathering evidence from scratch.

That is why Leyden is not simply "Native Image but weaker." By carrying profiles forward it shortens **warm-up** as well as startup — the second of our two problems, attacked while keeping the JIT rather than by removing it.

More recently the cache stopped being tied to one particular garbage collector, which unblocked it for the low-latency collector many teams run in production, and the JDK now ships a small baseline cache of its own classes, so you get a modest improvement with no training run at all.

> **Note — an active project, not a finished feature.** Leyden is still shipping. The prototype has things that have not landed yet — storing pre-compiled machine code in the cache so methods run natively from the very first call, and pre-generating the dynamic proxies frameworks lean on. If today's numbers are close but not quite enough, they will keep improving without you doing anything.

### What it asks in return

The cache is tied to the environment that produced it. **Train on the same kind of CPU and with the same garbage collector as production**, or the cache gets partly or wholly ignored — quietly, with no error, just your old startup time back.

In practice the training run belongs in CI on an instance matching production, not on your laptop. More discipline than it sounds, but it is one pipeline step, and it does not need revisiting every time you add a dependency. Metadata, by contrast, you maintain forever.

One practical gotcha: the single-command workflow runs two JVMs under the hood, so it needs roughly double your configured heap available while building the cache. On a small CI runner that will surprise you.

---

## Part 7 — Comparing startup, throughput, memory, and build cost

![A line chart comparing three lines: the native binary lifts off at around fifty milliseconds and stays just below full speed, the JVM with a cache lifts off at about one second and climbs quickly, and the plain JVM does not start answering until around three seconds then climbs slowly to the highest final speed](/blogs/tutorial/assets/java-native-builds-graalvm-vs-leyden/05-startup-speed-compared.svg)

That chart is the whole argument in one picture. Native is first off the line and never improves. Plain JVM is last off the line and ends up highest. The cache is a compromise that costs you almost nothing to take.

Filled out:

| | Plain JVM | Native Image | Leyden AOT cache |
| --- | --- | --- | --- |
| **Time to first request** | Seconds | Tens of milliseconds | Well under half of plain |
| **Peak throughput** | Highest | Lower, unless you add profiling | Same as plain |
| **Memory footprint** | Baseline | Three to five times smaller | Roughly baseline |
| **Java needed at runtime?** | Yes | No | Yes |
| **Reflection, proxies, runtime codegen** | All fine | Must be declared, or removed | All fine |
| **Code changes** | None | Sometimes, plus metadata | None |
| **Build time** | Seconds | Minutes, and gigabytes of RAM | A training run |
| **Ongoing maintenance** | None | Metadata, forever | One pipeline step |
| **Runs in an empty container** | No | Yes | No |
| **When it goes wrong** | Runtime, loudly | Build time, if configured right | You just lose the speed-up |

One line each:

**Native Image gives you the lowest possible floor, and charges you in ongoing effort and peak performance.**

**Leyden gives you most of the startup win for almost no effort, and charges you nothing you will notice.**

---

## Part 8 — When to choose Native Image, an AOT cache, or the plain JVM

![A decision tree: is startup actually hurting you, no means stay where you are; yes leads to turning on the AOT cache, then asking whether that was fast enough; if not, asking whether the process dies between bursts of traffic, which leads to going native or staying on the JVM](/blogs/tutorial/assets/java-native-builds-graalvm-vs-leyden/06-which-road-decision-tree.svg)

The order matters, because the cheapest answer is usually good enough and most people leap straight past it.

**First, check that startup is actually your problem.** Measure it. If your container starts in four seconds and stays up for a fortnight, you spent four seconds. Do not rebuild your deployment story over four seconds. Plenty of teams go native for a cold-start problem their traffic pattern means they never have.

**If it does matter, try the cache first.** One pipeline step. No code changes, no metadata, no understanding of reachability analysis, and if it does not help you have lost an afternoon. Best effort-to-benefit ratio available, and it should be your default attempt.

**Go native when the shape of the workload demands it:**

- **A CLI.** Not negotiable. A tool that pauses before every invocation is a tool people stop reaching for, and you control the whole dependency tree so the metadata burden stays small.
- **Serverless, or anything billed per request.** Cold start is your latency and your invoice at once.
- **Genuine scale-to-zero.** If instances die between bursts, you pay startup constantly, and milliseconds versus seconds changes which architectures are available to you.
- **Tight memory budgets.** Packing many small services onto limited hardware, a three-to-five-times footprint reduction can be the entire argument.

**Stay on the JVM for a long-lived service.** Steady load, instances alive for weeks, peak throughput that matters: plain HotSpot with an AOT cache is very likely your answer, and native metadata would be a permanent tax against a one-time benefit you barely collect.

> **Note — the decision that will save you the most time.** If you are heading native, look at your serialisation library before anything else. Reflection-heavy JSON will have you declaring every data class you own. Compile-time serialisation generates its own wiring and needs almost none. The same logic runs through your whole stack: **every dependency that does its work at compile time instead of at runtime is one you will not fight.** Deciding this on day one costs nothing. Deciding it in week three costs a rewrite.

---

## Make the first request part of the benchmark

Return to that fresh instance waiting to serve its first request. Give it a budget: how soon must it be ready, how much memory can it use, and what throughput must it sustain after warming up?

Measure the same application and workload on the plain JVM, with a compatible Leyden AOT cache, and as a native executable where practical. Record time to the first successful request, latency during warm-up, steady-state throughput, process memory, and build time. Repeat the runs under comparable conditions; a single fast launch is an observation, not a deployment decision.

Use the result to make a bounded choice:

- **Try a JVM AOT cache** when startup matters and you want to retain JVM behaviour. Verify the features supported by your JDK and rebuild the cache with your application releases.
- **Choose GraalVM Native Image** when measured cold-start or memory savings justify native builds, metadata, and testing the executable itself. CLIs, serverless functions, and services that scale to zero are strong candidates.
- **Keep the plain JVM** when it already meets your budgets. A long-lived service may gain more from application profiling than from changing its deployment artifact.

The exciting part is having these choices within Java. You can move more work into the build, carry preparation forward in a cache, or keep the runtime optimising against live traffic. Each gives you a different place to pay for performance.

Your user experiences the first request as part of your application's speed. Make it part of your definition of fast.
