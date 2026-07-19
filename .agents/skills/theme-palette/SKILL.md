---
name: theme-palette
description: Use when adding custom color families to `src/theme.css` in Tailwind-style names, especially for non-built-in families like `warm`, `cool`, and `designer`.
---

# Theme Palette

Use this skill when adding, restoring, or reviewing custom palette tokens in `src/theme.css`.

## Files

- `src/theme.css`

## Rules

- Define colors only inside `@theme`.
- Use full Tailwind-style scales such as `--color-charcoal-50` through `--color-charcoal-950`.
- Build each named family from the explicit dark color and its paired complementary white from the brief.
- Do not duplicate Tailwind built-in families like `slate`, `neutral`, or `zinc`.
- Do not add `html`, `body`, `:root`, or semantic alias tokens unless the user explicitly asks for them.
- Treat the existing palette collection as canonical: restore or extend it; never replace it when introducing project-specific colors.
- Add new families alongside existing families and preserve their original token values and names.
- Every new family must include the complete `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950` scale so Tailwind utilities remain predictable.
- Keep typography tokens and color tokens inside the same `@theme` block; keep runtime semantic variables such as `--paper` in the global stylesheet when the app needs them.

## Tailwind v4 color workflow

This app uses Tailwind v4 CSS-first configuration. A custom family becomes a utility family by adding tokens like:

```css
@theme {
  --color-designer-50: #fff;
  /* ...all intermediate shades... */
  --color-designer-950: #111;
}
```

Use the resulting classes directly (`bg-designer-50`, `text-designer-700`, `border-designer-200`). Do not add a parallel `tailwind.config.js` color definition for the same family, and do not silently rename an existing family.

## Current Families

- `pure-black`
- `carbon-black`
- `material-black`
- `charcoal`
- `graphite`
- `warm-charcoal`
- `espresso-black`
- `earth-black`
- `obsidian-warm`
- `midnight-black`
- `slate-black`
- `steel-black`
- `ink-black`
- `couture-black`
- `velvet-black`
- `onyx-black`
- `shadow-black`
- direct accent tokens: `red-400`, `purple-400`, `purple-600`
- `paper`
- `inkstone`
- `persimmon`

The black-family collection above is intentionally retained as a reusable mini-palette library even when a page uses only the project-specific `paper`, `inkstone`, and `persimmon` families.
