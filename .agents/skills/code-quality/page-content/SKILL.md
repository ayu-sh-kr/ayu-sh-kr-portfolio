---
name: page-content
description: Keep authored route copy in page-owned data modules in this Dota Web portfolio. Use when adding, editing, or reviewing visible strings, SEO metadata, labels, links, specimen content, or accessibility labels in `src/pages` and `src/components/pages`.
---

# Page Content

Keep route composition readable by putting authored content in one
`src/data/<route>-content.ts` module. The route shell and its section components
import that module; templates express structure and behavior only.

## Put content in the page module

Move these values into the page-owned content object:

- SEO title, description, keywords, and Open Graph copy.
- Visible headings, paragraphs, CTA labels, specimen text, lists, and link labels.
- Reader-facing `aria-label`, placeholder, helper, empty-state, and status text.
- Authored hrefs when they belong to the page's content model.

Keep these in the component or page instead:

- Selectors, element IDs, CSS class names, route paths, event names, and framework attributes.
- Runtime state, calculated values, DOM behavior, and presentation-only branching.

Do not move a short structural symbol, such as an icon or separator, unless it is
authored copy with a meaning independent of its template.

## Shape the data around the route

Create one descriptive export such as `pricingContent` or
`designTypographyContent`. Group it by the page shell and rendered sections in
reader order. Keep repeated cards, rows, checklist items, and links as arrays so
the component maps them instead of embedding duplicate markup.

Use `as const` for static authored data. Use `satisfies PageSeoContent` for the
`seo` entry and import `toSEO()` in the route page. Document the exported content
constant and any exported types; document properties on explicit interfaces.

```ts
export const exampleContent = {
  seo: { /* ... */ } satisfies PageSeoContent,
  hero: { eyebrow: "…", title: "…", cta: { label: "…", href: "…" } },
  features: [{ title: "…", body: "…" }],
} as const;
```

## Workflow

1. Read the page shell and every rendered section before choosing the data shape.
2. Extend an existing route content file, or create `src/data/<route>-content.ts`.
3. Move all authored copy for that route together; do not leave a second source in templates.
4. Import the content directly in each consumer and render arrays with `map(...).join("")`.
5. Keep accessibility text with the same section that owns the control or landmark.
6. Search the route for stale visible literals, then run `npm run build`.

Avoid creating a generic site-wide strings file. Content belongs to the smallest
route domain that owns its wording; promote it only after genuine reuse appears.
