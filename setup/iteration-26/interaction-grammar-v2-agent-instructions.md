# Interaction Grammar v2 — agent instructions

Companion to `interaction-grammar-v2.html` (Design grammar · 03).
Read this before editing that page, and before adding *any* interactive
behaviour anywhere in the app.

This file exists because interaction drift is invisible in a diff. Two
pages can use identical tokens and still feel like different products if
one lifts 2px in 250ms and the other lifts 4px in 400ms. The page is the
specimen sheet; this file is the enforcement.

---

## 1. The rule that governs the page itself

**Specimen first, prose second.** This is not a style preference — it is
the format the grammar pages are in, set by `design-grammar.html` (01)
and confirmed by `typography-demo.html` (02):

> a `.spec` card containing the **live thing**, a `.spec-label` naming
> it, a small mono `.kv` carrying its value, and a short `.usecase`
> underneath saying where it goes and what it prevents.

v1 of this page inverted that: nine prose taxonomy tables carried the
content and the live specimens were sparse. It measured **4.88 words per
element** against page 01's 4.01, with 58 interactive nodes.

v2 measures **3.64 words per element with 82 interactive nodes** — denser
in markup than the reference page. **Treat those numbers as a budget.**
If an edit pushes words-per-element above roughly 4.0, the edit is prose
that should have been a specimen. Check it:

```bash
python3 - <<'EOF'
import re
s=open('interaction-grammar-v2.html').read()
b=s.split('<body>')[1].split('<script>')[0]
w=len(re.sub(r'<[^>]+>',' ',b).split()); e=len(re.findall(r'<[a-zA-Z]',b))
print('words/element', round(w/e,2), '| interactive',
      len(re.findall(r'<button|<input|<details|<dialog|data-tilt|<summary', b)))
EOF
```

**A prose table is never the right container for a variant.** If a family
gains a variant, it gains a card.

---

## 2. Structure — do not revisit

- **Left sticky TOC rail**, matching page 01. `.shell` is a grid inside
  the single `.layout-page` container: one column below 1100px, then
  `190px / 1fr` with the rail sticky at `--layout-stick`. Rail groups are
  `.micro` labels (Input / Commitment / Response / Contract).
  - **Cascade order matters.** `.toc-wrap{display:none}` must sit
    **before** the `@media (min-width:1100px)` block that sets
    `display:block`. Same specificity, later wins — putting it after
    silently hides the rail at every width. That was a real bug.
- **`.layout-page` throughout**, one container, prose capped by `.lead`'s
  built-in measure and the `.measure` helper.
- **Nine families, ordered by trigger**, grouped into Input (01–03),
  Commitment (04–05), Response (06–09), Contract (10–15). Note the
  reorder from v1: Ingest moved from 09 to **05**, next to Selection,
  because both are the human committing something. Action, Recompute,
  Transient and Interrupt are all the system answering, so they sit
  together.
- **Every specimen is live.** No stills, no recordings. Three exceptions
  are *deliberately* inert and marked as such:
  - the four `[data-frozen]` `.act` buttons, which document a state
  - the `.anat` toast, held open with `--p:.62` for annotation
  - the three `.mini-dlg` scrim mocks, which show tone without blocking
    the page (each pairs with a live "Open it" button)
- **One `.display`, one `.layout-section-hero`, zero `.btn-accent`.** With
  ~30 demo triggers an accent button breaks the one-per-view rule
  instantly. The accent is spent on the rails, the active TOC marker,
  focus rings, selection, the meter and the drag state — only where it
  carries state.
- **`.measure` is a layout helper, applied in markup.** `typography.css`
  puts the measure on `.lead` and `.prose` only. **Never fold a measure
  into a role class** — that is redefining `.title` per page.

---

## 3. Reversals from v1 — and why

Recorded so they don't get reverted by someone reading the older file.

| v1 said | v2 does | Why |
|---|---|---|
| No fixed TOC sidebar; use a sticky chip rail | Left sticky rail at 1100px | Page 01 has one and it is the house pattern. The chip rail was solving a breakpoint problem that `.shell` solves properly. |
| No motion previews on the verb cards | All 16 verbs are playable specimens | v1's objection was 16 looping animations. These **play once on click** and rest. That turns the most textual section into the most visual one. |
| Taxonomy tables per family | Specimen grids per family | The weight was wrong. See §1. |
| "One easing curve" | One *spatial* curve + two single-purpose | Factually the app has three. The other two are attached to press and to the skeleton sweep. |

---

## 4. Behaviour rules

### Pointer (01)
- Lift is `translateY(-2px)` at `.25s var(--ease)`. Deep lift
  (`-3px`/`-4px` + shadow) only for a card that is itself the link.
- **Lift XOR nudge.** A container lifts, *or* a mark inside it travels.
  The page ships this as a live do/don't pair — keep it.
- Two wash intensities: `--tint`, and `rgba(255,77,0,.035)` for a row
  that must stay quiet. There is no third.
- **Pointer light and spring tilt are licensed to `.topic[data-tilt]` and
  nowhere else.** The specimen on this page is documentation and does not
  count as a second site use.
- Every hover needs a `:focus-visible` equivalent. If every hover
  vanished, the interface must still be fully usable.

### Focus (02)
- One ring: `outline: 2px solid var(--accent)`. Three offsets by what it
  must clear — **3px** floating/pill chrome, **2px** fields and
  grid-packed cards, **−2px** full-bleed rows (plus a small radius).
- The specimens use a `[data-focus]` click handler that blurs then
  re-focuses, so the ring is visible without a keyboard. **That is a
  demo affordance only** — never ship programmatic focus-on-click.
- **A risk-tone dialog opens with focus on cancel.**
- Never remove an outline without replacing it with the ring.

### Scroll (03)
- **One passive listener, one rAF, one render function per page.** On this
  page that single frame drives the top rail, the mirrored rail in the
  Read-progress card, the nav hairline, and the pin.
- Reveal fires once — `io.unobserve()` on first intersection. Nothing
  re-hides. The Reveal specimen is excluded from the observer by id so
  its replay button owns it.
- Scrollspy root margin is `-40% 0px -50% 0px`. The asymmetry is what
  makes the handoff read like reading. Do not make it symmetric.
- Progress rails write straight to `style.width` inside the frame and are
  **not** transitioned (the route topbar's `.2s linear` is the exception).
- **No `.reveal` inside a pinned stage.**
- The pin here is **56svh in a 220vh wrapper** — abbreviated so the page
  stays readable, and labelled as such in the copy. **Production pins use
  `100vh`** (not `svh`) so the pin height doesn't change mid-scroll as the
  URL bar collapses. Do not propagate 56svh.
- The entry/exit pill measures itself off an **off-screen clone** into
  `--pw`, exactly as the pricing contact pill does with `--sb-w`.

### Selection & disclosure (04)
- **Selection is a state, not a motion.** Colour and a mark. No pop.
- Selected owns colour, hover owns transform — they never touch the same
  property, so no arbitration rule is needed.
- Native `<details>`. The `+` **rotates 45°**; never swaps to `−`.
- Panels transition to a **real ceiling**, never `none`/`auto`.
- `aria-expanded` on the trigger, `aria-controls` on the panel.
- A branch **replaces** its fieldset (`innerHTML` swap + `fadeUp`), it
  does not collapse it.

### Ingest (05)
- Fields use `--fs-field`, stepping to 16px under `(pointer: coarse)`.
- **The drop zone is the only dashed non-element in the system.** Do not
  spend dashes on empty states or placeholder cards.
- Drag-over changes four things at once — the one place that is correct,
  because the human is holding something.
- Chips `popIn` on accept; removal is immediate, no exit animation.
- Submit hands off to family 06. **A form never invents its own pending
  state.**

### Action lifecycle (06)
- Five states via `data-state` **only**. Auto-return: **2200ms** from
  success, **2600ms** from error, **12s** pending timeout.
- **Static `.btn` and stateful `.act` are distinct components and never
  substitute for each other.**
- The glyph node does not exist in idle. Do not reserve an empty slot.
- Pending disables, suppresses hover, sets `cursor: progress`.
- `--ok` has **one** sanctioned use: a settled `.act` success fill, plus
  the toast's exit circle which reproduces it exactly. Never a wash, tint
  or surface.
- Route progress is **ref-counted**, decelerating toward a **0.90
  ceiling** it cannot cross without a completion.
- Skeletons predict the real layout *exactly*. Sweep stagger 80ms/row.

### Live recomputation (07)
- **Dark panel = numbers/breakdown. White card = human input. Plain row =
  CTA.** Established on the coffee page. **Do not regress.** The page
  labels both halves explicitly so the split can't be misread as
  decoration.
- Only the value that changed is marked. Figure dips (opacity .25 + 4px)
  while the new value is written, then settles.
- Meters are **weighted, not counted**.
- `tabular-nums` on every changing digit.
- **One** `aria-live="polite"` region with a summary sentence.

### Transient (08)
- **Toast is an ink pill, cornered, and passes. Dialog is a white card,
  centred, and blocks.**
- Contract: circle in → grow to measured width → volume retracts as a
  **gradient stop with a feathered trailing edge** → collapse to circle →
  outcome glyph one beat → gone.
- Natural expiry collapses; hand dismissal just goes. **The two exits
  stay different.**
- Pause on `pointerover` / `focusin` / `visibilitychange`. **Resume,
  never restart.**
- Coalesce by id: refill, tabular `×n`, one 2% pulse. **Three maximum**; a
  fourth retires the oldest through the timeout exit.
- **No visible `×`.**
- **If a button started the work, the button reports it.**
- The version here is condensed from toast v2 (no pointer drag). **If the
  two disagree, toast v2 is the source of truth.**

### Interruption (09)
- Native `<dialog>` + `showModal()`. Platform owns top layer, focus trap,
  Esc, inert background, focus return.
- **Tone is colour only** — a 2px top rule and a button variant.
- In-flight: cancel disables, Esc `preventDefault`ed, scrim inert.
- Cancel, scrim-click and Esc resolve identically — one exit, three doors.
- **Never two blocking layers.**

### Timing (10)
Six durations. **One spatial curve** `cubic-bezier(.2,.8,.2,1)`, plus two
that may **not** be borrowed: `.2,.9,.25,1` (press) and `.35,0,.25,1`
(skeleton sweep). All three are plotted as an SVG specimen on the page —
if a curve is ever added, it must appear on that plot.

| Duration | For |
|---|---|
| `.12s` | a press, or a per-frame value (`linear`) |
| `.2s` | colour only — no distance, no settle |
| `.25s` | the default move: any transform under ~8px |
| `.3–.35s` | a glyph drawing itself, a mark rotating, a deep lift |
| `.42–.55s` | a *measure* changing |
| `.7s` | reveal on scroll, once per element. The ceiling. |

**Opacity gets `ease`. Movement gets the curve. Per-frame values get
`linear`.**

### Verbs (11)
Sixteen, each a playable specimen. Card anatomy, in this order: a **44px
`.vs` stage**, then a `.vhead` row carrying the name and its value, then
the description. The stage comes first because the specimen is the point.

**Four traps, all of which have already bitten once:**

1. **`.vs` must carry `display:block`.** It is a `<span>`, and an inline
   box ignores `block-size` — the stage collapses to zero height and every
   absolutely-positioned specimen falls through onto the label. The whole
   grid looked like stacked text. `.verb-in` exists for the same reason.
2. **`--vp` is registered `inherits:false`,** so the `retract` animation
   must run on `.vvol::after` — the pseudo-element that actually reads it.
   Animating `.vvol` itself does nothing at all.
3. **Never move a specimen with a length that isn't relative to the
   stage.** `scrub` originally used `translateX(calc(100% * 6))`, which is
   600% of a 14px mark and ran clean off the stage. It animates
   `inset-inline-start` to `calc(100% - 24px)` instead.
4. **`.verb.play .x` out-specifies the reduced-motion resting block.**
   Do not fight it with more selectors — the guard lives in the click
   handler, which returns early when `rm()` is true and announces that
   specimens are shown at rest.

A verb that cannot be demonstrated in a 44px stage is probably not a
verb, it is a composition. Adding one means a card, a keyframe, a value
in `.vhead`, and a row in **both** reduced-motion blocks — same commit. **A verb that cannot be demonstrated
in a 34px stage is probably not a verb, it is a composition.** Adding one
means adding a card, a keyframe, and a row to the reduced-motion resting
block — all three, same commit.

The `retract` specimen animates a registered custom property via
`@property --vp`. If a browser without `@property` support matters, that
card degrades to a static volume, which is an acceptable still.

### Reduced motion (13)
- **Removes motion, never information.**
- Transitions go to `.001ms`, not `none`, so state changes still commit
  and `transitionend` still fires.
- **A disabled animation must not become a frozen artefact.** Every loop
  needs a designed still: spinner → solid ring at 50%; check/cross →
  fully drawn; ping → `opacity:0`; pins → static with section padding.
  **This now includes the verb specimens** (`.vspin`, `.vcheck`,
  `.vring`) — they are in both blocks.
- `html[data-rm="on"]` is a **review aid**, never persisted, and must
  stay an exact duplicate of the media query. A rule added to one goes
  into the other in the same commit.

---

## 5. Do not re-add

- **Prose taxonomy tables** in place of specimen cards. See §1.
- **`.btn-accent`** anywhere on this page.
- **`max-inline-size` on `.title` or `.meta`.** Use `.measure`.
- **A duration/easing playground with sliders.** It invites inventing
  values, which is the failure this page exists to prevent.
- **Looping verb previews.** Play-once only.
- **A visible `×` on the toast.**
- **A green surface anywhere.**
- **`transition: all`.** Ten instances remain elsewhere and are being
  replaced with explicit property lists — do not add an eleventh.
- **`.toc-wrap{display:none}` after the 1100px media query.**
- **A `.vs` stage without `display:block`.**
- **`scroll-behavior` without `scroll-padding-block-start`.** `html`
  carries `scroll-padding-block-start: var(--layout-stick)` so *every*
  programmatic scroll clears the fixed header, not only anchor jumps.
  Without it `scrollIntoView()` parks the target under the nav and its
  first click lands on the header instead.

---

## 6. Known drift this page documents

Flagged in §14 of the page. Recorded so it isn't rediscovered.

- `transition: all .2s` — **10 instances**: `blog-demo`,
  `design-grammar` (×3), `pricing-demo`, `showcase-markdown-demo`,
  `start-project-demo`, `support-demo` (×2), `support-section`.
- **Hover-only reveals** — several `:hover::before{opacity:1}` and
  `:hover .arr{opacity:1}` rules. Most pair with `:focus-within`; a few
  do not. Audit before ship.
- Hardcoded `scroll-margin-top: 70px` / `96px` in `pricing-demo` and
  `typography-demo`. Both should derive from `--layout-stick`.
- Off-scale type values (`13.5px`, `14.5px`, `12.5px`) in
  `start-project-demo` and `support-demo` — a typography audit item, same
  files.

---

## 7. Adding a behaviour — the procedure

1. **Name the trigger.** That gives you the family. If you can't, stop.
2. **Grep the grammar for what you're about to add** — the duration, the
   curve, the verb, the colour. Nothing returned is usually a decision
   already made, not a gap to fill.
3. **Pick a verb from the sixteen.** If none fits, that's a conversation.
4. Implement with existing tokens only.
5. **Add a specimen card to the family** — live thing, `.spec-label`,
   `.kv` value, `.usecase`. Not a paragraph. A behaviour with no card
   doesn't exist as far as the next agent is concerned.
6. If it establishes a rule, add it to §12 or §14.
7. Run the checklist.

---

## 8. Acceptance checklist

**Page integrity**
1. Exactly one `.display`, one `.layout-section-hero`, zero `.btn-accent`.
2. Zero raw `font-size` outside `var(--fs-*)` (`code{font-size:.9em}`,
   inherited from `typography.css`, is the only exception).
3. Zero raw `font-weight`, zero untokenised `border-radius`, zero
   bare-integer `z-index`.
4. Width media queries only at **700 / 1100** (520 unused in v2).
5. Every space value on the ten-step `--layout-space-*` scale.
6. No measure folded into a typography role class.
7. Words-per-element at or under ~4.0, interactive count at or above 80.
8. Every variant has a card; no prose stands in for a specimen.
9. Every inert specimen deliberately marked (`[data-frozen]`, `.anat`,
   `.mini-dlg`) and paired with a live equivalent where one exists.

**Behaviour**
10. Every hover has a `:focus-visible` equivalent.
11. Everything reachable and operable by keyboard alone.
12. No information carried by motion alone.
13. Every duration on the six-step scale; every spatial curve
    `var(--ease)`; press and sweep curves only where licensed.
14. Every verb already in the sixteen, and playable in its 34px stage.
15. One motion idea per section.
16. State published by a machine, reflected by the UI.
17. Async states cannot be stranded: timeout, cancel path, settled
    outcome.
18. One `aria-live` region.
19. Scroll work passive, rAF-throttled, one shared frame.
20. Reveals unobserve after firing.

**Verification**
21. Reduced motion on: no frozen artefacts, nothing lost, pin unpinned,
    every loop *and every verb specimen* on a designed still.
22. `html[data-rm="on"]` matches the media query exactly.
23. Pointer light **and spring tilt respond to a real pointer** — the
    tilt loop is easy to drop in a rewrite, and the card looks finished
    without it because the CSS light still shows at a static 50%/50%.
24. Every `.vs` stage measures 44px, with no specimen escaping it and no
    overlap between stage, `.vhead` and `.vd`.
25. Clicking a verb under reduced motion adds no `.play` class.
26. Zero console errors after exercising every specimen: reveal replay,
    hairline toggle, pill cycle, all three focus rings, choice cards,
    chips, both disclosures, panel, branch swap, act cycle + all four
    state buttons, all three routes, skeleton swap, estimator, toast
    repeat, toast fail, copy, all three dialog tones + Esc, drop zone,
    clock, all sixteen verbs, reduce-motion toggle both ways.
27. TOC rail visible at 1100px and above, hidden below; scrollspy marker
    lands on the right entry.
28. No horizontal scrollbar at 320px; checked at 768, 1100, 1440, and
    200% zoom.
29. Landscape phone near 700×360.
30. Destructive dialog opens with focus on **cancel**.
31. Self-contained: no external CSS, JS, font or image reference, for the
    service-worker offline fallback.

---

## 9. Voice

Human, in Ayush's voice. Declarative and specific. Every rule states the
failure it prevents, because a rule without its reason gets deleted by
the next person who finds it inconvenient. Never apologetic, never
scolding. The page argues that restraint is a technical decision rather
than an aesthetic one — so it must not itself be decorated.
