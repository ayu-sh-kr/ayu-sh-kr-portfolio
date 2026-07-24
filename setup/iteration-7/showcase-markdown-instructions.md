# Build Instructions — Markdown-First Showcase Case Page

**New direction:** a case study is a **markdown document**, not a designed layout. Ayush writes prose the way he writes blog posts; the page is text-first. A small set of custom components can be dropped **inline in the markdown as tags**, and his own framework (dota) renders them as web components. The pinned-scroll motion is a thin reading enhancement layered on top — never the structure.

Design system unchanged: paper/ink, one persimmon accent (#FF4D00), system SF type, hairline borders. Reuse the shared layer (`tokens.css`, `ui.css`, `scroll.js`). Tailwind v3+, vanilla JS/regular CSS for the demo; dota components in production.

---

## Authoring model (this is the whole idea)

A case study is a `.md` file with frontmatter + prose + occasional component tags:

```markdown
---
slug: dota-workspace
title: dota-workspace
tagline: A monorepo toolchain for building web-component apps.
kind: open source
year: 2026
status: active
stack: [TypeScript, Web Components, Vite]
cover: /img/dota.svg
links:
  - { label: Repo, href: https://github.com/... }
  - { label: Docs, href: https://... }
next: restaurant-oms
---

Authoring web components meant repeating the same boilerplate in every app.
I wanted modern ergonomics without giving up the platform.

<Metrics>
- { value: 8, label: packages }
- { value: 1, label: workspace }
</Metrics>

## A core, then satellites

`dota-core` defines the component model. Everything else — routing, data,
UI — is a thin package built on it, so you adopt only what you need.

<Aside kind="note">
The whole point: apps built on dota outlive framework churn.
</Aside>

## It runs this site

The portfolio, blog, and this showcase are all built on dota — the strongest
proof the ergonomics hold up in production.
```

**Prose is the default.** Components are seasoning, not the meal. A case study with zero components must still render as a clean, complete article. Ayush should be able to write one in a text editor without thinking about layout.

## The component vocabulary (keep it small)

Each maps to a dota web component in production; in the demo they're plain custom elements enhanced by JS. Keep the set tight — every new component is new authoring burden.

- `<Metrics>` — a list of `{value, label}`; renders as big-type stats in a row, count up on reveal. For the 1–4 headline numbers.
- `<Aside kind="note|warn|quote">` — a callout. `quote` = the rant/opinion voice (accent left-border), `note` = tinted box, `warn` = for caveats.
- `<Figure src caption>` — an image with caption; optional `wide` attribute for a fuller bleed.
- `<Code lang>` — fenced code already works via markdown; this is only for when a label/copy-button is wanted. Prefer plain triple-backtick fences.
- `<Stack>` — renders the frontmatter `stack` as chips inline, if the author wants them mid-prose rather than in the header.

That's the whole set. Resist adding more; the value is that authoring stays close to plain markdown.

## Rendering pipeline

1. Parse frontmatter → header block (chips: kind · year · status; title; tagline; optional cover).
2. Render markdown body to HTML (build-time; use your md renderer — this is where `dota-md` fits).
3. Custom tags in the body are left as custom elements; dota upgrades them on load. In the demo, a small JS pass enhances them.
4. Wrap the article in the reading shell (progress bar, prose measure, support footer).

## Page layout (text-first)

```
#progress          2px accent reading bar — the only pinned/orange chrome
<nav>              shared
header             chips + title + tagline + optional cover (NOT pinned-cinematic; a quiet header)
article.prose      the rendered markdown — 720px measure, 18px/1.75, the star of the page
  ...prose, with <Metrics>/<Aside>/<Figure> inline where authored...
#toc               optional sticky left-rail table of contents on desktop (from h2/h3), auto-built
#support           related case studies + how-I-work/FAQ + CTA + next
<footer>           shared
```

### Header (quiet, not cinematic)
Left-aligned within the prose measure (or centered — pick one and keep consistent). Chip row, display title (`clamp(2.2rem,5vw,3.4rem)`), tagline, then the cover as a calm image below (no scale-up theater). The old spotlight cinematics move to the **list page** only; case pages stay readerly.

### Prose (the core)
720px measure, 18px, line-height 1.75. Same prose styles as the blog article (h2/h3 spacing, accent links, blockquote, inline code, dark code blocks with a language label + copy button). This is deliberately the same reading surface as the blog — a case study reads like a well-written post.

### Table of contents (optional)
If the article has 3+ `h2`s, show a sticky TOC in the left margin on wide screens, built from headings, highlighting the active section as you scroll. Collapses on mobile. This is the one nod to "many projects" navigation.

## Motion (deliberately minimal)
- Reading progress bar (top, accent) — the only always-on motion.
- `<Metrics>` count up once on reveal (IO-triggered).
- One-shot fade/rise reveals on headings and figures as they enter — subtle, 24px rise.
- Active-section highlight in the TOC.
- **No pinned chapters, no cover scale-up, no horizontal rails on case pages.** Motion serves reading, nothing more.
- `prefers-reduced-motion`: reveals instant, counts show final value, progress bar may remain.

## Why this fits Ayush's setup
- Authoring is just markdown → same flow as his blog, low friction, versionable in git.
- Components are his framework's job → the page *is* a live demo of dota rendering custom elements inside markdown.
- Text-heavy → recruiters and clients read substance, not choreography.
- Scales to many projects trivially: a new case study is a new `.md` file. No layout work, ever.

## Acceptance checklist
- [ ] A `.md` with only prose (no components) renders as a complete, polished article
- [ ] `<Metrics>`, `<Aside>`, `<Figure>` render correctly inline and degrade to readable text if the enhancer doesn't run
- [ ] Prose measures 720px at 18px/1.75; reads comfortably for a 10-minute case study
- [ ] TOC appears only with 3+ headings, tracks the active section, collapses on mobile
- [ ] Reading progress hits 100% at article end
- [ ] No pinned/cinematic motion on the case page; motion is reading-only
- [ ] Orange stays scarce (accent word, chips, metrics, aside border, inline code, progress bar)
- [ ] Reduced motion fully readable; Lighthouse perf ≥ 95, a11y ≥ 95

> Note: the **list page** (`../iteration-6/showcase-list-instructions.md`) is unchanged and keeps its spotlight/featured/archive tiers — that's where visual richness lives. Only the individual case page becomes text-first. The two are designed to complement: a rich index leading into calm, substantive reads.
