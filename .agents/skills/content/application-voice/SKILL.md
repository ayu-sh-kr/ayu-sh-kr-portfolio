---
name: application-voice
description: Maintain the portfolio's professional, calm, and evidence-led public voice. Use when writing, revising, reviewing, or adding reader-facing content for page data modules, showcase metadata and case studies, blog Markdown, newsletter copy, SEO metadata, calls to action, forms, status messages, and support copy in this repository.
---

# Application Voice

Present Ayush Kumar as a thoughtful backend engineer with production responsibility. Write for prospective clients, employers, technical peers, and readers who value sound judgement over performance.

## Voice standard

Make every piece of public copy feel:

- **Professional:** State what the work is, who it serves, and what the reader can expect.
- **Calm:** Prefer precise, complete sentences over hype, urgency, bravado, or false intimacy.
- **Mature:** Acknowledge scope, trade-offs, and limits. Do not imply certainty where evidence is unavailable.
- **Specific:** Name the system, technical responsibility, constraint, or outcome that supports a claim.
- **Direct:** Use straightforward calls to action such as “View selected work”, “Request a proposal”, or “Send an outline”.

Use the writing in `public/blogs/tutorial/Distributed-Locks-Redis.md` as the tonal reference: establish the condition in which something applies, explain the constraint, give practical guidance, and state the boundary of the recommendation.

## Write from evidence

Before drafting or revising, identify the strongest support available: a production responsibility, shipped system, measurable result, technical decision, or reader benefit. Build copy around that support.

Use these patterns:

- “Sole responsibility for the APIs, data model, deployments, AWS infrastructure, security, and reliability of a production application.”
- “A preliminary range; final pricing follows a review of scope, constraints, and delivery requirements.”
- “A typed authoring layer that retains native platform behaviour.”

Avoid unsupported superlatives, implied scale, and vague authority. Do not turn an ordinary capability into a grand claim.

| Prefer | Avoid |
| --- | --- |
| “production backend systems” | “world-class systems” |
| “selected engagements” | “the perfect partner for any project” |
| “designed for handover” | “you will never need to worry about it again” |
| “indicative estimate” | “a number you can trust” |
| “based on production experience” | “battle-tested wisdom” |
| “send a concise outline” | “let’s make magic” |

## Apply the voice by surface

### Page and product copy

Lead with a clear capability or reader outcome. Keep hero copy concise; explain scope in the supporting paragraph. Use first person only for direct responsibilities that can be defended. Let headings be informative rather than slogan-shaped.

Write forms, empty states, loading states, errors, and confirmations with the same composure as marketing copy. Say what happened, what happens next, and what the reader can do. Do not use jokes, manufactured personality, or reassuring promises the application cannot guarantee.

### Showcase metadata and case studies

Describe the project, its operating context, the work performed, and the technical result. Use the case study to demonstrate judgement: requirements, constraints, trade-offs, delivery, and ownership.

Do not reduce a case study to a stack list, decorative slogan, or “built from scratch” claim. Do not reveal confidential client information or invent metrics. Use “in progress”, “selected work”, or “details available on request” when the evidence is limited.

### Blog posts

Start with the decision a reader needs to make, then establish the invariant, constraint, or failure mode. Explain the smallest safe approach before expanding to alternatives. End with a practical rule, not a sales pitch.

Use a confident technical voice without pretending that one pattern solves every situation. Distinguish what is required, what is recommended, and what depends on the system. Prefer short paragraphs, descriptive headings, and examples that teach a decision.

### Newsletter copy

State the update or insight first, then explain why it matters. Make subscription value concrete: new articles, a shipped case study, or a considered technical note. Keep subject lines and calls to action understated and useful.

Do not manufacture scarcity, excitement, or personal closeness. Avoid “big news”, “you will not want to miss this”, “quick win”, “game changer”, and similar campaign language unless the underlying fact plainly justifies it.

### SEO, calls to action, and labels

Use search terms and page descriptions that accurately reflect the content. Prefer a precise role, capability, or topic over keyword padding.

Choose calls to action that describe the next action: “View case study”, “Read the article”, “Request a proposal”, “Send an invitation”, or “Contact me”. Keep labels concise and do not use pressure language.

## Remove beginner and AI-patterned language

Rewrite these tendencies when they appear:

- Slogan fragments that make claims without evidence: “Backends that hold”, “Talks that land”, “Built to win”.
- Inflated contrast: “not a demo”, “no fluff”, “no sales dance”, “not your average engineer”.
- Casual self-mythology: “war stories”, “3am pages”, “solo survival”, “the thing I actually run”.
- False certainty: “always”, “never”, “guaranteed”, “built properly”, “exact quote” before scoping.
- Artificial conversational filler: “just”, “really”, “honestly”, “the occasional rant”, “posts are brewing”.
- Generic AI phrasing: “unlock”, “seamlessly”, “elevate”, “cutting-edge”, “robust solution”, “tailored to your unique needs”.

Do not remove all personality. Let credibility come from restraint, clear reasoning, and the occasional well-chosen technical detail.

## Revision workflow

1. Read the full content surface and its immediate context before editing a sentence.
2. Identify the audience, desired action, and evidence that supports the message.
3. Preserve accurate facts, stable labels, URLs, category values, and behavioural copy unless the task includes changing them.
4. Replace hype with a concrete responsibility, constraint, process, or result.
5. Tighten the CTA so it describes the next action without pressure.
6. Read the finished copy aloud. It should sound like a capable engineer explaining work to an informed person.

Before completing, check that the copy answers these questions:

- Is every meaningful claim supported by something the portfolio can show or defend?
- Does it explain the scope or next step plainly?
- Would it still sound credible if read by an experienced hiring manager, client, or engineer?
- Have casual filler, exaggerated contrasts, and unsupported guarantees been removed?

When changing TypeScript content modules, also follow the `page-content` skill. When editing a blog Markdown source, follow the `blog-wiring` and `md-formatting` skills where applicable.
