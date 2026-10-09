---
name: portfolio-writing
description: Write, revise, and publish this portfolio's technical blog articles and Dispatch news briefs. Use for requests to add or improve article hooks, narrative flow, readability, SEO metadata, sources, closures, and route wiring.
---

# Portfolio Writing

Write for developers who want to understand what happened, how it works, and why it matters. Read at least two recent items from the **same surface** first: `public/blogs/**` for an article or `public/news/**` for a Dispatch brief. Read the corresponding entry in `src/configs/blogs.config.ts` or `src/configs/news.config.ts`. Follow [application-voice](../application-voice/SKILL.md), [technical-blog-writing](../technical-blog-writing/SKILL.md), [seo-optimization](../seo-optimization/SKILL.md), and [content-seo-publishing](../content-seo-publishing/SKILL.md) for their domain-specific rules.

## Editorial focus

Default to practical backend engineering and the infrastructure behind AI developer tools. Serve developers building and operating software, especially small teams. Connect stories to one of three pillars: backend reliability (databases, messaging, security), AI developer infrastructure (coordination, context, isolation, permissions, cost), or deployment (runtimes, native builds, cloud operations). Follow an explicitly requested adjacent topic without forcing it into a pillar.

## Dispatch news workflow

- Answer four questions: what changed, what problem prompted it, how it works, and what remains unproven. Establish the news immediately; explain the architecture in cause-and-effect order.
- Add an original contribution: an explanatory diagram, inspected source path, comparison with documented alternatives, or a reproducible experiment. State what was inspected or tested; never invent hands-on experience. A summary of the announcement alone is insufficient.
- Carry one familiar scenario through the mechanism and return to it in the closure. Use the Weft coordination article as a structural example, without copying its opening.
- Link a relevant evergreen guide where it helps explain a prerequisite, and related reporting where it advances the story. Use descriptive anchors; do not add unrelated links to meet a quota.
- Attribute benchmarks to their producer and include the workload and conditions. Separate announced, preview, shipped, and measured capabilities. Preserve publication dates on revisions; update freshness only for substantive changes.

## Blog workflow and distribution

Use technical-blog-writing for original tutorials and explainers. Make news lead readers toward durable guides and make guides connect to relevant project evidence. Choose related reading by topic and reader need, rather than recency alone.

Treat one substantial blog every ten days as an editorial planning rhythm, not a word-count or automatic publishing requirement. Prioritize a complete useful task over a fixed 15–20 minute length. When distribution copy is requested, extract distinct lessons, diagrams, or findings that stand alone; keep LinkedIn to at most one useful post per day and avoid repeating link promotions. Use tagged referral links for distribution while retaining the clean canonical article URL for references. Do not post or schedule anything without a request.

## Research and angle

- Check primary sources: the original announcement, docs, paper, repository, or disclosure. Record publication dates and distinguish announcement, earlier history, and the date of the underlying event.
- Separate demonstrated behavior from author claims, benchmark conditions, predictions, and third-party interpretation. Attribute material numbers and state the denominator, scope, exclusions, and trade-offs. Never turn potential access into confirmed exfiltration or a prototype result into a universal claim.
- Choose one reader question and one angle. For a short news item, report the development first, then explain its mechanism and practical consequence. For a longer tutorial, build the concepts in dependency order.

## Draft as a connected story

1. **Hook:** Open with a small, plausible situation or the concrete news. Identify the subject quickly. Avoid generic industry scenarios, invented pain, and assuming the reader uses a particular stack.
2. **What happened or what to decide:** State the product, finding, or engineering choice in plain language. Define unfamiliar terms at first use.
3. **How it works:** Follow cause and effect. Use a familiar example with enough context to understand the input, action, and result. Keep each section connected to the previous one; use short paragraphs and descriptive H2s. For a product, show two or three useful commands only if the docs support them, and explain what each returns.
4. **Limits:** Explain what the evidence does and does not establish. Keep cautions proportional and close to the relevant claim.
5. **Closure:** Return to the opening situation and resolve it with a practical takeaway. Do not end with a generic “bigger picture” slogan or a sales pitch.

Prefer connected prose over stacked bullets. Highlight a few meaningful terms or outcomes in bold for scanning; avoid bolding whole sentences. Keep code fences tagged and preceded by a sentence explaining the example. Follow the requested read time by checking the actual word count and the article's complexity, rather than padding to a number.

## SEO and publishing

Follow [content-seo-publishing](../content-seo-publishing/SKILL.md) for titles, metadata, catalog ownership, and all route surfaces. Choose the title and description only after the story's angle and evidence are clear. For a revision, keep the established URL unless the user requests a migration. If an SVG is requested, follow [blog-svg-diagrams](../../documentation/blog-svg-diagrams/SKILL.md) and verify its root-relative URL and rendered layout.

## Final review

Read the article straight through for tone, transitions, and repetition. Check that the headline promise is fulfilled, the hook and closure connect, source claims are precise, the read-time estimate is plausible, Markdown links/assets resolve, and all route surfaces agree. Run `git diff --check` and the relevant build when a checkout and dependencies are available. Report what was actually verified.
