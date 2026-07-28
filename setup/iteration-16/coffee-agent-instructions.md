# Build Instructions — "Buy Me a Coffee" Page for ayush.dev

You are extending Ayush's Apple-inspired site with a **support/tip page**. Same design language as the portfolio, blog, and pricing builds: paper white, ink gray, one persimmon accent, system SF typography, hairline borders, scroll-driven motion. **This page's job is a single small conversion** — get a visitor to complete one coffee order — so it stays light, quick, and a little charming rather than trying to sell anything.

Reuse the exact tokens from the other builds:

```css
--paper:#FAFAF8; --ink:#1D1D1F; --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
```

Stack: Tailwind v3+, vanilla JS, regular CSS. No animation libraries. Native scroll only, same as the other pages.

---

## 0. The one job

A visitor lands, understands why this exists in one sentence, and completes a coffee order in two taps. It is not a donation essay and not a subscription pitch — it's small, quick, and low-friction. Nothing on the page should require more effort than the coffee itself is worth.

## 1. Page structure (in order)

```
<nav>              shared, fixed, hairline appears after 40px scroll
#hero              compact pin (140vh) — headline scale/fades on scroll
#order             the signature element: pick a size, pick a quantity, see the cup fill, checkout
#impact            three quiet reasons this matters (no numbering — not a sequence)
[supporters]       recent-supporters wall + running total
[closing cta]      tinted invite card, one button back to #order
<footer>           shared, one line
[sticky pill]      fixed "buy a coffee" pill, appears on scroll, hides inside #order
```

## 2. Hero (compact pin)

- Wrapper `140vh`, sticky stage, same scale/fade-out engine as the other pages (`opacity: 1 - p*1.4`, `scale(1 - p*0.1) translateY(p*-30px)`).
- Eyebrow: `SUPPORT THE WORK`.
- Headline (display scale): `This runs on caffeine.` / `Not VC money.` — `caffeine.` in `--accent`.
- Sub: one sentence tying it to the real work — dota, the blog, the talks — one engineer and a coffee habit.
- Two buttons: **filled accent** `Buy a coffee ↓` (→ `#order`), **ghost** `See what it funds` (→ `#impact`).
- Trust line under the buttons: `One-time · no account needed · goes straight to Ayush`.

## 3. The order flow (`#order`) — the signature element

This is the whole page. Two short steps, a live visual, then checkout. No form-first, no email gate before the visitor even sees a price.

### 3.1 Step 1 — pick a size
Three pick cards (same `.pick` component as the pricing page's estimator): **Espresso $3**, **Latte $5** (featured, flagged `Most picked`), **Cold Brew $10**. Each card: price + name, one soft sub-line describing the gesture ("A quick nod of thanks" / "Standard-issue gratitude" / "For when it really helped"), selected state = accent border + tint background + filled check mark top-right.

### 3.2 Step 2 — pick a quantity
Four buttons: `×1 · ×3 · ×5 · Custom`. Custom reveals an inline number input (min 1). Keep this a single row of equal-weight buttons, not a slider — a slider implies a continuous effort scale that doesn't apply to "how many coffees."

### 3.3 The cup — signature visual
An SVG coffee cup sits between the picks and the totals. Its liquid fill (a clipped `<rect>`) rises with the order total (capped visually around a $60 "full cup"), and three CSS steam wisps above it fade in and animate faster/heavier as the total grows (driven by a `--heat` custom property, 0.25–1). This is the one moment of delight on the page — keep everything else calm around it.
- `prefers-reduced-motion`: steam holds a static low opacity, no waft animation; the fill level still updates instantly.

### 3.4 Totals — dark panel (numbers only)
A single dark panel (`background: var(--ink)`, white text, 26px radius) shows:
- Eyebrow `Your total`, a large tabular-numeral figure (`$5.00`), a one-line description built from the selections.
- A breakdown row of small pills (`Size: Latte`, `Qty: ×1`) — same pill component as the pricing page's estimator breakdown. This is numbers and math only. **Do not put form inputs inside this panel** — that was an earlier mistake. Translucent inputs on a dark background read as a mess; keep this panel purely informational.

### 3.5 Details card — separate white card
Directly below the dark panel, a plain white card (hairline border, 22px radius) holds the human inputs:
- `Your name (optional)` — a single-line pill input, exactly the input styling used in the blog's subscribe strip (`border:1px solid var(--hairline); border-radius:999px; background:#fff`).
- `Leave a note (optional)` — a textarea with the same border/background but a 16px radius (pill radius doesn't work for multi-line fields).
- Both use `--accent` as the focus border color, never a dark/translucent treatment.

### 3.6 CTA row
Below the details card, in the page's normal light background (not inside any card): the accent `Complete order →` button, plus one line of reassurance microcopy (`Demo checkout — wire up Stripe, Razorpay, or UPI here. No card charged.`). Keep this row light — it's a call to action, not a form field, so it doesn't belong inside the white card either.

### 3.7 Thank-you state
On submit, swap the details card + CTA row for a confirmation card using the **same white-card grammar** (hairline border, 22px radius) — not a dark or differently-styled component. Contents: a small accent checkmark badge, `Thanks — truly.`, one line naming what was ordered, and a ghost `Buy another` button that resets the form and swaps the views back.

**Rule of thumb for this whole section:** dark panel = numbers, white card = human input, plain row = call to action. Don't mix input fields into the dark panel again.

## 4. Impact section (`#impact`)

Eyebrow `Where it goes`, title `Not a tip jar. A tank of gas.` Three **light column blocks** — no numbers, no borders (this isn't a sequence, so don't number it): small icon, bold outcome heading, one soft sentence. Suggested three: keeps dota open source · funds the experiments · buys the coffee (literally).

## 5. Supporters wall

A hairline-divided list (same row grammar as the blog's post list): initial avatar, name, optional one-line note, an amount chip, a relative timestamp. Include a couple of "Anonymous" entries so the wall doesn't feel curated. One small line above it states a running total (`142 coffees · $687 raised so far`) — a single stat line, not a stat grid.

## 6. Closing CTA

Reuse the `.invite` tinted card pattern from the other pages: short heading, one reassuring line, one accent button back to `#order`.

## 7. Sticky contact pill

Same three-phase width-animated pill as the pricing page (`hidden → icon → open` and reverse), coffee-cup icon instead of a mail glyph, label `☕ Enjoying this?` + `Buy a coffee` button. Appears once scrolled past roughly half the hero, hides while `#order` itself is in view (no point suggesting "buy a coffee" when they're already looking at the order form). Same centered, width-animates-both-ways mechanic; same mobile behavior (label drops at ≤520px).

## 8. Motion rules

- Hero: the only pin — same scale/fade engine as the other pages.
- Cup fill + steam: the one signature, continuously-live visual; everything else is one-shot.
- Pick cards / quantity buttons: hover-lift + selected state only.
- Totals figure flashes briefly on recalculation (same pattern as the pricing estimator).
- Everything else: one-shot IntersectionObserver reveals (opacity + 24px rise, ~55ms stagger).
- Sticky pill: the three-phase sequence from the pricing page.
- Only animate `transform`, `opacity`, and the pill's `width`/the cup's fill height.

## 9. Accessibility & performance

- `prefers-reduced-motion`: hero static, reveals instant, steam static (no waft), pill fades without choreography, cup fill still updates.
- All controls keyboard reachable with a visible `:focus-visible` ring (2px accent) — pick cards, quantity buttons, custom-quantity input, name/note fields, and the pill button.
- Semantic landmarks: `<nav> <main> <section aria-labelledby> <footer>`; the cup SVG is `aria-hidden`; the breakdown pills are decorative (`aria-hidden`) since the figure + sub-line already state the same information in text.
- Responsive to 320px: pick grid and quantity grid collapse to single column, dark totals panel restacks, details card fields stay full-width, sticky pill drops its label.
- Lighthouse targets: performance ≥ 95, a11y ≥ 95.

## 10. Content swap points

Coffee size names/prices/sub-lines · cup fill cap (`CUP_MAX`) · impact section's three items · supporter wall entries + running total line · closing CTA copy · footer line · the checkout button's actual destination (currently a demo confirmation — swap in a real Stripe/Razorpay/UPI checkout link or embed).

## 11. Acceptance checklist

- [ ] Order completes in two taps before any typing is required
- [ ] Cup fill and steam respond live to size × quantity, capped sensibly, and freeze correctly under reduced motion
- [ ] Dark totals panel contains **only** numbers/breakdown pills — no form inputs
- [ ] Name/note fields use the pill-input and hairline-textarea styling shared with the blog's subscribe strip, not a dark/translucent treatment
- [ ] Thank-you card reuses the same white-card grammar as the details card it replaces
- [ ] Impact section is unnumbered (not a sequence)
- [ ] Sticky pill: enters as icon → expands both directions → collapses to icon → disappears; hides while `#order` is in view
- [ ] Orange stays scarce: hero accent word, featured pick flag + selected states, cup liquid, breakdown pills' implied emphasis, one CTA button, focus rings
- [ ] Reduced motion: fully usable, zero choreography, cup fill still updates instantly
- [ ] Lighthouse: performance ≥ 95, a11y ≥ 95; responsive to 320px
