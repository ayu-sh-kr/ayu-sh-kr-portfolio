# Build Instructions — Showcase List Page (`/showcase`)

The index for all of Ayush's project case studies. It has to look intentional with **3 projects and still hold up at 30** — so the design scales by tiers, not by dumping everything in one grid. Same design system as the rest of ayush.dev: paper/ink, one persimmon accent (#FF4D00), system SF type, hairline borders, scroll-driven motion.

Reuse the shared layer (`tokens.css`, `ui.css`, `scroll.js`). Stack: Tailwind v3+, vanilla JS, regular CSS. No animation libraries.

---

## The scaling model (read this first)

The "I have many projects" problem is solved by **three tiers**, not one list:

1. **Spotlight** — the top 1–2 projects. Large, pinned, cinematic. This is where dota-workspace lives.
2. **Featured grid** — the next 4–8. Medium cards, two columns, reveal on scroll.
3. **The archive** — everything else. Compact hairline rows (like the blog index), filterable, can hold 20+ without visual fatigue.

A project moves between tiers by changing one field (`tier: "spotlight" | "featured" | "archive"`) in its data — the page re-renders it in the right place. You never redesign; you re-tag.

## Project data model

Every project (whether it renders as spotlight, card, or row) is one object. The **same object** feeds this list page and its article page (see article instructions).

```js
{
  slug: "dota-workspace",
  title: "dota-workspace",
  tagline: "A monorepo toolchain for building web-component apps.",
  tier: "spotlight",                 // spotlight | featured | archive
  kind: "open source",               // open source | product | client work | backend
  year: 2026,
  status: "active",                  // active | shipped | archived
  stack: ["TypeScript","Web Components","Vite"],
  accent: null,                      // null = site persimmon; or per-project hex for spotlight only
  cover: "/img/dota-cover.svg",      // used by spotlight + featured
  metric: { value: "8", label: "packages" },  // optional headline number
  summary: "One-line hook for the card/row."
}
```

Sort within each tier by `year` desc, then manual order.

---

## Page structure

```
<nav>                     shared, fixed
#hero          pinned 150vh — title + live project count
#spotlight     pinned per project — cinematic (see below)
#featured      normal flow — 2-col reveal grid
#archive       normal flow — filterable hairline rows
#support       help / how-I-work / CTA band
<footer>       shared
```

### Hero (pinned, 150vh)
- Eyebrow: `SHOWCASE`
- Headline (display): `Things I've designed, built, and shipped.` — `shipped.` in accent.
- Sub: one line — range of work from backend infra to open-source tooling to client sites.
- A live count rendered from data: `12 projects · 4 open source · 3 client`.
- Scroll scale/fade-out, same as portfolio hero.

### Spotlight (one pinned stage per spotlight project)
Each spotlight project gets its **own** pin-wrap (~260vh). As the user scrolls one project:
1. Cover/visual scales up from 0.9→1 and its corners un-round slightly (Apple product reveal).
2. Title + tagline rise in from below.
3. Stack chips fade in one by one (stagger).
4. The headline metric counts up (e.g., 0→8 packages) driven by scroll progress, not a timer.
5. A `View case study →` button resolves last, linking to `/showcase/{slug}`.
All progress-driven so scrubbing backward reverses cleanly. If two spotlight projects exist, they stack as two pin-wraps; a thin vertical index (◦ ◦) on the right shows which you're in.

### Featured grid (normal flow)
- Two columns desktop, one mobile. Cards: cover thumb, kind chip, title, tagline, stack chips, `→`.
- IO reveal with 60ms stagger; hover lifts 4px, cover zooms 3% inside its rounded mask.
- Whole card is one link to `/showcase/{slug}`.

### Archive (filterable rows)
- Filter pills: `All · Open source · Product · Client · Backend` (by `kind`), with live count, URL-hash synced — identical mechanics to the blog filter.
- Rows: `[year | title + tagline | kind chip | →]`, hairline divided, hover washes tint + arrow slides. Collapses to two lines under 640px.
- Empty state per filter.

### Support section (required)
A three-part band before the footer — this is what turns browsers into clients/recruiters:
1. **How I work** — 3 short columns (e.g. *Scope it together · Build in the open · Hand off clean*), each a title + one sentence.
2. **Help / FAQ** — 3–4 collapsible rows (`<details>` styled): "Do you take freelance work?", "Can you own a whole backend?", "What's your stack?", "How do we start?". Accessible disclosure, hairline dividers, chevron rotates on open.
3. **CTA** — oversized line `Have something to build?` + accent button `Start a conversation` → contact.

---

## Motion rules
- Hero + spotlights: pinned, progress-driven (scrub-reversible).
- Featured + archive + support: one-shot IO reveals and hover micro-interactions only.
- Metric count-up is tied to scroll progress, never `setInterval`.
- `prefers-reduced-motion`: pins collapse to static stacks, spotlight covers show at full scale, counts show final value, reveals instant.

## Acceptance checklist
- [ ] Adding a project = adding one data object; changing `tier` moves it between spotlight/featured/archive with no layout edits
- [ ] Page reads as intentional at both 3 and 30 projects
- [ ] Spotlight metric counts up on scroll and reverses on scroll-up
- [ ] Archive filter is keyboard operable, count-accurate, hash-synced
- [ ] Support FAQ is real `<details>` disclosure, keyboard + screen-reader friendly
- [ ] Every card/row is a single link to its case study
- [ ] Orange stays scarce (accent word, chips, metric, spine, hovers)
- [ ] Reduced motion fully readable; Lighthouse perf ≥ 95, a11y ≥ 95
