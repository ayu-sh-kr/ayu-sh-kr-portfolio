# Build Instructions — Support Section for ayush.dev (Answers-First, Then a Ticket)

You are adding a **support section** to Ayush's Apple-inspired site. Same design language as the portfolio,
blog, and pricing specs: paper white, ink gray, one persimmon accent, system SF typography, hairline
borders, scroll-driven motion. **But this section's job is deflection-with-warmth** — most people arriving
at "support" have a problem that's faster to answer than to file, so the section leads with answers and
treats the contact form as the escape hatch, not the entrance. It must never feel like a wall of form
fields, and it must never feel cold.

Reuse the exact tokens from the portfolio build:

```css
--paper:#FAFAF8; --ink:#1D1D1F; --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
```

Stack: Tailwind v3+, vanilla JS, regular CSS. No animation libraries. Native scroll only, same as the
other pages. This is an **evolution of interactions already on the site** — the estimator's pick cards,
the speaking topic cards' pointer-light, the pricing FAQ accordions, the sticky pill's state machine. Do
not invent a new interaction vocabulary; extend the existing one.

---

## 0. The one job

A visitor should leave either **answered** or **in contact** — and should reach whichever they need without
friction. The section is a funnel with two exits: "you just solved it yourself" and "a real message reached
a real person." Every choice serves getting them to one of those two exits, warmly.

Three mechanics carry the section. Do not drop any:
1. **Answers before the form** — quick-help routes that resolve common problems inline, so the form is the
   fallback, not the first thing seen.
2. **A quiet, deliberate handoff to the form** — the form is present but not shoved forward; reaching it is
   one obvious click for anyone who needs it.
3. **A form that feels like a conversation, not a ticket queue** — human copy, one standout micro-interaction
   (the file drop), and a calm confirmation instead of a dead "submitted" state.

---

## 1. Section structure (in order)

The order is deliberate — *welcome, then answers, then (quietly) the form*. Never open on form fields.

```
#support                     max-width ~56rem, generous vertical padding
  opener                     eyebrow + warm headline (accent word) + one-paragraph invitation
  routes                     3 quick-help cards (tappable, pick-card grammar)
  answer                     inline panel that unfurls under the routes for the picked route
  handoff                    two hairlines + "None of these — I need a person →"
  ticket (form)              revealed on handoff click: name, email, topic pills, details, file drop
    success                  swaps in on submit — calm confirmation, "send another"
```

There is **no sticky pill** in this section (the pricing page owns that motion; don't duplicate it). If the
support section lives on its own page, the shared nav still applies.

---

## 2. Opener (welcoming, answers-first)

- Eyebrow: `SUPPORT`.
- Headline (title scale, one word in `--accent`): e.g. `Stuck on something? Let's unstick it.` with
  `unstick` in accent. Keep it human and a little warm — this is the first thing a frustrated person reads.
- One paragraph that does real work: sets the expectation that most things are faster than a ticket, and
  promises a real person if not. Something like: "Most things move faster than a ticket does. Tell me what
  kind of snag it is — there's a good chance the answer's already here. And if it isn't, a real message
  reaches a real person."
- The opener carries a `.reveal` (opacity + 24px rise, matching the site's IO reveal).

**Tone rule:** never scold, never sell. This person may be mid-outage. The copy's job is to lower their
blood pressure and point them at the fastest exit.

---

## 3. Quick-help routes (the deflection layer)

Three tappable cards in a responsive grid (`repeat(auto-fit, minmax(220px, 1fr))`). These are an
**evolution of the estimator's `.pick` cards**: same tap-to-select, same accent-selected state, plus the
**pointer-following light** from the speaking topic cards. The difference: selecting a route doesn't feed a
calculator — it **unfurls an answer inline** below the row.

Routes (labels are about the *visitor's situation*, not internal categories):
- **Something's down** — "An API, a job, a deploy misbehaving"
- **How do I…?** — "Using a thing I built, or configuring it"
- **Billing or access** — "Invoices, handover, account questions"

Each card: an icon, a bold label, a soft sub-label, and a chevron that rotates 90° when open. Selected
card gets accent border + `--tint` background + `box-shadow: 0 0 0 1px var(--accent)`. Only one open at a
time; clicking an open card closes it.

**Interaction details:**
- Pointer-light: `radial-gradient` at `--mx/--my` set from `pointermove`, `opacity` up on hover. Lifted
  directly from `.topic::before` in the speaking section — reuse it verbatim.
- Cards are real `<button>`s with `aria-expanded` / `aria-controls` pointing at the answer region.
- Keyboard operable; visible 2px accent `:focus-visible` ring.

### 3.1 The inline answer panel

One shared panel below the routes, `aria-live="polite"`, that animates open via `max-height` +
`opacity` + `translateY` (matching the pricing FAQ's unfurl feel). Its contents are swapped per route by
JS. Each answer is: a short bold heading, one or two sentences of plain-language help, and a **mini-FAQ**
of 2 `<details>` accordions reusing the pricing page's accordion styling (custom summary, accent `+` that
rotates to `×`).

Answer content should genuinely resolve the common case and, where relevant, point to the real fix:
- *Something's down* → tell them to email with `URGENT` in the subject for anything live-affecting, and
  what to check first (alarms, health check, AWS status).
- *How do I…?* → point at the handover docs / repo `/docs`, distinguish "how-to" (support) from "add a
  feature" (retainer/build).
- *Billing or access* → invoices come direct, they keep everything (code, AWS account, docs), how to get a
  past invoice or transfer the account.

The answers should read in Ayush's voice and stay honest — if the real answer is "that's a valid reason to
message me," say so. Deflection with integrity, not a runaround.

---

## 4. The handoff to the form (quiet, deliberate)

Between the answers and the form, a single row: two hairline rules with a text button centered between
them — `None of these — I need a person →`. This is the emotional pivot from self-serve to human contact,
so give it space and make it unmissable without making it loud.

- The arrow (`→`) is in `--accent-deep` and slides 3px right on hover.
- Clicking toggles the form open (and the label flips to `Hide the form`), sets `aria-expanded`, then
  smooth-scrolls the form into view and focuses the first field.
- The form is **collapsed by default** (`max-height:0; opacity:0`) and expands on this click — so a first-
  time visitor sees answers, and only someone who wants the form summons it. Anyone who just wants the form
  is one obvious click away; it is never hidden, only deferred.

---

## 5. The form (a conversation, not a queue)

Revealed panel, white card, 24px radius, hairline border. A small header sets the tone: a heading like
`Tell me what's going on.` and a sub-line that lowers the bar — "Enough detail to picture it beats a
perfect bug report. I'll reply from an actual inbox." A `Usually within a day` chip sits top-right.

Fields, in order:
- **Name** and **Email** in a two-column grid (single column under ~560px). Email label carries a soft
  `— so I can reply`.
- **Topic** — a row of single-select pills (`An outage · A bug · A how-to · Billing · Something else`)
  using the **ink-thumb selected state** from the pricing segmented toggle (selected = filled `--ink`,
  white text). Optional; clicking a selected pill deselects.
- **The details** — a textarea with a human placeholder that tells them what actually helps ("What you
  expected, what happened instead, and when it started. Paste any error text — it helps more than you'd
  think.").
- **File drop** — see §6. Labeled optional: `Screenshots or logs — optional, but they speed things up`.

Footer: a reassurance line (`No account needed. I read every one myself — no queue, no bot triage.`) on the
left, the accent submit button (`Send it over`) on the right, wrapping on small screens.

**Copy discipline:** every label and message is interface voice — plain, active, never apologetic. Optional
fields say so. Placeholders show what to write, never repeat the label.

---

## 6. The signature micro-interaction — the file drop

This is the section's one standout moment; give it weight. A dashed-border drop zone that:
- Shows an up-arrow-into-tray icon, a `Drop files here, or browse` line (with `browse` in accent), and a
  constraint line (`Images, logs, or a short screen recording · up to 10 MB each`).
- Carries the **same pointer-following light** as the route cards (consistency of vocabulary).
- On drag-over: border goes accent, background tints, the whole zone scales up ~1%, and the icon lifts 4px.
  Uses `dragenter/dragover/dragleave/drop` with a guard so child elements don't flicker the state.
- A transparent `<input type=file multiple>` fills the zone so click-to-browse works; the zone is also
  `tabindex=0`, `role=button`, and opens the picker on Enter/Space.
- Added files appear as **chips that pop in** (`popIn` keyframe: fade + slight rise + scale) showing a file
  icon, name (ellipsized), size (formatted B/KB/MB), and a remove `×`. Cap at ~6 files, skip anything over
  10 MB silently.

The drop zone is where the section earns "not a regular support form." Everything else can be calm; this
is the flourish.

---

## 7. Submit → confirmation (no dead ends)

On submit, validate gently in-JS: required name, valid email, non-empty details. Invalid fields flash their
border to accent for ~1.6s (never a harsh red block) and focus moves to the first offender — no scolding
copy. On success, the form's inner content is replaced (not navigated away) with a **calm confirmation**:
- A tinted circle with an accent check (pops in), a heading like `Got it — it's on my desk.`, and a sub-line
  that **echoes back the email** they'll hear from ("I'll get back to you within a day, usually sooner — at
  {email}.").
- A ghost `Send another` button that resets everything (fields, files, topic, pills) and returns to the
  form.

The confirmation matters: a support flow that ends in a grey "submitted successfully" undoes all the warmth.
End on a human note.

---

## 8. Motion rules for the section

- Section reveals: one-shot IO (`opacity` + 24px rise, ~55ms stagger, `threshold: 0.12`), reusing the
  site's existing observer pattern — do not add a second observer if integrating into an existing page.
- Route cards + drop zone: pointer-following light (reused from the speaking topic cards).
- Answer panel + form: `max-height`/`opacity` unfurl, matching the FAQ accordion timing.
- File chips: `popIn` on add.
- Only animate `transform`, `opacity`, `max-height`, and border/background colors. Read layout before
  writing.
- `prefers-reduced-motion`: reveals instant, no pointer-light, panels open without transition, chips don't
  animate, drag state still changes color (informational). The section stays fully usable with zero
  choreography.

---

## 9. Accessibility & performance (non-negotiable, matches the other pages)

- Semantic landmarks: `<section aria-labelledby>`; routes are a labelled `role="group"`; the answer panel is
  `aria-live="polite"`; the form is a real `<form novalidate>` with associated `<label>`s.
- Route buttons carry `aria-expanded`/`aria-controls`; the handoff button and form-toggle maintain
  `aria-expanded`; the drop zone is keyboard-operable with a visible focus ring.
- Every control keyboard-reachable with a 2px accent `:focus-visible` ring.
- Responsive to 320px: routes and the name/email grid collapse to single column; the form padding tightens;
  nothing overflows.
- No layout shift: reserve the answer/form heights via the `max-height` transition rather than injecting
  unmeasured content. Size all icons.
- Lighthouse targets: performance ≥ 95, a11y ≥ 95.

---

## 10. Wiring (what's left as placeholder)

The demo front-ends nothing on purpose — before shipping:
- **Submit** must POST to an email service or endpoint (or fall back to a `mailto:` with a prefilled
  subject/body assembled from the fields). The success state currently fires on client validation only.
- **File uploads** are held client-side; they need a real upload target (presigned S3, a form backend, or
  attachment via the email service). Enforce the 10 MB / type limits server-side too.
- The email address (`hello@ayush.dev`) and any doc/repo links in the answers are placeholders to confirm.

Keep these swap points together and obvious, as with the pricing page's content-swap block.

---

## 11. Integration note (dota)

When this moves into the dota stack: the **route card**, the **answer panel**, the **topic pills**, and the
**file drop** are the natural components. If the input component group (`base-input` + `ax-*`) exists by
then, the name/email/details/file fields should be rebuilt on it so the form inherits the seed-once /
report-up / no-write-back contract; the topic pills become `ax-pills` and the drop becomes `ax-file`. Keep
the section's own logic (which route is open, form revealed/collapsed, success state) as the parent
controller — it reads field values via the collector, never writes them back.

---

## 12. Acceptance checklist

- [ ] Section opens on a warm headline + invitation, never on form fields
- [ ] Three quick-help routes tap to open, show a pointer-light, and unfurl a real answer inline
- [ ] Only one route open at a time; answers carry a working mini-FAQ accordion
- [ ] The form is collapsed by default and revealed by an unmissable but quiet handoff ("I need a person")
- [ ] Anyone who wants the form reaches it in one obvious click; anyone who doesn't never has it pushed at them
- [ ] File drop: drag-over changes state, click/keyboard both open the picker, files pop in as removable chips with size + type limits
- [ ] Submit validates gently (accent flash, focus first offender — no scolding) and ends on a calm, human confirmation that echoes the reply address
- [ ] "Send another" fully resets the form
- [ ] Orange appears only in: headline accent word, one open route, chips, drop-zone light + accent state, the single submit button, hovers
- [ ] Reduced motion: fully usable, zero choreography
- [ ] Lighthouse: performance ≥ 95, a11y ≥ 95; responsive to 320px
- [ ] Submit + file upload wired to a real backend before publishing
```
