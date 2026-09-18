# A 4B open-weights model, retrained on one task, beats the Postgres query planner

In 2015, a group of database researchers asked an uncomfortable question: *how good are query optimizers, really?* Ten years later, they asked it again — and the answer was still "not good enough." Every time Postgres runs a query joining several tables, it must pick one execution plan out of a set that explodes combinatorially with every table added. Nobody can search that space exactly, so the planner guesses — and its guesses are often wrong.

**QoRL, a project by Rohan Bansal, is a direct answer to that decade-old question.** The act: take a small open-weights model — a 4-billion-parameter Qwen that fits on a home GPU — and retrain it on this one problem. The goal: find out whether a learned model can plan these queries better than Postgres's own planner can.

## One task, taught from scratch

The benchmark is the Join Order Benchmark: 113 analytical queries over the IMDb dataset — movies joined to companies, keywords, cast. Out of the box, the open-weights Qwen 4B couldn't produce a usable plan for 99 of the 113 queries. So it was retrained on exactly one skill: given a query, write planner hints that steer Postgres toward a faster execution.

The teaching method is the elegant part. Postgres *executes* the model's suggestion, and the measured runtime becomes the reward. Faster than the default plan — reinforced. Slower — discouraged. No human labels, no theory of databases baked in: just trial, error, and a timer. Total cost of the whole effort: **about $1,200**, mostly a rented GPU node and API fees for teacher examples.

The result: a **1.81x speedup and a 44.7% summed latency reduction across all 113 queries — with zero regressions**.

## The takeaway I keep coming back to

This isn't really a database story. It's a story about where AI is heading.

The model isn't special. It isn't frontier, isn't huge, isn't expensive. What made it good was **retraining on one dedicated task with a reward that could be checked in the real world**. Combine that with open weights — free to download, cheap to run, fine-tunable on a desk machine — and a pattern emerges: the interesting units of AI progress are becoming small, specialized, and affordable. Not one giant model that knows everything, but many little experts you can spin up for the price of a cloud bill.

A year ago, "beat Postgres at query planning" would have sounded like a research lab's roadmap. This week it was one person, one sabbatical, and $1,200.

Source: [Rohan Bansal — Training a 4B model to produce 81% faster query plans than Postgres](https://rohanbansal.com/qorl)
