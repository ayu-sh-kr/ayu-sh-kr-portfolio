# Build Instructions — Ayush's Portfolio (Pin-Scroll Reveal, Apple-Inspired)

You are building a single-page portfolio website for Ayush, a backend engineer. It must feel like an Apple product page: huge confident typography, one accent color, generous whitespace, and scroll-driven storytelling where sections **pin** to the viewport and animate as the user scrolls through them.

Placeholder copy below is intentional — Ayush will replace it. Keep every content string in one clearly marked place (a `content.js` object or data attributes) so swapping is trivial.

---

## 1. Stack

- **Tailwind CSS v3+** (Play CDN is fine for dev; a proper build with `tailwind.config.js` for production)
- **Vanilla JavaScript** — no animation libraries. All motion is `requestAnimationFrame` + scroll progress + IntersectionObserver.
- **Regular CSS** in one `styles.css` for what Tailwind doesn't cover: keyframes, the pin-stage mechanics, custom properties.
- No frameworks, no GSAP/Lenis/Locomotive. Native scroll only.

## 2. Design tokens

Define as CSS custom properties on `:root` and mirror in `tailwind.config.js` (`theme.extend.colors`).

```css
:root {
  --paper: #FAFAF8;        /* page background — warm white */
  --ink: #1D1D1F;          /* primary text (Apple ink) */
  --ink-soft: #6E6E73;     /* secondary text (Apple gray) */
  --hairline: rgba(29,29,31,0.10);
  --accent: #FF4D00;       /* persimmon — THE orange. use sparingly */
  --accent-deep: #C23A00;  /* hover / text-on-tint */
  --tint: #FFF1EA;         /* pale orange wash for chips/badges */
}
```

**Color discipline (this is what makes it Apple, not Halloween):** the page is 95% paper + ink. Orange appears only as: the accent word in the hero, the progress spine in pinned sections, link hovers, one CTA button, and small chips. Never as large background areas.

## 3. Typography

- Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Segoe UI", sans-serif`. (Optionally load Inter as fallback for non-Apple devices.)
- Display headlines: `clamp(2.75rem, 8vw, 7rem)`, weight 700, `letter-spacing: -0.035em`, `line-height: 1.02`.
- Section titles: `clamp(2rem, 5vw, 3.5rem)`, weight 600, `letter-spacing: -0.025em`.
- Body: 17–19px, weight 400, `line-height: 1.6`, secondary text in `--ink-soft`.
- Eyebrow labels: 13px, weight 500, uppercase, `letter-spacing: 0.08em`, color `--accent-deep`.
- Sentence case everywhere except eyebrows.

## 4. Page structure (in order)

```
<nav>            fixed, backdrop-blur, hairline border appears after 40px scroll
#hero            pinned 180vh — headline scales/fades out as you scroll
#journey         pinned 450vh — 4 chapters crossfade (the signature section)
#work            pinned 380vh — vertical scroll drives a horizontal project rail
#skills          normal flow — staggered reveal grid
#contact         normal flow — oversized CTA
<footer>         the colophon — closing "last page" of the book (see §4.7)
```

### 4.1 Nav
Logo text `ayush.dev` left; links Work / Journey / Skills / Contact right; `backdrop-filter: blur(20px)` with `background: rgba(250,250,248,0.72)`. Smooth-scroll anchors (`scroll-behavior: smooth` on html, but disable it when JS drives focus).

### 4.2 Hero (pin + scale-out)
- Eyebrow: `BACKEND ENGINEER · 4 YEARS`
- Headline: `I build backends that just work.` — the word `work.` in `--accent`.
- Sub: one sentence: JVM, AWS, sole engineer behind a growing dating app, open to freelance.
- Two buttons: filled ink `See my work`, ghost `Get in touch`.
- Scroll hint: tiny animated chevron/line at bottom.
- **Motion:** hero content is inside a sticky viewport; as progress p goes 0→1, apply `opacity: 1-p*1.4`, `transform: scale(1 - p*0.12) translateY(${p*-40}px)`.

### 4.3 Journey (the signature pinned section)
A sticky full-viewport stage inside a 450vh wrapper. Four chapters crossfade as scroll progress moves through equal windows. Layout: left = giant ghost index number (e.g. `01`) at ~20rem, 4% opacity ink; center = chapter content; bottom = thin orange progress spine that fills 0→100%.

Chapters (placeholder copy — keep structure):
1. **Foundation** — `BTech, Information Technology` · "Where the fundamentals were laid — systems, networks, and a bias for building."
2. **Indiknot** — `1 year · rug company` · "First production systems. Learned that software ships to real businesses, not tutorials."
3. **Sacrena** — `2 years · dating app` · "Sole backend engineer. I own the APIs, the data, the infra, and the 3am pages. Kotlin · Spring Boot · AWS · Postgres · Redis."
4. **Today** — `Freelance + open source` · "Maintaining the dota libraries and taking on client work."

**Crossfade math:** for chapter i of n, its window is `[i/n, (i+1)/n]`. Local progress `lp = clamp((p - i/n) * n, 0, 1)`. Opacity: fade in over first 25% of the window, hold, fade out over last 25% (except last chapter: no fade-out). TranslateY from 32px → 0 → -32px across the window.

### 4.4 Work (pinned horizontal rail)
Sticky stage inside a 380vh wrapper. A flex row of cards translates on X: `translateX(-p * (railWidth - viewportWidth))`. Cards ~420px wide, 24px radius, white bg, hairline border, hover lifts 4px. Each card: eyebrow (project type), title, one-line description, chip row (stack), arrow link.

Cards (placeholder):
1. **dota** — `open source · maintainer` — "dota-core, dota-wrap, dota-rest — a web-component wrapper in the spirit of lit. This site runs on the ideas behind it." Chips: Web Components, TypeScript.
2. **Sacrena** — `production backend` — "Core backend and infrastructure of a rapidly growing dating app, run by one engineer." Chips: Kotlin, Spring Boot, AWS, Postgres, Redis.
3. **Restaurant OMS** — `product` — "Order management that speeds up ordering and serving." Chips: Spring Boot, Postgres, Nuxt.
4. **Jalans** — `client work` — "Designed and built the web presence for a local clothing store." Chips: Design, Web.
5. **Your project** — CTA card, `--tint` background, orange arrow → scrolls to contact.

### 4.5 Skills
Normal flow. Six groups in a responsive grid (`auto-fit, minmax(240px, 1fr)`), each: eyebrow group name + chips. Reveal with IntersectionObserver: `opacity 0 → 1`, `translateY(24px) → 0`, 60ms stagger per card. Groups: Backend / Cloud & Infra / Data / Security / AI / Frontend (content from Ayush's skill list).

### 4.6 Contact
Display-size line: `Let's build something reliable.` (`reliable` in accent). One orange filled button `Email me`, ghost `Download resume`. Row of small links: GitHub · LinkedIn · IST (UTC+5:30).

### 4.7 Footer — the colophon ("the last page")

The footer is **not** a sitemap. The whole page is structured like a book (numbered chapters, eyebrow labels, giant ghost numerals, a spine that fills with time). The footer is the book's **closing page**, so it must speak that same language — do not bolt on a generic multi-column SaaS footer.

**Anatomy, top to bottom:**

1. **Ghost word.** A single giant word (`fin`) bleeding off the bottom edge, `font-size: clamp(7rem,22vw,20rem)`, weight 700, `opacity: .035`, `color: var(--ink)`, `position:absolute` centered, `pointer-events:none`, `aria-hidden`. This is the exact same device as the `01/02/03` ghost numerals in the Journey section — that's what ties the footer to the page. The footer wrapper is `position:relative; overflow:hidden` so the word clips.

2. **Eyebrow + title.** Reuse the site `.eyebrow` (`Colophon · the last page`) and a `.col-title` (`clamp(1.6rem,3.5vw,2.4rem)`, weight 600, `-.025em`). One line of the title in `--ink`, the continuation in `.soft`. Same title treatment as every other section — no new type scale.

3. **The support paragraph (the "story of time and work").** This is the emotional centerpiece — it's about hours accumulating into years. Typography rules (this is the part people get wrong):
   - Base text: **`--ink-soft`**, `font-size: clamp(1.05rem,1.6vw,1.2rem)`, `line-height: 1.65`, `letter-spacing: -.005em`, `max-width: 34rem`. Do **not** dump the whole paragraph in flat grey `.soft` — it flattens the hierarchy.
   - Lead clause: wrap in `.lede` → `color: var(--ink); font-weight: 500`. The opening sentence should sit darker/heavier than the rest so the eye lands there first.
   - The count of hours: wrap in `.odometer` → `color: var(--accent)`, weight 700, `tabular-nums`. This is the **only** accent in the paragraph. One number, one color pop — consistent with the page's "orange is rare" discipline.
   - So the color rhythm reads: **ink (lede) → ink-soft (body) → accent (number)**. Three tiers, deliberate.

4. **The index (this is the scalable link block).** A book's contents page is **grouped**, not a flat list — that's the pattern that scales. Use a responsive grid of numbered groups:
   - `.index-grid { display:grid; gap:2.5rem 2rem; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); }` — adding a 5th/6th/7th group wraps naturally with **zero structural change**. This is the whole point: the footer must grow as the site grows.
   - Each `.index-group` has a `.grp-head` (bottom hairline) containing a `.grp-num` (`01`, accent-deep, tabular, `.08em`) and a `.grp-title` (12px, uppercase, `.1em`, `--ink-soft`). The number continues the book's chapter-numbering motif.
   - Under each head, stacked `.index-link`s: 15.5px, weight 500, `color: var(--ink)`. On hover: `color: var(--accent-deep)` + `translateX(3px)`, and a leading `.tick` (`›`, accent) fades/slides in. Same restrained motion vocabulary as the nav and cards — never a background fill.
   - External links get a small `.ext` marker (`↗`) in `--ink-soft`; a `feed`/`↗` qualifier sits in `.ext` too.
   - **Suggested groups** (fill with whatever the site has): `01 Explore` (Work, Journey, Skills, About), `02 Work` (individual projects), `03 Engage` (Pricing, Contact, Speaking, Hire me), `04 Writing` (Blog, Notes, RSS), `05 Elsewhere` (GitHub, LinkedIn, X, Email). Groups and links are content swap points — see §7.

5. **Baseline strip.** Separated by a `.footline` top hairline. `flex`, `justify-between`, `items-baseline`. Left: `© {year} ayush.dev · Backend engineer · open for freelance work` in `.soft text-sm`. Right: a live **IST clock** (`.clock`, `tabular-nums`), reinforcing the "about time" theme.

**Two small scripted touches (both respect `prefers-reduced-motion`):**
- **IST clock:** `toLocaleTimeString('en-IN', {hour12:false, timeZone:'Asia/Kolkata'})` updated every 1s, appended with ` IST`. Runs always (it's not motion).
- **Hours odometer:** when the footer enters the viewport (IntersectionObserver, `threshold:.6`, fire once), count `.odometer` up to the target (~35,040 = four years of small hours) over ~1.4s with an ease-out cubic, formatted `toLocaleString('en-IN')` and prefixed `≈ `. Under reduced-motion, skip the animation and render the final number statically.

**Color discipline reminder:** the footer stays on `--paper` with hairline dividers only — **no gradient panel, no tinted background block.** The only orange in the entire footer is: the `.grp-num`s, link-hover states, the `.tick`, and the single `.odometer` number. Everything else is ink / ink-soft on paper, exactly like the rest of the page.


## 5. The animation engine (write exactly this pattern)

One scroll system, three primitives:

```js
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// progress of a pin-wrapper: 0 when its top hits viewport top,
// 1 when its bottom hits viewport bottom
function progressOf(wrapper) {
  const r = wrapper.getBoundingClientRect();
  return clamp(-r.top / (r.height - innerHeight), 0, 1);
}

let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { renderAll(); ticking = false; });
}, { passive: true });
```

- `renderAll()` reads each wrapper's progress once, then writes transforms/opacities. **Read all layouts before writing** to avoid thrash.
- Pin pattern in CSS: wrapper `position: relative; height: 450vh;` → child `position: sticky; top: 0; height: 100vh; overflow: hidden;`.
- IntersectionObserver (`threshold: 0.15`) adds `.is-in` for one-shot reveals; unobserve after firing.
- Only animate `transform` and `opacity`. `will-change: transform` on rail and hero content only.

## 6. Accessibility & performance (non-negotiable)

- `@media (prefers-reduced-motion: reduce)`: kill pin heights (wrappers become `height: auto`, children `position: static`), show all chapters stacked, rail becomes a normal horizontally scrollable/wrapped list, reveals appear instantly.
- All interactive elements keyboard reachable; visible `:focus-visible` ring (2px accent).
- Semantic landmarks: `<nav> <main> <section aria-labelledby> <footer>`; chapters are real headings (h2/h3), not divs of text.
- Lighthouse targets: performance ≥ 95, a11y ≥ 95. No layout shift: reserve heights, no images without dimensions.
- Test at 360px width: pinned sections must still read; drop ghost numbers to background on mobile.

## 7. Content swap points

Everything Ayush will replace lives in these slots — keep them together:
hero headline/sub · 4 journey chapters (title, meta, body) · 5 work cards (title, eyebrow, body, chips, link) · skills groups · contact email + resume URL + social links · footer index groups (group title + links) + support paragraph + odometer target.

## 8. Acceptance checklist

- [ ] Scrolling the full page tells a story: intro → journey → work → skills → contact
- [ ] Hero visibly scales/fades on first scroll (immediate feedback)
- [ ] Journey chapters never overlap illegibly mid-crossfade
- [ ] Rail reaches its final card exactly when the section unpins
- [ ] Reduced-motion mode is fully readable with zero JS motion
- [ ] Orange appears only in the places listed in §2
- [ ] All copy is sentence case; no Title Case headlines
- [ ] Footer reads as the book's "last page," not a SaaS sitemap: ghost `fin`, numbered index groups, no tinted background panel
- [ ] Footer index is a wrapping grid — adding a group reflows with no structural break
- [ ] Support paragraph shows three color tiers: ink lede → ink-soft body → accent number
- [ ] Hours odometer counts up once on entry; IST clock ticks; both degrade gracefully under reduced-motion
