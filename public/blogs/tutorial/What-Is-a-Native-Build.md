# What Is a Native Build? Compilation, Linking, and Managed Runtimes

## Two downloads, two very different experiences

You needed a command line tool last week. You found one, downloaded it, dropped it in your path, and typed its name. It answered before your finger left the Enter key. One file. No setup. It just worked.

Then you needed another tool. You downloaded that one too, and it told you to install a runtime first. So you did. Then you ran it, and there was a pause. Not a long one, maybe half a second, but you noticed it. And you noticed it again the next time, and the time after that.

Both tools do roughly the same kind of work. Both were written by competent people. Neither is badly made. So what is actually different between them?

The honest answer is that **they made opposite choices about when the work should happen**. One of them finished everything before you ever downloaded it. The other left part of the job for the moment you pressed Enter, and that decision buys it something valuable in return.

That single trade sits underneath a surprising amount of software. It explains why Go tools ship as one file and Java tools ship with installation instructions. It explains why your Docker images are the size they are. It explains why a language can be blazing fast and still feel slow to start. And it explains what people mean when they say "native build," which is a phrase you have probably nodded along to more than once.

By the end of this, you will understand that trade completely. We are going to walk the whole path, from the code you type to the program that runs, and you will not need to know anything about assembly or memory addresses to follow it. Let us start at the very beginning.

---

## What a compiler is actually doing

Your computer's processor does not read your code. It cannot. It has no concept of a function name, a loop, or a variable called `userEmail`. What it understands is a small, fixed vocabulary of extremely simple instructions: move this number here, add these two things, jump to that position, compare these values.

**A compiler is a translator between those two worlds.** You write something structured and readable, and the compiler converts it into that primitive vocabulary the processor can actually execute. Everything else a compiler does, all the checking and optimizing and warning, is in service of that one job.

Two things about this translation matter for the rest of the story.

The first is that **translation takes real time and real effort**. A good compiler does not just convert your code mechanically. It studies it. It notices that a calculation inside a loop produces the same answer every time and moves it outside the loop. It notices that a small function is called everywhere and pastes its body directly into each caller so there is no jumping around. It notices that a branch of code can never be reached and deletes it. This work is genuinely expensive, which is why large projects take minutes to build.

The second is that **the output of translation is specific**. Processors do not all share the same vocabulary. The instruction set your laptop's Apple silicon chip understands is not the one a server's Intel chip understands. Operating systems differ too, in how a program asks for memory or opens a file. So translated code is not universal. It is made for one particular combination of processor family and operating system, and it will not run anywhere else.

Hold onto both of those facts, because the entire native build question grows out of them. **Translation is expensive, and its result only fits one kind of machine.** Someone has to decide when to pay that cost and how much freedom to give up in exchange.

But before we get to that decision, there is a detail we have been quietly ignoring. We have been talking as though the compiler translates *your* code. In reality, most of what ends up in your program was never written by you at all.

---

## You never write the whole program

Think about the last thing you built. Did you write the code that parses JSON? The code that opens a network connection? The code that formats a date, or compresses a file, or sorts a list efficiently?

Almost certainly not. You used **libraries**.

A library is a bundle of code that somebody else wrote and packaged up so other programs can use it. The defining feature is what it lacks: **a library has no starting point**. It never runs on its own. Nothing happens if you point your operating system at one and tell it to go. It sits there inert until some actual program calls into it.

That is the whole difference between a library and an application. Both are made of the same stuff. Only one of them is something you can launch.

What makes libraries work is a clean separation between two things:

**What it looks like from outside.** The names of the functions, what you pass them, what you get back. This is the part you read documentation for, and it is the part your compiler needs in order to write a correct call to it.

**What it does inside.** The actual logic. You are not supposed to care. In fact the entire value of a library is that you get to not care, and that the author can rewrite the inside completely without breaking your code, as long as the outside stays the same.

> **Quick note.** This is why the word *boundary* comes up so often around libraries. A library is not really a code-saving device, though it saves code. It is a boundary between two groups of people who want to work independently, and every mechanism around it, from version numbers to release notes, exists to keep that boundary stable over time.

Once you are using other people's code, though, a new question appears. Your program is no longer one thing you control. It is your code plus a collection of things you brought in, each with its own version, each possibly bringing in things of its own. That relationship has its own name.

---

## Library or dependency? Both, actually

People use these two words as though they mean the same thing, and get gently confused when they seem not to line up. They describe the same object from two angles.

**A library is what the thing is.** A packaged piece of reusable code, sitting on a server somewhere, minding its own business.

**A dependency is what the thing is to you.** A relationship. A statement that your program cannot be built or cannot run without it.

So every library you use is one of your dependencies, but not everything you depend on is a library. You might also depend on a specific compiler version, a database that has to be running, a tool your build script calls, an environment variable that has to be set. All dependencies. None of them libraries.

The reason the vocabulary splits along language lines is mostly historical. **In C and C++ people say "library" because libraries were the only part of the picture that had tooling.** You pass the linker a file and it uses it. There is no resolver sitting on top introducing new words.

Languages that grew up with package managers say "dependency" instead, because the manager's job was never just handing you a file. Its job is untangling a *web* of relationships: you asked for one thing, that thing needs four more, two of those want conflicting versions of a fifth, and something has to decide what actually gets installed.

> **Quick note.** C and C++ have exactly the same web of relationships. It is just managed by humans, build scripts, and system package managers rather than by a resolver. Tools like Conan and vcpkg exist precisely to bring dependency vocabulary to a world that only ever had libraries.

Either way, you now have a pile of pieces: your compiled code, plus a set of libraries you are borrowing from. They are separate files that know nothing about each other. Something has to join them into one working program, and *when* that joining happens turns out to be the first big fork in our road.

---

## Linking: the moment the pieces become one program

When your code calls a library function, the compiler writes down the call but leaves a blank where the destination should be. It does not know where that function will live. Filling in those blanks is a job called **linking**, and there are two fundamentally different times to do it.

**Static linking happens at build time.** The linker opens the libraries, finds the code for every function you actually use, and copies that code directly into your program. When it finishes, your program contains everything it needs. The libraries could be deleted from the machine entirely and it would not notice.

**Dynamic linking happens when the program starts.** Your program ships containing only the *names* of what it needs. When you launch it, the operating system finds those libraries on the machine, loads them into memory, and wires up the connections right then, moments before your code begins to run.

Neither is correct in general. They fail in different directions.

| | Static linking | Dynamic linking |
|---|---|---|
| **When pieces are joined** | While you build | While the program starts |
| **File size** | Larger, everything is inside | Smaller, references only |
| **Shipping it** | Copy one file and you are done | The right libraries must already be there |
| **Security patches** | Every program must be rebuilt and redistributed | Update the library once, every program is fixed |
| **Many programs at once** | Each one carries its own copy | They share a single copy in memory |
| **Version conflicts** | Impossible, you froze what you shipped | The classic source of "works on my machine" |
| **Predictability** | Exactly what you tested is what runs | Depends on what the target machine has |

The tension here is genuinely unresolved, and both sides have a strong argument.

**The case for dynamic linking is safety at scale.** When a serious flaw is found in a widely used library, a system running dynamically linked programs can be fixed in one step: replace the library, restart things, done. Every program on the machine is protected, including programs whose authors have long since moved on. With static linking, every single program that copied the flawed code in has to be rebuilt by whoever built it, and shipped again, and installed again.

**The case for static linking is certainty.** If you are shipping software to machines you do not control, dynamic linking means your program's behaviour depends on someone else's filesystem. The exact combination you tested may not be the combination that runs. Static linking removes that uncertainty entirely. What you tested is what runs, everywhere, forever.

> **Quick note.** There is a third option worth knowing about because it causes trouble later. A program can also load a library *while running*, by name, on demand. That is how plugin systems work: the program has no idea what will be loaded until a user drops something into a folder. Remember this one. It is going to matter.

Now we have all the pieces in place. You have code, you have borrowed code, and you have a way to join them. The question that remains is the biggest one: how much of this entire process should happen before you ship, and how much should be left for later?

---

## The fork in the road

Here is the whole thing in one picture. Everything above is the top half. Everything below is where we are going.

![Native and managed execution paths: native builds compile and link before distribution, while managed applications use a runtime and JIT compilation after launch.](/blogs/tutorial/assets/native-vs-managed.svg)

Look at where the dashed line falls on each side. That line is the moment you press Enter. **On the left, almost everything is above the line. On the right, almost everything is below it.**

Both roads perform the same work. Translating your code, pulling in libraries, optimizing. Neither one skips a step. The only difference is which side of that line the work lands on, and every advantage and frustration we are about to discuss comes directly from that.

Let us walk the right road first, because it is the one whose reasoning is least obvious.

---

## The managed road: stopping halfway on purpose

On this road, the compiler does something that sounds lazy and is actually strategic. It translates your code only part of the way, into a form called **bytecode**, and then stops.

Bytecode is a halfway language. It is far more structured than the raw instructions a processor understands, but far more mechanical than the code you wrote. Crucially, it is not tied to any particular processor. The same bytecode file works everywhere.

Of course, a processor cannot execute bytecode. So this road needs an extra participant: a **runtime**, a program whose job is to run your program. You may know it as a virtual machine, or an interpreter, or simply "the thing you had to install first."

When you launch, the runtime starts up, reads your bytecode, goes and finds the libraries you asked for, loads them, and begins executing. At first it does this fairly slowly, working through the bytecode step by step.

Then something clever happens. **The runtime watches your program run.** It notices which functions get called constantly and which get called once. It notices which branch of an `if` almost always wins. It notices that although a variable *could* hold any of five different types, in practice it always holds one. And armed with all that real evidence, it translates the busy parts into proper machine instructions, optimized specifically for the behaviour it just observed. This is called **just-in-time compilation**, or JIT.

This is why managed programs have a warm-up. For the first moments, the runtime is still learning. After that, it is running code tuned to what your program actually does, rather than what someone guessed it might do at build time.

And this is the payoff for stopping halfway:

**One file goes everywhere.** You ship bytecode. A runtime exists for each platform. You did not have to build separately for each one.

**Optimization gets real evidence.** A build-time compiler has to guess. A runtime can measure. For long-running server software, that measured knowledge is worth a great deal.

**The program can grow after it starts.** Because nothing was finalized, new code can be loaded later. Plugins, extensions, frameworks that inspect your classes and build things on the fly. All of it is possible because the door was left open.

That last one is not a side effect. It is the deep reason this road exists, and it is what makes the other road difficult for these languages. But we will come back to that. First, let us look at what happens when you refuse to leave anything for later.

---

## The native road: finish everything first

On this road, the compiler translates all the way down to the instructions your processor actually understands, and the linker folds the library code in. When the build finishes, you have a **binary**: a complete, finished program that the operating system can launch directly. No runtime. No translator. No further preparation.

This is what people mean by a **native build**. Native means the program speaks the machine's own language, without an interpreter standing in the middle.

The consequences are immediate and pleasant.

**It starts instantly.** There is nothing to boot up and nothing to warm up. The very first instruction runs at full speed, because there is no learning phase to get through.

**It uses less memory.** A runtime is itself a substantial program. It occupies memory, it manages its own bookkeeping, it needs room to work. A native binary carries far less of that overhead.

**It is one thing to hand over.** Copy the file, run the file. No installation instructions, no version prerequisites, nobody stuck because they have the wrong runtime.

But doing all the work early gives the compiler an opportunity that goes beyond just being early. Because it can see the whole program at once, it can make decisions that would be unsafe otherwise. It can delete every function nobody calls. It can look at an interface with only one implementation in the entire program and skip the lookup, calling the implementation directly, then paste it inline. It can decide memory layouts once, globally, with full knowledge.

Every one of those optimizations rests on a promise, though. And the promise is the concept everything in this article has been building toward.

---

## The idea underneath everything: closed world and open world

The promise is this: **nothing new will appear later**.

When a compiler assumes it can see the entire program, that no code will show up after the build, that assumption is called a **closed world**. When the opposite is true, when code can arrive at any time, that is an **open world**.

The difference sounds philosophical. It is intensely practical, because closed-world optimizations are *only valid if the promise holds*.

Consider deleting unused functions. If nothing in the program calls it, throw it away, the program gets smaller and faster. But that is only safe if nothing can ever call it. If code could show up later and ask for that function by name, deleting it was a bug waiting to happen.

Or consider calling an implementation directly instead of looking it up. Safe, if there is genuinely only one. Catastrophic, if a second one can be loaded tomorrow.

| | Closed world | Open world |
|---|---|---|
| **The assumption** | The whole program is visible at build time | Code can appear at any time, even mid-run |
| **Can delete unused code?** | Yes, safely | No, it might be needed |
| **Can skip lookups?** | Yes, when there is one answer | No, the answer can change |
| **Plugins loaded at runtime** | Not possible | Natural |
| **Looking things up by name** | Must be declared in advance | Works freely |
| **Typical of** | Native builds, AOT tooling | Runtimes and virtual machines |
| **You gain** | Speed, size, instant start | Flexibility, portability, extensibility |

This is the real fork in the road, and now the earlier picture should look different to you. **The native road is not just "faster." It is faster because it made a promise, and that promise costs you things.**

Which brings us to the honest version of the trade.

---

## The honest scorecard

Native builds get talked about as an upgrade. They are not. They are a different set of compromises, and some of them bite hard.

| | You gain | You give up |
|---|---|---|
| **Starting the program** | Instant, no warm-up | Nothing meaningful |
| **Memory** | Noticeably lower and steadier | Nothing meaningful |
| **Shipping** | One self-contained file | A separate build for every platform you support |
| **Building** | — | Much slower builds, all the work happens now |
| **Peak speed** | Very good, consistently | The runtime's measured, evidence-based tuning |
| **Flexibility** | — | Plugins, runtime loading, looking things up by name |
| **Debugging** | — | Tools that expected a runtime often do not work |

Two of these deserve a closer look, because they are the ones people are surprised by.

**Peak speed is not automatically better.** This feels wrong the first time you hear it. Surely native is faster? For starting up, absolutely. But for a program that runs for hours, a runtime that has spent those hours measuring real behaviour can produce better-tuned code than a compiler that had to guess before anything ran. A build-time compiler optimizes for the program as written. A runtime optimizes for the program as actually used.

**Building for every platform is a real tax.** Because translated code only fits one processor and operating system combination, supporting three platforms means three builds, three sets of build machines, three things to test and release. The single-file convenience your users enjoy is paid for on your side.

So it is a genuine trade. Which is why different languages have landed in genuinely different places.

---

## Five languages, five answers

| Language | Native by default? | Runtime it carries | The interesting part |
|---|---|---|---|
| **C** | Yes | Almost none | The original model. Nothing is provided, nothing is hidden |
| **Go** | Yes | Substantial, built in | Native, but ships a scheduler and memory manager inside every binary |
| **Rust** | Yes | Almost none | Compile-time strictness means there is nothing to manage later |
| **Swift** | Yes | Shared on Apple platforms | Native while keeping more flexibility than Rust |
| **Java** | No | The JVM | Designed for an open world, now retrofitting a closed one |

**C** set the pattern everyone else is reacting to. It compiles to machine code with essentially nothing underneath, which is why its programs are tiny and why so much of the work falls on you. There is no automatic memory management to ship, because there is no automatic memory management.

**Go** chose native builds as a product decision rather than a performance one. Its promise was always that building and shipping should be boring, and it delivers: one command, one file, and switching target platforms is a setting rather than a project. The price is that every binary carries Go's own machinery inside it, including its memory manager and the system that makes goroutines work. That is why a trivial Go program is a few megabytes rather than a few kilobytes, and it is a price Go pays cheerfully.

**Rust** reaches native builds from the opposite direction. It has no memory manager to ship because ownership rules settle memory questions while you compile. What would be runtime bookkeeping elsewhere is compile-time argument in Rust. It also makes each generic function concrete during the build, generating a separate specialized copy for each type you use it with, which is a large part of why builds are slow and why the results are so fast. Rust has almost no ability to inspect itself at runtime, which sounds like a limitation but means the closed world costs it nothing. It was already living there.

**Swift** is the interesting middle. It compiles natively, but keeps more flexibility than Rust does, including the ability to ask questions about types while running. On Apple's platforms its runtime support ships as part of the operating system, so binaries stay small without being self-contained in the strict sense. It is a good example of native not being a single point but a spectrum.

**Java** is where this gets genuinely hard, and it is worth its own section.

---

## The hardest case: retrofitting a closed world

Java was designed, deliberately and correctly, for an open world. Write once, run anywhere was the entire pitch, and everything about the platform encourages loading code by name, inspecting types while running, and generating new behaviour on the fly.

Its ecosystem took that freedom and ran with it. The frameworks most people use every day work by scanning your code at startup, finding the pieces you marked, and assembling an application out of them. Configuration by discovery. It is a genuinely powerful model and it is why those frameworks feel magical.

It is also **exactly what a closed-world compiler cannot see**. When code decides what to load based on a string it computes at startup, no build-time analysis can follow it. As far as the analyzer is concerned, that code is unreachable, so it gets deleted, and your program fails at startup with an error about something that obviously exists.

Native build tooling for Java handles this by making the invisible visible. You declare, up front, what will be looked up dynamically. The tooling can generate a lot of these declarations automatically by running your program normally once and recording what it reaches. But the principle is unavoidable: **anything dynamic has to be promised in advance.**

The deeper fix has been the more interesting one. Rather than patching over discovery at build time, modern frameworks have started **doing the discovery at build time and generating plain code as output**. Instead of scanning your application at startup, the build works out the answer and writes out ordinary, visible code that does what the scanning would have done. Nothing is left to be discovered, so nothing needs to be declared, and the analyzer can see everything naturally.

That shift is more significant than it first appears. It is not a workaround. **It is an ecosystem slowly moving work from run time to build time**, which is the exact same movement this entire article has been describing, happening at the framework level instead of the compiler level.

> **Quick note.** There is one more twist worth appreciating. A runtime can *also* use closed-world optimizations, even though it lives in an open world. It assumes there is only one implementation, optimizes accordingly, and quietly keeps an escape route in case a second one appears. If that happens, it undoes the optimization and carries on. That is the runtime's structural advantage: it gets closed-world speed without making a closed-world promise. And it is exactly the trick a native build can never play, because after the build there is nobody left to change their mind.

---

## So which one should you pick?

You now know enough to decide this yourself rather than by reputation, but here is the shape of it.

**Reach for a native build when startup cost is visible to someone.** Command line tools are the clearest case. A tool that runs for 40 milliseconds cannot afford to spend 400 booting a runtime. Functions that start on demand and are billed by the millisecond are another. So is anything where a user is sitting and waiting.

**Reach for a native build when distribution is the hard part.** If you are handing software to people who should not have to install prerequisites, one file is a much better gift than a file plus instructions. Small container images are a version of this too.

**Stay on the managed road when the program runs for a long time.** A server that starts once and runs for weeks does not care about half a second at startup. It cares about throughput over time, and that is where measured, evidence-based optimization earns its keep.

**Stay on the managed road when the program needs to change shape while running.** If loading code on demand is central to what your software is, you are describing an open world. Do not fight it. You will lose, or you will win at a cost you will resent.

**And stay put when the cost is not yours to pay.** Native builds are slower to produce, harder to debug, and multiply your build matrix by the number of platforms you support. If nobody is actually feeling the startup delay, you would be trading real engineering time for a number nobody measures.

> **Quick note.** The most useful question is not "which is faster." It is "who is waiting, and for what?" A person waiting for a tool to respond is feeling startup time. A server handling its ten-millionth request is feeling throughput. Those are different problems and they point in different directions.

---

## Back to those two downloads

The tool that answered instantly was a native build. Somebody paid the translation cost before they published it. They accepted that they would have to build it separately for every operating system, and that they could never load a plugin they had not planned for. In exchange, you got one file that was completely finished before it arrived, with nothing left to work out.

The tool that needed a runtime and paused for half a second had not finished. The author shipped something half-translated and let the runtime complete the job on your machine. That is why it needed something installed first, and that is what the pause was: a runtime waking up, finding its libraries, and beginning to learn how the program behaves. Leave it running for an hour and it will have tuned itself to your actual usage in ways the first tool cannot, because the first tool made all its decisions before it ever met you.

Neither of them was built wrong. **They just drew the line in different places, and the line only has two sides.** Everything else, the file sizes and the install steps and the warm-up and the plugin support and the speed, follows from where that line was drawn.

So the next time you meet a program that starts instantly, or one that makes you install something first, you will know you are not looking at quality. You are looking at a decision. Somebody chose how much work to finish early and how much freedom to keep, and you are holding the result.

And now you know how to make that choice yourself.
