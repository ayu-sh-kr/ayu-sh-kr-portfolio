---
name: code-structure
description: Organize and review this Dota Web portfolio's source hierarchy. Use when adding, moving, or reviewing page components under src/components/pages; group components by route, page section, and section-owned UI so files change together.
---

# Code Structure

Keep source layout aligned with the visitor-facing composition tree. Place route components in `src/pages`; place route-specific components in `src/components/pages/<route>`.

## Page hierarchy

Organize a route by logical section, then colocate the section shell and its private child components below that section.

```text
src/components/pages/<route>/
├── <section>/
│   ├── <section-shell>/<section-shell>.component.ts
│   └── <section-child>/<section-child>.component.ts
└── <route-wide-concern>/
    └── <component>/<component>.component.ts
```

For example, Coffee keeps the complete purchase flow in `coffee/order`, and Showcase separates the index journey (`showcase/index`) from the case-study reader (`showcase/article`). The existing Pricing route follows the same pattern with `estimator`, `start-project`, `build`, and `speaking` sections.

Keep a leaf component in the parent section that renders it. If a component is shared by two sections in one route, place it in the smallest route-level concern that truthfully describes both callers. Keep a route-wide controller, sticky control, or shared stylesheet at the route level only when it is not owned by a single rendered section.

## File rules

- Keep each custom element in its own `<component>/<component>.component.ts` directory with colocated `.component.css`.
- Keep component names and selectors unchanged when reorganizing; a file move must not become a behavior rewrite.
- Keep page shells in `src/pages`. Let them compose section selectors in reader-facing order.
- Keep route-specific CSS imports in `src/style.css` pointed at the moved colocated stylesheet.
- Keep generated discovery working: component TypeScript must remain under `src/components/**/*.component.ts` for the Vite preloader.
- Keep broadly reusable controls outside `pages`, in the appropriate `src/components/utils`, service, data, or event layer.

## Move workflow

1. Read the route page and its rendered custom elements to identify its sections and parent-child ownership.
2. Create the section directories and move both TypeScript and colocated CSS together.
3. Update explicit imports, CSS imports, exports, and any path-sensitive tooling references.
4. Search for the former paths, then run `npm run build` to validate TypeScript, component discovery, and stylesheet resolution.

Do not create one-file organizational levels without a real section boundary. Do not move a component into another section merely because its filename sounds similar; its renderer and change cadence define ownership.
