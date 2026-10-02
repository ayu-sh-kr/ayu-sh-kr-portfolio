# Why OpenAI, TypeSafe and Cloudflare are racing to make AI decide

In just over two weeks, three AI companies announced products built around a surprisingly small output: a decision. TypeSafe AI introduced **Jev** on September 15. OpenAI followed with its **Decisions API** at DevDay on September 29. On October 1, Cloudflare released **Clef** and **Clef-flash**, open-weight models designed for the same kind of work.

The timing alone does not prove a coordinated race. The product choices are more revealing. Cloudflare explicitly compares Clef with Jev and supports the same API shape. OpenAI is offering a bounded decision interface backed by Luna. Each is making a different bet on a question that sits inside many AI agents: when the possible actions are already known, why ask a model to write an answer?

## Jev put the idea on the table

TypeSafe’s pitch was direct: pass in a situation and a set of questions, then receive **typed answers and probabilities** that software can use. A typed answer might be one choice from a list or a score against a defined scale. Jev does not generate a paragraph explaining itself. TypeSafe calls this a “System One” model, positioning it as a fast decision layer within automated workflows.

The company also made speed, cost and calibrated confidence central to its launch. Its reported gains come from TypeSafe’s own evaluations, whose workflow and reference answers affect the comparison. The bigger signal was the interface: the model’s job was no longer to compose a response for a reader, but to supply a constrained judgment to another piece of software.

## OpenAI brought decisions into its API

Two weeks later, OpenAI announced the **Decisions API** in limited preview. Developers provide text or image context and define questions with a finite set of allowed answers. OpenAI describes uses such as classification, request routing and choosing an agent’s next action, with the service drawing on Luna’s intelligence.

That announcement matters because OpenAI framed decisions as a distinct API surface at DevDay. It has not published directly comparable latency or benchmark results for the Decisions API in its launch recap, so this is evidence of product direction, not evidence that OpenAI has overtaken Jev on speed or quality. OpenAI said a wider release was planned for the following days.

## Cloudflare made a direct counteroffer

Cloudflare’s October 1 launch is the clearest sign of competition. **Clef** and the smaller **Clef-flash** are available on Workers AI, while their weights are published under Apache 2.0. Cloudflare says Clef follows the System One API, allowing an existing Jev integration to switch endpoint and model. It is also recruiting design partners for a reinforcement-learning fine-tuning service for these decisions.

Cloudflare put numbers next to that pitch. In its 43 benchmark runs, it reports median latency of **209.3 ms for Clef**, **38.8 ms for Clef-flash** and **524.1 ms for Jev**. It says a Clef model led on seven of ten decision benchmarks. These are Cloudflare’s measurements under its selected workloads and serving conditions; they do not settle how the models compare in every application. Clef’s 27B model and Clef-flash’s 9B model also make different trade-offs between accuracy and speed.

The open weights are another competitive lever. Developers can inspect or run Cloudflare’s models locally, while Workers AI offers a hosted path. Jev was introduced in early access as a hosted TypeSafe product; OpenAI’s Decisions API began in limited preview. Those access choices may matter as much as a leaderboard score to teams deciding where a model sits in their system.

## What the launches reveal

The common target is the repeated **decision between steps** of a larger workflow: classify this input, choose a route, score a risk, or decide whether an agent should continue. Returning only predefined answer types can reduce output generation and make the result easier for software to handle. That explains the interest in speed and predictable structure, especially when an agent might make many such calls.

The three announcements do not establish that every agent needs a dedicated decision model, or that the products share an architecture. They establish that three companies now want to own this narrow step through different routes: TypeSafe with Jev’s purpose-built model, OpenAI with a limited-preview API, and Cloudflare with hosted and open-weight alternatives compatible with Jev’s interface.

A decision still needs scrutiny. A model can return a perfectly valid answer and make the wrong call; confidence and a fixed schema do not grant it authority to approve a payment or execute a risky tool. The meaningful contest ahead is whether these models can make **reliable decisions in real workflows**, under clear human and software controls, as well as produce impressive launch benchmarks.

Sources: [TypeSafe AI — Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev); [OpenAI — DevDay 2026 recap](https://openai.com/index/devday-2026-recap/); [Cloudflare — Introducing Clef](https://blog.cloudflare.com/clef-decision-models/); [Cloudflare — Workers AI changelog](https://developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/).
