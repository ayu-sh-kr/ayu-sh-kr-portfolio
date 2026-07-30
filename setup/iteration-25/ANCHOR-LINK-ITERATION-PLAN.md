# Anchor Link Audit and Iteration Plan

## Status

Iterations 1 and 2 are complete: prominent anchor calls to action now use the
shared `src/anchor-link.css` contract. Header navigation and the home work-card
CTA now use their role-appropriate shared foundation; footer navigation and
whole-card migrations remain planned follow-up work.

## Decision

Every application anchor is in scope for the audit, including the header,
footer, and linked cards. They must not all become visual buttons: their
semantic role determines the shared CSS contract they receive.

The implementation will use one globally imported, class-only stylesheet. It
will not add a wrapper component or change router/hash behaviour. The working
class API is:

```css
/* Common anchor safety and focus contract. */
.app-link

/* Prominent routing, hash, and mailto calls to action. */
.app-link--button
.app-link--accent
.app-link--ink
.app-link--ghost
.app-link--compact
.app-link--full

/* Header and footer navigation. */
.app-link--nav
.app-link--nav-mobile
.app-link--footer

/* A whole anchor that represents a linked content surface. */
.app-link--card
```

The final stylesheet location should be `src/anchor-link.css`, imported once
from `src/style.css` beside the existing shared interaction styles. The name
is intentionally broader than `action-button`: it is the source of truth for
anchors, while `action-button` remains the source of truth for the existing
stateful native-button custom element.

## Audit Scope

### 1. Button links — migrate to the complete button contract

These are anchors whose primary purpose is to trigger a prominent route, hash,
or mailto action. They currently repeat most of the `action-button` contract
with inconsistent dimensions and interaction states.

| Surface | Current classes | Intended shared classes |
| --- | --- | --- |
| Home and error | `motion-button` with ink/accent/ghost variants | `.app-link .app-link--button` plus visual variant |
| Pricing hero, tiers, contact, estimator, and prepared-email CTA | `pricing-*button`, `build-pricing-*button`, `speaking-pricing-*button` | Same button base and visual variant; estimator also uses `--full` |
| Coffee hero and closing | `coffee-accent-button`, `coffee-ghost-button` | Same button base and visual variant |
| Coffee and pricing sticky controls | `coffee-sticky-button`, `pricing-sticky-button` | Button base plus `--compact` |
| Showcase calls to action | `showcase-button` with ink/accent/ghost variants | Same button base and visual variant |
| Blog recovery state | `blog-ink-button` | Ink button variant |
| Support project and FAQ calls to action | `support-start-project-*`, `support-faq-ask` | Accent, ghost, or ink button variant |
| Offline return-home controls | `offline-button offline-button-ghost` | Ghost button variant |

The shared button contract will match the established behaviour in
`src/components/utils/action-button/action-button.component.css`:

- `--layout-space-7` (3rem / 48px) minimum target for regular controls;
- control typography tokens, pill radius, inline-flex alignment, and no text
  underline;
- semantic accent, ink, and ghost colour variants;
- one focus-visible ring, hover lift, active press feedback, reduced-motion
  fallback, and forced-colors fallback.

`--compact` is reserved for the two floating sticky controls. `--full` is
reserved for the estimator CTA. Other current one-off sizes and timings will
be normalized rather than preserved as new variants.

### 2. Header and footer links — include in the shared navigation contract

These anchors are navigation, not calls to action, and therefore must not use
the pill-button class.

| Surface | Current class or markup | Audit finding | Intended contract |
| --- | --- | --- | --- |
| Header brand | Tailwind utilities directly on the anchor | Has no reusable class-level anchor contract | `.app-link` plus a local brand selector only for identity typography |
| Header desktop navigation | `nav-link` | 2rem target, hover colour, no component-local reduced-motion rule | `.app-link .app-link--nav` |
| Header mobile navigation | `nav-link mobile-nav-link` | 2.75rem row target and hover surface are intentionally menu-specific | `.app-link .app-link--nav .app-link--nav-mobile` |
| Footer index | `footer-index-link` | Own hover translation and external-link marker; no common nav base | `.app-link .app-link--footer` |

The shared navigation contract owns focus visibility, no-underlining, semantic
colours, and reduced-motion behaviour. Header and footer styles retain their
contextual layout, spacing, indicators, and desktop/mobile presentation.

### 3. Linked cards — include in the shared linked-surface contract

These anchors make an entire content surface clickable. They are neither
navigation rows nor button links, so their content layout and visual hierarchy
must remain local.

| Linked-card family | Components audited | Intended contract |
| --- | --- | --- |
| Showcase project cards and archive rows | `showcase-card`, `showcase-row` | `.app-link .app-link--card` plus local grid, media, and reveal styles |
| Blog featured post and archive rows | `blog-featured`, `blog-row` | Same linked-card foundation plus local editorial treatment |
| Article previous/next cards | `blog-quiet-card`, `showcase-quiet-card` | Same foundation plus local two-way navigation layout |
| Pricing alternatives | `.pricing-project-alternatives-grid a` | Same foundation plus local card geometry |
| Support resources | `support-resource` | Same foundation plus local resource-row grid |
| Privacy and terms related links | `privacy-related-card`, `terms-related-card` | Same foundation plus local document-card layout |
| Home project link | `work-card-link` | Audit as an embedded card CTA, not a whole-card anchor; retain as a text/CTA link unless its markup changes |

The card foundation will own only universally safe anchor behaviour: inherited
colour, no underline, visible keyboard focus, a predictable transition policy,
reduced-motion reset, and forced-colors affordance. It will **not** impose a
single card display, padding, minimum height, or hover transform; those are
meaningful per-card layout decisions.

### Explicitly not promoted to button/card classes

Inline prose links, legal/document table-of-contents links, back links, quiet
text links, social links, filters, and non-anchor controls remain in their
current semantic styles. They still inherit the global `:focus-visible` rule.

## Findings That Drive the Migration

1. Regular button links vary from 2.8rem to 3rem, use several literal pill
   radii and paddings, and have different transition curves and state coverage.
2. Only the offline button has a press state; only some families include a
   local focus rule, forced-colors rule, or reduced-motion handling. The shared
   button class removes this behavioural drift.
3. The Coffee and pricing project class names are also used by native
   `<button>` elements. Anchor migration must replace the class on `<a>`
   elements only; native button styles remain out of scope.
4. Header/footer links and linked cards have intentionally different density
   and layout from CTAs. They need a common anchor foundation, not button
   visual styling.
5. Existing route/hash destinations already benefit from the global
   `[id] { scroll-margin-block-start: var(--layout-stick); }` rule. No routing
   logic or hash handling is required.

## Implementation Iterations

### Iteration 1 — Establish the shared stylesheet and class contract

1. Add `src/anchor-link.css` and import it once from `src/style.css` after
   shared tokens/layout and alongside `action-button` styles.
2. Implement `.app-link` plus the button, navigation, and linked-card role
   classes described above using existing semantic colour, layout, and type
   tokens only.
3. Add one reduced-motion and one forced-colors treatment in this shared
   stylesheet. Do not duplicate them in migrated selectors.

### Iteration 2 — Migrate button links by visual variant

1. Replace button-like `<a>` classes with `.app-link` and the appropriate
   button/variant modifiers.
2. Preserve only the `--compact` sticky and `--full` estimator modifiers.
3. Remove the anchor-only duplicate base/variant rules after each component
   has been migrated.
4. Leave native `<button>` markup and its CSS untouched, including Coffee
   checkout/reset controls and the pricing project form submit/edit controls.

### Iteration 3 — Migrate header and footer navigation

1. Add the shared navigation classes to the header brand, desktop links,
   mobile links, and footer index links.
2. Reduce `nav-link` and `footer-index-link` to context-specific layout and
   indicator rules only.
3. Keep the header's menu button, dark-mode button, popover behaviour, and
   external-link attributes unchanged.

### Iteration 4 — Migrate whole-card anchors carefully

1. Add `.app-link .app-link--card` to each whole-card anchor listed above.
2. Consolidate only duplicated link semantics and accessibility interaction
   styles; preserve each card's geometry and content animation locally.
3. Do not add `.app-link--card` to `work-card-link` unless that link becomes
   the card's clickable surface.

### Iteration 5 — Remove obsolete CSS and verify

1. Search for retired button-anchor selectors and ensure each migrated anchor
   uses the new shared class contract.
2. Check no `href`, `target`, `rel`, analytics data attribute, or hash value
   changed during the markup-only migration.
3. Run `npm run build`.
4. Verify keyboard Tab/Enter navigation, visible focus, active press feedback,
   route/hash scroll offset, reduced motion, and forced colors.
5. Check 320px, 768px, 1440px, and 200% zoom in light and dark modes. Test
   mobile navigation and both floating sticky CTAs on a coarse pointer.

## Acceptance Criteria

- Every audited anchor carries either the shared foundation class or a documented
  exclusion based on its semantic role.
- Route/hash CTA anchors use the same target size, focus, press, motion, and
  variant behaviour.
- Header/footer navigation retains navigation density and card anchors retain
  their contextual geometry; neither is visually converted into a CTA.
- There is one globally imported class-only stylesheet for the shared anchor
  contracts and no new custom element/component.
- Application source builds successfully with no altered routing, analytics,
  or external-link safety attributes.
