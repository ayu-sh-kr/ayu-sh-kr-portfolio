# Open Knowledge Format (OKF): linked context for AI agents

> **TL;DR:** OKF is a Markdown-and-YAML format for linked organisational knowledge. It lets people and agents follow curated relationships instead of reconstructing every connection from similarity search; it complements RAG rather than replacing it.

An agent can retrieve the sentence that defines `weekly_active_users` and still produce the wrong number. It may not see the event filter, identity-resolution rule, timezone boundary, or runbook that explains a late backfill. The failure is not always model intelligence. Often, the context arrived as isolated fragments when the task required a connected explanation.

[Open Knowledge Format (OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) is Google Cloud’s open specification for keeping that connective tissue in a portable form: a directory of Markdown documents, small YAML frontmatter blocks, and ordinary links. Google Cloud introduced the format in June 2026 to formalise the emerging “LLM wiki” pattern without introducing a new service, SDK, or runtime. It is deliberately a format, not an agent platform.

That distinction matters. OKF does not make a model factual. It does not run a vector database, grant access to a warehouse, or replace a semantic layer. It gives people, export pipelines, and agents a shared way to publish knowledge about systems so another consumer can discover, inspect, and follow it.

This article explains the current OKF v0.2 idea, why it has drawn attention, how its links differ from retrieval at query time, and where Retrieval-Augmented Generation (RAG) still belongs. The useful conclusion is less dramatic than “RAG is dead”: context systems work best when retrieval, linked knowledge, and authoritative execution each do the job they suit.

## The problem is not that organisations lack documents

Most teams have plenty of documentation. The harder problem is that the meaning of one operational fact is distributed across unrelated places. A data catalog knows that `orders.customer_id` exists. A dbt model describes a join. A dashboard definition contains a filter. A runbook explains why last night’s numbers changed. A senior engineer remembers an exception that none captured.

Ask an agent, “Why did weekly active users fall after the mobile release?” and it must assemble that story. A conventional search result can provide relevant passages, but relevance is not a relationship. The agent still has to infer whether a metric depends on an event, whether an event belongs to a version, and which source is current.

OKF starts from a small proposition: **make the concepts and their useful connections explicit before a question arrives.** A table, metric, API, playbook, data-quality rule, and business definition can each become a document. Normal Markdown links then say how a reader moves between them.

This is why the format is interesting for agent work. It moves some context assembly from probabilistic runtime selection into authored, reviewable structure. It does not eliminate reasoning; it gives reasoning a map.

## What Open Knowledge Format (OKF) is

An OKF *bundle* is a self-contained directory tree. Its unit of knowledge is a *concept*: one Markdown file describing one thing—a metric, table, playbook, or policy. The concept’s ID is its path without `.md`, so a file at `metrics/weekly-active-users.md` has a stable, understandable identity.

The format has a small required core. Every non-reserved concept file has parseable YAML frontmatter and a non-empty `type`. Everything else is optional or producer-defined. `index.md` can list a directory for progressive disclosure; `log.md` can record updates. The Markdown body carries explanation that a human and agent can both read.

```text
product-analytics/
├── index.md
├── metrics/
│   ├── index.md
│   └── weekly-active-users.md
├── events/
│   ├── app-opened.md
│   └── purchase-completed.md
├── tables/
│   └── mobile-events.md
└── playbooks/
    └── investigate-metric-drop.md
```

The hierarchy gives a reader a first place to look. Links do the more important work. The metric can link to the event and table it uses; the playbook can link to the metric, release notes, and a known ingestion delay. Those links use standard Markdown paths, not specialised graph syntax, so the bundle is readable in an editor, diffable in Git, and usable without a dedicated viewer.

The [v0.2 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) adds questions that matter in agent-maintained documentation: where did this claim come from, when was it generated, who verified it, is it stale, and can a computation be checked at runtime? That is a meaningful expansion from a plain collection of notes while keeping the on-disk format simple. The runtime boundary is explained in [Attested computation](#attested-computation-is-a-boundary-not-magic-verification).

## The frontmatter is a compact contract

Free-form prose is useful, but a consumer needs a few stable fields to filter, preview, and assess a concept without reading every file. OKF uses YAML frontmatter for that compact contract. This table separates practical keyword fields from the richer v0.2 trust and lifecycle signals.

| Frontmatter field | What it tells a consumer | Why an agent cares |
| --- | --- | --- |
| `type` | The concept kind; the only required field. | Routes a file as a metric, table, playbook, API, or generic concept. |
| `title` | A display name. | Makes generated indexes and tool results understandable. |
| `description` | A one-line summary. | Supports discovery without loading the full document. |
| `resource` | Canonical URI for the asset. | Connects knowledge to the actual table, dashboard, endpoint, or repository. |
| `tags` | Cross-cutting keywords. | Enables filtering such as `revenue`, `mobile`, or `incident`. |
| `sources` | Provenance for claims or derived knowledge. | Shows where a statement came from rather than treating prose as self-authenticating. |
| `generated` | Actor and time of the latest generated content. | Separates an agent draft from independently verified guidance. |
| `verified` | Verification events by people or processes. | Enables advisory trust tiers: unverified, machine-confirmed, human-reviewed. |
| `status` / `stale_after` | Lifecycle and freshness boundary. | Allows warnings before relying on deprecated or expired definitions. |

A metric concept remains ordinary Markdown:

```md
---
type: Metric
title: Weekly active users
description: Distinct active accounts in a Monday-to-Sunday UTC window.
resource: looker://explore/product/weekly_active_users
tags: [product, engagement, mobile]
sources:
  - resource: /references/metric-policy.md
    author: human:analytics-team
generated:
  by: process:analytics-catalog-export
  at: 2026-08-28T09:00:00Z
verified:
  by: human:data-steward
  at: 2026-08-29T14:30:00Z
status: stable
stale_after: 2026-11-01T00:00:00Z
---

# Definition

Count distinct `account_id` values from [app opened](/events/app-opened.md).
Exclude internal accounts using [the account policy](/policies/internal-users.md).

# Investigation

For release changes, follow the [metric-drop playbook](/playbooks/investigate-metric-drop.md).
```

The frontmatter does not encode every business rule. It establishes enough structure for a consumer to identify the document, assess its signals, and decide whether to open the body. The links carry surrounding relationships in the form people already understand.

## Pre-linked context changes the agent’s first move

The central design difference is timing. In a typical RAG system, documents are split into chunks, embedded, indexed, and searched at query time. A prompt arrives; the retriever selects passages that seem semantically close; the model uses those passages as context. This remains useful when the corpus is large, weakly structured, or too broad to load directly.

With OKF, a producer records important paths through the knowledge before the question. An agent may begin at an `index.md`, read the metric concept, then follow its explicit link to the event definition and investigation playbook. The traversal occurs at runtime, but the connections were linked earlier by someone—or something—with domain context.

![An OKF agent discovers a metric from an index, follows explicit links to linked context, then applies a playbook to produce an evidence-backed answer.](/blogs/news/assets/okf-runtime-discovery.svg)

*Discovery starts at an index, traversal follows pre-authored links, and execution stays in the approved executor.*

This does not mean an agent should open every linked file. A consumer can use frontmatter for triage, choose a depth limit, rank links, combine the bundle with search, and ask for clarification. The format makes traversal possible without reconstructing every relationship from similarity scores. The agent discovers a relevant route while working; the links themselves were pre-linked in the bundle. That makes a relationship inspectable in a pull request and usable by any consumer that understands Markdown paths.

## RAG retrieves evidence; OKF preserves navigation

“Will OKF replace RAG?” is the wrong architecture question. The two mechanisms solve adjacent, not identical, problems.

RAG is a retrieval pattern. Its responsibility is to select useful evidence from a corpus at the moment a user asks a question. It is effective when terminology varies, when a relevant page is not already on a known path, or when the corpus is too big or fluid for fixed navigation. Its failure mode is plausible incompleteness: the right fragment may be missed, or retrieved fragments may lack the relationship that tells the model how to combine them.

OKF is a knowledge interchange and navigation format. Its responsibility is to preserve curated context, provenance, lifecycle signals, and cross-links in files that a human, agent, indexer, or visualiser can consume. Its failure mode is stale or missing documentation. A valid link can point to a concept that has not been updated—or to a concept that was never written.

| Question | OKF | RAG | Metadata catalog / schema |
| --- | --- | --- | --- |
| Primary job | Represent and connect knowledge | Retrieve relevant text at query time | Describe assets, fields, and governance metadata |
| Main unit | Linked Markdown concept | Indexed text chunk | Dataset, table, column, endpoint, or model definition |
| Relationship model | Explicit Markdown links plus hierarchy | Inferred from query-to-chunk similarity | Usually structural lineage or ownership |
| Best at | Explaining how concepts fit together | Finding likely evidence in broad content | Telling what an asset is and how it is shaped |
| Timing | Links are authored before use; traversal is runtime | Selection is runtime | Declared once, consulted at runtime |
| Does not replace | Search, authorisation, execution, schemas | Curated relationships and source access | Business meaning and operational guidance |

A metadata catalog and an OpenAPI or Protobuf definition remain authoritative for their contracts. OKF does not try to absorb them. It can point to them, explain business meaning, and connect them to the metric, decision, or runbook where that meaning matters. Treating them as competitors creates duplicated facts instead of a system composed from clear responsibilities.

In practice, most systems will want both. Use OKF as the curated graph-shaped layer; index its concepts for lexical or vector search; retrieve when the starting point is unknown; follow links when a concept establishes a deliberate path; and query the source of truth when correctness depends on live state.

## What v0.2 adds: trust needs more than a confident paragraph

Agents can generate documentation quickly, inspect many files, and repair cross-links at a scale that is tedious for people. But more documentation is not necessarily more trustworthy documentation. An agent that writes a polished metric note from an outdated dashboard has made the problem easier to consume, not safer.

OKF v0.2 adds optional conventions for provenance, credibility signals, generation, verification, lifecycle, and attested computations. The spec records evidence rather than a universal “trust score.” A source can name an author, last-modified time, or usage count. A consumer can make its own judgement from those signals instead of inheriting an opaque score that may mean nothing outside its original tool.

Verification is separate from generation. A concept can say that an export process generated it at a time, and a human later verified it. The derived tiers are advisory: no verification is unverified; a non-human verifier is machine-confirmed; a `human:` verifier makes it human-reviewed. None proves a statement is permanently true. They tell an agent what review trail exists.

Freshness is explicit, too. `status: deprecated` preserves history and links without presenting a document as current. `stale_after` supplies an absolute moment after which a consumer can warn, refuse, or seek newer evidence. That is preferable to quietly assuming a document is current because it ranked first.

## Attested computation is a boundary, not magic verification

An *Attested Computation* links a documented value to an approved computation, an executor that runs it, and deterministic code that checks the resulting receipt. The consumer can avoid presenting a number merely because an agent wrote SQL that looked reasonable.

For weekly active users, the definition might be human-reviewed, but this week’s number is live. An agent should not infer it from Markdown. Instead it discovers the computation concept, supplies declared parameters, invokes the approved executor, and receives a receipt. An attester checks that the computation and parameters correspond to the claim and that the displayed value matches the authoritative result. A failed attestation is a visible stop, not a detail the model can phrase around.

This is useful, but its boundary matters. v0.2 does not define a universal runtime protocol, sandbox, executor ABI, or authorisation model. It identifies the contract surface; the platform still handles credentials, permissions, isolation, audit logs, timeouts, and recovery. An OKF document is never permission to execute its referenced code.

> **Keep this distinction clear:** `verified` says a definition has been checked against policy; `attestation` says one execution produced a value by the sanctioned method. A current definition can yield a failed run, and an old definition can execute faithfully. A trusted-looking document is not evidence that a runtime result is right.

## What an agent actually does with an OKF bundle

Suppose a product manager asks why weekly active users dropped after version 4.18. A robust consumer can follow a bounded, auditable journey:

1. Read the bundle index and find the `Weekly active users` metric.
2. Check its status, `stale_after`, sources, and verification trail before treating the definition as guidance.
3. Follow links to the event definition, internal-user policy, dashboard, release notes, and investigation playbook.
4. Find an attested computation for the current weekly value and run it only through the approved executor, even if the concept text suggests the SQL; this assumes the bundle itself is maintained.
5. Present observed data, the applied definition, and uncertainty where the linked evidence does not establish causality.

Every step can still use retrieval. Search may find the release note. A vector index may rank a specific incident postmortem. The difference is that the metric concept provides a reliable local starting point and the next links are not an accidental co-occurrence in an embedding space.

This works only when the bundle is maintained. If an event definition changes without updating the metric, the agent has a documented path to a bad answer. Use code review, automated checks, ownership, and lifecycle policies for the bundle just as you would for an API contract. A file format makes discipline easier to apply; it cannot supply the discipline.

## How to introduce it without creating another stale wiki

Start narrow: choose one recurring decision that forces people or agents to search through several systems—a business metric, production runbook, service integration, or data-quality investigation. Capture the concept that names the decision, then link only the assets needed to explain it.

Use a small set of clear types, such as `Metric`, `Table`, `Event`, `API Endpoint`, `Playbook`, and `Policy`. OKF does not require a global taxonomy, but local consistency improves discovery. Put the bundle beside the code or data project it describes when that makes ownership and change review natural.

Add fields that answer real operational questions. `resource` should land on the real asset. `sources` should preserve where a claim came from. Populate `generated`, `verified`, `status`, and `stale_after` only when your process can keep them meaningful. A decorative verification field creates false confidence.

Then define consumer behaviour. Decide whether an agent may follow external links, what it does with stale concepts, whether machine-confirmed content can support an action, and when it must call an authoritative API or query engine. These are product and security decisions, not format settings.

Measure the workflow, not the number of Markdown files. Did the agent find the correct source faster? Did an engineer understand a metric change without a handoff? Did reviewers catch a broken relationship? If a bundle merely restates an existing catalog, it is overhead. If it explains a recurring decision and links people to evidence, it is earning its place.

## Who should adopt it first, and how hard is it?

OKF is most useful for teams whose agents or engineers repeatedly cross the
same boundaries: data teams explaining metrics and joins, platform teams
connecting services to runbooks, and product teams tracing a customer-facing
number back to its operational definition. The common condition is not simply
“we have documents.” It is that a useful answer depends on **several owned
sources** and the route between them is stable enough to curate.

The first implementation is deliberately light. A small team can begin with a
versioned directory, a handful of high-value concepts, standard Markdown links,
and the required `type` field—there is no OKF service or SDK to deploy. The
harder part is production adoption: assigning owners, keeping links current,
recording meaningful provenance and freshness, and defining what an agent may
do when a concept is stale or unverified. That is governance and workflow work,
not a file-format problem.

Start with one repeated investigation and treat the bundle as a reviewed
contract. If it shortens that investigation without hiding the source of truth,
expand it. If the team cannot maintain the relationships, keep the scope small
and let search do more of the work.

## What to do with this

OKF is timely because agents need **durable context** that moves with the systems it describes. Markdown plus frontmatter is not novel. The useful part is an attempt to standardise a **minimal interoperability boundary** around a pattern many teams already use: a human-readable, agent-maintained knowledge library.

It can reduce repeated context assembly and make **relationships visible before inference** begins. It can let a catalog exporter, documentation agent, and a different consumer work on the same files. It can make **provenance and freshness** visible enough to shape agent behaviour instead of hiding them in a proprietary UI.

It is still early. A specification does not guarantee broad adoption, high-quality producers, reliable consumers, or agreement on domain vocabulary.

Markdown links are expressive but often untyped, so surrounding prose carries their exact relationship. Large bundles still need search, indexes, permissions, conventions, and quality controls. A model can still misunderstand a clear document.

The practical rule is simple: **OKF makes knowledge portable and navigable; RAG finds evidence; authoritative systems establish live truth.** Keep those responsibilities distinct, and an agent has a better chance of showing its work instead of merely sounding informed.

## Further reading

- [OKF v0.2 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) — the canonical format, conformance, trust, lifecycle, and attestation rules.
- [Google Cloud: Introducing the Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing/) — the motivation, reference producer and consumer, and sample bundles.
- [OKF annotated guide](https://okf.md/spec/) — a shorter guided explanation of the specification’s concepts and conventions.
