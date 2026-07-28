---
name: pricing-typography
description: Maintain the pricing page's shared typography contract. Use when changing headings, paragraphs, cards, controls, or pricing CSS under src/components/pages/pricing or src/pages/pricing.page.css.
---

# Pricing Typography

Keep the pricing page easy to scan by using its shared type roles instead of introducing isolated font values.

## Typography contract

The variables in `src/pages/pricing.page.css` are inherited by every pricing component. Use them for these roles:

| Content | Variables |
| --- | --- |
| Page hero | `--pricing-type-display-*` |
| Primary section heading | `--pricing-type-section-*` |
| Nested section heading | `--pricing-type-subsection-size` with the section weight, tracking, and leading |
| Introductory paragraph | `--pricing-type-lede-*` |
| Standard paragraph | `--pricing-type-body-*` |
| Compact supporting copy | `--pricing-type-compact-*` |
| Cards, questions, and preview titles | `--pricing-type-card-title-*` |
| Eyebrows, badges, and field labels | `--pricing-type-label-*` |
| Buttons and interactive controls | `--pricing-type-control-*` |
| Tier amounts and estimator amount | `--pricing-type-price-*` or `--pricing-type-estimate-size` |

Use the shared `.pricing-eyebrow`, `.pricing-section-title`, and `.pricing-section-lede` classes whenever the markup supports them. They carry the three most common page-level roles.

## Change workflow

1. Read `src/pages/pricing.page.css` before changing type in a pricing component.
2. Assign the element to an existing role and consume its variables with `var(...)`.
3. Keep a new literal type value only when it represents a genuinely distinct role. Add that role to the page contract and this table first.
4. Preserve readable body copy: use the lede or body line-height tokens, not a tighter display-heading line height.
5. Check both normal and dark themes, then run the project verification command.

Do not use a component-local font family or redefine a section title just to make it look larger. The display and price roles exist for deliberate emphasis; all other content should reinforce the shared hierarchy.
