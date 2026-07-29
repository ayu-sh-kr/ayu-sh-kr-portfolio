# Toast v2 — agent instructions

Component spec for `toast-v2-demo.html`. This file is the contract. If a rebuild
or a future agent contradicts anything here, this file wins.

Read alongside `alert-agent-instructions.md`. The two components are defined
against each other and neither makes sense alone.

**This is the second revision.** The first tried a concentric ring for time and
a persistent glyph for state, and they fought for the same 40px. Rather than
picking one and dropping the other, both required signals were moved onto
properties that don't compete. That is the standing rule for this component
now — see §0.

**v2 is a grammar realignment, not a redesign.** Every interaction, motion
structure and piece of machinery from v1 is intact. What changed is that five
values which had been invented inside the component were replaced with values
the design system already had. See `toast-grammar-audit.md` for the evidence
behind each one.

| Was | Now | Sourced from |
|---|---|---|
| `rgba(31,122,61,.5)` green wash | neutral `rgba(255,255,255,.18)` | `.rail.dark` track |
| accent only when actionable | unchanged, now `.32` | `.rail.dark .fill` |
| `rgba(194,58,0,.55)` fail wash | `rgba(194,58,0,.34)` | `#topbar.err` |
| green on the surface | solid `--ok` on the exit circle | `.act[data-state="success"]` |
| `@keyframes toast-nudge` shake | deleted | no precedent in the system |
| 18px glyph, stroke 2 | 16px, stroke 2.4 | `.act .glyph` / `.act .check` |
| accent text action label | ghost pill, white text | `.btn-ghost` inverted |

> **Notes for future passes.** (1) An intermediate v1 attempt replaced the
> retraction with a uniform opacity fade, on the theory that removing the moving
> edge required removing the movement. Wrong, and reverted — the retraction is
> the feature; only its *trailing edge* was ever the problem. (2) A 3px identity
> bar was briefly added to the leading edge; the border-radius clipped it into a
> crescent. Identity cues must not introduce geometry of their own.

---

## 0. The rule that produced this design

**Neither signal is optional.** A toast that vanishes without warning is a
broken promise; a toast that doesn't say what happened isn't a notification.
If two required things collide, the fix is to put them on channels that don't
compete — never to quiet one at the other's expense, and never to remove one
because the two together look busy.

They collided the first time because they were the same *kind* of mark (a
figure) sharing the same *place* (a 40px dot). The fix is not a better figure.
It's recognising that state and time are different *kinds* of information —
state is a fact, time is a quantity — and giving each the property that
actually suits it: state gets a **hue**, time gets a **volume**. A colour and a
quantity don't compete for the same 40px because they were never occupying it
in the first place; the wash is the whole pill.

---

## 1. What this is

Transient, non-blocking word from the system. It reports; it never asks.

| | Alert dialog | **Toast** |
|---|---|---|
| Surface | white card | **ink pill** |
| Position | centred, top layer | **cornered, page chrome** |
| Blocks | yes | **no** |
| Needs an answer | yes | **no** |
| Leaves on its own | never | **yes** |
| How many at once | one, queued | **three, stacked** |

Floating chrome on this site is ink. Same 56px height, same `border-radius:
999px`, same `0 12px 40px -12px rgba(29,29,31,.5)` shadow as the pricing
page's sticky contact pill.

---

## 2. The fill — one layer, two signals

```
.toast
├── .toast-fill    absolute, inset:0, z-index:0 — the wash
├── .toast-glyph   absolute, pinned left, z-index:2 — the threshold mark
└── .toast-body    relative, z-index:1 — message, count, action
```

`.toast-fill` is a translucent colour composited over the ink pill.

- **Hue** carries state: quiet neutral for `note`, `--ok` for `done`, `--err`
  for `fail`, accent when an action is attached (accent overrides tone — it is
  the one place this component spends the site's one chromatic colour).
- **Volume** carries time: a gradient stop driven by `--p` every frame from the
  same shared clock. Full at open, nothing at expiry.

Both properties belong to the same DOM node. That is what makes them stop
competing — they are not two elements claiming the same space, they are two
attributes of one element.

### Colour is sourced, not invented

The system codifies a quantity on a dark surface:

```css
/* design-grammar.html:129–130 */
.rail.dark      { background:rgba(255,255,255,.12) }
.rail.dark .fill{ background:var(--accent) }
```

The volume follows it. Two alphas per state — `hi` is the retracting volume,
`lo` the permanent base of the same hue.

| State | `--tone-hi` | `--tone-lo` | Precedent |
|---|---|---|---|
| `note` / `done` | `rgba(255,255,255,.18)` | `rgba(255,255,255,.06)` | `.rail.dark` track |
| has action | `rgba(255,77,0,.32)` | `rgba(255,77,0,.10)` | `.rail.dark .fill`, `#topbar` |
| `fail` | `rgba(194,58,0,.34)` | `rgba(194,58,0,.10)` | `#topbar.err` |
| `sticky` | `rgba(255,255,255,.10)`, flat | same | — |

`--tone-0` is always the same hue at **zero alpha**, never `transparent`.

### No green on the surface — ever

`--ok` has exactly one sanctioned use system-wide:

```css
.act[data-state="success"]{ background:var(--ok); border-color:var(--ok); color:#fff }
```

A solid fill on a button. It is never a wash, a tint, or a surface. A 320×48
green fill was ~120× that area with no relative anywhere on the site — which is
why it never read as clearly as it should have.

**Success lands on the exit circle instead**, reproducing `.act`'s settled
states so the visitor reads a colour they already know:

| Exit | Circle | Glyph | Reproduces |
|---|---|---|---|
| `done` | solid `var(--ok)` | white check | `.act[data-state="success"]` |
| `fail` | solid `#fff` | `var(--err)` cross | `.act[data-state="error"]` |
| `note` | `rgba(255,255,255,.12)` | white bell | neutral |

Arrival is always the neutral circle — the outcome isn't known yet.

### The edge is feathered, not cut

Unchanged from v1 and still load-bearing. A `scaleX` retraction produces a
straight vertical edge crossing a shape with no straight sides, and collapses
into a sliver at the cap. So the volume is a gradient stop:

```css
background:
  linear-gradient(90deg,
    var(--tone-hi) 0,
    var(--tone-hi) calc(var(--p) * 100%),
    var(--tone-0)  calc(var(--p) * 100% + var(--p) * 2.5rem)),
  linear-gradient(var(--tone-lo), var(--tone-lo));
```

The feather scales with `--p`, so at zero nothing is left behind.

---

## 2a. `.toast` must stay positioned — a real bug

`.toast-fill` is `position: absolute; inset: 0`. It relies on `.toast` being
`position: relative` to be contained by it.

The static specimen on the demo page had `.anat .toast { position: static }`,
which broke that containment: the fill escaped to the nearest positioned
ancestor and painted a full-bleed tint across the hero and the section below
it. It looked like a styling quirk; it was a containment failure.

**Any rule that overrides `.toast`'s position must keep it `relative`.** This
applies to the demo specimen, to any future inline/static rendering of the
pill, and to anything that drops `.toast` into a new context.

---

## 3. The glyph — a threshold, not a fixture

The dot used to hold a permanent icon for the toast's whole life. It no longer
does. The glyph now exists only at the two moments the pill *crosses a
threshold* — becoming a pill, and stopping being one.

### Arrival — three phases, each waiting for the last

| # | What | Duration | Class |
|---|---|---|---|
| 0 | Mounted, invisible. `scale(0)`, 48px circle, bell already loaded and marked visible | — | — |
| 1 | **The icon scales 0 → 100** and lands as a circle | 300ms | `+ is-in` |
| 2 | **The circle expands into the pill**, the mark retiring as it goes | 420ms | `− is-shown`, `+ is-open` |
| 3 | The clock arms | — | — |

**Phase 2 must not begin until phase 1 has finished.** This was the bug in the
first cut: `is-open` was added 60ms in, so the icon never actually landed — the
pill started widening while the circle was still growing, and the two motions
smeared into one indistinct move. The `setTimeout` before phase 2 is exactly
phase 1's duration; if one changes, so does the other.

The icon is written into the DOM and given `is-shown` **before** phase 1
starts, so it scales up *with* the circle rather than fading in on top of one
that has already arrived.

The mark is always the bell. It is never tone-specific — nothing is known yet.
It does not travel into the body, and it does not persist once open.

### Direction of expansion

Not a toast property. It falls out of the rail's `align-items`, because the
width animates from the circle and flex alignment decides which edge stays
pinned:

| Rail position | `align-items` | Grows |
|---|---|---|
| `*-right` | `flex-end` | **leftward** — right edge pinned |
| `*-left` | `flex-start` | **rightward** — left edge pinned |
| `*-center` | `center` | **both ways** — as the pricing contact pill does |

These rules live **outside** the `min-width: 700px` query. They were briefly
inside it, which left the icon expanding in the wrong direction on a phone.

### Departure — the arrival played backwards

| # | What | Duration |
|---|---|---|
| 1 | Pill shrinks back to the circle (`− is-open`); body fades fast (120ms) | 420ms |
| 2 | Outcome glyph appears in the circle and holds | 340ms |
| 3 | **The icon scales 100 → 0** (`− is-in`), then unmounts | 300ms |

**Phase 3 is a scale, not a fade.** It has to undo phase 1 of the arrival, or
the two thresholds stop reading as the same gesture performed forwards and
backwards. An opacity fade here is a regression even though it looks
superficially similar.

The outcome glyph takes `.act`'s settled colours — see §2. `fail`'s white disc
is the one inversion on the component, mirroring the alert dialog's `risk`
tone, and is used nowhere else.

### Departure — dismissed by hand

Swipe or keyboard dismissal does **not** run the collapse-and-glyph sequence.
It flies immediately, in the direction of the gesture, and fades. See §7 for
why the two exits are kept deliberately different — this was a design
decision, not an oversight, and it is documented so a future pass doesn't
"fix" it into matching the timeout exit.

---

## 4. No visible close button

Swipe already dismisses; a close button next to a retracting fill was two
controls for one job, and removing it gives the line real width back.

**Removing it does not remove the requirement to be dismissible without a
pointer.** Every toast is `tabindex="0"`. With one focused,
`Delete` / `Backspace` / `Escape` dismiss it — the keyboard equivalent of the
swipe, not a hidden feature. A visually-hidden string inside each toast states
this for assistive tech.

`sticky` toasts have no timer and therefore no other way to leave. v1 gave them
a one-time `translateX` wiggle to teach the drag gesture; **that has been
removed.** The system's motion vocabulary — reveal, hover lift, spin, draw,
sweep, width expansion — is entirely single-direction and settles once. A
back-and-forth shake is an idiom from a different design language, and the
grammar's own "one motion idea, no competing animations" rule puts it out of
bounds.

A sticky toast reads as persistent because **its volume never retracts**. That
is the signal, and it needs nothing added to announce it.

## 4a. Size and measure

Two fixes, both about the pill feeling right in the hand.

**Height dropped from 56px to 48px.** 56px matched the pricing page's sticky
contact pill, but that pill only ever appears alone; this one stacks three
deep, and at 56px the stack read as heavy. 48px is still comfortably above the
44px minimum touch target and keeps the single `--toast-h` token driving
everything else (glyph slot, circle diameter, body vertical centring) — no
other value needed to change.

**One default width, floor not target.** Every toast opens at
`--toast-w-base: 20rem`. `measure()` still finds the content's natural width,
but `.toast.is-open` carries `min-inline-size: min(var(--toast-w-base), 100%)`,
so longer copy pushes past the default and shorter copy never pulls in under
it. A stack should read as one consistent object repeated, not a ragged column
of three different widths, and the message gets the full default measure
whether or not it strictly needs it.

### The floor must never touch the live element

`min-inline-size` does **not** go on `.toast.is-open`, and this is not a style
preference — it silently breaks the enter animation.

Used width is `max(inline-size, min-inline-size)`. `min-inline-size` is not in
the transition list, so the instant `is-open` lands it jumps from `auto` to the
floor and the element is at full width immediately, with the `inline-size`
transition animating invisibly underneath. Removing the class on exit drops the
floor instantly, so the shrink *is* smooth.

**That asymmetry is the diagnostic**: an expansion that snaps while the
matching collapse animates correctly means a non-transitioned property is
winning the used-value calculation. Look for a second property setting the same
dimension before assuming the transition itself is wrong.

The floor lives on the measuring ghost instead, via `.toast-measure`, so
`measure()` returns a value that is already floored and capped. The live
element then animates one property to one number, with nothing competing.

**`measure()`'s ghost must carry `transform: none`.** The base `.toast` is
`scale(0)`, and `getBoundingClientRect()` reports the *scaled* box — without
the override the measurement returns 0. (Under the previous `scale(.9)` base it
was silently returning 90% of the true width, which is now also fixed.)

**Text truncation was firing on ordinary messages.** The rail's desktop cap
was `min(26rem, ...)` — 416px, minus padding, minus the action button and
count badge on any actionable toast — routinely too narrow for a normal
sentence. Raised to `min(var(--toast-rail-w, 30rem), 100vw - 2×gutter)`, a
480px ceiling on desktop. This is a **safety net for pathological length**, not
the primary control — the primary control is still the copy rule in §6 of the
original spec (~48 characters). A message written to that length should not
truncate at the new width; if one does, that's a signal the copy is too long,
not that the cap needs raising again.

`text-overflow: ellipsis` — what produces the `…` — remains as the hard
backstop, but should be rare in practice now.

---

## 5. Pending — before there's a deadline

`Toast.promise()` opens with the fill holding a low, static base
(`rgba(255,255,255,.06)`) plus a moving highlight —
`linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent)`
sliding across on a `1.35s cubic-bezier(.35,0,.25,1)` loop.

This is the skeleton loader's sweep, reused verbatim rather than invented
fresh. The wash holds at full strength, because there is no duration yet to spend.

When the promise settles, `morph()` swaps in a fresh full-area wash in the
outcome's hue and the drain begins from full, on the outcome's duration. The
pill never leaves and comes back — one node for the whole request, same as
before.

---

## 6. Behaviour unchanged from the first revision

These held up and are unchanged:

- **Coalescing** — a repeat with the same `id` doesn't stack; the fill resets
  to full, a tabular `×n` counter appears, one small pulse plays.
- **Three at a time** — a fourth expires the oldest, through the *same* exit a
  timeout uses (§3), because that is exactly what happened to it.
- **The clock pauses** while a human hovers or focuses the rail, and while the
  tab is hidden. It resumes from where it stopped; it never restarts. It
  arms only once the pill has finished growing, so the drain and the entrance
  never run over each other.
- **FLIP on removal** — survivors glide into the vacated slot over 260ms
  rather than jumping.

---

## 7. Why the two exits stay different

> "How it leaves tells you why."

A toast that ran out of time did nothing wrong — it collapses, shows the
outcome, and fades: a small ceremony for something that resolved on its own.
A toast a person dismissed was *acted on* — it flies immediately in the
direction of the gesture, with no ceremony, because the person already knows
what they did.

Collapsing on a manual dismiss would make an intentional action look like a
passive expiry. Flying on a natural timeout would make something automatic
look like it was pushed away. Keep them apart.

---

## 8. Layout and positioning

Still built on `layout.css` tokens only, now with a switchable anchor.

| | Value |
|---|---|
| Stacking | `var(--layout-z-toast)` |
| Gutter | `var(--layout-gutter)` |
| Gap between pills | `var(--layout-space-3)` |
| Radius | `var(--layout-radius-pill)` |
| Rail width, ≥ 700px | `min(30rem, 100vw - 2 × gutter)` |
| Mobile (all positions) | full width between gutters, at the chosen block edge |

### Position is a rail attribute, not a rebuild

```js
Toast.position('top-right');   // 'top-left' | 'top-center' | 'top-right'
                                // 'bottom-left' | 'bottom-center' | 'bottom-right'
```

Sets `data-position` on `#toastRail`. CSS reads the prefix (`top`/`bottom`) for
the block edge and the suffix (`left`/`center`/`right`) for the inline anchor:

```css
#toastRail[data-position^="bottom"]{ inset-block-end: ... }
#toastRail[data-position^="top"]{ inset-block-start: ...; flex-direction: column-reverse }
@media (min-width:700px){
  #toastRail[data-position$="right"]{ inset-inline: auto var(--layout-gutter); align-items: flex-end }
  #toastRail[data-position$="left"]{  inset-inline: var(--layout-gutter) auto; align-items: flex-start }
  #toastRail[data-position$="center"]{ inset-inline: 0; margin-inline: auto; align-items: center }
}
```

**Default is `bottom-right`**, unchanged from revision 2 — nearest the thumb on
mobile, out of a right-handed cursor's way on desktop.

**`top-*` reverses stacking order** (`flex-direction: column-reverse`) so a
newly arriving toast appears nearest the edge it's anchored to, same as
`bottom-*` already did — "newest closest to where it entered" holds regardless
of which edge that is.

**Left/right/center only matter at ≥700px.** Below that, every position spans
the full gutter-to-gutter width — a corner-anchored toast on a 360px screen is
the whole screen with extra steps, so only the block edge (top or bottom)
changes anything there.

**Switching position does not move toasts already on screen.** It only affects
where the next one opens. Position is a property of the rail, not of any
individual pill.

`--toast-lift` still applies on pages with docked bottom chrome (pricing's
contact pill), and only matters for `bottom-*` positions — never move the rail
to a different edge to dodge a collision; lift it instead.

Body padding is `var(--layout-space-3)` at the start (clears the 3px edge
indicator) and `var(--layout-space-4)` at the end.

---

## 9. Accessibility

- Rail: `role="region"`, `aria-label="Notifications"`, `aria-live="polite"`,
  `aria-relevant="additions"`
- `fail` also writes to a separate assertive, visually-hidden region — not
  double-announced by the polite one
- Every toast: `tabindex="0"`; `Delete` / `Backspace` / `Escape` while focused
  dismisses it; a visually-hidden string states this
- Focus is never moved to a toast on open — it would steal it from whatever
  the person was doing
- `:focus-visible` on the pill draws the accent outline. **Never
  `:focus-within`** — that lit the entire pill in accent on every action
  click in the previous revision. A container does not wear its child's focus
  ring; `.toast-act` carries its own.
- `prefers-reduced-motion`: opens at full width immediately, no shrink-glyph
  ceremony on expiry (fades directly), no FLIP, sweep slows rather
  than stops (it is still information — work is still in flight)

---

## 10. API

```js
Toast.note(message, opts)
Toast.done(message, opts)
Toast.fail(message, opts)
Toast.promise(promiseOrFn, { pending, done, fail, id })   // → the promise
Toast.dismiss(id)
Toast.clear()
```

```js
opts = {
  id,                                    // enables coalescing
  duration,                              // ms; overrides the tone default
  sticky,                                // no fill drain, must be dismissed by hand
  action: { label, onClick }             // fill turns accent; return a string to morph in place
}
```

---

## 11. Do not re-add

- ✗ A ring, or any shape concentric with the glyph
- ✗ **A hard-cut trailing edge on the volume** — it must always be feathered,
  and the feather must scale with `--p` so nothing is left at zero
- ✗ Replacing the retraction with a fade, a pulse, or anything that removes the
  volume. The volume is the component.
- ✗ A separate bar, badge or marker for identity — the radius will clip it
- ✗ `--ok` anywhere on the surface — it is a solid `.act` fill and nothing else
- ✗ Any hue that isn't accent or `--err` on the volume
- ✗ Shakes, wiggles, oscillations, or any motion that reverses direction
- ✗ Icon metrics off `.act`'s (15–16px, `stroke-width: 2.4`)
- ✗ Starting the expansion before the icon has finished scaling in
- ✗ Fading the icon out on exit instead of scaling it to 0
- ✗ A transform on `.toast-glyph` — the container already scales on both
  thresholds, and a second scale inside it reads as a wobble
- ✗ Putting the rail's `align-items` inside a media query
- ✗ `min-inline-size` on `.toast.is-open` — it snaps the expansion
- ✗ Any second property setting the pill's width while it animates
- ✗ Adding a colour, motion or measure without grepping the grammar for it first
- ✗ `position: static` on `.toast` in any context
- ✗ A toast narrower than `--toast-w-base`
- ✗ A permanent glyph visible while the toast is open
- ✗ Dropping either signal to resolve a collision — move its channel instead
- ✗ A flat, non-composited `--ok` / `--err` fill
- ✗ Inversion anywhere but the `fail` closing beat
- ✗ A visible × or any second dismiss control alongside the fill
- ✗ `:focus-within` styling on `.toast`
- ✗ Collapse-and-glyph on a manual dismiss, or fly-away on a natural expiry —
  keep the two exits apart
- ✗ Reintroducing the sticky nudge, on any toast
- ✗ More than three on screen
- ✗ Top or centre placement
- ✗ A success toast for work a button started — `.act` owns `success`

---

## 12. Pre-ship checklist

- [ ] Fill hue reflects tone; fill volume reflects time remaining; both on the same layer
- [ ] The volume retracts — it does not fade, pulse or hold still
- [ ] Trailing edge is a feather, never a cut; feather scales with `--p`
- [ ] At `p = 0` nothing remains — no sliver against the rounded cap
- [ ] Base tint keeps the hue readable when the volume is nearly spent
- [ ] No green anywhere on the surface; `--ok` appears only on the `done` exit circle
- [ ] Exit circles match `.act`'s success/error states exactly
- [ ] Volume colours are only neutral-white, accent, or `--err`
- [ ] No motion in the component reverses direction
- [ ] Glyphs are 16px at `stroke-width: 2.4`
- [ ] `--tone-0` is the hue at zero alpha, not the `transparent` keyword
- [ ] `.toast` is `position: relative` in every context, including static specimens
- [ ] Short and long messages open at the same width floor; only long copy exceeds it
- [ ] Every fill colour is composited over ink at a capped alpha — never a flat block
- [ ] Text stays legible against the fill at 100%, 50%, and ~0% remaining
- [ ] Arrival glyph is always the bell, regardless of eventual tone
- [ ] Icon scales 0 → 100; it does not slide, fade up, or start at 90%
- [ ] Expansion begins only after the icon has fully landed
- [ ] The expansion animates smoothly — it does not snap to full width
- [ ] Only `inline-size` sets the pill's width during the transition
- [ ] Expansion direction matches the rail anchor, at phone width too
- [ ] Exit ends with the icon scaling 100 → 0, not fading
- [ ] `measure()`'s ghost carries `transform: none`
- [ ] Natural expiry: shrink → tone-specific glyph → hold → scale to 0, in that order
- [ ] Manual dismiss: immediate fly in the gesture's direction, no shrink, no glyph
- [ ] Fail's closing beat is the only inversion on the component
- [ ] No visible × anywhere; `Delete`/`Backspace`/`Escape` dismiss a focused toast
- [ ] Sticky toasts show a flat, non-retracting volume and no added motion
- [ ] Pending shows the skeleton-style sweep, no area spent, static base
- [ ] Repeat with the same `id` coalesces — fill resets to full, counter ticks, no second pill
- [ ] Fourth toast expires the oldest through the timeout exit, not the dismiss exit
- [ ] Hover, focus and tab-hidden all pause the drain; all resume, none restart
- [ ] Drag past 25% dismisses; under 25% springs back and the drain resumes
- [ ] `:focus-visible`, never `:focus-within`, on the pill
- [ ] Zero bare `z-index` integers; zero hardcoded measures; zero spacing off the ten-step scale
- [ ] `prefers-reduced-motion` → instant open, no shrink-glyph ceremony, slower sweep
- [ ] Checked at 320px, 768px, 1440px and at 200% browser zoom
- [ ] Checked on a landscape phone, roughly 700×360

---

## 13. Open items

- **dota-core**: implementation section not written until the real component
  API is shared, same position as `scroll-hint` and the alert dialog.
- **`--toast-lift` on pricing**: needs setting to the real contact-pill height
  once both ship on the same page.
- **Shared layer**: `#toastRail` and `.toast` should move into `ui.css` with
  the rest of the extracted layer rather than staying inlined per page.
- **Manual-dismiss ceremony**: if a future review decides the collapse-and-
  glyph exit should also apply to swipe/keyboard dismissal, that is a
  deliberate reversal of §7 and should be made explicitly, not slipped in
  while touching something else.
