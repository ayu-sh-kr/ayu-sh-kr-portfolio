# typography-demo.html — Agent Instructions

**Pairs with:** `typography-demo.html`
**Governed by:** `typography/SKILL.md` (rules), `typography/references/TYPOGRAPHY-SPEC.md` (rationale)
**Version:** matches typography v1.1

Read this file before touching `typography-demo.html`. It records decisions
that are not recoverable from the markup, and mistakes that have already been
made once.

---

## 1. What this page is

A **specimen page**. It renders every type role live so that drift is visible
rather than described. It is the third artifact in a three-file system:

| File | Owns | Audience |
|---|---|---|
| `assets/typography.css` | The values | Runtime |
| `SKILL.md` | The rules | Agents |
| `references/TYPOGRAPHY-SPEC.md` | The reasoning | Designers |
| `typography-demo.html` | The evidence | Everyone |
| `check-tokens.py` | The enforcement | CI / pre-commit |

**This page is downstream of all three.** It never introduces a value, a rule,
or a rationale. If something on this page disagrees with `typography.css`,
**this page is wrong** — fix it here, not there.

### What it is not

- Not a page template. Do not copy its layout for a real page.
- Not a component library. Components live in the design grammar page.
- Not a place to prototype. New tiers get decided in the spec first.

---

## 2. The single biggest hazard: token drift

The `:root` block at the top of the page is an **inlined mirror** of
`typography/assets/typography.css`. It is inlined because the file must stay
self-contained for the service worker offline fallback.

That means there are now two copies of the token set, and they can silently
diverge. A specimen page that lies is worse than no specimen page.

**Whenever `typography.css` changes, regenerate the inlined block in the same
commit.** Not later, not in a follow-up.

Verify with the bundled checker:

```bash
python3 check-tokens.py
```

It reads the `:root` block from both files, normalizes cosmetic differences
(whitespace, leading zeros, quote style), and compares all 34 declarations
across the `--fs-`, `--tr-`, `--lh-`, `--fw-`, `--font-` and `--measure`
families. Exit 0 is in sync; exit 1 prints exactly which values diverged and
which file is authoritative.

Do **not** replace this with a `grep | diff` one-liner. That was tried and it
produced false mismatches — the demo packs several tokens onto shared lines and
drops leading zeros, so a line-anchored grep misses declarations and reports
drift that isn't there. A check that cries wolf gets ignored, and then a real
drift ships.

---

## 3. Structure — fixed

Thirteen sections, IDs `s01`–`s13`, in this order. The order encodes an
argument: foundation → variables → roles → discipline. Do not reorder.

| ID | Section | Must contain |
|---|---|---|
| `s01` | The stack | Both font stacks, the platform-variance warning |
| `s02` | The scale | A live specimen for every fluid tier |
| `s03` | Fluid behaviour | The live meter, the clamp formula, the WCAG note |
| `s04` | Weight | All four weights, the "why 500 not 400" note |
| `s05` | Tracking | Both comparison pairs, the full curve table |
| `s06` | Leading & measure | Three leading samples, the measure rule |
| `s07` | Role classes | The assembled-section specimen |
| `s08` | Long-form prose | A real `.prose` block, not a description of one |
| `s09` | Numerals | The live proportional/tabular comparison |
| `s10` | Container response | The resizable card |
| `s11` | Pairings | The pairing list |
| `s12` | Do & don't | The full prohibition list |
| `s13` | Ship checklist | Twelve numbered items |

Adding a section means adding a TOC entry under the right group heading
(Foundation / Variables / Roles / Discipline) **and** verifying the scrollspy
still resolves — every `#toc a[href]` must match a real section `id`.

---

## 4. The specimen block — exact markup contract

Every specimen uses this structure. Do not invent variants.

```html
<div class="spec">
  <div class="spec-head">
    <code class="tok">.role-class</code>
    <span class="hint">when to reach for it</span>
  </div>
  <div class="spec-demo">
    <!-- the role rendered live, at real size -->
  </div>
  <p class="spec-note">Why it exists. <b>The one thing to remember.</b></p>
  <dl class="vals">
    <div><dt>Size</dt><dd data-probe="--fs-token">—</dd></div>
  </dl>
</div>
```

Rules:

- **`.spec-demo` renders the real thing.** Never a screenshot, never a
  description, never a scaled-down approximation. The whole value of the page
  is that the specimen is the artifact.
- **`.spec-note` carries at most one `<b>`.** It marks the single takeaway. Two
  bolds means the note is doing two jobs and should be two notes.
- **`.vals` is optional.** Include it when the numbers matter (size tiers),
  omit it when they don't (the assembled-section specimen).
- **`.tok` is click-to-copy.** Anything inside it must be literally pasteable —
  a real class name or token, never prose.

### Hint text — locked

`.hint` follows the house rule established on the coffee and pricing pages.
Do not restyle it here:

- **11.5px, weight 400** — not 12px, not medium
- **`--ink-soft` at 80% opacity**
- **lowercase** via `text-transform`
- **right-aligned**, achieved by `justify-content: space-between` on the parent
- **no badge, no pill, no colour, no accent**

The hint says *when to reach for this role*, in the voice of someone pointing
at it. `one per page · at the top` — not `Usage guidelines for the display tier`.

---

## 5. Live instrumentation — how it works

Four mechanisms. Breaking any of them turns a live page into a stale one, and
the failure is silent.

### 5.1 The hidden probe

A single off-screen `<div>` gets `font-size: var(--token)` applied, then
`getComputedStyle` reads the resolved pixel value. This is why the numbers are
real rather than transcribed.

**Never replace probe output with a hardcoded number.** If a value looks wrong,
the token is wrong.

### 5.2 Probe attributes

| Attribute | Reads | Renders |
|---|---|---|
| `data-probe="--fs-x"` | Computed font-size | `48.0px` |
| `data-probe-tr="--tr-x"` | Raw custom property | `-.035em` |
| `data-probe-lh="--lh-x"` | Raw custom property | `1.05` |

Tracking and leading read **raw**, not computed, because they step at
breakpoints and the raw value is the useful one.

### 5.3 The fluid meter rows (`#fluid .frow`)

```html
<div class="frow" data-t="--fs-display" data-min="38.4" data-max="96">
```

`data-min` and `data-max` are the tier's clamp endpoints **in pixels**. They
drive bar fill and the `at-max` accent state.

**These are hand-maintained and will silently lie if a clamp changes.** When
you edit a clamp in `typography.css`, update three places: the stylesheet, the
inlined mirror, and the `data-min`/`data-max` on the matching row.

Sanity check: at a 1440px viewport every bar should read 100% and turn
persimmon. At 360px every bar should read 0%. If one doesn't, its endpoints
are wrong.

### 5.4 The step readout

`#vps` and `#stepState` report which tracking/leading breakpoint is active.
The thresholds in JS (`700`, `1100`) **must match the media queries** in the
token block. There is no way to derive one from the other, so they are
duplicated — check both when either moves.

---

## 6. Do not re-add

These were considered and removed. Reintroducing any of them regresses the page.

- **A webfont, for any reason** — including "just for the specimen page". The
  entire tracking curve is tuned to system metrics; a webfont makes every
  specimen a lie.
- **Tailwind, via CDN or otherwise.** Earlier pages load it. This one must not:
  Tailwind's type scale and this scale disagree, and having both loaded makes
  it impossible to tell which one a specimen is demonstrating.
- **A dark-mode toggle.** Out of scope. Type behaviour is the subject; theming
  is a different page.
- **Copy-the-CSS buttons on each specimen.** Tried, removed — it duplicated the
  stylesheet into the page body and immediately went stale. Click-to-copy on
  `.tok` is the replacement and is sufficient.
- **A font-size slider or viewport simulator.** The browser window is the
  simulator. A fake one gave numbers that disagreed with real resize, which is
  the exact failure this page exists to prevent.
- **Per-specimen animation.** One motion idea per page: the reveal. Specimens
  are static so the eye compares type, not movement.
- **Accent colour on `.label` or `.micro`.** Only `.eyebrow` carries accent.
- **A second `.display` anywhere on the page.** The page hero is the only one,
  and the page must obey the rule it documents.

---

## 7. Deliberate rule violations — do not "fix"

An agent auditing this page against `SKILL.md` will flag these. **They are
documentation, not defects.** Leave them exactly as they are.

| Location | Looks like | Actually is |
|---|---|---|
| `s03`, `.vals` `Wrong` row | A `vw`-only clamp | The counter-example being taught |
| `s12`, don't-list item | `@font-face` and `@import` | Prohibition text inside `<code>` |
| `s05`, left panes | Uppercase at 0 tracking, display at 0 | The "before" side of both comparisons |
| `s09`, left pane | `font-variant-numeric: normal` | The proportional-digit demonstration |

When adding a new counter-example, add a row to this table in the same edit.

---

## 8. Accent budget

Persimmon appears in exactly five places. This is a hard ceiling.

1. TOC active state (border + text)
2. `.eyebrow` text
3. `.chip` text and tint background
4. Filled fluid bars at maximum (`.at-max`)
5. The measure rule in `s06`

The scroll progress bar is the sixth and is page chrome, not content. Adding a
seventh use requires removing one.

---

## 9. Motion

One idea: a one-shot reveal on scroll, `translateY(14px)` + opacity, `.6s`
`cubic-bezier(.2,.8,.2,1)`, `IntersectionObserver` at `threshold: .08`,
unobserved after firing.

The fluid bars have a `.45s` width transition — this is a *state* transition,
not an entrance, and does not count as a second motion idea.

`prefers-reduced-motion: reduce` must disable both and reveal everything
immediately. Verify it, do not assume it.

---

## 10. Voice

Same as the rest of the site: human, in Ayush's voice, never apologetic and
never scolding.

- **Do:** "Capitals are drawn assuming they sit inside lowercase words."
- **Don't:** "You should always remember to add letter-spacing to uppercase."

Section leads state what the section is for in one or two sentences. Notes
explain *why*, not *what* — the specimen already showed the what. Prohibitions
in `s12` are stated flatly, with the reason attached, and never with an
exclamation mark or a warning emoji.

---

## 11. Adding a new role

Only after the role exists in `typography.css` and is documented in `SKILL.md`.
This page is last, never first.

1. Add the token to the inlined `:root` mirror.
2. Add the role class to the "role classes under test" CSS block.
3. Add a `.spec` block to `s02` in scale order — largest to smallest.
4. If fluid, add a `.frow` to `s03` with correct `data-min` / `data-max`.
5. Add it to the pairing list in `s11` if it has a natural neighbour.
6. Add it to the `s07` assembled specimen only if a real page would use it there.
7. Re-run the acceptance checklist below.

---

## 12. Acceptance checklist

Do not ship without all of these.

**Integrity**
1. Zero external requests — no `src`/`href` pointing at `http`
2. `python3 check-tokens.py` exits 0
3. Every `#toc a[href]` resolves to a real section `id`
4. Every `data-min`/`data-max` matches its clamp endpoints

**Live behaviour**
5. At 1440px: every fluid bar reads 100% and shows the accent state
6. At 360px: every fluid bar reads 0%
7. Viewport meter reports the correct step at 699px, 700px, 1099px, 1100px
8. Container card re-tiers `title-sm → h2 → title` when dragged
9. Numeral panes visibly differ in width behaviour as digits change
10. Clicking a `.tok` copies it and flashes the tint state

**Rule compliance**
11. Exactly one `.display` on the page
12. Every uppercase run carries positive tracking, except the `s05` counter-example
13. No raw `font-size` outside the token block and role-class block, except
    inline demo styles that are themselves the specimen
14. Every clamp carries a `rem` component, except the `s03` counter-example

**Accessibility**
15. 200% browser zoom: every fluid specimen genuinely grows
16. `prefers-reduced-motion`: reveals off, everything visible
17. Landscape phone ~700×360: display tier caps, no horizontal scroll
18. Tab order follows visual order; TOC links reachable

**Cross-checks**
19. Section 12's prohibition list matches `SKILL.md` "Never do these"
20. Section 13's checklist matches `SKILL.md` self-check plus responsive items

---

## 13. When this page and the spec disagree

The stylesheet wins, then the skill, then the spec, then this page.

If you find a disagreement, **stop and report it** rather than silently
picking a side. A disagreement between these four files usually means a change
landed in one place only, and the useful fix is to find the missing edits — not
to make this page agree with whichever file you happened to open first.
