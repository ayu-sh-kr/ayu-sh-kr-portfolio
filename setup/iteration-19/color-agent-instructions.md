# Color — agent instructions

Companion spec for `src/color.css` (v3.0) and `color-grammar.html`.
Read before touching any file that sets a background, a text color, a
border or a shadow.

---

## Architecture

Three tiers. Values flow one way and never back.

| Tier | Lives in | Looks like | Who may read it |
|---|---|---|---|
| **Ramp** | `theme.css` | `--color-true-matcha-600` | only `color.css §2` |
| **Family** | `color.css §2` | `--primary-600`, `--primary-on-light` | only `color.css §4` |
| **Semantic** | `color.css §4–7` | `--primary-color`, `--border-color` | **every component** |

A component that reads a ramp step has skipped the family contract and
will break on the next palette. That is why the Tailwind theme in §12
exposes the semantic tier only — there is no `bg-primary-600`.

**Install order**

```
@import "tailwindcss";
@import "./theme.css";
@import "./color.css";
@import "./typography.css";
…component imports…
```

`color.css` replaces the `:root{}`, `html.dark{}` and
`@media (prefers-color-scheme: dark)` blocks that used to live in
`style.css`. Delete all three; the last two were byte-identical copies
of each other and `light-dark()` removes both.

---

## Swapping a palette

One attribute:

```html
<html data-palette="cobalt">
```

Adding a family means copying one block in `color.css §2` — eleven ramp
aliases plus two on-colors — and turning §02 of the grammar page green.
Nothing else in the codebase is opened.

**On-colors are declared by the family, never by the mode.** This is the
line that fails silently. A light family (amber, lime, yellow) needs
dark text on its 600 step; if that decision lives in the light-mode
block it claims "white sits on primary" for every family that will ever
be mounted, and the first light family drops every filled button to
roughly 2:1 with nothing raising a hand.

---

## The family contract

A ramp is not a palette until it satisfies all six. Run §02 of
`color-grammar.html` — it evaluates these live against rendered values,
in the selected family and mode.

1. Step **600** clears 4.5:1 on the light background.
2. Step **400** clears 4.5:1 on the dark background.
3. Step **800** clears 7:1 on light; **200** clears 7:1 on dark.
4. The family **declares its own on-colors**.
5. Step **800 on 50** clears 4.5:1 — that pairing is every chip, badge
   and inline code on the site. Same for 200 on 950 in dark.
6. **Hue distance** from each status hue is at least 30°.

Measured for the shipped families:

| family | 600/bg | 400/bg | 800/bg | chip | min hue Δ |
|---|---|---|---|---|---|
| true-matcha | 4.84 | 8.13 | 8.72 | 8.37 | 48° ok |
| cobalt | 5.57 | 7.61 | 9.52 | 8.94 | 78° ok |
| persimmon | 5.15 | 7.17 | 8.43 | 7.98 | **9°** |
| sunburst | 4.53 | 9.95 | 7.71 | 7.55 | **1°** |

Persimmon sits 9° from `--danger-color`; sunburst sits 1° from
`--warning-color`. Both pass every contrast anchor and still fail rule 6
— a destructive action and the brand read as the same signal. Usable
only with an icon or a shape doing the work hue normally does. Sunburst
is deliberately absent from `color.css §2` and present in the demo page,
so the checker has something to fail on.

---

## Modes

`light-dark()` reads `color-scheme`, which `§8` sets from `html.light`,
`html.dark` and the system default. **There is exactly one copy of the
dark values, and it sits inline next to the light one.** If you find
yourself writing a second `html.dark{}` block, the token belongs in a
`light-dark()` pair instead.

Numeric values cannot go through `light-dark()`, but a `color-mix()`
result is a color — so the mix ramp expresses its dark compensation
inside the pair rather than in a separate block.

A `@supports not (color: light-dark(...))` fallback covers older
engines. Delete it once the support floor moves.

---

## The mix ramp — five steps

All derived from `--foreground-color`, so every one inverts for free.
Percentages step up in dark because a 10% line on a dark ground reads
lighter than a 10% line on a light one.

| Token | Light | Dark | Use it for |
|---|---|---|---|
| `--subtle-color` | 5% | 8% | Inert ground, skeleton base, idle badge |
| `--border-color` | 10% | 16% | **The line.** Every division |
| `--border-strong-color` | 20% | 28% | Structural rule, table head |
| `--shadow-color` | 25% | 45% | Base of `--shadow-lift` |
| `--scrim-color` | 40% | 60% | Modal scrim, base of `--shadow-pop` |
| `--primary-color-wash` | 8% | 14% | Row hover, pointer hotspot |
| `--primary-color-ring` | 16% | 24% | Focus halo on fields |

Nothing between these steps. Ever.

**Lines carry meaning or they do not exist.** A border at the second
step is decorative — it says only "these are two different things", and
it is fine that a low-vision reader cannot resolve it. The moment a
border means something (focused, selected, invalid, hovered) it jumps to
a full-strength token. There is no middle border.

---

## Four grounds

Semantic, not aesthetic. Choosing a ground is choosing what kind of
content is inside it.

| Ground | Token | Contains |
|---|---|---|
| Page | `--background-color` | The document — prose, sections, content |
| Surface | `--surface-color` | **Human input** — forms, fields, editable |
| Contrast | `--contrast-background-color` | **Machine output** — totals, breakdowns |
| Subtle | `--primary-color-subtle` | Asides, notes, chips, marks |

**The separation law:** contrast panel = numbers, surface card = input,
plain row = the CTA. Three jobs, three grounds, never merged. A contrast
panel containing a text field is the specific mistake this prevents.

**Contrast is the inverse of the page, not "the dark one."** Dark panel
on a light page; light panel on a dark page. Going one step *deeper* in
dark instead of inverting measures **1.19:1** against surface — the
estimator result and a raised card become indistinguishable. Inverting
measures **16.10:1**, matching the 16.83:1 light mode already had. This
is the quietest failure in the whole system; check it after any theme
change.

**Code does not invert.** It stays dark in both modes via
`--code-background-color` (brand-tinted through `--primary-950`). Code
is a quotation from a terminal, not a panel.

---

## Status

Family-independent by design — a success that follows the brand is not a
success, it is decoration. This is the only tier holding literal values.

Every light step lands 5.1–5.4:1 on the light ground; every dark step
lands 7.7–9.0:1 on the dark one. Within a mode all three carry identical
optical weight, so an error never shouts louder than a success. Only the
hue differs.

Each pairs with its own wash — `--success-color-subtle` and friends.
Status never borrows `--primary-color-subtle`.

---

## Depth

Two shadows, one ring, three gradients. A shadow is the foreground at a
ramp step, which is why it deepens automatically in dark rather than
disappearing.

`--shadow-lift` · `--shadow-pop` · `--shadow-ring` ·
`--gradient-shimmer` · `--gradient-placeholder` · `--gradient-hotspot`

Do not author a third shadow or a fourth gradient.

---

## Variants

| Variant | Means | Per view |
|---|---|---|
| `.btn-primary` | The one thing you came here to do | Exactly 1 |
| `.btn-contrast` | A real action, but not the one | 1–2 |
| `.btn-ghost` | Navigation, escape, secondary | Unlimited |

Each state moves **one** property: hover moves the border *or* the
background one step, never both; focus moves the outline only; disabled
moves opacity, never colour.

One focus treatment app-wide — `2px solid var(--primary-color)` at `3px`
offset. Never removed, never restyled per component. It is the only
affordance a keyboard user has.

---

## Shadow DOM

Tailwind's generated stylesheet cannot cross a shadow boundary; custom
properties can. Inside a dota component's shadow root, write plain CSS
referencing the same semantic tokens. Everything in `color.css §4–7`
resolves normally through the boundary.

---

## Retiring `--blog-*`

Nine aliases, a fourth tier existing only to keep an old vocabulary
alive. Map and delete (`color.css §13` has the table):

```
--blog-paper → --background-color        --blog-accent      → --primary-color
--blog-ink   → --foreground-color        --blog-accent-deep → --primary-color-strong
--blog-ink-soft → --muted-color          --blog-tint        → --primary-color-subtle
--blog-hairline → --border-color         --blog-code        → --code-background-color
                                         --blog-code-text   → --code-foreground-color
```

Two of those names lie after a swap: `accent-deep` and `tint` describe a
hue, and there is no persimmon left to be deep or tinted. That is the
whole argument for the semantic tier.

---

## Do-not-re-add list

- A per-page or per-component `:root{}` colour block
- A second `html.dark{}` copy of values that belong in `light-dark()`
- A ramp step (`--primary-600`, `--color-*-500`) in a component file
- A hue in a token name (`accent`, `tint`, `paper`, `ink`)
- A hex, `rgb()` or `hsl()` literal outside `color.css §5`
- `--primary-color-on` defined in a mode block instead of a family block
- `--contrast-background-color` resolving to the same step as
  `--surface-color` in either mode
- Loose alphas outside the five mix-ramp tokens
- A third drop shadow

---

## Pre-ship checklist

1. Zero colour literals and zero ramp steps in the component file?
2. Every alpha from the five mix-ramp tokens?
3. Exactly one `.btn-primary` in the view?
4. Every text–ground pair legal in **both** modes?
5. Contrast panel still distinct from surface in dark?
6. Focus outline present and unmodified?
7. Only `--shadow-lift` and `--shadow-pop`?
8. Disabled expressed as opacity, not a repaint?
9. No input inside a contrast panel; no total inside a surface card?
10. Checked under `forced-colors: active` and in print?
11. Contract in §02 of the grammar page still green, in all four
    families and both modes?

---

## Auditing

```bash
grep -rohiE '#[0-9a-f]{3,8}\b'            src/components | sort | uniq -c | sort -rn
grep -rohiE 'rgba?\([0-9., ]+\)'          src/components | sort | uniq -c | sort -rn
grep -roh  '--primary-[0-9]\{2,3\}'       src/components | sort | uniq -c | sort -rn
grep -roh  '--color-[a-z-]*-[0-9]\{2,3\}' src/components | sort | uniq -c | sort -rn
grep -roh  '--blog-[a-z-]*'               src/components | sort | uniq -c | sort -rn
```

The third and fourth commands should return nothing — a ramp step in a
component is the drift that survives review because it looks correct
today. Report counts and proposed tokens before changing anything; some
drift is intentional and the human should confirm.

---

## About `color-grammar.html`

The working reference, not a report. It is self-contained and offline-safe:
the specimen theme at the top stands in for `theme.css` and does not
exist in the app.

Four interactive pieces: the palette switcher and mode switcher in the
header, the live family contract (§02), the ground-separation table
(§05), and the pairing matrix (§06).

Every figure is read from the rendered document at runtime — resolve the
token through a probe element, composite it over its ground, run WCAG
2.1 — so the page cannot drift from the stylesheet, and it re-measures
on every palette and mode change.

**Keep §07 Recipes in sync with `color.css §9`.** A stale recipe is
worse than no recipe; people copy it.
