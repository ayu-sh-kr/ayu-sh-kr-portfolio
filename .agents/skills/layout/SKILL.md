---
name: layout
description: Canonical layout system for this Dota Web portfolio. Use whenever a page or component positions content, defines a container, spacing, grid, responsive layout, radius, sticky element, or z-layer.
---

# Layout

Use the repository layout system in `src/layout.css`. It is loaded after
`src/typography.css` and before component styles. Layout owns geometry only;
semantic colours remain in `src/color.css` and surfaces stay in colocated
component CSS.

## API

All public tokens and classes are namespaced `--layout-*` / `.layout-*`.

| Content shape | Class | Measure |
| --- | --- | --- |
| Prose | `.layout-reading` | 45rem |
| Form | `.layout-form` | 38rem |
| One or two UI columns | `.layout-content` | 60rem |
| Three-plus columns, site chrome | `.layout-page` | 80rem |

Never nest containers. Pair the chosen container with `.layout-section-hero`,
`.layout-section-lg`, `.layout-section`, `.layout-section-sm`, or
`.layout-section-end`. Use `.layout-section-flush` only when adjacent sections
have no divider.

Each page section owns the container that constrains its content. Put the
appropriate `.layout-*` class on the section root when possible; do not rely
on a generic container selector from a sibling component or stylesheet for
centering, gutters, or maximum width.

Use `.layout-stack` (`-xs`, `-sm`, `-lg`, `-xl`) between direct children;
`.layout-grid-auto` first for grids; `.layout-grid-2/-3/-4` only when the
count matters; `.layout-grid-rail` and `.layout-rail` for a sticky side rail;
and `.layout-row` for wrapped horizontal groups.

Every margin, padding, and gap must use `--layout-space-1` through `-10`.
Use the supplied `--layout-radius-*`, `--layout-z-under`, `--layout-z-*`, `--layout-stick`, and
safe-area-aware fixed-chrome helpers instead of local equivalents.

## Responsive and accessibility rules

Use only mobile-first 520px, 700px, and 1100px width breakpoints. Prefer
container queries for reusable components. Grid/flex children need
`min-inline-size: 0`; ordinary full-height blocks use `100svh`; anchors use
the global `--layout-stick` offset; fixed bottom controls clear the safe area.

Do not add raw container measures, section padding, width breakpoints, bare
z-index values, Tailwind geometry utilities for owned concerns, or colours and
surfaces to `layout.css`. Test 320px, 768px, 1440px, and 200% zoom in both
colour modes before shipping.
