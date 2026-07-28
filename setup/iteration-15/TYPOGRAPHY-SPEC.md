# Typography Specification

**Scope:** every page and section of the web app
**Status:** v1.1 — fully responsive; derived from an audit of the 12 existing demo pages
**Companion files:** `../SKILL.md` (agent rules), `../assets/typography.css` (implementation)

---

## 1. What this document is for

The twelve pages already share a type system. Nobody wrote it down, so
it has been drifting — the same heading tier now exists in four slightly
different sizes depending on which page you land on. None of the drift is
individually wrong. Collectively it is the difference between a product
and a set of pages that resemble each other.

This spec names what already exists, picks one value where several
compete, and gives designers and engineers the same vocabulary.

---

## 2. Audit findings

Measured across all 12 pages.

### What is already consistent — protect it

| Element | Consistency |
|---|---|
| Body font stack | **12 / 12 identical** |
| `.eyebrow` (13px / 500 / +.08em / uppercase) | **12 / 12 identical** |
| `.chip` (12.5px / 500) | **12 / 12 identical**, one intentional override |
| Weight palette | Only 4 weights used, ever |
| `-webkit-font-smoothing: antialiased` | 12 / 12 |

This is a strong foundation. The system is 80% there.

### What has drifted

| Problem | Detail |
|---|---|
| **50 distinct font-size values** | For roughly 14 actual roles |
| **`.display` defined 4 ways** | Same class name, four different clamps across 6 files |
| **`.title` defined 4 ways** | Same class name, four different clamps across 8 files |
| **17 line-height values** | For 6 actual leading needs |
| **15 tracking values** | For 7 actual optical needs |
| **Two mono stacks** | `ui-monospace, Menlo, monospace` (6×) vs `ui-monospace, SFMono-Regular, Menlo, monospace` (3×) |
| **Two reading measures** | 720px (4 files) vs 680px (1 file) |
| **Article `h2` two sizes** | 1.6rem in editorial pages, 1.45rem in legal pages |
| **Half-pixel sizes** | 13.5px (20×), 14.5px (12×), 16.5px, 15.5px, 10.5px |

### The most useful finding

`.display` and `.title` were not drifting randomly. Each splits into
**two clean clusters**, and the clusters correspond to two genuinely
different jobs:

- Marketing pages (portfolio, pricing, blog) want a big cinematic hero.
- Utility pages (skeleton, reload, action-button) want a modest one.

Three utility pages had already converged on `clamp(2.2rem, 6vw, 3.6rem)`
independently. That is not drift — that is a missing tier. The system now
names it `.display-sm`, and does the same for `.title-sm`.

**Design lesson:** when a token drifts into two stable clusters, you are
usually missing a token, not enforcing one badly.

---

## 3. The typeface

```
-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Inter, sans-serif
```

**Why system-native.** Zero network requests, zero layout shift, zero
flash of unstyled text, and each OS renders its own type at the hinting
quality it was tuned for. The pages load instantly on a slow connection
in a way a webfont build cannot match.

**The trade-off, stated honestly.** The app looks slightly different on
macOS (SF Pro), Windows (Segoe UI), and Linux (Inter, or a fallback).
Letterforms, x-height, and apparent weight all shift a little. This is
accepted deliberately: the alternative costs 80–200KB and a font-loading
strategy, and the layout is robust enough to absorb the variation.

**Consequence for designers:** design against SF Pro, but sanity-check
headlines on Windows. Segoe UI runs slightly narrower with a smaller
x-height, so a headline that fits on exactly two lines in the Mac mock
may not be a tight fit on Windows — leave slack.

**Do not add a webfont** without revisiting this whole spec. Every
tracking value below is tuned to these metrics.

### Monospace

```
ui-monospace, SFMono-Regular, Menlo, monospace
```

Code, IDs, hashes, file paths. Nothing else. Use this four-value stack,
not the shorter variant currently in some files — dropping `SFMono-Regular`
loses the correct face on several macOS builds.

---

## 4. The scale

Four fluid tiers for headlines, ten fixed steps for everything else.

### Fluid tiers

Every fluid value interpolates linearly between a **360px** and a
**1440px** viewport, then locks at both ends.

| Role | Token | 360px | 1440px | Weight |
|---|---|---|---|---|
| Page hero | `--fs-display` | 38.4px | 96px | 700 |
| Utility hero | `--fs-display-sm` | 32px | 57.6px | 700 |
| Section opener | `--fs-title` | 30px | 52.8px | 600 |
| Card / block | `--fs-title-sm` | 22px | 33.6px | 600 |
| Article h2 | `--fs-h2` | 22px | 28px | 600 |
| Article h3 | `--fs-h3` | 19px | 22px | 600 |
| Lead / long-form body | `--fs-lead` | 17px | 18px | 400 |

The formula is always `clamp(min, Xrem + Yvw, max)`. The `rem` term is
not decorative — see §14.

### Fixed steps

These do **not** scale with the viewport, deliberately. See §14.2.

| px | Token | Role |
|---|---|---|
| 16 | `--fs-body` | Default body |
| 15 | `--fs-ui` | Buttons, primary UI |
| 14 | `--fs-ui-sm` | Nav, dense UI |
| 13 | `--fs-meta` | Eyebrow, timestamps, helper |
| 12.5 | `--fs-caption` | Chips, pills, tags |
| 12 | `--fs-label` | Uppercase table heads |
| 11 | `--fs-micro` | TOC groups, fine print |

**Why the steps get closer together as they get smaller.** At display
sizes, a 10% size change is obvious. At 12px it is invisible, so small
steps need finer granularity to express hierarchy — 12 vs 13 vs 14 are
each meaningfully different roles even though they sit 1px apart.

**Why 12.5px survives.** It is odd-looking, but `.chip` uses it
identically in all 12 files and it sits correctly between the 12px
uppercase label and the 13px eyebrow. Consistency beats tidiness.

**Two rounding decisions to be aware of:**
- Article `h2` was 1.6rem (editorial) and 1.45rem (legal). Both become
  one fluid tier running **22 → 28px**. The legal value is preserved at
  the small end, the editorial value exceeded at the large end.
- The reading measure was 720px in four files and 680px in one. All
  become **720px**.

---

## 5. Weight

Four weights. No exceptions.

| Weight | Use |
|---|---|
| 400 Regular | Body prose only |
| 500 Medium | UI, meta, eyebrow, buttons — the workhorse |
| 600 Semibold | Every heading up to `.title` |
| 700 Bold | Display tier only |

**Why no 300 or 800.** The system stack has no reliable Light or
ExtraBold across all three platforms. Requesting one produces a
synthesised fake on Windows — mechanically stretched outlines that look
broken next to real weights.

**Why 500 rather than 400 for UI.** At 13–15px on a light background,
Regular reads thin and washed out, especially in the muted grey. Medium
holds the same visual density as 400 body copy at 16–18px, so the whole
interface reads at one consistent weight even though the numbers differ.

**Contrast, not volume.** Hierarchy comes from the 600/400 pairing and
from size, never from adding a heavier weight. If something is not
standing out, it is the wrong size, not the wrong weight.

---

## 6. Tracking

The single most important rule, and the one most often broken.

| Size | Tracking | Why |
|---|---|---|
| ≥ 40px | -0.035em | Large type has too much air between letters |
| 28–40px | -0.03em | |
| 20–28px | -0.025em | |
| 18–20px | -0.02em | |
| 16–18px | -0.015em | |
| ≤ 15px lowercase | 0 | Tightening small type destroys legibility |
| Any uppercase | +0.05 to +0.08em | Caps are drawn for word-spacing, not letter-spacing |

**The principle.** Type is spaced for the size it was designed at.
Scaled up, the gaps scale too and the word falls apart. Scaled down,
letters need more room to stay distinguishable. So tracking runs
**inversely to size**, from -0.035em at the top of the scale to 0 at
the bottom.

**Uppercase is a special case.** Capitals in any humanist sans are drawn
assuming they sit inside lowercase words. Set in a row on their own, they
crowd. The eyebrow at +0.08em and the label at +0.06em are the corrected
values. Uppercase at 0 tracking always looks like a bug.

---

## 7. Leading

| Context | Value |
|---|---|
| Display | 1.04 |
| Title | 1.08 |
| Heading (h2/h3) | 1.25 – 1.3 |
| UI | 1.45 |
| Body | 1.6 |
| Long-form prose (720px) | 1.75 |

**The principle: leading follows measure.** The longer the line, the more
vertical space the eye needs to find the start of the next one. A 720px
column at 18px runs ~75 characters and needs 1.75. A button label runs
two words and needs 1.

**The 1.75 prose value is deliberate and should not be tightened.** It
is what makes the legal and article pages readable at length.

---

## 8. Measure and rhythm

- **Reading columns cap at 720px.** At 18px that is roughly 68–75
  characters — the top of the comfortable range. Never wider.
- **Short intro columns cap at 560px.**
- **Paragraph spacing is 1.2em**, expressed in `em` so it scales with
  the text it separates.
- **Headings carry asymmetric margin** — large space above (2.5em),
  small below (0.5em). A heading belongs to the text that follows it,
  and the space should say so.
- **Headline tiers use `text-wrap: balance`** so multi-line headlines
  split into even lines instead of leaving one orphaned word. Body text
  does not — balancing long paragraphs is expensive and unnecessary.

---

## 9. Numerals

Anything in a column, anything that ticks, anything that updates in
place: `font-variant-numeric: tabular-nums`.

Proportional digits have different widths — a `1` is narrower than a `0`.
In a price table or a running timer this causes visible horizontal
jitter. Tabular numerals lock every digit to one width.

Already applied in 15 places. It should be everywhere digits are compared
or animated: prices, dates, counters, timers, table cells, metrics.

Prose numbers ("about 30 people") stay proportional.

---

## 10. Specimen

```
DISPLAY 96/700/-.035/1.04     Build things that
                              actually ship

DISPLAY-SM 57/700/-.035       Skeleton loaders

TITLE 52/600/-.025/1.08       What I work on

TITLE-SM 33/600/-.025/1.1     Backend systems

H2 24/600/-.02/1.25           The problem

H3 20/600/-.02/1.3            Constraints

LEAD 18/400/-.015/1.6         A short paragraph that introduces
                              the section and gives the reader
                              somewhere to land.

BODY 16/400/0/1.6             Default running text for the
                              interface.

UI 15/500                     [ Get in touch ]

UI-SM 14/500                  Work   Writing   Contact

EYEBROW 13/500/+.08/UPPER     CASE STUDY

META 13/500                   Updated 12 March 2026

CHIP 12.5/500                 ( Postgres )

LABEL 12/600/+.06/UPPER       PLAN

MICRO 11/600/+.05/UPPER       SECTION
```

---

## 11. Migration map

Old value → token. Anything not on the left is already correct.

| Found in files | Becomes |
|---|---|
| 13.5px | `--fs-meta` (13) |
| 14.5px | `--fs-ui-sm` (14) |
| 15.5px | `--fs-ui` (15) |
| 16.5px | `--fs-body` (16) |
| 11.5px, 10.5px | `--fs-micro` (11) |
| 1.02rem, 1.05rem, 1.1rem, 1.15rem | `--fs-lead` (18) |
| 1.6rem, 1.45rem | `--fs-h2` (24) |
| 1.3rem | `--fs-h3` (20) |
| `clamp(2.75rem,8vw,6.5rem)`, `clamp(2.4rem,6.5vw,5rem)` | `--fs-display` |
| `clamp(2.2rem,6vw,3.6rem)` | `--fs-display-sm` |
| `clamp(2rem,5vw,3.4rem)` | `--fs-title` |
| `clamp(1.6rem,4vw,2.3rem)` | `--fs-title-sm` |
| `.prose` max-width 680px | 720px |
| `ui-monospace, Menlo, monospace` | `--font-mono` |

**Suggested order:** load `typography.css` globally first and confirm
nothing breaks, then strip per-page redefinitions one file at a time
starting with the smallest (`showcase-markdown-demo.html`). The heavy
files (`support-demo.html`, `start-project-demo.html`) go last.

---

## 12. Accessibility

- Size steps are defined in `rem`, so browser zoom and OS text-size
  settings scale the whole system. Never set a font-size in `px` in a
  page file.
- Body text is 16px minimum. 11–14px is reserved for genuinely secondary
  content — never for anything a user must read to complete a task.
- Ink on paper (`#1D1D1F` on `#FAFAF8`) is roughly 16:1 — well past AAA.
  Muted ink (`#6E6E73`) is roughly 4.9:1 — passes AA for normal text, but
  do not use it below 13px or for anything essential.
- Never rely on weight alone to signal state. Pair it with colour, an
  icon, or a label.

---

## 13. Governance

**Adding a step to the scale requires a human decision.** The scale has
14 entries for a reason: every addition makes the next designer's choice
harder and the drift easier. Before adding one, check whether an existing
step plus a weight or colour change does the job.

**When you find drift,** report it with a count before fixing it. Some
drift is intentional — the 11.5px chip override on the pricing page is a
deliberate density choice inside a dense comparison table, not a mistake.

**Review this spec** whenever a new page type is introduced, or whenever
the same value appears in three files without a token. Two files is a
coincidence. Three is a missing token.


---

## 14. Responsive behaviour

### 14.1 What scales

Seven tiers are fluid: the four headline tiers, `h2`, `h3`, and the
lead/long-form body size. Each interpolates linearly between a 360px
and a 1440px viewport, then locks. Below 360px and above 1440px the
type is constant — the layout adapts, the type does not.

**Tracking and leading are also responsive**, stepped at 700px and
1100px. This is not decoration. A `.display` renders at 38.4px on a
phone and 96px on a desktop; §6 says those two sizes need different
tracking (-0.03em vs -0.04em), so applying one value to both would
contradict the system's own rule. The steps live on `:root` custom
properties, so a component that uses `var(--tr-display)` follows the
curve automatically.

The curve in §6 extends one step further than originally written:

| Size | Tracking |
|---|---|
| ≥ 72px | **-0.04em** |
| 40–72px | -0.035em |
| 28–40px | -0.03em |
| 20–28px | -0.025em |
| 18–20px | -0.02em |
| 16–18px | -0.015em |
| ≤ 15px lowercase | 0 |
| any uppercase | +0.05 to +0.08em |

Leading loosens as the measure widens: prose runs 1.65 on a phone
(~40 characters per line) and 1.75 on desktop (~72 characters). Short
lines need less vertical room to find their way back.

### 14.2 What deliberately does not scale

Body copy, buttons, nav, chips, labels and fine print are fixed.

**Body must never shrink.** 16px is the floor for running text on any
device. Scaling it down on a phone — where reading conditions are
already worse — is the most common mistake in fluid type systems.

**Interface chrome should stay physically constant.** A button label
should feel the same size on a phone and a 32" monitor. Users sit
further from big screens, which roughly cancels the size difference.
Scaling UI text with the viewport makes desktop interfaces look
inflated and wastes the extra space you gained.

The rule of thumb: **scale what is being looked at, fix what is being
used.** Headlines are looked at. Buttons are used.

### 14.3 Why the `rem` term in every clamp

`clamp(2.6rem, 7.5vw, 6rem)` looks fine and is broken. The preferred
value is pure `vw`, which is a fraction of viewport width and completely
ignores the user's font-size setting. Someone who has set their browser
to 24px default, or zoomed to 200%, gets the same headline size as
everyone else. That fails **WCAG 1.4.4 (Resize Text)**.

The fix is to give the preferred value a `rem` component so part of it
tracks the user's setting:

```
clamp(2.4rem, 1.2rem + 5.333vw, 6rem)
```

Solve it like this for any new tier:

```
slope     = (max_px - min_px) / (1440 - 360)
intercept = min_px - slope × 360
preferred = (intercept ÷ 16)rem + (slope × 100)vw
```

Also: never set `html { font-size: 16px }`. It overrides the browser
preference and freezes every rem in the system, which defeats the point.

### 14.4 The iOS field bug

Any focused `input`, `select` or `textarea` under 16px makes iOS Safari
zoom the entire viewport. The page lurches, the user loses their place,
and it does not zoom back out on blur.

v1.0 set fields to 15px, so every form in the app had this. Fixed via
`--fs-field`, which steps to 16px under `@media (pointer: coarse)` —
keyed to touch input rather than screen width, so it also catches
touchscreen laptops and tablets in landscape.

### 14.5 Container queries

Viewport width is the wrong question for a reusable component. A card in
a 320px sidebar and the same card in a 900px feature slot sit at the
same viewport width and need different heading sizes.

Mark the block with `.t-container` and use `.cq-title` / `.cq-lead`
inside it. The component then responds to the space it is actually
given. A `@supports not` fallback covers older browsers with the
conservative size.

Use container queries for anything reused in more than one layout
context: cards, sidebars, modals, table cells. Use the ordinary fluid
tokens for page-level type — a page hero genuinely is about the viewport.

### 14.6 Edge cases covered

| Case | Handling |
|---|---|
| Landscape phone | Height-based cap; the fluid scale reads *width* and would otherwise put a 60px headline into 360px of height |
| Long URLs, IDs | `overflow-wrap: break-word` on `.prose`, `anywhere` on inline code |
| Code blocks | Scroll horizontally, never reflow — `white-space: pre` + `overflow-x: auto` |
| Very narrow columns | `hyphens: auto` below 520px only |
| Orphaned words | `text-wrap: balance` on headings, `pretty` on body |
| Print | Point-based override; measure released |

### 14.7 Testing checklist

Do not sign off a page without all five:

1. **320px** — smallest phone still in use. Headlines must not overflow.
2. **768px** — tablet portrait, and where the 700px tracking step lands.
3. **1440px** — where the fluid tiers reach their maximum.
4. **200% browser zoom at 1280px** — this is the one that catches
   `vw`-only clamps. Type must genuinely grow.
5. **Landscape phone, ~700×360** — the height cap should engage.

Then tap a form field on a real iPhone. If the page zooms, a field is
under 16px.
