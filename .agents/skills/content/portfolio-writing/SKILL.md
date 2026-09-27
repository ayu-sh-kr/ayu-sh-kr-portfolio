---
name: portfolio-writing
description: Write, revise, and publish this portfolio's technical blog articles and Dispatch news briefs. Use for requests to add or improve article hooks, narrative flow, readability, SEO metadata, sources, closures, and route wiring.
---

# Portfolio Writing

Write for developers who want to understand what happened, how it works, and why it matters. Read at least two recent items from the **same surface** first: `public/blogs/**` for an article or `public/news/**` for a Dispatch brief. Read the corresponding entry in `src/configs/blogs.config.ts` or `src/configs/news.config.ts`. Follow [application-voice](../application-voice/SKILL.md), [technical-blog-writing](../technical-blog-writing/SKILL.md), [seo-optimization](../seo-optimization/SKILL.md), and [blog-wiring](../blog-wiring/SKILL.md) for their domain-specific rules.

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

- Use one searchable H1 that names the subject and actual outcome; match it exactly to the catalog title. Keep the slug stable when revising an existing post. Write a distinct, accurate summary/description and a small set of terms the body genuinely covers.
- Use source links within the story where they help verification and a short source line at the end. Do not link to a vague “linked post” when the original source is known.
- For `/blog/<slug>/`: put Markdown under `public/blogs/<category>/`, register it in `src/configs/blogs.config.ts`, and follow the asset placement in blog-wiring.
- For `/news/<slug>/`: put Markdown under `public/news/` and register it in `src/configs/news.config.ts` with `slug`, `date`, `title`, `summary`, `kind`, `document`, `keywords`, `minutes`, and a source reference when available. Do not put news only in the older blog catalog.
- Wire new public routes in `vite.config.ts` (SSG), `public/sitemap.xml`, `public/llms.txt`, and `vercel.json` (canonical trailing-slash redirect). Align the route, Markdown source, and catalog slug. Do not add YAML frontmatter when the catalog owns metadata.
- If an SVG is requested, follow [blog-svg-diagrams](../../documentation/blog-svg-diagrams/SKILL.md) and verify its root-relative URL, contrast, typography, accessible title/description, and rendered layout.

## Final review

Read the article straight through for tone, transitions, and repetition. Check that the headline promise is fulfilled, the hook and closure connect, source claims are precise, the read-time estimate is plausible, Markdown links/assets resolve, and all route surfaces agree. Run `git diff --check` and the relevant build when a checkout and dependencies are available. Report what was actually verified.
