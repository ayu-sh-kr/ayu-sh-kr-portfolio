# Build Instructions — Network Connectivity ("Offline") Page v3 for ayush.dev

You are building the **v3** offline / connection-error page for Ayush's Apple-inspired site. Same design language as the portfolio, blog, pricing, and earlier offline specs: paper white, ink gray, one persimmon accent, system SF typography, hairline borders. **This page's job is reassurance + recovery.** Tell the visitor what happened, show a living "still trying" signal, and carry them back automatically the moment the network returns.

This variant supersedes the earlier two in one respect: it makes a **big, bold Wi-Fi glyph the hero**, animates it as a *connecting attempt* (arcs filling outward with accent, then gently receding and repeating — never a "crossing" or a hard cut), puts the message and CTA **below** the glyph, and moves **troubleshooting to a second full-screen section** reached by **native scroll snapping plus a progress-based content reveal**. Keep the other two variants; this is a separate file (`offline-v3-demo.html`).

Reuse the exact tokens:

```css
--paper:#FAFAF8; --ink:#1D1D1F; --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
```

Stack: Tailwind v3+, vanilla JS, regular CSS. No animation libraries. Self-contained (works with zero network as a service-worker offline fallback).

---

## 0. The one job

A visitor landing mid-failure should (1) instantly read "connection problem, not a dead site" from the glyph alone, (2) see a live signal that the page is actively retrying, and (3) be carried back automatically on reconnect. Troubleshooting is secondary — deliberately one snapped screen away, so the first screen stays calm and uncluttered.

Three mechanics carry the page:
1. **A big animated Wi-Fi glyph** that reads as *trying to connect* — the signature and the emotional core.
2. **A live status signal + auto-retry** driven by `navigator.onLine` and the `online`/`offline` events.
3. **A snapped two-section scroll with a progress reveal**: the browser settles on the next section while its content rises into view.

---

## 1. Page structure

```
<nav>                shared, fixed, hairline appears after 40px scroll
#scroll-container    scrollable main, height:100% — owns the snap points
  <offline-hero>            SECTION 1 — big glyph + message + CTA + scroll cue
  <offline-troubleshoot>    SECTION 2 — troubleshooting (3 icon rows) + CTA + live "last tried"
  <footer>                  shared one line + diagnostic code chip (ERR_NETWORK · offline)
```

Each section is a normal-flow snap target with `min-height:100svh`, `scroll-snap-align:start`, and `scroll-snap-stop:always`. The page is not pinned and neither section is transformed. A single scroll-container listener computes the handoff progress and applies a small opacity/translate reveal to the section content. The snap geometry stays untouched, so native wheel, touch, keyboard, and reduced-motion behavior remain predictable.

---

## 2. The hero glyph (the signature)

### 2.1 Form — big and bold
A large Wi-Fi mark centered above the text: `width:min(260px,58vw)`, three concentric arcs (outer→inner) plus a base dot, drawn on a `200×172` viewBox with a chunky `stroke-width:9`, round caps. This is the loudest thing on the page — it should dominate the first screen.

**One element per mark, single layer.** No ghost/overlay pair, no dash tricks. Every mark is drawn once in `--hairline` (uncolored) and carries a `.mark` class; a `.lit` class fades it to `--accent` via a single CSS color transition. The base dot is a filled circle (`.mark.dot`, transitions `fill`); the arcs transition `stroke`.

```css
.mark{fill:none; stroke:var(--hairline); stroke-width:9; stroke-linecap:round; transition:stroke .4s ease}
.mark.dot{fill:var(--hairline); stroke:none; transition:fill .4s ease}
.mark.lit{stroke:var(--accent)}
.mark.dot.lit{fill:var(--accent)}
```

### 2.2 Motion — a simple timed color sequence
Keep it dead simple: **everything starts uncolored.** On a timer, one mark at a time turns to accent, ordered **bottom-to-top** (base dot → inner → mid → outer). Once all four are lit, hold a beat, then **unlight them in the same order** (base → outer), hold, and repeat. There is **no `requestAnimationFrame`, no easing math, no per-frame work** — just a class toggle on a `setTimeout`, letting the CSS `transition` on `.mark` do the smoothing. The individual element changing color is controlled purely by time.

```js
const marks = [m0,m1,m2,m3];   // base → inner → mid → outer
const TICK = 320;              // ms between each mark lighting / unlighting
const HOLD = 700;              // ms pause at fully-lit and at fully-dark
let gi = 0, filling = true, t = 0;
function step(){
  if (linked) return;
  if (filling){ marks[gi].classList.add('lit');    gi++; }
  else        { marks[gi].classList.remove('lit'); gi++; }
  if (gi >= marks.length){ filling = !filling; gi = 0; t = setTimeout(step, HOLD); return; }
  t = setTimeout(step, TICK);
}
if (!reduced) t = setTimeout(step, TICK);
else marks.forEach(m => m.classList.add('lit'));   // reduced motion: all lit, static
```

**Tuning knobs:** `TICK` = how long between each element changing color (bigger = more deliberate one-by-one feel); `HOLD` = the pause at full and at empty. The `.4s` CSS `transition` on `.mark` controls how gently each color change eases in. That's the whole animation — legible, cheap, and obviously "connecting."

### 2.3 Healed state (`goLinked()`)
On reconnect: clear the timer, then light any remaining marks base→outer with a small `setTimeout` stagger (`i*90ms`) so they settle in the same order they animate — a quick, gentle fill to the fully-lit accent signal. Then swap status → `Back online — reloading…`, footer code → `resolved`, button label → `Continue`, and `location.reload()` ~950ms later. No special curve needed — the `.mark` CSS transition handles the smoothing.

---

## 3. Hero text + CTA (below the glyph)

Order under the glyph: eyebrow `CONNECTION LOST` → headline `You're offline.` (display scale, `offline.` in `--accent`) → one calm sub-sentence → the live status line → buttons. The glyph is the hero; the type is confident but secondary to it.

- **Status line:** `aria-live="polite"`, a dot + text. The dot carries a slow eased `ping` (1.8s) while retrying; turns green and static when linked. Text cycles `Trying to reconnect…` → `Trying to reach the server…` (manual) → `Back online — reloading…`.
- **Buttons:** ink `Try again` + ghost `Back to home`. `Back to home` is a real `<a href="/">`.
- **Scroll cue:** at the base of the hero, a small `Still stuck? Ways to fix it` label with a nudging chevron, hinting the second screen. It fades out as the handoff begins.

### Copy discipline (same rules as every other page)
Explain what happened and how to fix it, in the interface's voice. Don't apologize, don't be vague, never blame the user. Active voice, sentence case, one job per element. The status line reports state; buttons name their action; troubleshooting rows each cover one distinct cause.

---

## 4. Troubleshoot panel (second screen)

Reached only by scrolling — it slides up and fades in as the hero recedes. Contents:
- Eyebrow `GET BACK ONLINE` → heading `Three things to try.`
- **Three icon-led rows** (no numbers — these are parallel causes to check, not an ordered sequence, so each gets a glyph in a `--tint` tile rather than `01/02/03`):
  1. **Check Wi-Fi or data** — *wifi icon* — toggle it, switch to a stronger network.
  2. **Give it a second** — *circular-arrow icon* — lift/tunnel/dead-spot signal returns on its own.
  3. **Might be the server** — *stacked-racks icon* — if all else loads, it's on my side; won't stay down long.
- A repeated CTA (accent `Try again` + ghost `Back to home`) so the visitor never has to scroll back up to retry.
- A live `Last tried Ns ago` meta line (tabular numerals).

```css
.try{display:grid; grid-template-columns:auto 1fr; gap:1.1rem; align-items:center; padding:1.15rem .25rem; border-top:1px solid var(--hairline)}
.try:last-child{border-bottom:1px solid var(--hairline)}
.try-ic{width:42px; height:42px; border-radius:12px; background:var(--tint); display:grid; place-items:center; color:var(--accent-deep)}
```
Icons are inline 24×24 stroke SVGs (`currentColor`), decorative (`aria-hidden`); the heading text carries meaning. Reserve tile size — no layout shift.

---

## 5. The snapped section handoff + progress reveal

Use one normal-flow scroll container. Do not create a sticky wrapper, an absolutely positioned panel stack, or a translated stage. The browser owns the section movement:

```css
#scroll-container {
  height:100%;
  overflow-y:auto;
  overscroll-behavior-y:contain;
  scroll-snap-type:y mandatory;
}
.section {
  min-height:100svh;
  scroll-snap-align:start;
  scroll-snap-stop:always;
}
```

While the user moves between snap points, reveal only the content inside the incoming section. Never transform the snap target itself; transforms on the snap target can feed back into snap geometry. Use the scroll container's own `scrollTop` and the second section's `offsetTop`:

```js
const reveal = clamp(
  (scrollTop - troubleshoot.offsetTop + viewport * .75) / (viewport * .75),
  0, 1,
);
const exit = clamp(scrollTop / (viewport * .75), 0, 1);

heroInner.style.opacity = String(1 - exit * .65);
heroInner.style.transform = `translate3d(0, ${exit * -32}px, 0)`;
troubleshootInner.style.opacity = String(reveal);
troubleshootInner.style.transform = `translate3d(0, ${(1 - reveal) * 32}px, 0)`;
```

Throttle that one scroll-container listener with one `requestAnimationFrame`. It is a progress reveal only; it does not decide where scrolling stops. `scroll-snap-stop:always` makes the second screen a clear destination, while the reveal keeps the handoff gentle. Apply `inert` to the leaving section after its content is mostly gone and to the incoming section until its content is mostly visible. Clear those attributes when reduced motion is active.

The two screens are individual Dota components: `offline-hero` and `offline-troubleshoot`. Keep connectivity state and the single scroll listener in `offline-page`; child components own their markup and colocated stylesheets. The glyph timer remains independent from the scroll progress loop.

---

## 6. Connectivity logic (the recovery engine)

A small state machine over the real browser signals — no framework.
- **State:** `linked`, `checking`, `lastTry`.
- **`check(manual)`** — re-entry guarded; set `lastTry`; if manual, show "Trying to reach the server…" and disable both retry buttons. After a short delay read `navigator.onLine`: online → `goLinked()`; offline+manual → "Still no connection…"; offline+passive → resting text. Re-enable buttons.
- **`goLinked()`** — one-way latch: run the smooth healed settle, swap status/code/labels, `location.reload()`.
- **Events:** `online` → `check(false)`; `offline` → reset status + code chip.
- **Auto-retry:** every 5s, quiet, no UI nag.
- **Live meta:** per-second `Last tried Ns ago`.
- **On load:** one `check(false)` after ~600ms (covers already-back-on-arrival).

> Production note: `navigator.onLine` only means the interface is up, not that the origin is reachable. Back it with a `fetch(HEAD)` to a tiny same-dist health file with a short timeout and treat that as truth; keep the state machine, swap the check body. Leave a `// real HEAD request here` marker. The footer chip (`ERR_NETWORK · offline` → `· resolved`) is deliberate flavor matching the site's S3 + CloudFront footer.

---

## 7. Reduced motion & accessibility (non-negotiable)

`prefers-reduced-motion: reduce`:
- Disable snapping and reveal transforms — `#scroll-container{scroll-snap-type:none}`, both sections stay in normal flow and remain fully visible.
- Glyph shows a **calm, fully-lit resting signal** (JS adds `.lit` to every mark once) — no timed sequence.
- No status-dot ping, no scroll cue.
- Recovery still works: state machine runs, reload still fires on reconnect.

Also:
- Glyph SVG `role="img"` with an `aria-label` that updates on reconnect (`Searching for a Wi-Fi connection` → `Wi-Fi connection restored`).
- Status line `aria-live="polite"`.
- Retry is a real `<button>` (disables during an in-flight manual check); `Back to home` a real `<a>`. Visible `:focus-visible` ring (2px accent) on all controls.
- Semantic landmarks: `<nav> <main/div> <section aria-label> <footer>`.
- Responsive to 320px: glyph caps at `58vw`, buttons wrap, panels restack; no overflow, no layout shift.
- Self-contained for SW offline use (the Tailwind CDN link is demo-only; inline the few utilities used in production).
- Lighthouse: performance ≥ 95, a11y ≥ 95.

---

## 8. Content swap points (keep together)

Eyebrow · headline + accent word · sub-sentence · status strings · button labels · `Back to home` target · scroll-cue text · the three troubleshooting rows (headings, copy, icons) · footer code chip · auto-retry interval (5s) · health-check endpoint. Keep the interval and endpoint as adjacent constants — most likely to be tuned.

---

## 9. Integration note (dota / service worker)

The glyph/hero and troubleshooting screen are separate components. `offline-page` owns the shared scroll container, native snap behavior, progress reveal, connectivity state (`linked / checking / lastTry`), and retry state machine (`check()` → `goLinked()`). Register the page as the SW `offline.html` fallback for navigation requests and as the CloudFront custom error response for network-class failures. The `navigator.onLine` + HEAD-check split and the timed-class glyph sequence are framework-agnostic.

---

## 10. Acceptance checklist

- [ ] The Wi-Fi glyph is large and bold, and is clearly the hero of the first screen
- [ ] The glyph starts fully uncolored; marks turn to accent **one at a time on a timer**, base→outer, then **unlight in the same order**, then repeat
- [ ] The animation is a simple timed class toggle (setTimeout + CSS color transition) — no rAF, no easing math, no per-frame work
- [ ] Message text and both CTAs sit below the glyph; type is confident but secondary to the icon
- [ ] Troubleshooting is a **separate second full-screen component** reached by native vertical scroll snapping
- [ ] The scroll container uses one progress-based content reveal; the snap targets themselves stay in normal flow and are never transformed
- [ ] Status line is live (`aria-live`) and reflects real state via `navigator.onLine` + `online`/`offline`; quiet auto-retry every 5s
- [ ] Manual `Try again` (present on both screens) disables during an in-flight check; `Back to home` always available
- [ ] On reconnect the glyph settles smoothly to fully lit and the page reloads automatically
- [ ] Orange appears only in: the accent headline word, the lit glyph, the status dot, troubleshooting glyphs, and the one accent/ink CTA — nowhere else
- [ ] Reduced motion: snapping and reveal transforms are disabled, sections remain visible in normal flow, glyph is a calm static signal, and no ping/cue runs
- [ ] Self-contained (works offline as an SW fallback); responsive to 320px; no layout shift
- [ ] Lighthouse: performance ≥ 95, a11y ≥ 95
