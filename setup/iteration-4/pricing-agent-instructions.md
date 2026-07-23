# Build Instructions — "Work with me" Page for ayush.dev (Speaking + Building)

You are extending Ayush's Apple-inspired site with a **services / pricing page**. Same design language as the portfolio and blog specs: paper white, ink gray, one persimmon accent, system SF typography, hairline borders, scroll-driven motion. **But this page's job is conversion** — every section funnels toward one action: a client contacting Ayush. It is not a price list; it is a page that sells the *person* and the *outcome*, and makes price feel like the natural next step rather than the point.

Reuse the exact tokens from the portfolio build:

```css
--paper:#FAFAF8; --ink:#1D1D1F; --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
```

Stack: Tailwind v3+, vanilla JS, regular CSS. No animation libraries. Native scroll only, same as the other pages.

---

## 0. The one job

A visitor should leave having contacted Ayush — or at minimum knowing they *could*, cheaply, with one message. Everything is subordinate to that. When a design choice trades "looks impressive" against "lowers the friction to reach out," friction wins. The page is a funnel, not a brochure.

Three conversion mechanics carry the page. Do not drop any of them:
1. **A live estimator** — the visitor self-selects into a price range, so the number feels earned, not quoted at them.
2. **Price anchoring** — a single "most picked" tier per section carries the accent and sets the reference point.
3. **An always-available, low-friction contact path** — a sticky pill plus a bottom "just tell me the problem" escape hatch, so nobody who wants to reach out has to hunt for how.

## 1. Page structure (in order)

The order is deliberate — offer, then price; repeated for each service. Never lead a section with a number.

```
<nav>              shared, fixed, hairline appears after 40px scroll
#hero              compact pin (150vh) — headline scale/fades on scroll; primary CTA + estimator CTA
[service switch]   segmented toggle: "A build" / "A talk" — jumps to that section
#build             BUILDING offering — six numbered value rows (what you get, not job size)
#estimate          the live estimator (the signature element)
[building pricing] three tiers, middle = "Most picked"
#speak             SPEAKING offering — three formats + topic chips
[speaking pricing] three tiers, middle = "Most booked"
[faq]              four objection-handling questions (accordion)
#contact           oversized "just tell me the problem" CTA
<footer>           shared, one line
[sticky pill]      fixed contact pill, appears on scroll (see §6)
```

Note the ordering matches the brief exactly: **hero + CTA → building offer → building price → speaking offer → speaking price**. If Ayush ever reorders to put speaking first, keep the offer-before-price rule within each service.

## 2. Hero (compact pin)

- Wrapper `150vh`, sticky stage, same scale/fade-out engine as the portfolio hero (`opacity: 1 - p*1.4`, `scale(1 - p*0.1) translateY(p*-30px)`).
- Eyebrow: `SPEAKING · BUILDING`.
- Headline (display scale): two honest lines — e.g. `Backends that hold.` / `Talks that land.` — with the last word (`land.`) in `--accent`.
- Sub: one sentence positioning him as someone who *runs* the thing, not a vendor. ("I ship production infrastructure solo and talk about how it's really done — no folklore, no slideware.")
- Two buttons: **filled accent** `Start a conversation` (→ `#contact`), **ghost** `Estimate a build` (→ `#estimate`).
- Trust line under the buttons: `Usually replies within a day · IST (UTC+5:30) · open worldwide`. This microcopy does real work — it removes the "will I even hear back" hesitation.

## 3. The service switch (segmented toggle)

Directly under the hero, a pill-shaped segmented control: **A build** / **A talk**, with an animated ink "thumb" that slides and resizes to the active option (measure `offsetLeft`/`offsetWidth`, translate the thumb). Clicking scrolls to `#build` or `#speak`. Above it an eyebrow: `What are you here for?`; below it a one-line hint that swaps per selection.

This is orientation, not a hard filter — both sections stay on the page. It just lets a visitor who knows what they want skip straight there. Keyboard-operable, `role="tablist"`, `aria-selected` maintained.

## 4. Offering sections (sell before pricing)

### 4.1 Building offering (`#build`)
- Eyebrow `Building`, title that promises relief ("A backend you won't have to babysit."), one paragraph of positioning grounded in the Sacrena story (sole engineer, owns APIs/data/infra/the 3am pages).
- **Six numbered value rows** in a two-column grid. Numbering is legitimate here — it reads as a checklist of what's covered, not decoration. Each row: `NN` in accent, a bold outcome heading, one soft sentence.
- **Copy discipline — this is where "greedy" creeps in.** Name each value by *what the client gets*, never by *how big the job is for Ayush*. "Designed to be handed off," "Infra that scales quietly," "Operated, not just delivered" — outcomes. Avoid framing that reads as upsell.
- Suggested six: hand-off-ready design · infra that scales · operated not just delivered · security taken seriously · AI where it earns its place · full product when needed. Pull the specifics from Ayush's real skill list (Kotlin/Spring, AWS, Postgres/Redis, Spring AI/LangChain, Nuxt/Angular/dota).

### 4.2 Speaking offering (`#speak`)
- Sits on a hairline-topped section. Eyebrow `Speaking`, title ("Talks from someone who runs the thing."), positioning paragraph: every talk comes from a system he's operated, audience leaves with something usable Monday.
- **Three formats** as light column blocks (no borders, no numbers — this isn't a sequence): Conference talks · Team workshops · Podcasts & panels. One sentence each.
- **Topic chips** row using the standard tint chip: distributed systems, Redis in production, AWS for small teams, backend-solo survival, rate limiting, AI in real systems. Labels only — never a color per topic (breaks the one-accent rule, same as the blog's category rule).

## 5. Pricing (the tiers)

Two tier groups, identical structure, one per service. Cards on white, 24px radius, hairline border, hover lifts 4px.

**Anchoring is the whole point of the layout.** The **middle tier** in each group is the featured one: accent border + `box-shadow: 0 0 0 1px var(--accent)` + a small accent flag (`Most picked` for building, `Most booked` for speaking) pinned to its top edge, and its CTA is the **filled accent** button. The outer two get ghost buttons. Eyes land on the middle; it becomes the reference price.

Each card: eyebrow (tier name) · price (with a `<small>` range or `/mo` suffix) · one-line positioning · a checklist (`<ul>` with small accent check SVGs, 3–4 items) · a CTA button pinned to the bottom (`margin-top:auto` so cards align).

**Building tiers** (placeholder numbers — Ayush replaces):
1. *Focused build* — `$3k–$6k` — one defined thing, fixed scope, 2–4 weeks. Ghost CTA `Scope it with me`.
2. *Product partner* — `$6k–$15k` — **featured** — full backend + AWS + ops handbook + optional frontend, milestone billing. Accent CTA `Start a conversation`.
3. *On retainer* — `from $2k/mo` — ongoing features + priority response + reserved capacity + cancel anytime. Ghost CTA `Talk retainer`.

**Speaking tiers** (placeholder):
1. *Podcast / panel* — `Free–$500` — remote guest, prep call, free for community shows. Ghost CTA `Invite me on`.
2. *Conference talk* — `$1.5k–$4k` — **featured** — tailored 30–45 min, slides+repo shared, in person or remote, travel at cost. Accent CTA `Check my availability`.
3. *Team workshop* — `$2k–$6k` — half/full day, exercises they keep, follow-up Q&A. Ghost CTA `Plan a session`.

Under each group, one soft line reinforcing flexibility: ranges are starting points; equity / non-profit / community arrangements welcome — "just ask." This keeps a budget-shy visitor in the funnel instead of bouncing.

**Tone:** these are approachable numbers, not a ladder. The lowest realistic entry point should feel reachable; nothing should read as grasping. If the numbers make you wince, they're too high.

## 6. The signature element — the live estimator (`#estimate`)

This is what a modern pricing page has that a price list doesn't: the visitor *builds their own quote* and watches the number respond. It makes price feel reasoned and fair, and it's the single strongest converter on the page. Give it weight — it must not look like a tip calculator.

### 6.1 Interaction model — two questions, no form
- **No inputs, no email gate.** Just two rows of large, tappable choice cards.
- **Q1 "What do you need built?"** — four cards in client-recognizable terms, each with an icon, a bold label, and a plain sub-label describing the *outcome*:
  - An API or service · A whole product · Cloud setup · An AI feature
  - Each carries a `data-base` price and a `data-desc` sentence.
- **Q2 "Where are you right now?"** — three cards describing the client's *situation*, not Ayush's effort:
  - Just an idea (mult ~0.7) · Building it now (mult 1.0) · Already live (mult ~1.45)
- Selected cards get accent border + tint background + a filled accent radio-check (top-right). Numbered step badges (`1`, `2`) precede each question.

**Do not** use an abstract "small / standard / involved" slider. It means nothing to a client and reads as an effort-tier upsell. The two questions above are about *the client's own situation*, which is what makes the result feel like it's about them.

### 6.2 The result panel — make it the hero of the section
- A **full-width dark panel** (`background: var(--ink)`, white text, 26px radius) — the one place on the page that inverts. This visual weight is what justifies a four-figure number.
- Large tabular-numeral figure (`clamp(2.6rem, 7vw, 4.4rem)`): `$low – $high`. It **flashes** (brief opacity dip + slight translate) on recalculation so changes register.
- A soft sub-line composed from the selections ("A backend that does one job well — for a tight first version to prove it works").
- **A breakdown row**: small pills echoing the choices (`Building: An API or service`, `Stage: Just an idea`). Showing the math is what makes the range feel *fair* rather than plucked from air.
- CTA `Get an exact quote →` (accent) + reassurance microcopy: "A ballpark, not a bill. The real number comes from a 20-minute call — and it's often less than you'd guess." That last clause matters — it counters sticker shock and keeps them moving to contact.

### 6.3 Math
`low = base × stageMult`, `high = low × 1.5`, rounded to the nearest 100. Keep bases so the entry point (idea-stage API) lands around a reachable low-thousands figure and nothing balloons past the top building tier. The estimator ranges must stay coherent with the tier cards below — a visitor will cross-check them.

## 7. Objection-handling FAQ

Four `<details>` accordions (custom summary, no default marker, an accent `+` that rotates to `×` when open). Each answers a real hesitation, not a feature question:
- "Are these prices final?" → no, honest starting points; the call gets you exact.
- "Can I hire you for both a talk and a build?" → yes, combined rate.
- "What if my budget is smaller?" → real flexibility; equity/non-profit/community.
- "Do I keep the code and infrastructure?" → always; your account, your docs, built to hand off.

The point of this section is to remove the last few reasons someone talks themselves out of reaching out.

## 8. Contact section (`#contact`)

The escape hatch, and the emotional close. Display-size headline: `Not sure which? Just tell me the problem.` (`problem` in accent). Sub: one message, one honest reply — a quote, a talk slot, or "here's who you actually need." No sales dance.

Buttons: filled accent `Email me` (`mailto:` with a prefilled subject), ghost `Book a 20-min call`. Trust line repeated: replies within a day · GitHub · LinkedIn · IST.

This framing is deliberate: a visitor who fits **no** tier still has a reason to contact ("just tell me the problem"), which is exactly the person a rigid pricing page loses.

## 9. The sticky contact pill (§signature motion)

A fixed pill, bottom-center, that keeps "get in touch" one tap away without nagging. Its entrance is a small orchestrated moment — get it right, it's the page's memorable micro-interaction.

### 9.1 Behaviour
- **Hidden** by default (collapsed to icon size, `opacity:0`, `scale(.5)`, `pointer-events:none`).
- **Appears early** — trigger once `scrollY > innerHeight * 0.55` (roughly half a screen of scroll). Earlier than instinct suggests; a late-appearing pill feels broken.
- **Hides** again when `#contact` enters view (no point offering "get in touch" when they're already there), and re-appears if they scroll back up.

### 9.2 The animation (three phases)
The pill is centered with `left:50%; translate(-50%,0)`, so animating its **width** makes it grow/shrink **symmetrically in both directions**. Base state has a defined collapsed width (= icon size) so there is always something to transition *from*.

1. **Enter as an icon.** Pop in as a small circular ink puck (~56px) showing only a mail glyph. Let it paint (~180ms).
2. **Expand horizontally, both ways.** Add the `open` state: width animates to fit the content, revealing label + button. The mail **icon is entry/exit-only — it fades out as the pill expands** (`#stickybar.open .sb-icon{opacity:0}`); the expanded pill shows label + button with no leading icon. The body fades/slides in with a small delay so it appears *after* the width starts opening.
3. **Collapse to an icon, then disappear.** On leave, remove `open` → the pill shrinks back to the icon puck (icon fades back in), holds ~360ms, then the icon class is removed and it fades out. Never jump straight from wide to gone.

Implement as a small state machine (`hidden → icon → open` and reverse) driven from the scroll handler, with `setTimeout`s for the inter-phase holds. Measure the expanded width at runtime from the body's `scrollWidth` (+ a little), capped to `min(560px, viewport - 24px)`, and store it in a `--sb-w` custom property — so changing the label text auto-fits with no hardcoded width.

### 9.3 Responsiveness
- Width is always capped to the viewport; it can never overflow.
- At `≤520px` the **label drops away** (`display:none`) — the expanded pill becomes just the mail glyph + `Get in touch` button, which fits comfortably even at 320px.
- Under `prefers-reduced-motion`: no choreography — the pill simply fades in/out at full size, no icon/expand phases.

## 10. Motion rules (whole page)
- Hero: the only pin — same scale/fade engine as the other pages.
- Segmented-toggle thumb: slides/resizes to the active tab.
- Estimator: result figure flashes on recalc; selection cards have hover-lift + selected states.
- Everything else: one-shot IntersectionObserver reveals (opacity + 24px rise, ~55ms stagger), `threshold: 0.12`, unobserve after firing.
- Sticky pill: the three-phase sequence above.
- Only animate `transform`, `opacity`, and the pill's `width`. Read layout before writing (no thrash).

## 11. Accessibility & performance (non-negotiable, matches the other pages)
- `prefers-reduced-motion`: hero static, reveals instant, estimator still fully usable (values show immediately), pill fades without choreography, toggle still switches.
- All controls keyboard reachable with a visible `:focus-visible` ring (2px accent) — the estimator cards, toggle, accordions, and pill button especially.
- Semantic landmarks: `<nav> <main> <section aria-labelledby> <footer>`; the estimator questions are real labelled groups; tier cards use headings.
- Responsive to 320px: nav collapses to logo + one link on narrow screens; pick grids, tiers, and the estimator result all go single-column; the dark result panel restacks with a full-width CTA.
- Lighthouse targets: performance ≥ 95, a11y ≥ 95. No layout shift — reserve heights, size any icons.

## 12. Content swap points (keep together for easy editing)
Everything Ayush replaces: hero headline/sub + trust line · six building value rows · building tier names/prices/bullets/CTAs · estimator base prices + stage multipliers + option copy · speaking formats + topic chips · speaking tier names/prices/bullets/CTAs · four FAQ Q&As · contact email + prefilled subject + resume/call links + socials. Keep prices in obvious, adjacent slots — they are the thing most likely to change.

## 13. Integration note (dota)
When this moves from the demo into the dota stack: the estimator, the tier card, and the sticky pill are the natural components. Keep the estimator's data model (option → `{base}`, stage → `{mult}`, `low/high` derivation) unchanged so the render layer can swap freely. The pill's width-measurement approach stays the same — it's framework-agnostic.

## 14. Acceptance checklist
- [ ] Page reads offer-before-price in both services; no section opens on a number
- [ ] Estimator works with zero typing, updates live, and shows its own breakdown
- [ ] Estimator ranges stay coherent with the tier cards below them
- [ ] Estimator entry point feels reachable; nothing reads as greedy or upsell-y
- [ ] One featured tier per group carries the accent and sets the anchor
- [ ] Sticky pill: enters as icon → expands both directions → collapses to icon → disappears
- [ ] Pill icon is entry/exit-only (gone once expanded); pill appears by ~0.55 viewport scroll
- [ ] Pill never overflows; label drops on small screens; fits at 320px
- [ ] FAQ answers real objections; contact section gives a reason to reach out even with no tier fit
- [ ] Orange appears only in: hero accent word, one CTA/featured tier per group, chips, estimator selections + figure, checklist ticks, pill button, progress/hover accents
- [ ] Reduced motion: fully usable, zero choreography, estimator values immediate
- [ ] Lighthouse: performance ≥ 95, a11y ≥ 95; responsive to 320px
