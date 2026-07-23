# Build Instructions — Speaking & Teaching Section (Portfolio Add-On)

You are adding **one new section** to Ayush's existing Apple-inspired portfolio (`portfolio-demo.html` / the `portfolio-agent-instructions.md` build). This is an **integration**, not a new page — reuse the portfolio's tokens, typography, nav, reveal system, and scroll engine exactly. Do not introduce new dependencies, new colors, or a second design language.

The section positions Ayush as a **speaker/lecturer/mentor**, not just a builder. It has one signature motion (a headline that fills with ink+accent as you scroll) and one signature interaction (topic cards that respond to cursor pressure with a fluid light), plus a quiet proof line and an invite CTA. Placeholder copy and numbers are intentional — Ayush swaps them.

---

## 1. Where it goes

Insert the section **between `#work-wrap` (Work) and `#skills` (Skills)** in the existing `<main>`. Add a nav link too.

```
<nav>  … Work / Journey / [Speaking] / Skills / Contact …
#hero-wrap
#journey-wrap
#work-wrap
#speaking          ← NEW (this section)
#skills
#contact
<footer>
```

Nav: add `<a href="#speaking">Speaking</a>` between the Journey and Skills links.

## 2. Stack & reuse (non-negotiable)

- **Reuse the exact tokens** already on `:root` (`--paper --ink --ink-soft --hairline --accent --accent-deep --tint`). Do not redefine them.
- **Reuse existing classes**: `.eyebrow`, `.soft`, `.title`, `.chip`, `.btn` / `.btn-accent` / `.btn-ghost`, `.reveal`.
- **Reuse the existing scroll engine.** The portfolio already has `progressOf(el)`, a single throttled `scroll`→`requestAnimationFrame(renderAll)` loop, and an IntersectionObserver that toggles `.is-in` on `.reveal` elements. Hook new work into **those** — do not add a second scroll listener or a second observer.
- Vanilla JS + regular CSS only. No animation libraries.

## 3. Design intent (what makes it not-clutter)

The earlier failure mode was stacking many motions inside one pin. **The rule: one signature motion + one signature interaction, everything else calm.**

- **Signature motion:** only the *headline* is pinned and scroll-driven. It starts faint and colorless, then fills with ink (and a moving band of accent at the fill edge) while scaling up — an "impression" moment. Everything below the headline is normal document flow with standard `.reveal` fade-ins.
- **Signature interaction:** the *topic cards* react to the pointer (pressure-tilt + a fluid light that follows the cursor).
- **Calm:** proof numbers are a single small inline line (not a big stat grid), and the invite CTA is a plain tinted card. No marquee, no second pin, no scroll-scrubbed counters.

Do **not** re-add: a stat dashboard/counter grid, a venue marquee, a progress spine, or a second pinned scene. Those were removed on purpose.

## 4. Structure (top to bottom)

```
<section id="speaking">
  #sp-head-wrap        pinned wrapper, height:160vh
    #sp-head-stage     position:sticky; top:0; height:100vh; flex column, left-aligned, vertically centered
      #sp-head-inner   eyebrow + .sp-lead headline + .sp-sub + .sp-proof   (all fade in via .lit)
  <div normal-flow>    max-w-6xl, px-6, pt-8, pb-28
    .sp-topics         responsive grid of 4 topic cards (.topic[data-tilt])
    .invite            invite-me-to-speak CTA (reveal)
</section>
```

**Important spacing lesson (already fixed — keep it this way):** the eyebrow, headline, sub-line, AND proof line **all live inside the pinned `#sp-head-inner`**. Do not move the proof line down into the normal-flow block — if you do, it only appears after the whole 160vh pin scrolls past, which creates a huge empty gap and drops the numbers right on top of the cards. Proof belongs with the headline.

## 5. The pinned fill-on-scroll headline (the signature)

### Markup
```html
<div id="sp-head-wrap">
  <div id="sp-head-stage">
    <div id="sp-head-inner">
      <p class="eyebrow mb-5">Speaking &amp; teaching</p>
      <h2 id="speaking-h" class="sp-lead">
        <span class="fill">I make hard systems </span><span class="fill dot">click.</span>
      </h2>
      <p class="sp-sub">Beyond shipping code, I teach it — lectures, workshops, and mentoring
        on backends, cloud, and AI agents for teams that want to level up fast.</p>
      <p class="sp-proof">
        <span><b>40+</b> sessions</span><span class="sep">/</span>
        <span><b>1,200+</b> engineers taught</span><span class="sep">/</span>
        <span>rated <b>9.4</b>/10</span>
      </p>
    </div>
  </div>
</div>
```

### CSS
```css
#sp-head-wrap{position:relative; height:160vh}
#sp-head-stage{position:sticky; top:0; height:100vh; display:flex; flex-direction:column;
               align-items:flex-start; justify-content:center; overflow:hidden}
#sp-head-inner{max-width:72rem; margin:0 auto; width:100%; padding:0 1.5rem; will-change:transform}
#sp-head-inner .eyebrow{opacity:0; transition:opacity .5s}
#sp-head-inner.lit .eyebrow{opacity:1}

.sp-lead{position:relative; font-weight:700; letter-spacing:-.035em; line-height:1.04; max-width:16ch;
         font-size:clamp(2.6rem,7.5vw,6rem); transform-origin:left center; will-change:transform}

/* the fill: a gradient clipped to the text. --fp (0%→100%) is driven from JS.
   ink fills up to (fp - 6%), an accent band rides the fill edge, faint ghost ink after. */
.sp-lead .fill{
  color:transparent;
  background-image:linear-gradient(90deg,
    var(--ink) 0%, var(--ink) calc(var(--fp,0%) - 6%),
    var(--accent) calc(var(--fp,0%) - 6%), var(--accent) var(--fp,0%),
    rgba(29,29,31,.12) var(--fp,0%), rgba(29,29,31,.12) 100%);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
}
.sp-lead .dot{color:var(--accent)}   /* keeps the last word visually anchored even before fill */

.sp-sub{color:var(--ink-soft); font-size:clamp(1rem,2vw,1.2rem); max-width:34rem; margin-top:1.6rem;
        opacity:0; transform:translateY(12px); transition:opacity .6s, transform .6s}
#sp-head-inner.lit .sp-sub{opacity:1; transform:none}

.sp-proof{display:inline-flex; flex-wrap:wrap; gap:.5rem 1.1rem; align-items:baseline;
          font-size:.9rem; font-weight:500; color:var(--ink-soft); letter-spacing:.01em; margin-top:1.4rem;
          opacity:0; transform:translateY(12px); transition:opacity .6s .1s, transform .6s .1s}
#sp-head-inner.lit .sp-proof{opacity:1; transform:none}
.sp-proof b{color:var(--ink); font-weight:600; font-variant-numeric:tabular-nums}
.sp-proof .sep{color:var(--hairline)}
```

### JS (add inside the existing `renderAll()`, after the work-rail block)
Grab refs once near the other section refs:
```js
const spHeadWrap = document.querySelector('#sp-head-wrap');
const spHeadInner = document.querySelector('#sp-head-inner');
const spLead = document.querySelector('.sp-lead');
const spFills = Array.from(document.querySelectorAll('.sp-lead .fill'));
```
Then in `renderAll()`:
```js
// speaking headline: fills + grows with scroll
const spp = progressOf(spHeadWrap);
const fp = clamp(spp / 0.8, 0, 1) * 100;      // fill completes at 80% of the pin, then holds
const scale = 0.82 + clamp(spp / 0.8, 0, 1) * 0.18;  // grows 0.82 → 1.0
spFills.forEach(f => f.style.setProperty('--fp', fp + '%'));
spLead.style.transform = `scale(${scale})`;
spHeadInner.classList.toggle('lit', spp > 0.06);  // eyebrow/sub/proof fade in
```
This lives behind the existing `if (reduced) return;` guard in `renderAll()`, so reduced-motion never runs it (CSS handles that state — see §8).

**Tuning knobs:** `160vh` = how long the fill lasts (longer = slower/more deliberate). `0.8` = fraction of the pin spent filling before it holds full. `0.82`→`1.0` = the grow range. Keep the grow subtle; this is emphasis, not a zoom.

## 6. Topic cards — pressure + fluid interaction (the signature interaction)

Four cards in a responsive grid. Each is a real `<a href="#contact">` (keyboard-focusable, whole card is the link) with `data-tilt`. Each card: `.num` (01–04), `<h3>` title, one-line `.soft` description, a `.chip` row, and a `.sp-arrow` ("Book this talk →") that appears on hover/focus.

### CSS
```css
.sp-topics{display:grid; gap:1rem; grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.topic{position:relative; background:#fff; border:1px solid var(--hairline); border-radius:22px;
       padding:1.6rem 1.7rem; display:flex; flex-direction:column; gap:.5rem; overflow:hidden;
       cursor:default; transform:translateZ(0);
       transition:transform .5s cubic-bezier(.2,.9,.25,1), box-shadow .5s, border-color .5s}
/* fluid light — position set from JS via --mx/--my */
.topic::before{content:""; position:absolute; inset:0; border-radius:inherit; opacity:0;
               background:radial-gradient(340px circle at var(--mx,50%) var(--my,50%),
                         rgba(255,77,0,.10), transparent 60%);
               transition:opacity .4s; pointer-events:none}
.topic:hover::before,.topic:focus-within::before{opacity:1}
.topic:hover,.topic:focus-within{box-shadow:0 22px 50px -28px rgba(29,29,31,.3); border-color:transparent}
.topic.pressed{transition:transform .12s cubic-bezier(.2,.9,.25,1), box-shadow .12s}
.topic h3{font-size:1.15rem; font-weight:600; letter-spacing:-.015em}
.topic .num{font-size:13px; font-weight:600; color:var(--accent-deep); letter-spacing:.02em}
.topic .sp-arrow{margin-top:.4rem; color:var(--accent-deep); font-weight:500; font-size:14px;
                 opacity:0; transform:translateX(-4px); transition:opacity .35s, transform .35s}
.topic:hover .sp-arrow,.topic:focus-within .sp-arrow{opacity:1; transform:none}
.topic:focus-visible{outline:2px solid var(--accent); outline-offset:3px}
```

### JS (one-time setup, outside `renderAll`, skipped when reduced)
Per card, run a small spring toward target rotation/scale in its own rAF (only alive while animating), and set the light position from pointer coords:
```js
const cards = Array.from(document.querySelectorAll('.topic[data-tilt]'));
if (!reduced) cards.forEach(card => {
  const s = { rx:0, ry:0, sc:1, trx:0, try_:0, tsc:1, raf:0 };
  const tick = () => {
    s.rx += (s.trx - s.rx)*0.12; s.ry += (s.try_ - s.ry)*0.12; s.sc += (s.tsc - s.sc)*0.12;
    card.style.transform =
      `perspective(800px) rotateX(${s.ry}deg) rotateY(${s.rx}deg) translateY(${(s.sc-1)*-24}px) scale(${s.sc})`;
    const done = Math.abs(s.trx-s.rx)<0.01 && Math.abs(s.try_-s.ry)<0.01 && Math.abs(s.tsc-s.sc)<0.001;
    s.raf = done ? 0 : requestAnimationFrame(tick);
  };
  const spring = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left)/r.width, py = (e.clientY - r.top)/r.height;
    card.style.setProperty('--mx', px*100+'%'); card.style.setProperty('--my', py*100+'%');
    s.trx = (px-0.5)*10; s.try_ = -(py-0.5)*10;   // tilt toward cursor (pressure = distance from center)
    spring();
  });
  card.addEventListener('pointerenter', () => { s.tsc = 1.02; spring(); });
  const relax = () => { s.trx=0; s.try_=0; s.tsc=1; spring(); };
  card.addEventListener('pointerleave', relax);
  card.addEventListener('pointerdown', () => { s.tsc = .97; card.classList.add('pressed'); spring(); });
  card.addEventListener('pointerup',   () => { s.tsc = 1.02; card.classList.remove('pressed'); spring(); });
  card.addEventListener('pointercancel', () => { card.classList.remove('pressed'); relax(); });
});
```
Notes: spring factor `0.12` = follow speed; tilt magnitude `10` (deg); press scale `.97`; hover lift via `translateY((sc-1)*-24)`. Uses Pointer Events so it covers mouse + touch. The cards still get `.reveal` for their scroll-in fade (handled by the existing IO).

## 7. Invite CTA (unchanged — ship as-is)

Plain tinted card in normal flow, with `.reveal`. Do not restyle.
```html
<div class="invite reveal">
  <p class="eyebrow mb-3">Invite me to speak</p>
  <h3 class="title" style="font-size:clamp(1.7rem,4vw,2.6rem)">Running a meetup, cohort, or team offsite?</h3>
  <p class="soft mt-4 max-w-xl mx-auto">I put together talks and hands-on workshops tailored to your
    audience — remote or in person, IST-friendly. Tell me the room and I'll shape the session.</p>
  <div class="mt-8 flex gap-3 justify-center flex-wrap">
    <a class="btn btn-accent" href="mailto:hello@ayush.dev?subject=Speaking%20invitation">Invite me to speak</a>
    <a class="btn btn-ghost" href="#contact">See topics &amp; rates</a>
  </div>
</div>
```
```css
.invite{background:var(--tint); border-radius:24px; padding:2.6rem 2.2rem; text-align:center; margin-top:3.5rem}
```

## 8. Accessibility & reduced motion (non-negotiable)

Under `@media (prefers-reduced-motion: reduce)`: unpin the headline, show it fully filled and colored at a smaller static size, and reveal the sub-line and proof immediately. Cards drop the tilt/light. The existing `if (reduced) return;` in `renderAll` already stops the fill JS; this CSS covers the resting state:
```css
@media (prefers-reduced-motion: reduce){
  #sp-head-wrap{height:auto}
  #sp-head-stage{position:static; height:auto; overflow:visible; display:block; padding:10vh 0 2vh}
  #sp-head-inner{transform:none !important}
  #sp-head-inner .eyebrow{opacity:1}
  .sp-lead{transform:none !important; font-size:clamp(2.4rem,6vw,5rem)}
  .sp-lead .fill{-webkit-text-fill-color:var(--ink); color:var(--ink); background:none}
  .sp-sub{opacity:1; transform:none}
  .sp-proof{opacity:1; transform:none}
  .topic{transition:none}
  .topic::before{display:none}
}
```
Also: `#speaking` uses `aria-labelledby="speaking-h"`; the headline is a real `<h2>`; cards are real `<a>` with visible `:focus-visible` rings; the fluid light and tilt are decorative and pointer-only, so keyboard users still get the hover-equivalent state via `:focus-within`.

## 9. Content swap points (keep together for Ayush)

- Headline text (`.sp-lead .fill` spans) — keep it 2 spans so the fill spans both; last word carries `.dot`.
- Sub-line (`.sp-sub`).
- **Proof numbers (`.sp-proof`)** — these are invented placeholders (40+ / 1,200+ / 9.4). Replace with real, defensible figures or cut a stat.
- 4 topic cards: `.num`, title, description, chips, and the `.sp-arrow` label.
- Invite CTA: heading, body, `mailto:` address + subject, and the "See topics & rates" target.

## 10. Acceptance checklist

- [ ] Section sits between Work and Skills; nav has a working `#speaking` link
- [ ] Only the headline is pinned (160vh); everything below is normal flow — no second pin
- [ ] Headline starts faint/colorless and fills with ink + a moving accent edge as you scroll, while growing ~0.82→1.0
- [ ] Eyebrow, sub-line, and proof line all fade in with the headline (via `.lit`) — proof is NOT down by the cards, and there is no empty gap between headline and cards
- [ ] Topic cards tilt toward the cursor, show a pointer-following light, and press-in on click with a spring
- [ ] Cards are real links, keyboard-focusable, with a visible focus ring and the arrow shown on focus
- [ ] Reuses existing tokens/classes and the single existing scroll loop + IO — no new libraries, colors, or second listeners
- [ ] Orange stays scarce: the fill's accent edge, the last headline word, chips, card light, arrows, and the one CTA button only
- [ ] Reduced motion: headline static + fully filled, proof/sub visible, cards inert — fully readable, zero transforms
- [ ] Proof numbers replaced with real figures before publishing
