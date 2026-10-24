# ClickBench removes pgrust over benchmark cheating allegations

**ClickBench has removed pgrust**, a project rebuilding PostgreSQL in Rust, after maintainer Alexey Milovidov alleged that its submission used code tailored to the benchmark and replayed cached work. The removal is merged. The pgrust creator disputes the central allegations and has submitted a newer version for inclusion.

The dispute resurfaced on October 23, when the creator responded publicly. It concerns **v0.4-preview**, not every version of pgrust, and raises a concrete question about database rankings: how much of a fast repeat query comes from executing the request, and how much comes from remembering the earlier run?

## What ClickBench says it found

[ClickBench](https://github.com/ClickHouse/ClickBench#readme) tests analytical databases with **43 SQL queries over nearly 100 million rows** of web-traffic data. The workload includes counting, filtering, grouping and sorting—the operations behind reports and dashboards.

In [removal PR #2165](https://github.com/ClickHouse/ClickBench/pull/2165), Milovidov reports inspecting the published preview binary and the older public v0.3 source. He identifies query-numbered Rust files embedded in the binary and execution plans specifically matching ClickBench queries. The submission was marked as untuned.

His second finding concerns repeated requests. In a local test on a **96-core AWS Graviton machine**, a query counting URLs containing `google` took **10.8 seconds initially, then 11 milliseconds and 5 milliseconds**. Changing the search text to `rambler` took 283 milliseconds on its first run, followed by 12 and 4 milliseconds.

Milovidov attributes the tiny repeat timings to saved filtering decisions. He also reports that nearby SQL variations, including a simple request for the smallest URL, failed rather than using a general execution path.

The report explicitly says the benchmark answers were correct: 30 matched exactly, while the remaining differences were valid choices among tied results. **The objection is what the timings measure**, rather than fabricated answers.

> **Cold and hot runs:** ClickBench runs each query three times. A true cold run begins after restarting the database and clearing operating-system caches. Hot runs repeat the query with reusable data already in memory. Its rules allow some intermediate caches, but require result caches and caches near the end of execution to be disabled.

## The creator disputes how that code was used

In his [October 23 response](https://news.ycombinator.com/item?id=50209450), linked from the removal PR, pgrust creator `malisper` says the query-specific files were internal performance probes accidentally included in the binary. He says the benchmark instead compiled SQL into an intermediate representation, then into machine instructions through its new compiler.

He also disputes the description of the cache. His explanation is that pgrust remembers which distinct strings match a filter in its compressed text dictionaries, avoiding repeated checks of the same strings. He argues that this is intermediate work permitted by the benchmark.

The creator acknowledges submitting the preview too early, with narrow SQL support. He says the newer **v0.4-beta** provides broader coverage and public source. Those statements explain the project's position; they do not independently settle what executed inside the earlier preview binary.

## The new submission makes the cache boundary visible

The replacement [PR #2751](https://github.com/ClickHouse/ClickBench/pull/2751) remains open at the time of writing. Its cache disclosures and [submitted installation script](https://github.com/malisper/ClickBench/blob/deabb4a553195570e1ad3e738146759cafa4ae02/pgrust/install) show why the distinction matters. The script explicitly enables `condition_cache=full`, `dict_filter_cache=on` and `zone_store=on`; these are declared settings, rather than an independent measurement of their effect.

Consider the same request: count URLs containing `google`. Remembering that a block of data contains no matches lets the engine skip that block. Remembering every matching row removes more work. Remembering the matching count can let it answer the repeated count directly.

The new submission documents these choices separately:

| Cache setting | What the submission says it retains |
| --- | --- |
| Condition cache: `full` | Matching rows and counts; repeated count-only queries can use those counts. |
| Condition cache: `rows` | Matching rows, without the saved counts. |
| Condition cache: `granule` | Which small blocks contain no matching rows; other blocks are read and filtered again. |
| Dictionary filter cache | Which distinct text values match a filter such as `LIKE`. |

The creator also confirms that the preview's dictionary filter cache **stayed enabled when the condition cache was switched off**. He says the new version fixes that control and documents how to disable each cache. The replacement submission nevertheless runs with caches enabled by default, leaving their suitability for ClickBench to review.

These are materially different amounts of saved work. A repeat count that uses stored counts cannot be read as the speed of scanning and filtering the data again. That is the comparison readers need before treating milliseconds on a chart as a database-wide advantage.

## Removal is confirmed; reinstatement is pending

The merged removal establishes ClickBench's decision about the preview entry. The open replacement PR establishes an attempt to return with a more auditable submission. Neither establishes a verdict about every pgrust workload, and the measurements above are Milovidov's reported tests, not independent tests performed for this article.

For the URL-count example, the useful question remains the same: **what work did the database do during the timed run?** Public source, explicit cache settings and tests with changed queries give reviewers a way to answer it. Until that review is resolved, the replacement submission should be read as a proposal, rather than restored validation of the earlier speed claims.

## Sources

- [ClickBench removal PR #2165](https://github.com/ClickHouse/ClickBench/pull/2165): merged removal, reported binary/source inspection and timing conditions.
- [ClickBench rules and caching policy](https://github.com/ClickHouse/ClickBench#rules-and-contribution): workload, tuning requirements and permitted caching.
- [pgrust creator's October 23 response](https://news.ycombinator.com/item?id=50209450): disputed execution paths, cache explanation and acknowledgement of early submission.
- [pgrust v0.4-beta submission #2751](https://github.com/ClickHouse/ClickBench/pull/2751): open replacement proposal and cache controls.
