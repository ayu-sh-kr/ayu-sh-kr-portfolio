# Iteration 17 — True Matcha color grammar remediation

## Why this iteration exists

All page styles currently use the shared semantic color grammar from `src/style.css`:

- no raw hex, RGB, HSL, or named `white`/`black` color values appear in `src/components/pages` or `src/pages`;
- no page reaches directly into a literal `--color-*` family; and
- no page uses Tailwind's built-in literal color utilities.

The system therefore has one global contrast defect rather than route-level color drift. The active True Matcha mapping makes `--primary-color-on` (`paper-50`) too light for the primary control backgrounds:

| Mode | Current pairing | Contrast | Result |
| --- | --- | ---: | --- |
| Light | `paper-50` on `true-matcha-500` | 4.28:1 | Fails AA for normal-size button/control text |
| Dark | `paper-50` on `true-matcha-400` | 2.51:1 | Fails AA |

`--primary-color-on` is used by primary buttons, pills, badges, and selected control states across the pricing, support, legal, offline, and coffee routes. Fix the semantic contract centrally; do not introduce component overrides or color literals.

## Required change

In `src/style.css`, retain `true-matcha` as the active family but revise the role mappings:

```css
/* Light mode: use shades that support paper text on action backgrounds. */
--primary-color: var(--primary-600);
--primary-color-hover: var(--primary-700);
--primary-color-strong: var(--primary-800);
--primary-color-on: var(--color-paper-50);

/* Dark mode and the system-dark fallback: light green actions need dark text. */
--primary-color: var(--primary-400);
--primary-color-hover: var(--primary-300);
--primary-color-strong: var(--primary-200);
--primary-color-on: var(--color-pure-black-950);
```

Keep `--primary-color-subtle`, document/background/surface roles, and literal palette tokens unchanged. The target pairings then meet AA for normal-size control text:

| Mode | Target pairing | Minimum contrast |
| --- | --- | ---: |
| Light | `paper-50` on `true-matcha-600` | 5.26:1 |
| Light hover | `paper-50` on `true-matcha-700` | 7.01:1 |
| Dark | `pure-black-950` on `true-matcha-400` | 8.02:1 |
| Dark hover | `pure-black-950` on `true-matcha-300` | 12.36:1 |

## Verification

1. Run `npm run build`.
2. Check light and dark mode at every route: home, pricing, support, coffee, blog, showcase, offline, privacy, terms, and the error page.
3. Verify default, hover, focus-visible, disabled, and selected primary controls; pay particular attention to the pricing CTAs, support route controls, coffee ordering controls, and legal markdown CTAs.
4. Preserve the existing color grammar: page code may use semantic `var(--*-color)` roles or Tailwind arbitrary utilities pointing to those roles, never raw colors, `--color-*` literals, or Tailwind literal color utilities.
