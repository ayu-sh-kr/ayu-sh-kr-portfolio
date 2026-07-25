# Build Instructions — Terms & Conditions Page for ayush.dev

You are adding a **terms and conditions** page to Ayush's Apple-inspired site. It is the **sibling of the privacy policy** and shares its entire shell — the same header, summary box, scope switch, section anatomy, TOC, tables, print styles, and JS. Read `privacy-agent-instructions.md` first; this document only covers what's different.

Same design language throughout: paper white, ink gray, one persimmon accent, system SF typography, hairline borders, 720px reading measure.

```css
--paper:#FAFAF8; --ink:#1D1D1F; --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
```

Stack: Tailwind v3+, vanilla JS, regular CSS. No animation libraries.

> **Before publishing:** the copy in `terms-demo.html` is a realistic starting point built around how Ayush actually works — it is **not** legal advice. Payment terms, liability caps, IP assignment, and the governing-law clause all have real consequences and must be reviewed by a lawyer in the relevant jurisdiction before this page goes live.

---

## 0. The one job

The privacy page exists to reassure. **This page exists to prevent arguments.** Its job is that nobody is ever surprised — not about who owns the code, not about what happens when an invoice is late, not about whether their name can appear in the portfolio.

That gives it a distinct voice from every other page on the site:

- **Every clause states the rule, then the reason.** "Late payment pauses work after 14 days overdue. I'll always warn you first; I'd rather hear that cash is tight than chase silence." The reason is what stops a term reading as hostile.
- **Concede the reasonable thing in the clause itself.** Small requests stay free. Community events can ask. Most of this is negotiable. A terms page that only protects one side gets skimmed and distrusted.
- **Never use words Ayush wouldn't say on a call.** No "heretofore", no "the Company". First person throughout — he's one engineer, and the page is stronger when it sounds like it.

## 1. Page structure

Identical shell to the privacy page, with two content differences:

```
#progress          2px accent reading bar
<nav>              shared, "Legal" is the current item
header.legal       chips (Terms · Version) + title + tagline + updated line + summary box
[scope switch]     "Using the site" → #use  /  "Hiring me" → #estimates
#toc               sticky left-rail, grouped, active-section tracking
main.prose#doc     24 numbered sections
.legal-foot        cross-links to Privacy and "Work with me", version line, back to top
<footer>           shared
```

**Updated line** — third fact differs from the privacy page: `Governed by the law of India` instead of the applies-to line. Jurisdiction is the fact a client scans for.

**Summary box** — five bullets, and unlike the privacy page's these are *rules*, not reassurances:

- Read anything here, quote it with credit, don't republish it wholesale as your own.
- Code in blog posts is free to use and comes with no warranty.
- Prices and the estimator are honest ballparks, not offers.
- Paid work runs on a signed agreement, which wins over this page.
- When you've paid in full, the work is yours.

That fourth bullet is the most important sentence on the page — put it in the summary and repeat it in §01, because it's what makes the rest of the page safe to keep simple.

## 2. Section anatomy

Unchanged from the privacy page: `.lsec` with `data-group` + `data-short`, an audience `.chip`, an `--ink-soft` `.n` number, and a copyable `.anchor`. **Section numbers matter more here than anywhere else on the site** — clauses get cited by number in emails and proposals, so once published, numbers are effectively frozen. Add new clauses at the end of their group rather than renumbering.

## 3. Content model — the 24 sections

**The basics**
- 01 **What you're agreeing to** — using the site accepts these terms; sections 3–8 cover the site, 9–19 cover paid work, and **a signed proposal or MSA overrides this page**.
- 02 **Who you're dealing with** — one named person, one email, definitions of "I" and "you".

**Using the site** (portfolio POV)
- 03 **Using the site** — permitted freely (read, share, link, print, feed to a reader). Four prohibitions: aggressive scraping, unauthorised security testing, wholesale republishing "with or without an AI in the middle", implied endorsement. Close with a responsible-disclosure invitation — it turns a prohibition into an offer.
- 04 **What's mine, and what you may use** — writing and design reserved; quoting with a link needs no permission; **code snippets are explicitly free for any use with no attribution**; open-source libraries fall under their own repo licences, not this page.
- 05 **Posts are opinions, not advice** — the blog is one engineer's experience, not professional advice; the `.aside quote` carries the line about tutorials being tested on his machines; opinions are his alone, not any employer's or client's.
- 06 **Links to other places** — no control over third parties, and an explicit statement that there are no affiliate or paid links.
- 07 **The newsletter** — free, one-click cancel, never sold or lent; defer storage details to the Privacy Policy.
- 08 **Availability** — personal site, no uptime promise, content can change, old links maintained on a best-effort basis.

**Working with me** (freelance POV)
- 09 **Estimates are not quotes** — this section is the direct legal counterpart of the pricing page's estimator. State plainly that displayed prices are not an offer and nothing on the site creates a contract at a stated price. Ship the pricing page and this clause together.
- 10 **How an engagement starts** — call → written proposal (scope, deliverables, timeline, price, schedule) → written acceptance + deposit. Email acceptance is sufficient. Invite the client's own MSA early.
- 11 **Scope and changes** — out-of-scope work is re-quoted, never refused; written change notes with price and timeline impact; **small things stay free**, said explicitly.
- 12 **Fees, invoices, and taxes** — milestone billing, retainers monthly in advance with no rollover, 14-day terms, third-party costs on the client's own accounts, work pauses at 14 days overdue after a warning, Indian taxes added where required.
- 13 **What I need from you** — access, answers, one decision-maker; the client warrants it has the right to hand over what it hands over; a 30-day idle clause that releases reserved time.
- 14 **Who owns what** — the ownership table (see §4 below), plus retention of title until payment, with a sentence admitting it has never mattered in practice.
- 15 **Confidentiality** — confidential by default; "I'll sign your NDA; I don't need you to sign mine"; defer handling to the Privacy Policy.
- 16 **Speaking engagements** — written confirmation, travel at cost, a tiered cancellation ladder (>21 days free / <21 days 50% / <7 days 100%), full refund plus help finding a replacement if he cancels, recording welcome, slides remain his under a licence attendees keep. Close with the community/non-profit invitation.
- 17 **Cancellation and refunds** — 14 days' notice either way, pay for accepted work, refund the balance, and **a handover regardless of how it ends**. Retainers stop at the end of a billing month.
- 18 **Warranty and the fix window** — 30 days of free defect fixes, with "defect" defined against the proposal; new features and third-party systems excluded; `.aside note` acknowledging no software is bug-free.
- 19 **Showing the work** — the clause a portfolio site genuinely needs. Default permission to name the client and describe the problem; a hard list of what never appears without written permission (source, credentials, metrics, user data, private screenshots, NDA material); and an unconditional right to be removed later, "no negotiation, no explanation needed".

**For everyone**
- 20 **Liability** — as-is for site visitors; for clients, capped at fees paid for that engagement, no indirect or consequential loss either way, with the standard carve-out for fraud, gross negligence, and anything that can't legally be limited.
- 21 **Ending things** — site access restriction, engagement termination by reference to §17, and which clauses survive (confidentiality, ownership, liability).
- 22 **Governing law** — India, courts of Uttar Pradesh, severability, plus a "we talk before anyone reaches for a lawyer" line.
- 23 **Changes to these terms** — apply to site use on posting, to engagements only from the next signed proposal, **never retroactively**.
- 24 **Questions** — "if a clause here is a problem, say so before we start"; one accent CTA button.

## 4. The ownership table (§14)

The single most-read block on the page. It's a table, not prose, because it's a lookup — a client scans for one row.

| What | Yours or mine |
|---|---|
| Code written for your project | Yours, on full payment |
| Infrastructure and accounts | Yours — set up in your name from day one |
| Documentation and ops handbook | Yours |
| My pre-existing libraries and helpers | Mine, licensed to you perpetually and royalty-free |
| Open-source dependencies | Under their own licences, which I'll list |
| Workshop slides and exercises | Mine, licensed to your team for internal use |

Uses `.ltable`, and restacks into labelled blocks below 640px via `td[data-l]::before`. Note the coherence with the pricing page's promise — *"It's your code, your AWS account, your docs"* — and with the portfolio's hand-off-ready positioning. If either page changes, change both.

## 5. Motion, print, and accessibility

All identical to the privacy page. Progress bar over `#doc`, no-stagger one-shot reveals at `threshold:.08`, segmented thumb, anchor copy, one throttled scroll loop, one IntersectionObserver, full `@media print` block, `prefers-reduced-motion` handled.

Orange budget for this page: progress bar, chips, prose links, the `.aside` tag and quote border, inline code, the anchor `#`, and exactly one accent CTA button at §24. Nothing else.

## 6. Files

Shares `legal.css` and `legal.js` with the privacy page verbatim; the demo inlines both so `terms-demo.html` opens standalone.

```
legal/
├── privacy.html
├── terms.html          # this page
├── legal.css           # shared shell
└── legal.js            # shared behaviour
```

## 7. Cross-page consistency (check on every edit)

These four pages make promises about each other. When one moves, check the others:

| Claim | Lives in |
|---|---|
| "Your code, your AWS account, your docs" | pricing page FAQ ⇄ Terms §14 |
| "Ranges are starting points, not walls" | pricing page ⇄ Terms §09 |
| Estimator stores nothing | pricing page ⇄ Privacy §06 |
| NDA and client-naming rules | Privacy §09 ⇄ Terms §15, §19 |
| Version number and last-updated date | header ⇄ footer, both legal pages |

## 8. Content swap points

Version number and both dates · payment terms and the late-payment window in §12 · the speaking cancellation ladder in §16 · the warranty window in §18 · the ownership table rows in §14 · the liability cap wording in §20 · **the jurisdiction in §22** · the contact address and prefilled subjects. Fee mechanics and jurisdiction are the two most consequential — flag them for the lawyer explicitly.

## 9. Acceptance checklist

- [ ] Summary box states the five rules and says a signed agreement overrides the page
- [ ] §01 repeats the override in full — a reader who skips the summary still sees it
- [ ] §09 exists and is consistent with the pricing page and its estimator
- [ ] §14's ownership table matches the pricing page's hand-off promise, row for row
- [ ] §19 gives clients an unconditional right to be removed from the portfolio
- [ ] Every clause states a rule **and** its reason; no clause reads one-sided
- [ ] Section numbers are stable, cited-in-email friendly, and `--ink-soft`
- [ ] Every `h2` has a copyable deep link that clears the fixed nav
- [ ] Tables restack readably at 375px with column names intact
- [ ] Reading progress hits exactly 100% at §24
- [ ] Scope switch jumps only — nothing is hidden or collapsed
- [ ] Printed output is clean: no chrome, link URLs shown, clauses don't split across pages
- [ ] Reduced motion: fully readable, zero transforms
- [ ] Cross-links to Privacy and "Work with me" resolve; footer version matches the header
- [ ] Lighthouse: performance ≥ 95, a11y ≥ 95; responsive to 320px
- [ ] **Reviewed by an actual lawyer before it goes live**
