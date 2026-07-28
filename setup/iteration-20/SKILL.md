---
name: layout
description: Canonical layout system for this Dota Web portfolio. Use whenever a page or component positions content, defines a container, spacing, grid, responsive layout, radius, sticky element, or z-layer.
---

# Layout

One layout system applies across every route. `src/layout.css` owns page
geometry. It is imported after `src/typography.css` and before all component
styles in `src/style.css`.

Layout is geometry only: it sets no colours, borders, shadows, backgrounds, or
component surfaces. Continue to use `src/color.css` semantic tokens and
colocated component CSS for those concerns.

## Public API

All tokens and classes are namespaced `--layout-*` / `.layout-*`.

### Containers

Choose the measure by the widest content shape. Apply one container to a
section; never nest containers.

| Shape | Class | Measure |
| --- | --- | --- |
| Long-form prose | `.layout-reading` | 45rem / 720px |
| Single-column form | `.layout-form` | 38rem / 608px |
| One or two UI columns | `.layout-content` | 60rem / 960px |
| Three-plus columns, header, footer | `.layout-page` | 80rem / 1280px |

All containers carry the responsive `--layout-gutter`. Use `.layout-bleed` for
the rare full-viewport band or divider.

### Rhythm and flow

Sections own vertical spacing with one of:

- `.layout-section-hero` — first section only.
- `.layout-section-lg` — major band.
- `.layout-section` — default.
- `.layout-section-sm` — dense strip.
- `.layout-section-end` — last section before the footer.
- `.layout-section-flush` — opt-in removal of top padding when there is no divider.

Use `.layout-stack`, optionally with `-xs`, `-sm`, `-lg`, or `-xl`, for spacing
between direct children. Do not add page-level top margins to cards or section
children.

### Grids and rows

Use `.layout-grid-auto` first; use `-sm` or `-lg` for the 220px or 300px
minimum track. Fixed-count `.layout-grid-2`, `-3`, and `-4` are only for a
meaningful count. Use `.layout-grid-rail` with `.layout-rail` for a sticky
side rail, and add `.layout-grid-rail-left` to reverse it.

Use `.layout-row` for wrapped horizontal groups and its `-tight`, `-loose`,
`-split`, `-top`, and `-fill` modifiers as needed.

### Tokens

- Space: `--layout-space-1` through `--layout-space-10` (4, 8, 12, 16, 24,
  32, 48, 64, 96, 128px). Every layout margin, padding, and gap lands on this scale.
- Section rhythm: `--layout-section-sm`, `-md`, `-lg`, and `-hero`.
- Grid floors: `--layout-col-sm`, `-md`, `-lg`.
- Geometry available to component surfaces: `--layout-pad-card`,
  `--layout-pad-panel`, and `--layout-radius-xs` through `-round`.
- Chrome: `--layout-nav-h`, `--layout-stick`, `--layout-z-under`, and
  `--layout-z-base` through `--layout-z-toast`.

## Responsive rules

Use mobile-first `min-width` media queries at only 520px, 700px, or 1100px.
For reusable components in differently sized slots, use container queries.
The permitted exceptions are pointer/hover, reduced-motion, print,
forced-colours, and landscape-phone height rules.

Every grid or flex child that can contain long content needs
`min-inline-size: 0`. Use `100svh` for ordinary full-height content; only
pin-scroll sections deliberately use `100vh`.

## Fixed and sticky UI

Use `--layout-stick` for sticky offsets and the global anchor offset. Fixed
bottom controls must include `env(safe-area-inset-bottom)` and use
`--layout-z-toast`. The header uses `--layout-nav-h` and `--layout-z-nav`.
Never write a bare z-index number.

## Do not

- Introduce raw page measures, section padding, gaps, radii, or width breakpoints.
- Use Tailwind spacing, width, grid, radius, or z-index utilities where this
  system supplies the same concern.
- Redeclare `--layout-*` tokens in a component.
- Put colour or a component surface in `layout.css`.
- Use `overflow-x: hidden` to mask a broken track.

## Before shipping

1. Confirm one justified container and one section rhythm class per section.
2. Confirm exactly one hero section per route.
3. Check 320px, 768px, 1440px, and 200% zoom for overflow and hierarchy.
4. Test fixed controls against the iPhone safe area, anchors below the nav,
   keyboard focus, and both colour modes.
