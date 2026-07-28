# Layout-system adoption plan — merged v2

## Decision

Adopt `setup/iteration-20/layout.css` as the next version of
`src/layout.css`. This is now an **additive, low-risk foundation change**:
the existing `.layout-page`, `.layout-reading`, and `.layout-content` API and
their 80rem / 45rem / 60rem measures are preserved exactly. New route work
uses the existing `.layout-*` naming convention.

Keep the portfolio's active Lexend Deca typography, true-matcha semantic
palette, light/dark behavior, and component visual language. The layout layer
must continue to own geometry only.

## Designer handoff

Send the designer this implementation decision: the merged v2 preserves the
application's current container behavior, and we will adopt its additive
geometry primitives. Ask them to confirm only the repository-specific
documentation corrections below—not to redesign the current theme or choose a
new measure scale.

The confirmation is non-blocking for the v2 foundation. It is required before
the skill and specification become the canonical instructions for future work.

## What changed from the first plan

| Earlier recommendation | Merged-v2 decision |
| --- | --- |
| Rename the API to `l-*` to avoid `.grid` / `.card` collisions. | No rename. v2 already uses the safe `.layout-*` namespace and does not create a generic `.card` or `.panel`. |
| Decide whether to shrink the 80rem page frame to 72rem. | Removed. The current 80rem page, 60rem content, and 45rem reading measures are v2's deliberate public contract. |
| Add `--measure`, `--measure-sm`, and `--gutter` to typography. | Do not add them. This workspace's `src/typography.css` declares none of those tokens and `src` has no consumers of them. Page measures and the gutter remain `--layout-*` owned. |
| Add compatibility aliases while routes migrate. | Not needed for the three existing container classes. Replace the v1 file with v2 in one change; migrate pages only to consume the additive classes. |
| Put card/panel geometry in the layout API. | Removed. v2 correctly supplies pad/radius tokens only; surfaces stay in existing component CSS. |

## New capabilities in v2

- Adds the missing form measure: `.layout-form` / `--layout-form-max` at
  38rem (608px).
- Turns the existing large section-space token into a complete rhythm API:
  `.layout-section-sm`, `.layout-section`, `.layout-section-lg`,
  `.layout-section-hero`, `.layout-section-end`, and opt-in
  `.layout-section-flush`.
- Introduces a ten-step `--layout-space-*` scale, grid floors and responsive
  grid/rail primitives at 520px, 700px, and 1100px.
- Adds rows, full-bleed, fixed-chrome, safe-area, sticky-offset, named z-layer,
  radius, and shrink-guard primitives using the existing namespace.
- Separates layout from visual surfaces: `--layout-pad-card`,
  `--layout-pad-panel`, and `--layout-radius-*` are consumable tokens, but
  layout CSS sets no colour, border, shadow, background, or card class.
- Adds `MERGE-NOTES.md`, which explains why the current three-measure ladder
  replaces the earlier five-measure proposal.

## Corrections needed in the iteration before it becomes canonical

1. **Resolve documentation against this repository, not the source project.**
   `MERGE-NOTES.md` and `SKILL.md` describe live `--gutter` / `--measure`
   typography tokens; they do not exist in `src/typography.css` here. Remove
   the claimed conflict and state that `--layout-reading-max`,
   `--layout-gutter`, and `.layout-measure` are the app's live contracts.
   Correct the historical Tailwind 2.2.19 reference too: this app uses
   Tailwind 4.3.3.
2. **Do not require `ui.css` yet.** It does not exist in this app. Retain the
   actual import order in `src/style.css`: theme → colour → typography →
   layout → colocated component CSS. A future UI layer may consume the layout
   pad/radius tokens, but it is not a prerequisite for v2.
3. **Bring `LAYOUT-SPEC.md` up to v2.** It still contains superseded
   `.shell-*`, `.sec-*`, `--sp-*`, `.card/.panel`, and five-width examples,
   plus the old rule that all clamps need a rem term. The spec must match
   `SKILL.md` and `layout.css` before agents use it as rationale.
4. **Keep the standalone demo as source material, not application CSS.** Its
   markup now demonstrates the correct `.layout-*` API, but it still inlines a
   separate typography system and paper/ink/persimmon styles. Recreate the
   specimen in `/design/layout` with `.type-*` roles and `src/color.css`
   semantic tokens.
5. **Fix the final global overrides at integration time.** `src/style.css`
   currently declares `[id] { scroll-margin-top: 4rem; }` and
   `body { overflow-x: hidden; }` after its imports. They override or duplicate
   v2's anchor and overflow guards. Remove them only with the v2 integration,
   after anchor and long-content tests.
6. **Verify the 57px nav contract.** Set the header and its inner row to a
   deterministic `--layout-nav-h`, then replace `z-index: 50` with
   `--layout-z-nav`. Migrate both sticky contact bars from `45` to
   `--layout-z-toast` and add the safe-area offset.
7. **Make the rail-left modifier unambiguous.** Document that
   `.layout-grid-rail-left` is used together with `.layout-grid-rail`; or make
   it a complete standalone grid class. Its current media rule alone does not
   establish `display: grid` below 1100px.

## Delivery sequence

### 0. Normalize the iteration package

1. Promote the revised skill to `.agents/skills/layout/SKILL.md` so it is
   discoverable for future layout work.
2. Update `SKILL.md`, `LAYOUT-SPEC.md`, and `MERGE-NOTES.md` to reflect the
   app's actual token ownership, class names, import order, and current
   semantic theme.
3. Keep the source-demo palette and typography explicitly marked as demo-only.

**Gate:** the CSS, skill, spec, merge notes, and live application agree on
class names, token owners, measures, and the no-colour layout boundary.

### 1. Land the v2 foundation as one controlled change

1. Replace `src/layout.css` with v2 without renaming the existing container
   API or changing its three preserved measures.
2. Preserve the current `src/style.css` import order; do not create `ui.css`.
3. Remove the stale body overflow and 4rem anchor overrides, then use
   `--layout-stick` as the one global anchor offset.
4. Update header and fixed controls to the nav, z-layer, and safe-area tokens.

**Gate:** `npm run build` passes; existing `.layout-page`, `.layout-reading`,
and `.layout-content` renders remain visually unchanged at 320px, 768px, and
1440px; anchors clear the nav; no horizontal scroll appears at 320px or 200%
zoom.

### 2. Make `/design/layout` the live v2 specimen

1. Expand the existing route and `src/data/design-layout-content.ts` to cover
   all four measures, space/rhythm classes, grids and rail, breakpoints,
   radii, z-layers, and migration rules from `layout-demo.html`.
2. Use only `.layout-*`, `.type-*`, and semantic-colour tokens. Keep authored
   text in the data module and styles colocated with the route components.
3. Include the two current migration cautions: no nested containers and no
   page-local width breakpoints outside the approved system.

**Gate:** the route verifies the actual loaded v2 API in light and dark mode;
it is not a visually different embedded demo.

### 3. Convert routes in low-risk order

1. Prose: privacy, terms, blog article, showcase article →
   `.layout-reading` + section rhythm.
2. Support → `.layout-content`, `.layout-form`, and content-driven grids.
3. Pricing estimator/start-project and coffee → form/content/rail primitives;
   convert sticky controls to the shared fixed-chrome rules.
4. Showcase index, header/footer, and then home → page container and grid
   primitives, retaining intentional motion and pin-scroll behavior.
5. Offline/error views last; preserve legitimate height, print,
   forced-colours, reduced-motion, pointer, hover, and container-query
   exceptions.

**Gate per route:** visual comparison at 320px, 768px, 1440px, and 200% zoom;
keyboard focus, dark mode, anchor links, long unbroken content, and mobile
safe-area behavior all pass.

### 4. Enforce and close

1. Audit raw page-container measures, section padding, gaps, radii,
   z-indexes, and width media queries. Review every exception rather than
   mechanically changing it.
2. Retire Tailwind geometry utilities only where a v2 primitive owns the same
   concern; preserve Tailwind for non-layout presentation and component state.
3. Keep `/design/layout` as the visual regression reference and apply the
   discoverable layout skill to future component and page work.

## Intentional exceptions

`prefers-reduced-motion`, pointer/hover capability, print, forced-colours,
short landscape-phone guards, and reusable-component container queries remain
valid. Pin-scroll sections may use `100vh`; ordinary full-height blocks use
`100svh`.
