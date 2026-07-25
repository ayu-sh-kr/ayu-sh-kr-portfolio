# Build Instructions — Privacy Policy Page for ayush.dev

You are adding a **privacy policy** to Ayush's Apple-inspired site. Same design language as the portfolio, blog, showcase, and pricing specs: paper white, ink gray, one persimmon accent, system SF typography, hairline borders. **But a legal page's job is to be found, read, and trusted** — so motion is the lightest on the whole site: a reading progress bar, a sticky TOC, one-shot reveals. Nothing is pinned. Nothing scrubs.

The page serves two audiences at once and must be legible to both:

- **Portfolio POV** — a stranger reading the blog, subscribing, or emailing. They want to know: are you tracking me, and do you have my email?
- **Freelance POV** — a prospective client about to hand over repository access, cloud credentials, and possibly their users' data. They want to know: where does my data sit, who else touches it, and what happens when we're done?

Reuse the exact tokens from the portfolio build:

```css
--paper:#FAFAF8; --ink:#1D1D1F; --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
```

Stack: Tailwind v3+, vanilla JS, regular CSS. No animation libraries.

> **Before publishing:** the copy in `privacy-demo.html` is a well-structured starting point written to match how Ayush actually works — it is **not** legal advice and hasn't been reviewed by a lawyer. Every claim in it (retention windows, subprocessors, regions) must be checked against reality, and the finished page should be reviewed by someone qualified in the jurisdictions Ayush's clients care about.

---

## 0. The one job

A visitor should finish the page **less worried than when they arrived**, and a client should find the one section they came for in under ten seconds. Everything is subordinate to that:

1. **Say the answer first.** A plain-English summary box at the top, before any numbered section.
2. **Label every section by who it's for.** Site visitors / Clients / Everyone.
3. **Never hide legal text.** The scope switch and TOC are navigation aids. Nothing filters, collapses, or hides — a policy you have to unfold is a policy that looks like it's hiding something.

## 1. Page structure (in order)

```
#progress          2px accent reading bar — the only always-on motion
<nav>              shared, fixed, hairline appears after 40px scroll, "Legal" is the current item
header.legal       chips (Privacy · Version) + title + tagline + updated line + summary box
[scope switch]     segmented control: "Visiting the site" / "Working with me" — jumps, never filters
#toc               sticky left-rail TOC on ≥1200px, grouped, tracks the active section
main.prose#doc     the numbered sections — 720px measure, 18px/1.75
.legal-foot        cross-links to Terms and "Work with me", version line, back to top
<footer>           shared, one line
```

### 1.1 Header (quiet, never cinematic)
Left-aligned within the 720px measure. Chip row → `<h1>` at `clamp(2.2rem,5vw,3.4rem)` / `-.03em` → one-line tagline in `--ink-soft` → the **updated line**.

The updated line reuses the `.sp-proof` pattern from the speaking section — inline, small, hairline separators, values in `--ink` semibold with `tabular-nums`:

```
Last updated 25 July 2026  /  In effect from 1 August 2026  /  Applies to ayush.dev and client work
```

Three facts, no more. A legal page whose date is buried reads as stale.

### 1.2 The summary box (the trust move)
Same construction as the blog's `.tldr`: `--tint` background, 20px radius, `.eyebrow` reading **THE SHORT VERSION**, then 3–5 one-line bullets.

Rules for this box:
- It answers the questions people actually arrive with — do you sell my data, do you track me, do you have my email, what happens to my code.
- It is **not** the policy, and it says so in a small `--accent-deep` footnote line at the bottom. Never let the summary be the only place a fact appears.
- Keep every bullet under two lines. If a bullet needs a caveat, the caveat belongs in the section, not here.

## 2. The scope switch

A pill-shaped segmented control, identical construction to the pricing page's: `.seg` container, absolutely positioned `.seg-thumb` in `--ink` that measures `offsetLeft`/`offsetWidth` of the active button and slides + resizes to it.

- Two options: **Visiting the site** → `#visit`, **Working with me** → `#client-data`.
- Clicking scrolls to that section. It does **not** filter, dim, or hide anything.
- `role="tablist"`, `aria-selected` maintained, `:focus-visible` ring in accent.
- Above it, an eyebrow: `READ THE PART THAT'S ABOUT YOU`.

This exists because the two audiences genuinely want different halves of the document, and scrolling past nine sections about analytics to find the DPA paragraph is a bad first impression for a client.

## 3. Section anatomy

Every section is:

```html
<section class="lsec reveal" id="visit" data-group="As a visitor" data-short="When you visit">
  <div class="lsec-head"><span class="chip">Site visitors</span></div>
  <h2><span class="n">03</span>When you visit the site<a class="anchor" href="#visit">#</a></h2>
  …prose…
</section>
```

- `data-group` — the TOC group heading this section falls under. Groups are emitted **in document order**, whenever the value changes, so ordering is never sacrificed to grouping.
- `data-short` — the TOC label. Always shorter than the heading.
- `.chip` — the audience label. **Same tint chip for all three values**; only the text differs. This is the blog's category rule applied here: no color per audience, ever.
- `.n` — the section number in `--ink-soft`, **not** accent. Seventeen accent numbers down the page would blow the one-accent discipline; the numbers are for citation, not emphasis.
- `.anchor` — a `#` that appears on `h2:hover` or keyboard focus, copies the deep link to the clipboard, and shows a small "Link copied" label for ~1.4s. Legal sections get cited in emails; make them citable.

`scroll-margin-top: 92px` on `.lsec` so anchored jumps clear the fixed nav.

## 4. Prose and content components

720px measure, 18px, line-height 1.75 — deliberately the same reading surface as the blog article and the showcase case page.

Three components carry the content:

- **`.ltable`** — hairline-divided data table, no vertical rules, uppercase `--ink-soft` headers, first column semibold. Below 640px each row **restacks into a block** with the column name injected via `td[data-l]::before`. Tables are the right tool here: "what / why / how long" is a matrix, and prose about retention is unreadable.
- **`.aside note`** — tinted callout with an uppercase `--accent-deep` tag. Use for the things a client needs to notice (the DPA paragraph).
- **`.aside quote`** — 3px `--accent` left border, `--ink-soft` text, no radius on the border side. Use once, at most twice, for the honest line that makes the page sound like a person.

Inline code (`--tint` bg, `--accent-deep` text) for regions, bucket names, header names.

## 5. Table of contents

- Fixed left rail, `top:118px`, 190px wide, `display:none` below 1200px.
- Built at runtime from `.lsec` elements: emit a `.toc-group` label whenever `data-group` changes, then one link per section using `data-short`.
- Active link: `--accent-deep` text, `--accent` left border. Track by finding the last section whose `getBoundingClientRect().top < 140`.
- `max-height:70vh; overflow-y:auto` — a privacy policy has enough sections to overflow a short viewport.

## 6. Content model — what the page must cover

Ship these seventeen sections. Numbers are the demo's; keep the grouping.

**The basics** — 01 Who I am · 02 What this policy covers

**As a visitor** (portfolio POV)
- 03 **When you visit the site** — server logs and analytics, in a `what / why / kept for` table. The honest framing: aggregate counts, no cross-site tracking, IPs in logs for 30 days.
- 04 **Cookies and local storage** — say plainly why there's no consent banner, and mention any local preference (reduced motion, theme) that never leaves the device.
- 05 **The newsletter** — what's stored (address + confirmation date), what it's used for, that unsubscribing deletes rather than suppresses.
- 06 **When you get in touch** — inbox and calendar retention, plus the line that matters: **the pricing estimator runs entirely client-side and stores nothing.** That's a real privacy property of the pricing page and it should be claimed.

**As a client** (freelance POV)
- 07 **Client and project data** — credentials, repos, schemas. Four commitments: access lives in the client's accounts, credentials never in plain text, minimal local copies, records kept only where tax law requires. Ends with the off-boarding promise.
- 08 **Data I process on your behalf** — the controller/processor distinction in one plain sentence, then the DPA note, then the breach-notification commitment.
- 09 **Confidentiality and NDAs** — confidential by default; cross-link the Terms for the rules on naming a client publicly.

**For everyone**
- 10 **Who else touches your data** — subprocessor table: `service / what it handles / where`. AWS, analytics, email, scheduling, payments.
- 11 **How long I keep things** — retention table, ending on the honest exception: tax records can't be deleted on request.
- 12 **Where your data lives** — India + provider regions; the practical note that client infra can be region-pinned if decided early.
- 13 **Security** — concrete practices, then the `.aside quote` admitting nobody can promise perfect security.
- 14 **Your rights** — access, correction, deletion, portability, objection, withdrawal of consent; one email address, no form, no fee, 30-day completion, right to complain to a supervisory authority.
- 15 **Children** — professional site, not directed at under-18s.
- 16 **Changes to this policy** — version + date move; material changes get emailed.
- 17 **Getting in touch about privacy** — one accent button, `mailto:` with a prefilled subject.

**Tone rule throughout:** short declarative sentences, active voice, no "we may from time to time". This is a one-person operation — the page should read like one person answering, because that's the whole credibility argument.

## 7. Motion rules

- Reading progress bar — the only always-on motion, and the page's only orange chrome besides chips, links, aside borders and inline code.
  ```js
  const start = doc.offsetTop, end = start + doc.offsetHeight - innerHeight;
  progress.style.width = (end>start ? clamp((scrollY-start)/(end-start),0,1)*100 : 0) + '%';
  ```
  It must hit exactly 100% at the last section, not at the footer.
- One-shot IO reveals on sections: opacity + 24px rise, `threshold:.08`, unobserve after firing. **No stagger delay** — sections are read one at a time, and a delay on a section the reader has already reached feels broken.
- Segmented thumb slides/resizes.
- Anchor `#` fade on hover; "Link copied" label.
- Single throttled `scroll` → `requestAnimationFrame(render)` loop, one IntersectionObserver. Same engine as everywhere else on the site.
- `prefers-reduced-motion`: reveals instant, no smooth scrolling, progress bar still allowed (it's informational).

## 8. Print styles (non-optional here)

People save legal pages. `@media print`: hide `#progress`, `#nav`, `#toc`, the scope switch and back-to-top; black on white; drop the max-width; force reveals visible; `break-inside:avoid` on `.lsec`; append `href` after links via `a::after{content:" (" attr(href) ")"}`; give the summary box a border instead of a tint fill.

## 9. Files

```
legal/
├── privacy.html        # this page
├── terms.html          # see terms-agent-instructions.md
├── legal.css           # the shared shell: header, summary, .lsec, .ltable, .aside, #toc, print
└── legal.js            # TOC builder, progress, reveals, scope switch, anchor copy
```

`legal.css` / `legal.js` are shared verbatim between the two pages — the demo inlines them so each file opens standalone. In the dota stack, `<LegalSection>`, `<DataTable>`, and the TOC are the natural components; keep `data-group` / `data-short` / the chip label as the section's props.

## 10. Content swap points (keep together for easy editing)

Version number and both dates (header + footer) · every retention window in §11 · the subprocessor table in §10 (**verify each one before publishing**) · the analytics provider's name and region · the contact address and prefilled subjects · the jurisdiction reference in §12 and §14 · the DPA availability claim in §08. Retention windows and subprocessors are the two things most likely to drift out of date — keep them in tables, never buried in prose.

## 11. Acceptance checklist

- [ ] Summary box answers the top four questions before any numbered section, and says it isn't the policy
- [ ] Every section carries an audience chip; all chips use the same tint (no color per audience)
- [ ] Scope switch jumps only — no section is ever hidden, dimmed, or collapsed
- [ ] TOC groups appear in document order, track the active section, and disappear below 1200px
- [ ] Every `h2` has a copyable deep link that clears the fixed nav when followed
- [ ] Tables restack readably at 375px with their column names intact
- [ ] Reading progress hits exactly 100% at the last section
- [ ] Section numbers are `--ink-soft`; orange appears only in chips, links, aside borders, inline code, the progress bar, the anchor mark, and the one CTA button
- [ ] Printed output is clean: no chrome, links show their URLs, sections don't split across pages
- [ ] Reduced motion: fully readable, zero transforms
- [ ] Cross-links to Terms and "Work with me" resolve; footer version line matches the header
- [ ] Lighthouse: performance ≥ 95, a11y ≥ 95; responsive to 320px
- [ ] **Reviewed by an actual lawyer before it goes live**
