# Build Instructions — Blog for ayush.dev (Same Design System)

You are extending Ayush's Apple-inspired portfolio with a blog. Same design language as the portfolio spec: paper white, ink gray, one persimmon accent, system SF typography, hairline borders, scroll-driven motion. **But a blog's job is reading** — motion here is lighter than the portfolio: no long pinned scenes, just a fading hero, staggered reveals, live filtering, and a reading progress bar on articles.

Reuse the exact tokens from the portfolio build:

```css
--paper:#FAFAF8; --ink:#1D1D1F; --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
```

Stack: Tailwind v3+, vanilla JS, regular CSS. No animation libraries.

---

## 1. Content model

Ayush writes several kinds of posts. Every post has frontmatter (or a JS object) with:

```js
{
  slug: "distributed-locks-redis",
  title: "Distributed locks in Redis, without the folklore",
  category: "tutorial",        // tutorial | rant | news | notes
  date: "2026-07-12",
  minutes: 8,                  // reading time
  summary: "One-line hook shown on the index.",
  featured: false
}
```

**Categories** (fixed set, extendable):
- `tutorial` — step-by-step technical guides
- `rant` — opinions, delivered honestly
- `news` — takes on tech news
- `notes` — everything else (TILs, links, shorter thoughts)

Categories are labels, not colors. Everything uses the same tint chip (`--tint` bg, `--accent-deep` text) — the label text differentiates. Do NOT introduce a color per category; it breaks the one-accent discipline.

## 2. Blog index page (`/blog`)

Structure top to bottom:

### 2.1 Hero (compact pin, 140vh wrapper)
- Eyebrow: `THE BLOG`
- Headline (display scale, but one size smaller than portfolio hero): `Tutorials, takes, and the occasional rant.` — the word `rant.` in `--accent`.
- Sub: "Notes from running a production backend solo — what works, what broke, and what I think about it."
- Same scale/fade-out on scroll as portfolio hero (progress-driven, `scale 1→0.9`, `opacity 1→0`).

### 2.2 Filter bar (sticky under nav)
- Pill buttons: `All · Tutorials · Rants · News · Notes` + a live count of visible posts.
- Sticky: `position: sticky; top: 64px` (below nav), paper bg with blur so posts scroll beneath it.
- Active pill: filled `--ink` with white text (NOT orange — orange stays scarce). Hover: hairline darkens.
- Clicking filters instantly: matching rows fade/slide in (60ms stagger), non-matching collapse. Update the count. Reflect filter in URL hash (`#/tutorials`) so links are shareable.

### 2.3 Featured post (one card)
- Full-width card, white bg, 24px radius, hairline border, generous padding.
- Layout: chip row (category + read time) → 2.2rem title → summary → date + `Read →` link.
- Hover: lifts 4px, arrow slides 4px right. Entire card is the link (with proper `<a>` semantics).

### 2.4 Post list
- NOT cards. Hairline-divided rows (this contrast with the featured card is deliberate — Apple lists, not card soup).
- Row grid: `[date | title + summary | chip | →]`; on mobile stack to two lines.
- Row hover: title turns `--accent-deep`, arrow appears, background washes `--tint` at very low alpha.
- Rows reveal on first load with IntersectionObserver stagger.
- Empty state (a filter with no posts): "Nothing here yet. The `{category}` posts are brewing." + reset link.

### 2.5 Subscribe strip (optional but recommended)
- One hairline-topped row: "New posts, no noise." + email input + ink button `Subscribe`. Wire to whatever service later; for now `mailto:` fallback.

## 3. Article page (`/blog/{slug}`)

### 3.1 Reading progress bar
- 2px fixed bar at the very top (above nav border), `--accent` fill, width = article scroll progress. This is the article page's only orange chrome.

### 3.2 Title block
- Centered, max-width 680px: chip row (category · X min read · date) → display title (`clamp(2.2rem, 5vw, 3.6rem)`, -0.03em) → author line.

### 3.3 Prose typography (the core of this page)
Max-width **680px**, font-size **18px**, line-height **1.75**, `--ink` on paper.
- `h2` 1.6rem / `h3` 1.25rem, weight 600, tight spacing, extra top margin (2.5em) to create breathing room.
- Links: `--accent-deep`, underline on hover only.
- `blockquote` (rants live here): 3px `--accent` left border, italic off, `--ink-soft`, no rounded corner on the border side.
- Inline code: `--tint` bg, `--accent-deep` text, 4px radius, .9em.
- Code blocks (tutorials): `#1D1D1F` bg, `#F5F5F4` text, 16px radius, 15px mono, padding 1.25rem, horizontal scroll, small language label top-right in `--ink-soft`, copy button appearing on hover. Use highlight.js or Shiki at build time — no client-side highlighting cost if avoidable.
- A `.tldr` box for tutorials: `--tint` bg, 16px radius, "TL;DR" eyebrow, 2–3 bullet summary at the top.
- Images/figures: full bleed to ~800px, 16px radius, caption 14px `--ink-soft` centered.

### 3.4 End of article
- Hairline, then: chip row of category, share links, and prev/next post navigation as two quiet cards (title + arrow).
- "More like this": up to 3 rows from the same category, same row style as index.

## 4. Motion rules for the blog

- Index hero: pinned fade (the only pin on the blog).
- Everything else: one-shot IO reveals (opacity + 24px rise, 60ms stagger) and hover micro-interactions.
- Filter transitions: 250ms; never reflow so hard the user loses their place.
- Article pages: NO scroll-driven transforms on prose. Reading progress bar only. Motion must never compete with reading.
- `prefers-reduced-motion`: hero static, reveals instant, filter swaps without animation, progress bar still allowed (it's informational).

## 5. Files

```
blog/
├── index.html          # blog index
├── post.html           # article template
├── blog.css            # prose styles + shared additions
├── blog.js             # filtering, reveals, progress bar
└── posts/              # markdown or HTML fragments per post
```

If/when this integrates with the dota stack, each post row and the filter bar are good candidates for components; keep the data model above unchanged.

## 6. Placeholder posts to ship with (Ayush will replace)

1. tutorial — "Distributed locks in Redis, without the folklore" (8 min, featured)
2. tutorial — "Rate limiting a real API: token bucket in Spring Boot" (11 min)
3. rant — "Your microservices are just a distributed monolith with extra invoices" (5 min)
4. news — "What [AWS announcement] actually means if you run infra alone" (4 min)
5. notes — "TIL: EventBridge scheduler quirks" (2 min)
6. rant — "Stop putting business logic in your auth middleware" (6 min)

## 7. Acceptance checklist

- [ ] Filter pills work instantly, update the count, and survive a page reload via URL hash
- [ ] Featured card and list rows are fully keyboard navigable; whole row/card is one link
- [ ] Article prose measures 680px, 18px/1.75 — comfortable for a 10-minute read
- [ ] Code blocks scroll horizontally on mobile without breaking layout
- [ ] Reading progress reaches exactly 100% at article end
- [ ] Orange appears only in: hero accent word, chips, blockquote border, inline code, progress bar, hovers
- [ ] Reduced motion: fully readable, zero transforms
- [ ] Lighthouse: performance ≥ 95, a11y ≥ 95
