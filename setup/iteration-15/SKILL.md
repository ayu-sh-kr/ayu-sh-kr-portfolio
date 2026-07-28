---
name: typography
description: The canonical type system for the ayush.dev web app — font stack, size scale, weights, tracking, leading, and role classes. Use this skill whenever writing, editing, or reviewing any HTML, CSS, JSX, or component that renders text — new pages, new sections, small tweaks, refactors, or design reviews. Trigger it even when the request never mentions typography, fonts, or styling: any request to "build a page", "add a section", "make a card", "style this", "fix the spacing", or "match the other pages" is a typography request. Also use when auditing existing pages for visual drift.
---

# Typography

One type system across every page. This skill exists because the same
heading tier was drifting into five slightly different values across
twelve pages. Read the rules, use the tokens, never invent a value.

## Before writing any CSS

1. Link or inline `assets/typography.css` **first**, before page styles.
2. Choose a role class from the table below. Do not write a new
   `font-size` / `font-weight` / `letter-spacing` / `line-height` block.
3. If nothing fits, use the nearest token — do not add a step to the scale.

Adding a new size to the scale requires an explicit human decision.
If a design genuinely needs one, say so and stop; do not add it silently.

## The stack

```css
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Inter, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
```

System-native by design. **Never add a webfont, `@font-face`, Google Fonts
link, or `@import` for type.** The whole system assumes zero network cost
and SF/Segoe metrics. A webfont changes every optical decision below.

Always keep `-webkit-font-smoothing: antialiased` on `body`.

## Role table — pick one

| Use it for | Class | Size (360→1440px) | Weight | Tracking | Leading |
|---|---|---|---|---|---|
| Page hero, one per page | `.display` | 38.4 → 96px | 700 | -.03 → -.04em | 1.08 → 1.04 |
| Utility/tool page hero | `.display-sm` | 32 → 57.6px | 700 | -.03 → -.04em | 1.08 → 1.04 |
| Section opener | `.title` | 30 → 52.8px | 600 | -.02 → -.025em | 1.12 → 1.08 |
| Card / block heading | `.title-sm` | 22 → 33.6px | 600 | -.02 → -.025em | 1.12 → 1.08 |
| Article h2 | `.prose h2` | 22 → 28px | 600 | -.018 → -.02em | 1.3 → 1.25 |
| Article h3 | `.prose h3` | 19 → 22px | 600 | -.018 → -.02em | 1.3 → 1.25 |
| Lead paragraph, long-form body | `.lead` / `.prose` | 17 → 18px | 400 | -.012 → -.015em | 1.65 → 1.75 |
| Default body | — (inherits) | **16px fixed** | 400 | 0 | 1.55 → 1.6 |
| Form fields | `input`, `select` | 15px, **16px on touch** | 400 | 0 | — |
| Buttons, primary UI | `.btn` | **15px fixed** | 500 | 0 | 1 |
| Nav, dense UI | `nav a` | **14px fixed** | 500 | 0 | 1.45 |
| Kicker above a heading | `.eyebrow` | **13px fixed** | 500 | **+.08em** | — |
| Timestamps, helper text | `.meta` | **13px fixed** | 500 | 0 | 1.45 |
| Chips, pills, tags | `.chip` | **12.5px fixed** | 500 | 0 | 1 |
| Uppercase table heads | `.label` | **12px fixed** | 600 | **+.06em** | 1.4 |
| TOC groups, fine print | `.micro` | **11px fixed** | 600 | **+.05em** | 1.35 |

Everything above the double rule is fluid — it interpolates linearly
between a 360px and a 1440px viewport, then locks. Everything marked
**fixed** is fixed on purpose: body copy must never drop below 16px, and
interface chrome should be the same physical size on a phone and a 32"
monitor. Do not "fix" this by making them fluid.

Tracking and leading are stepped at 700px and 1100px via custom
properties in `:root`. Use `var(--tr-*)` and `var(--lh-*)`, never a
literal — a literal will not follow the steps.

`.display` and `.title` are **not** interchangeable across page types.
One `.display` per page, at the top. Everything below it is `.title`
or smaller. Never place two display-tier elements in one viewport.

## Hard rules

**Weights.** Only 400 / 500 / 600 / 700 exist. 400 is body prose only.
500 is the UI default. 600 is every heading up to `.title`. 700 is
display tier only. Never use 300, 800, or 900 — the stack renders them
as a synthesised fake on Windows.

**Tracking follows size, always negative above 18px.**

| Size | Tracking |
|---|---|
| ≥ 40px | -0.035em |
| 28–40px | -0.03em |
| 20–28px | -0.025em |
| 18–20px | -0.02em |
| 16–18px | -0.015em |
| ≤ 15px lowercase | 0 |
| any uppercase | +0.05 to +0.08em |

Uppercase text **never** ships at 0 tracking. Lowercase text below 16px
never ships at negative tracking.

**Leading follows measure.** The longer the line, the looser the leading.
1.75 for 720px prose, 1.6 for body, 1.45 for UI, 1.25 for headings,
1.04 for display. Never set a leading below 1 or above 1.8.

**Measure.** Reading columns cap at `--measure` (720px). Never let a
paragraph run wider. Short intro columns use `--measure-sm` (560px).

**Numerals.** Any digit in a table, price, timer, counter, date, or
metric gets `font-variant-numeric: tabular-nums`. Digits that change in
place without it cause visible width jitter.

**Monospace.** Only for code, IDs, hashes, and file paths. Always
`var(--font-mono)` — never the two-fallback `ui-monospace, Menlo, monospace`
variant, which drops SFMono on some macOS builds.

**Balance.** Headline tiers get `text-wrap: balance`. Body text does not.

## Responsive rules

**Never write a font-size media query.** The tokens already handle
viewport response. If a size feels wrong at some width, the tier is
wrong — pick a different one.

**Never set a px root font-size.** `html{font-size:16px}` overrides the
user's browser preference and freezes every rem in the system.

**Every clamp preferred term must carry a rem component.** Pure `vw`
(`clamp(2rem, 6vw, 4rem)`) does not respond to browser zoom or OS text
size — that is a WCAG 1.4.4 failure. Correct form:
`clamp(min, Xrem + Yvw, max)`. If you ever compute a new clamp, solve it:

```
slope     = (maxpx - minpx) / (1440 - 360)
intercept = minpx - slope * 360
preferred = (intercept/16)rem + (slope*100)vw
```

**Form fields must be ≥16px on touch.** Anything smaller makes iOS
Safari zoom the whole viewport on focus. Use `var(--fs-field)`, which
steps up automatically under `@media (pointer: coarse)`.

**Code blocks scroll, they do not reflow.** `.prose pre` keeps
`white-space: pre` and `overflow-x: auto`. Never add `pre-wrap`.

**For reusable blocks, use container queries, not viewport queries.**
A card in a 320px sidebar and the same card in a 900px feature slot need
different heading sizes at the *same* viewport width. Put `.t-container`
on the block and `.cq-title` / `.cq-lead` on the text inside it.

**Check landscape phones.** The fluid scale reads viewport *width* and
will serve a 60px headline into 360px of height. The stylesheet caps
this already — do not override it.

## Never do these

- Hardcode a px or rem font-size in a page file
- Introduce 13.5px, 14.5px, 15.5px, or 16.5px — round to the nearest step
- Redefine `.display`, `.title`, `.eyebrow`, or `.chip` per page
- Use a Tailwind text utility (`text-sm`, `text-2xl`) for anything in the
  role table — Tailwind's scale and this scale disagree
- Set `letter-spacing` on lowercase body copy
- Write a font-size media query, or a `vw`-only clamp
- Set a px root font-size
- Ship a form field under 16px
- Use `font-weight: bold` or `font-weight: normal` keywords
- Add a font import of any kind

## Self-check before returning code

Run through this every time. If any answer is no, fix it first.

1. Is `typography.css` loaded before page styles?
2. Does every text element use a role class or inherit from `body`?
3. Zero raw `font-size` declarations in the page file?
4. Exactly one display-tier element, at the top?
5. Every uppercase run carrying positive tracking?
6. Every heading above 18px carrying negative tracking?
7. Every column of digits tabular?
8. Prose capped at 720px?
9. No `@font-face`, no font `@import`, no Google Fonts link?
10. Every clamp preferred term carrying a rem component?
11. Form fields ≥16px on touch?
12. Tested at 320px, 768px, 1440px, **and at 200% browser zoom**?

## Auditing an existing page

Grep it and compare against the scale:

```bash
grep -ho "font-size:[^;}]*"      page.html | sort | uniq -c | sort -rn
grep -ho "font-weight:[^;}]*"    page.html | sort | uniq -c | sort -rn
grep -ho "letter-spacing:[^;}]*" page.html | sort | uniq -c | sort -rn
```

Any value not in the token list is drift. Report the count and the
proposed token before changing anything — some drift is intentional and
the human should confirm.

## Further reading

`references/TYPOGRAPHY-SPEC.md` — the designer-facing document: rationale
for each decision, specimen sheet, the drift audit this system was built
from, and the migration map from old values to tokens. Read it when a
human asks *why* a rule exists, when proposing a change to the scale, or
when the request is a design review rather than an implementation.
