# Google announces Gemini 4 Argon: capabilities, pricing and access

**Google has announced Gemini 4 Argon**, its new model for coding, professional research and cybersecurity defense. The September 30 announcement comes with launch prices, but access is limited for now: trusted cybersecurity partners are getting it first, with paid API customers and Google AI Ultra subscribers planned to follow.

The release centers on work that takes many steps to finish. Fixing a bug, for example, can mean finding its cause, changing several files and checking that the change holds up. Google's pitch is that Argon can keep reasoning through that kind of extended task.

## What Gemini 4 Argon can do

[Google DeepMind's model page](https://deepmind.google/models/gemini/) describes capabilities spanning software engineering, document-based work and visual understanding. That includes working through legal and financial material, interpreting charts and understanding long videos. These are different tasks, so a strong result in one does not establish reliability in all of them.

Google also reports a concrete result from its own data centers: a team of Argon agents analyzed memory-use measurements across its servers, identified optimizations and applied them. Once rolled out, those changes **freed more than 300 TiB of memory**, with Google estimating total savings of **500 TiB to 1 PiB**. This means freeing server RAM for other work, rather than clearing disk storage. The larger figure is an estimate; the 300 TiB figure is Google's reported result.

One notable change is a **one-million-token output limit**, up from 64,000, according to [Google's announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/). This is the generation limit, not a claim about how many documents fit into the input. It gives the model more room for extended reasoning and responses; it does not mean every request needs that much output.

## Strong benchmark results, with some gaps

Google's published comparison puts Argon at **77.9% on DeepSWE v1.1**, ahead of the listed GPT-6 Astra and Claude Opus 5.5 results on that software-engineering test. The same table shows it behind those models on FrontierSWE v2 and Terminal-Bench 4.0. The evidence supports a competitive coding model, rather than an across-the-board winner.

There is also an evaluation from [Vals AI](https://www.vals.ai/models/google_gemini-4-argon). Argon leads its GDP-weighted Vals Index at **68.9%**, but ranks second on code migration and fifth on its legal-agent benchmark. Vals used high reasoning effort and a 262,144-token output cap, so those results describe a particular setup rather than the newly announced maximum.

That distinction matters when judging Google's claims: the task, tools and evaluation settings shape the result. A leaderboard position is useful evidence, but it cannot predict how every codebase or research assignment will turn out.

## API pricing and what a request costs

Google announced introductory rates of **$2 per million input tokens and $10 per million output tokens**. After the introductory period, they rise to **$4 and $20**. The announcement does not give an end date. Cached input receives a 95% discount, making its introductory rate **$0.10 per million tokens**.

For a simple calculation, 100,000 uncached input tokens plus 20,000 billable output tokens would cost **$0.40 initially**, or **$0.80 at the later rates**. This illustrates token charges only; it assumes no additional tool or storage fees.

> A lower token price does not guarantee a cheaper finished task.

Longer generations and repeated attempts can increase the total. At the introductory output rate, one million billable output tokens alone would cost $10. Google's general [API pricing page](https://ai.google.dev/gemini-api/docs/pricing) did not yet list Argon when checked on October 1, so its detailed thinking-token, tool and cache-storage billing rules should be checked when API access opens.

## Who gets access first?

The [Fairwind Program](https://deepmind.google/fairwind-program/) prioritizes governments, critical infrastructure operators and other trusted defenders. Selected partners can use Argon directly or through CodeMender, Google's agent for investigating and patching software vulnerabilities. Applications are vetted, and access cannot be resold or shared outside the permitted teams.

For everyone else, the next milestone is wider availability. Argon's announcement brings promising capabilities and clear headline prices; public access will make it possible to judge how consistently it finishes real work, and what that work actually costs.
