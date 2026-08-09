---
name: css-formatting
description: Format portfolio CSS for readable, behavior-preserving maintenance. Use when expanding compressed rules, normalizing selector blocks, or reviewing component stylesheets without changing layout, tokens, states, or responsive behavior.
---

# CSS Formatting

Format component CSS in place without changing its runtime contract.

## Rules

- Preserve selectors, declaration values, cascade order, media queries, animation names, and custom-property names.
- Put one declaration per line and one selector block per section.
- Keep related selectors grouped only when they share the exact declarations; do not merge rules merely to shorten the file.
- Use the repository's two-space indentation and blank lines between rule groups.
- Keep long `calc()`, gradients, transitions, and shadow values readable across continuation lines.
- Preserve the existing mobile-first breakpoint policy and reduced-motion overrides.
- Use logical properties and existing `--layout-*`, `--type-*`, and semantic color tokens; formatting is not permission to invent design values.
- Keep component CSS colocated with its component and imported from `src/style.css`.

## Documentation boundary

Add a short file-level comment describing where the stylesheet is used, what surface it owns, and which shared layout or chrome contract it consumes. Add section comments only where a selector group has a non-obvious state or interaction relationship.

## Validation

After formatting, run `git diff --check`, the project typecheck/build, and a selector/value comparison if the file was heavily compressed. Confirm that formatting did not alter declarations or their order.
