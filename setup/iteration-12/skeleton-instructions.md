# Build Instructions — Skeleton Loaders for ayush.dev

You are adding a **skeleton loading system** to Ayush's Apple-inspired site. Same design language as the portfolio, blog, and pricing specs: paper white, ink gray, one persimmon accent, system SF typography, hairline borders. **A skeleton's job is to hold the reader's place** — it shows the *shape* of content that's still arriving, so that when the real thing renders it fades into the exact spot its outline was holding, and nothing on the page jumps.

Reuse the exact tokens from the portfolio build:

```css
--paper:#FAFAF8; --ink:#1D1D1F; --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
```

Stack: Tailwind v3+, vanilla JS, regular CSS. No animation libraries. In production these become dota components; keep the primitive and the shapes separable so the render layer can swap freely.

---

## 0. The one rule

**A skeleton must predict the real layout.** A generic centered spinner tells the reader nothing; a shaped placeholder tells them "a title, two chips, and four paragraphs are on the way." If the skeleton and the real content don't share the same measure, grid, and row height, the page will shift when data lands — which is worse than a spinner. Every skeleton in this system is built to mirror a specific real layout that already exists on the site.

If a piece of content can't be predicted (unknown shape, unknown count), do **not** use a skeleton — fall back to the top progress bar (see the loading-states system) or a simple inline spinner.

## 1. When to use each loading treatment

There are three loading moments on the site. This spec covers **only the skeleton** (the first). The other two are named here so the boundary is clear — don't reach for a skeleton where one of the others fits better.

| Moment | Treatment | Why |
|---|---|---|
| **Landing on a content page that renders after load** (a markdown article, a case study, the blog index) | **Skeleton** (this spec) | The layout is known ahead of the data, so its shape can be drawn immediately and reveal into place. |
| **An action mid-page** (subscribe, send email, file a support request) | **Button state machine** (spinner → check) | The page is already there; only one control is waiting. Don't blank the page for it. |
| **A full reload or route change** | **Top progress bar** (2px accent sweep) | Nothing about the next page's shape is known yet; a thin determinate-feeling bar reassures without lying about layout. |

### Concrete use cases for the skeleton

- **Slow markdown render (primary).** The blog article (`/blog/{slug}`) and the markdown showcase case page both render prose from markdown after the shell loads. Show the **article skeleton** (§4.A) in the `720px` / `680px` measure until the rendered HTML is ready, then reveal.
- **Blog index / filtered results.** When the post list is fetched or re-filtered and rows aren't in the DOM yet, show the **list skeleton** (§4.B) — one row shape repeated 4–6 times. Matches the hairline-divided rows exactly (date · title+summary · chip).
- **Work rail / featured tiles.** When project cards come from data, show the **card skeleton** (§4.C) — 3 card shapes in the same `minmax` grid as the real cards.
- **Not for:** the hero (it's static, ships in HTML), the estimator result (compute is instant), or anything already painted. Skeletons are for content that genuinely arrives late.

## 2. The primitive (`.sk`)

Everything is built from one class. A hairline-gray placeholder with a single **`--tint` sweep** moving left to right. The sweep is tint, **never full accent** — this is where "orange stays scarce" is easy to violate. A pulsing-orange skeleton would spend the site's one accent color on chrome that says nothing.

```css
.sk{position:relative; overflow:hidden; background:rgba(29,29,31,.055); border-radius:8px}
.sk::after{content:""; position:absolute; inset:0;
  background:linear-gradient(90deg, transparent 0%, rgba(255,241,234,.9) 50%, transparent 100%);
  transform:translateX(-100%); animation:sweep 1.35s cubic-bezier(.35,0,.25,1) infinite}
@keyframes sweep{100%{transform:translateX(100%)}}
```

Shape helpers set dimensions only — never new colors or effects:

```css
.sk-line{height:1rem; border-radius:6px}      /* body text line */
.sk-sm{height:.8rem; border-radius:5px}        /* meta / caption line */
.sk-chip{height:1.55rem; width:5rem; border-radius:999px}  /* a tint chip */
.sk-title{height:2rem; border-radius:8px}      /* a heading line */
.sk-block{border-radius:16px}                   /* an image / code block; set height inline */
.sk-circle{border-radius:50%}                   /* avatar */
```

**Width is set inline per instance** (`style="width:88%"`) so lines look like real ragged text, not a solid bar. Vary the widths — real paragraphs don't end at the same column.

### Optional group stagger

When several placeholders sit together (a paragraph, a card), let each sweep a beat after the last so the group breathes as one instead of flickering in lockstep:

```css
.sk-stagger > .sk:nth-child(2)::after{animation-delay:.08s}
.sk-stagger > .sk:nth-child(3)::after{animation-delay:.16s}
.sk-stagger > .sk:nth-child(4)::after{animation-delay:.24s}
.sk-stagger > .sk:nth-child(5)::after{animation-delay:.32s}
```

## 3. The reveal mechanic

The skeleton is a **layer that cross-fades out**, revealing the real content that was underneath (or that swaps in) at the same position.

```css
.skel-layer{position:absolute; inset:0; background:var(--paper); z-index:2;
  transition:opacity .55s ease, transform .55s cubic-bezier(.2,.8,.2,1)}
.skel-layer.gone{opacity:0; transform:translateY(-6px); pointer-events:none}
```

- The fade is `.55s` with the site's standard `cubic-bezier(.2,.8,.2,1)` easing and a small `-6px` lift — the same reveal grammar as `.reveal` elements elsewhere.
- The real content must occupy the **same box** the skeleton did, so nothing reflows. For a full page, the skeleton is `position:fixed; inset:0` over the paper; for a component, it's `position:absolute; inset:0` over the component's own body.

### JS controller (minimal)

```js
const Skeleton = {
  show(el){ el.classList.remove('gone'); },
  hide(el){ el.classList.add('gone'); }   // call once data/HTML is ready
};
```

Production flow is always the same three steps:

```js
Skeleton.show(layer);          // (usually already shown in the shipped HTML)
const data = await fetchThing();
render(data);                   // real content into its box
Skeleton.hide(layer);          // cross-fade the skeleton away
```

Ship the skeleton **in the initial HTML** for the slow-markdown case, so it paints instantly with the shell — don't wait for JS to inject it, or you get a flash of nothing first.

## 4. The three shapes

Each mirrors a real layout already on the site. Build exactly these; resist inventing more.

### 4.A Article (prose) — the primary case
Mirrors the blog/showcase reading measure. Inside a `720px` (blog: `680px`) centered column:
- Chip row: two `.sk-chip` (category + read time).
- Two `.sk-title` lines at ~88% and ~56% width (a wrapping headline).
- 4–5 `.sk-line` at varied widths (100 / 96 / 99 / 70%) for the opening paragraph.
- One `.sk-block` (~120–180px) for the first figure or code block.
Use `.sk-stagger` on the column so it settles as a unit.

### 4.B List rows
Mirrors the blog index rows exactly — grid `[date | title+summary | chip]`, hairline divider. Author **one row of skeleton** and repeat it 4–6 times. Per row:
- `.sk-sm` ~60px (date).
- A stacked pair: `.sk-line` ~70–82% (title) + `.sk-sm` ~40–52% (summary).
- `.sk-chip` (category).
Vary the title/summary widths row to row so it reads as a list, not a table.

### 4.C Card grid
Mirrors the work rail / featured tiles — same `repeat(auto-fit, minmax(...))` grid. Three card shapes, each `.sk-stagger`:
- `.sk-sm` ~40% (eyebrow).
- `.sk-line` ~55–70% at `1.3rem` height (project name).
- Two `.sk-sm` (100% / ~80%) for the description.
- A `.flex` of two `.sk-chip` (stack tags).

## 5. Motion & accessibility rules

- **Orange stays scarce.** The sweep is `--tint`, the placeholder is a low-alpha ink gray. No accent anywhere in the resting skeleton.
- **Only animate `transform` and `opacity`** (the sweep is a translated pseudo-element; the reveal is opacity+translate). No animating width/height/background-position.
- **Timeout, don't hang.** If data hasn't arrived in ~8–10s, stop implying progress: swap the skeleton for an inline empty/error state in the interface's own voice ("Couldn't load posts — retry"), never leave it shimmering forever. Errors don't apologize and aren't vague.
- **`aria-hidden="true"`** on the skeleton layer — it's decorative; screen readers should hear the real content (or an `aria-live="polite"` "Loading…" on the container), not a wall of empty nodes.
- **Don't shift layout.** Reserve the real height. The skeleton box and the content box must match, or the reveal defeats its own purpose.
- **`prefers-reduced-motion`:** kill the sweep (`animation:none`, drop opacity to ~.5 so it still reads as a placeholder), and drop the `-6px` lift on reveal — cross-fade only, faster. The skeleton still appears and still hides; only the motion is removed.

```css
@media (prefers-reduced-motion: reduce){
  .sk::after{animation:none; opacity:.5}
  .skel-layer{transition:opacity .01s}
  .skel-layer.gone{transform:none}
}
```

## 6. Files

```
loading/
├── skeleton.css        # .sk primitive + shape helpers + .skel-layer reveal
├── skeleton.js         # Skeleton.show/hide controller
└── skeletons.html      # the three shape templates (article / list / cards) to clone
```

In the dota stack, `.sk` is a styling primitive and each shape is a small component (`<sk-article>`, `<sk-list rows="6">`, `<sk-cards n="3">`) that renders the same markup. Keep the `show/hide` contract identical so pages don't care whether they're driving the demo version or the component.

## 7. Acceptance checklist

- [ ] Skeleton shares the exact measure/grid/row-height of the content it stands in for — zero layout shift on reveal
- [ ] Article, list, and card shapes all render and reveal correctly
- [ ] Sweep uses `--tint` only; no full accent anywhere in the resting skeleton
- [ ] Real content fades up (`-6px` lift, `.55s`, standard easing) into the skeleton's position
- [ ] Slow-markdown skeleton ships in the initial HTML (no flash of empty before JS)
- [ ] Line/row/card widths are varied so it reads as content, not solid bars
- [ ] Skeleton layer is `aria-hidden`; loading is announced politely once, not per-node
- [ ] A stalled load (~8–10s) resolves to a readable error/empty state, never an endless shimmer
- [ ] Reduced motion: no sweep, no lift — placeholder still visible, cross-fade only
- [ ] Not used for the hero, estimator, or already-painted content — only genuinely late-arriving layouts
