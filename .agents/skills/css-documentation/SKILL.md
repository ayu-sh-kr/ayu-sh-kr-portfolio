---
name: css-documentation
description: Document portfolio stylesheets with concise ownership and behavior notes. Use when adding or reviewing component CSS under src, especially fixed chrome, responsive states, animations, and shared layout offsets.
---

# CSS Documentation

Make a stylesheet understandable without requiring a maintainer to first trace every template and import.

## File-level documentation

Start each requested component stylesheet with a CSS comment that states:

- the component or custom element that uses it;
- the route or shared surface where it appears;
- the visual or interaction responsibility it owns; and
- the shared tokens, safe-area rules, stacking level, or cross-component variable it consumes.

Keep the note factual and short. Do not duplicate the component's TypeScript markup or document obvious declarations.

## Section documentation

Add comments before groups when they explain a meaningful contract, such as:

- a fixed control's interaction states;
- a toast's rail, item, fill, glyph, and body layers;
- a consent notice's pre-hydration visibility or published height;
- responsive reflow or reduced-motion behavior.

Explain why the group exists and what other selector or service depends on it. Keep ordinary typography and token declarations self-explanatory.

## Accuracy rules

- Document the active selectors and states, not intended future behavior.
- Name shared tokens rather than copying their values into prose.
- Mention cross-component contracts such as `--chrome-consent-h` and `--toast-lift` where they affect positioning.
- Do not use comments to justify obsolete hacks; remove stale comments when behavior changes.
