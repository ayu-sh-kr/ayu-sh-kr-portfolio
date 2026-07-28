---
name: typography
description: Maintain the portfolio's shared typography system across every page. Use when adding, editing, or reviewing text-bearing components, headings, paragraphs, cards, controls, forms, or page styles in src.
---

# Typography

Use `src/typography.css` as the one source of truth for shared type roles. It is imported globally before component styles and works with the app's active `--primary-font` and semantic colour tokens.

## Roles

Choose the nearest role instead of introducing a component-local type scale:

| Content | Tokens or class |
| --- | --- |
| Page hero | `--type-display-*` / `.type-display` |
| Section heading | `--type-section-*` / `.type-section` |
| Nested section heading | `--type-subsection-size` / `.type-subsection` |
| Introductory copy | `--type-lede-*` / `.type-lede` |
| Body copy | `--type-body-*` |
| Supporting copy | `--type-compact-*` |
| Card or question title | `--type-card-title-*` |
| Uppercase eyebrow | `--type-eyebrow-*` / `.type-eyebrow` |
| Uppercase field label | `--type-label-*` / `.type-label` |
| Buttons and controls | `--type-control-*` |
| Prices and changing metrics | `--type-price-*`, `--type-estimate-size`, or `.type-price` |

## Workflow

1. Read `src/typography.css` before changing a text style.
2. Use an existing role through `var(...)` in colocated component CSS; keep component selectors responsible for layout and colour.
3. Use `text-wrap: balance` only for display and heading roles. Keep paragraphs at body or lede leading for readable scanning.
4. Use `font-variant-numeric: tabular-nums` for prices, counters, dates, and changing metrics.
5. Keep form fields inheriting the shared font; touch inputs must remain at least `1rem`.
6. Add a new role only when no current role fits, then document it here and verify all routes that consume it.

Do not change `--primary-font` here; use the `design-tokens` skill for that. Do not copy typography from setup references without reconciling it with the active project font and theme.
