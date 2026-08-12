---
name: seo-optimization
description: Optimize technical blog titles, headings, metadata, keyword context, technical assets, and conclusions for search discoverability without keyword stuffing. Use when adding, revising, or reviewing Markdown blog posts and their catalog metadata in this portfolio.
---

# SEO Optimization

Apply this skill when a technical blog needs search-focused structure without losing its engineering voice.

## Workflow

1. Read the complete Markdown source and the live blog catalog entry.
2. Identify the primary technologies, the specific engineering problem, the delivery contract or outcome, and the surrounding stack.
3. Keep the title aligned between the Markdown H1 and the catalog header.
4. Preserve the article's claims and technical boundaries; never add metrics, guarantees, or scale that the source cannot defend.
5. Validate Markdown fences, headings, source paths, slug, description, keywords, category, and reading time.

## Title

Use one H1 that combines the main technologies, the concrete problem, and the outcome or decision. Prefer a comparison or problem-solving form such as:

- Redis vs. Kafka: Defining Delivery Contracts in Distributed Systems
- Choosing a Message Broker: When to Use Redis Pub/Sub or Kafka
- Implementing Cache Invalidation with Redis and Spring Boot

Avoid abstract titles, slogan fragments, keyword lists, and titles that promise more than the article explains.

## Heading hierarchy

Use H2 headings for major transitions and H3 headings for implementations, edge cases, or focused subcomponents. Make headings descriptive and search-relevant without repeating the same keyword mechanically.

Good headings name the decision or concept: “Defining Delivery Contracts: Redis Pub/Sub vs. Kafka”, “Implementing Cache Invalidation with Redis and Spring Boot”, and “Redis Streams: At-Least-Once Delivery”.

## Keyword context

Weave the ecosystem into the opening paragraphs and examples. Name relevant languages, frameworks, stores, cloud services, client types, or deployment environments before showing code. Use technical identifiers selectively in inline code.

Include only terms the article genuinely explains. Catalog keywords should reflect the title, body, and reader search intent; they should not become a padded synonym list.

## Technical assets

Precede every code or diagram block with one or two sentences explaining what it shows and why it matters. Tag executable examples with their language. Keep diagrams focused on actors, direction, ordering, state transitions, or failure branches.

Use descriptive alt text when adding image assets. Prefer an existing SVG or project-native asset system for diagrams; do not create decorative graphics just to add an image.

Add one or two quotable principles as Markdown blockquotes. A good quote states a defensible boundary, such as: “A broker choice cannot repair an unclear rule.”

## Conclusion

End with an actionable summary. A short three-item TL;DR may cover the primary tool, the bounded alternative, and the durable alternative. Keep the conclusion practical rather than promotional.

## Validation checklist

- Markdown has one H1 and a logical H2/H3 hierarchy.
- H1 and catalog header match.
- Title, description, keywords, and headings describe the actual article.
- Technical examples name their language and have explanatory lead-in prose.
- Code fences are balanced and diagrams are readable.
- At least one boundary or principle is highlighted.
- The conclusion states when to choose each major option.

