# Layout specification — v2

## Purpose

`src/layout.css` is the shared geometry contract for the Dota Web portfolio.
It keeps unrelated routes aligned without changing the active typography,
semantic palette, dark mode, or component surface language.

The layout layer is imported after `src/typography.css` and before colocated
component styles. There is no `ui.css` layer in this application. Component
styles consume semantic colours from `src/color.css` and may consume geometry
tokens from layout, but `layout.css` itself sets no colour, border, shadow,
background, or component surface.

## Public contract

### Container measures

| Content shape | Class | Token | Measure |
| --- | --- | --- | --- |
| Long-form prose | `.layout-reading` | `--layout-reading-max` | 45rem |
| One-column form | `.layout-form` | `--layout-form-max` | 38rem |
| One or two UI columns | `.layout-content` | `--layout-content-max` | 60rem |
| Three-plus columns and site chrome | `.layout-page` | `--layout-page-max` | 80rem |

Containers include the fluid `--layout-gutter`. Use exactly one per section;
nesting them applies the gutter twice. `.layout-bleed` is limited to genuine
full-viewport bands and dividers.

### Space and rhythm

`--layout-space-1` through `--layout-space-10` define 4, 8, 12, 16, 24, 32,
48, 64, 96, and 128px. Margins, padding, and gaps use these steps.

Sections use `.layout-section-hero`, `.layout-section-lg`,
`.layout-section`, `.layout-section-sm`, or `.layout-section-end` for their
vertical rhythm. The `-flush` modifier is intentional and only applies where
adjacent sections have no divider. Direct children use `.layout-stack` and its
size modifiers instead of local top margins.

### Composition and chrome

Content-driven `.layout-grid-auto` is the default grid. Fixed grids are
available as `.layout-grid-2`, `-3`, and `-4`; `.layout-grid-rail` and
`.layout-rail` provide a desktop sticky rail. `.layout-row` handles wrapped
horizontal groups. All grid primitives protect their children with
`min-inline-size: 0`.

The layer scale is `--layout-z-under`, `-base`, `-raised`, `-sticky`, `-nav`,
`-overlay`, `-modal`, and `-toast`. Fixed bottom controls clear the safe area;
the header, rails, and anchors use `--layout-nav-h` and `--layout-stick`.

## Responsive rules

Layout changes are mobile-first at 520px, 700px, and 1100px. Reusable
components use container queries when their slot, rather than the viewport,
determines their layout. Pointer, hover, reduced-motion, forced-colours,
print, and landscape-phone-height rules remain valid exceptions.

Use `100svh` for ordinary full-height views. Pin-scroll sections may retain
`100vh` because changing their height while the mobile browser chrome collapses
breaks the scroll timeline.

## Migration

The existing `.layout-page`, `.layout-content`, and `.layout-reading` measures
are preserved. Additive v2 migration proceeds by route family:

1. Install the v2 foundation and align global anchors, header layers, and
   sticky safe areas.
2. Use `/design/layout` as the live specimen for every public primitive.
3. Convert prose and support routes, then forms/pricing/coffee, then showcase,
   home, and exceptional offline views.
4. Audit remaining raw containers, section padding, width breakpoints, gaps,
   radii, and bare z-index values; review deliberate exceptions individually.

Verify at 320px, 768px, 1440px, and 200% browser zoom in both colour modes.
