# Component spec — `<scroll-hint>`

A small piece of orientation UI for a pinned/full-bleed hero: a short label plus an animated line that signals "keep scrolling." Ships with its own scoped design tokens (sensible defaults, fully overridable) so it drops into any design system without assuming particular variable names exist on the host page.

---

## 1. What it is, and what it's for

A `100vh` sticky hero can visually read as "this is the whole page." `<scroll-hint>` resolves that one ambiguity and then gets out of the way — it fades out once the visitor proves they already know to scroll.

**Use it on:**
- The first pinned/full-bleed hero stage of a page — the one place a fold could plausibly be mistaken for the entire page.

**Don't use it on:**
- Any section below the first fold.
- Pages or sections that don't pin. A scroll hint implies a pinned stage; using it on a normal-flow page misrepresents the page's own mechanics.
- Inside cards, modals, or anything that isn't a full-viewport stage.

## 2. Anatomy

```
<scroll-hint>
  "Scroll"                  small label text
  ─┐                        1px vertical line
   │  animated fill/drain
   ┘
</scroll-hint>
```

Two parts only: a text label and a line. No icon, no chevron, no button chrome.

## 3. Design rationale

| Choice | Why |
|---|---|
| Muted color, never the page's primary text or accent color | It's orientation UI, not content. If it visually competed with the headline or a CTA, it would read as another interactive element. |
| Text label, not an icon | An icon needs `aria-label` to mean anything to assistive tech, and often reads as clickable. A text word is self-describing. |
| Drip animation (`scaleY` grow-then-drain, flipped `transform-origin`), not a bouncing chevron | A bouncing arrow is a UI-kit cliché. A line that fills top-to-bottom and drains still unambiguously signals *downward* without borrowing a generic icon. |
| `pointer-events: none` | It typically sits near a hero's button row; it must never intercept a click meant for a real CTA. |
| Appears once per page, never repeated | Its job is resolving one ambiguity at one moment. Repeating it elsewhere is noise. |
| Fades out as the visitor scrolls (§5) | Its usefulness has a shelf life of roughly the first 15% of the pin. Sitting inert underneath incoming content for the rest of the pin serves no one. |
| `aria-hidden="true"` on the whole element | Decorative affordance, not content. A screen reader user doesn't need "Scroll" announced — the page's scrollability isn't in question for them the way it visually is for sighted users on a sticky stage. |

## 4. Tokens

The component defines its own custom properties with defaults, so it works standalone. Override any of them from the host page to match an existing design system:

```css
scroll-hint{
  --sh-color: #6E6E73;      /* the label + line color — point this at your muted-text token */
  --sh-size: 13px;          /* label font size */
  --sh-line-height: 34px;   /* the animated line's height */
  --sh-gap: .5rem;          /* space between label and line */
  --sh-duration: 1.8s;      /* one drip cycle */
  --sh-fade-rate: 6;        /* higher = fades out earlier in the pin, see §5 */
}
```

Example, pointed at an existing design system's muted-text token:

```css
scroll-hint{ --sh-color: var(--ink-soft); }
```

## 5. Reference markup (Tailwind-first)

Host-level positioning — where the hint sits, that clicks pass through it — is ordinary page layout, so it's Tailwind utility classes like anything else on the page:

```html
<scroll-hint class="absolute bottom-[5vh] left-1/2 -translate-x-1/2 pointer-events-none block
    [--sh-color:theme(colors.slate.500)]"></scroll-hint>
```

That last class, `[--sh-color:theme(colors.slate.500)]`, is Tailwind's arbitrary-property syntax — it sets the `--sh-color` custom property using a value from your Tailwind theme. That's the one bridge between the two systems: CSS custom properties inherit across a shadow-DOM boundary even though rules don't, so Tailwind can still hand the component a themed value without needing to style inside it directly.

**The component's own internals are the one place that stays plain CSS, and it's structural, not a preference:** once the label, the line, and the drip animation live inside a shadow root (§8), Tailwind's generated stylesheet — which lives on the main document — cannot reach them. Shadow DOM is style-encapsulated by design. So the split is:

- **Tailwind, dominantly:** host positioning, spacing, anything on the surrounding page.
- **Plain CSS, for fine-grained customization only:** the component's shadow-DOM internals — its default tokens (§4), the drip keyframes, and any value math (the fade-rate formula in §6). These aren't expressible as utility classes even in principle once they're behind a shadow boundary.

### No-JS fallback (light DOM, still Tailwind-first)

If a page can't run the custom element, the same label + line can be authored directly in light DOM, where Tailwind utilities apply throughout except the keyframe animation itself:

```html
<scroll-hint class="absolute bottom-[5vh] left-1/2 -translate-x-1/2 pointer-events-none block">
  <p aria-hidden="true" class="m-0 text-ink-soft text-[13px] tracking-[.02em]
      after:content-[''] after:block after:w-px after:h-[34px] after:mt-2 after:mx-auto
      after:[animation:sh-drip_1.8s_ease-in-out_infinite]
      after:[background:linear-gradient(theme(colors.ink-soft),transparent)]
      motion-reduce:hidden">Scroll</p>
</scroll-hint>
```

```css
/* the one thing Tailwind has no utility for: the keyframes themselves */
@keyframes sh-drip{
  0%{transform:scaleY(0); transform-origin:top}
  50%{transform:scaleY(1); transform-origin:top}
  51%{transform-origin:bottom}
  100%{transform:scaleY(0); transform-origin:bottom}
}
```

This form doesn't get the `progress`-attribute automation in §6 — opacity would need to be set on it directly from the host page's own scroll handler.

## 6. Fading with scroll progress

A hero pin typically already computes its own scroll progress (0 at the top of the pin, 1 at the end) to drive a fade/scale on the hero content. Reuse that value for the hint instead of adding a second scroll listener:

```js
const hint = document.querySelector('scroll-hint');
const p = progressOfYourPin(); // however your page already computes 0→1 pin progress
hint.setAttribute('progress', p);
```

Internally:

```js
opacity = clamp(1 - progress * shFadeRate, 0, 1);
```

With the default `--sh-fade-rate: 6`, the hint is fully transparent by ~16% into the pin — well before the hero content itself typically finishes fading, so it disappears the instant the visitor demonstrates they know to keep scrolling, without competing with the hero's own exit animation.

## 7. Component contract

| Attribute | Type | Behavior |
|---|---|---|
| `progress` | number 0–1 | Sets opacity `= 1 − progress × --sh-fade-rate`, clamped 0–1. Feed it your pin's own scroll-progress value each frame. |

| Slot | Default | Behavior |
|---|---|---|
| default | `Scroll` | Override the label text per-page; the animation and fade logic don't change. |

No other public surface — a display-only component with one numeric input.

## 8. Implementation

### Framework-free custom element (verified — this is what `scroll-hint-demo.html` runs)

```js
class ScrollHint extends HTMLElement {
  static get observedAttributes(){ return ['progress']; }
  connectedCallback(){
    this.attachShadow({ mode:'open' }).innerHTML = `
      <style>
        :host{
          display:block;
          --sh-color: #6E6E73; --sh-size: 13px; --sh-line-height: 34px;
          --sh-gap: .5rem; --sh-duration: 1.8s;
        }
        p{ margin:0; color:var(--sh-color); font-size:var(--sh-size); letter-spacing:.02em; }
        p::after{
          content:""; display:block; width:1px; height:var(--sh-line-height); margin:var(--sh-gap) auto 0;
          background:linear-gradient(var(--sh-color),transparent);
          animation:drip var(--sh-duration) ease-in-out infinite;
        }
        @keyframes drip{
          0%{transform:scaleY(0); transform-origin:top}
          50%{transform:scaleY(1); transform-origin:top}
          51%{transform-origin:bottom}
          100%{transform:scaleY(0); transform-origin:bottom}
        }
        @media (prefers-reduced-motion: reduce){ :host{ display:none } }
      </style>
      <p aria-hidden="true"><slot>Scroll</slot></p>`;
  }
  attributeChangedCallback(name, _old, val){
    if(name === 'progress'){
      const rate = parseFloat(getComputedStyle(this).getPropertyValue('--sh-fade-rate')) || 6;
      const p = parseFloat(val) || 0;
      this.style.opacity = Math.max(0, Math.min(1, 1 - p * rate));
    }
  }
}
customElements.define('scroll-hint', ScrollHint);
```

```html
<scroll-hint style="position:absolute; bottom:5vh; left:50%; transform:translateX(-50%); pointer-events:none;"></scroll-hint>
```

```js
hint.setAttribute('progress', progressOfYourPin());
```

### `@ayu-sh-kr/dota-core` version — pending

I don't have a verified example of how components are actually written with `@ayu-sh-kr/dota-core` in this codebase, and I'm not going to guess at decorator names again after getting it wrong last round. Share one of the following and I'll write this section to match exactly:

- An existing dota component's source (e.g. from `dota-wrap` or `dota-rest`), or
- The package's README / a link to its repo, or
- Just the decorator import lines you use elsewhere (e.g. whatever replaces `customElements.define`, however props/state are declared, how the template and styles are attached).

Whatever the real pattern is, this component only needs three things from it: a way to register a custom element, a way to receive the `progress` value (attribute or property, whichever the library prefers), and a way to attach the template/styles above.

## 9. Acceptance checklist

- [ ] Appears only on the first pinned hero of a page — never repeated, never on non-pinned pages
- [ ] Uses `--sh-color` only (or an override pointed at the host's muted-text token) — never the primary text or accent color
- [ ] `pointer-events: none` — never blocks a real CTA near it
- [ ] Fades out by ~16% scroll into the pin (default `--sh-fade-rate: 6`), reusing the page's existing scroll-progress calculation — no second scroll listener
- [ ] `aria-hidden="true"` on the element
- [ ] `prefers-reduced-motion`: `display: none`
- [ ] Every implementation shares the identical `progress → opacity` contract
