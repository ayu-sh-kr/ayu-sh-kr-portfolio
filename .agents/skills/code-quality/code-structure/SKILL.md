---
name: code-structure
description: Organize and review this Webingo Dota Wrap application's source hierarchy. Use when adding, moving, or reviewing routes, design-grammar components, shared app chrome, or their styles under `src`.
---

# Code Structure

Keep this compact design-grammar application organized by the concept it
documents. The source hierarchy follows the reader-facing reference areas:
`layout`, `color`, and `typography`.

## Source ownership

- Group route features by their real domain under `src/pages/<domain>/<feature>/`, with the
  `*.page.ts` shell and colocated page stylesheet in the feature folder. For example, the card
  presentations live in `src/pages/cards/reach-out/` and `src/pages/cards/about-us/`. Each shell
  owns its route decorator, SEO, and reader-order composition of its custom elements.
- Keep a concept's components in `src/components/<concept>/`. For example,
  `layout` contains the layout reference sections, while `color-grammar` and
  `typography-grammar` are the page-level reference components for their
  concepts.
- Keep app-wide chrome and behavior directly in `src/components/` and
  `src/utils/`. `app-header.component.ts` is shared navigation; it does not
  belong to a route or a design concept.
- Keep component styles colocated with their component. Register each new
  stylesheet once from `src/style.css`; it is the application's global style
  entry point because components render with `shadow: false`.

## Choose the smallest truthful scope

Add a new section to the existing concept folder when it documents one part of
the current grammar:

```text
src/components/layout/
├── layout-hero.component.ts
├── layout-container-section.component.ts
└── layout-rhythm-section.component.ts
```

Use a page-level `*-grammar.component.ts` only when one component owns the
entire reference journey. Split it into section components once the page has
independent sections, interaction, or CSS that would make one file difficult
to scan. Keep the page shell thin; it should compose the sections in the order
they are read.

Create a domain folder only when it reflects a real product or presentation family. For example,
use `src/pages/cards/` for card presentations, with a separate feature folder for each card deck.
Do not create arbitrary buckets such as `shared`, `misc`, or `common` merely to collect unrelated
routes. Within each feature folder, colocate only the route shell, its page stylesheet, and other
route-private files. Keep reusable custom elements in the matching
`src/components/<domain>/<feature>/` folder when they share that domain. Do not create a generic
`pages/` component subtree.

## File rules

- Name a component after its visible responsibility and keep its selector,
  class, and filename aligned: `layout-gap-scale-section.component.ts` renders
  `<layout-gap-scale-section>`.
- Keep a feature's primary component and stylesheet pair directly in its feature folder, such as
  `src/components/cards/reach-out/reach-out-card.component.ts` and its matching CSS. Group a
  distinct supporting component with its CSS in a named subfolder, such as
  `src/components/cards/reach-out/reach-out-card-footer/`. Do not create an extra subfolder for
  the primary component unless it has additional private files.
- Keep static specimen arrays and page-specific display copy beside their
  rendering component. Introduce `src/data/` only when a content model is
  consumed by more than one component or needs independent loading.
- Keep global foundations in `src/theme.css`, `src/color.css`,
  `src/typography.css`, and `src/layout.css`. Keep reference-page appearance
  in the relevant colocated stylesheet rather than expanding `src/style.css`.
- Keep route exports current in `src/pages/index.ts`, using the domain and feature path.
- Preserve Dota discovery: component files stay under `src/components` and
  page files under `src/pages`, so the configured Vite preloader and web-types
  generator can discover them.

## Change workflow

1. Read the route shell, the rendered components, and the relevant foundation
   stylesheet before selecting ownership.
2. Add or move the component into its concept or app-wide scope; update its
   selector only when the user asks for a behavior or public API change.
3. Update the owning page composition, `src/style.css` stylesheet registration,
   and `src/pages/index.ts` when applicable.
4. Search for the old path or selector, then run `npm run build`.

Avoid one-file directories, duplicate concept folders, and generic `shared` or
`common` buckets. Promote code out of a concept only after it is genuinely used
by another route or application-wide chrome.
