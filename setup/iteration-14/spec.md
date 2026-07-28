# Build spec — Support & Start a project

Two pages for **ayush.dev**, both static HTML with no framework and no build step.
They extend the visual system already established in `pricing-demo.html`,
`privacy-demo.html`, and `terms-demo.html`.

| File | Route | Purpose |
|---|---|---|
| `support-demo.html` | `/support` | Existing clients and library users get unstuck. Linked from the footer. |
| `start-project-demo.html` | `/start` (aliased `#contact`) | New work comes in: a spec, an idea, or a quote request. |

The two pages link to each other directly, so the pair can be clicked through as-is.

---

## 1. Shared foundations

### 1.1 Tokens

Identical to the existing pages. Do not introduce new colours without a reason.

```css
--paper:#FAFAF8;  --ink:#1D1D1F;  --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
--good:#0F9D58;   --warn:#B8860B;   /* support page only, status dot */
```

- **Type**: system stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Inter`). No web fonts.
- **Radii**: 999px pills · 24px cards · 18px selectable cards · 14px inputs · 12px file chips.
- **Body copy**: 14.5–15px at 1.55–1.65 line height. Section ledes 1.15rem.
- **Rhythm**: `5–6rem` vertical section padding, `1.5rem` gutters (`1.2rem` under 640px),
  content max-width `56rem` (support) / `64rem` (start a project, which is two-column).
- **Tailwind 2.2.19** is loaded from CDN for utility spacing only. All components are hand-written CSS.

### 1.2 Shared components

| Component | Class | Notes |
|---|---|---|
| Reading progress | `#progress` | 2px accent bar, fixed top, width = scroll fraction of document. |
| Nav | `#nav` | Fixed, `backdrop-filter: blur(20px)`, gains a hairline border past 40px scroll. Current page marked `.here`. |
| Skip link | `.skip` | Off-screen until focused; jumps to the page's primary interactive region. |
| Buttons | `.btn` + `.btn-ink` / `.btn-accent` / `.btn-ghost` | 2px lift on hover, 2px accent focus ring at 3px offset. |
| Chip | `.chip` | Tint pill, `accent-deep` text. Metadata only, never interactive. |
| Option chip | `.opt` | Interactive pill. Single-select fills ink; multi-select fills tint (`.chipset.multi`). |
| File drop | `.drop` | Drag/drop + browse, pointer-following radial light, `.dragging` state, chips list below. |
| Scroll reveal | `.reveal` → `.is-in` | IntersectionObserver at `threshold .12`, 55ms stagger between siblings. |
| Inline label hint | `.opt` | 10.5px uppercase `accent-deep` at 60% opacity. Carries `optional` / `pick any` only — never a sentence. |
| Footer | `.site-foot` | Four columns: brand, Work, Writing, Help. Collapses to 2 columns under 760px. |

### 1.3 Responsive behaviour

Breakpoints, in the order they fire:

| Width | What changes |
|---|---|
| `960px` | Intake drops to one column; the brief panel unsticks and moves below the form; the pinned mobile meter appears. |
| `860px` (height) | Short viewports unstick the brief panel too, so it can never be clipped. |
| `860 / 820px` | Step grids go 4→2; mode cards stack. |
| `760px` | Footer goes 4→2 columns. |
| `680px` | Support desk strip stacks to one column. |
| `640px` | Gutters tighten to 1.2rem, section padding drops ~30%, inputs go to 16px, submit rows go full-width, nav gap and type shrink. |
| `560px` | Brief rows stack label-over-value; two-column field grids collapse. |
| `520 / 480px` | Confirmation timeline stacks; step grids go to one column. |
| `400px` | Nav type and brand shrink again to hold 360px. |
| `hover:none` | Chip and accordion touch targets grow to ~44px. |

**Mobile specifics**

- Inputs are `16px` under 640px. Anything smaller makes iOS Safari zoom the page on focus.
- `env(safe-area-inset-bottom)` pads the pinned meter clear of the home indicator.
- Hover-only affordances (row slide, tint wash, pointer lights) are switched off rather than
  left to fire on tap.
- `-webkit-tap-highlight-color: transparent`; focus rings still show.

### 1.4 Quality floor (applies to both pages)

- Every interactive element has a visible focus state (`2px solid var(--accent)`).
- `prefers-reduced-motion: reduce` disables reveals, transitions, the pulse animation,
  and the pointer-following lights; scroll jumps become instant.
- Verified down to 360px. No horizontal scroll (`overflow-x:hidden` on body).
- All icons are inline SVG with `aria-hidden="true"`; no icon font.
- Live regions: `aria-live="polite"` on the route answer, file lists, and FAQ result count.
- No `localStorage`, no cookies, no third-party scripts.

---

## 2. Page A — Support

**Job:** answer the question without a message being sent. Failing that, make sending one easy
and honest about what happens next.

**Audience:** existing clients (bugs, invoices, access) and users of the open-source dota libraries.

### 2.1 Structure

```
nav
header.sup          hero + desk strip + urgent escape hatch
main
  #support          quick-help routes → inline answer → ticket form   [the original section]
  #next             what happens after you send (4 steps)
  #faq              searchable FAQ, 21 questions, 5 categories
  #shelf            self-serve resources (4 rows)
  #elsewhere        wrong-door redirects (3 cards)
footer
```

### 2.2 Hero + desk strip

Three cells in one bordered card:

| Cell | Content | Source |
|---|---|---|
| Systems | Pulsing dot + "All operational" | Should read from a real status source. Currently static. |
| Replying in | "~4 hours" | Median first-reply over 30 days. Static; update by hand or from the inbox. |
| At the desk | "Mon–Fri, 10:00–19:00 IST" + computed sub-line | Computed client-side. |

The sub-line compares now against IST office hours (UTC+5:30, Mon–Fri, 10:00–19:00) and renders
either `At the desk now · your time 4:12 PM` or `Away right now · messages still land, replies come
next working morning`. The systems dot is **not** driven by desk hours — being asleep is not an outage.

Below the strip, a persistent line routes live outages to `mailto:hello@ayush.dev` with `URGENT`
in the subject, deliberately bypassing the form.

### 2.3 Quick-help routes (`#routes`)

Three `.route` cards: `down`, `howto`, `billing`. Behaviour:

- Single-open. Clicking a card opens its answer and closes any other.
- Clicking the open card closes it.
- The answer unfurls in a shared `#answer` region (`max-height` 0 → 560px transition).
- Each answer is `{ k: heading, html: body }` in the `answers` map, containing a paragraph
  plus two `<details>` mini-FAQs.
- `aria-expanded` tracks state; `aria-controls="answer"`; the region is `aria-live="polite"`.
- Cards carry a pointer-following radial gradient (`--mx`/`--my` custom properties).

To add a route: add a `.route` button with a new `data-route` key and a matching entry in `answers`.

### 2.4 Ticket form (`#ticket`)

Hidden behind a quiet handoff button ("None of these — I need a person"), which toggles
`max-height` and swaps its own label to "Hide the form".

| Field | id | Type | Required |
|---|---|---|---|
| Name | `f-name` | text | yes |
| Email | `f-email` | email | yes |
| Topic | `.tpill` | single-select pill, toggleable off | no |
| Details | `f-msg` | textarea | yes |
| Attachments | `fileInput` | multi file | no |

- Validation is client-side and non-blocking until submit: invalid fields flash their border
  accent for 1.6s and focus moves to the first offender.
- Files: max 10MB each, max 6. Rejected silently over the limit — **should surface a message
  before ship.**
- On submit the inner form is replaced by a confirmation that echoes the address given.
  "Send another" resets fields, files, and topic.

**Backend contract (to build):** `POST /api/support` with
`{ name, email, topic, message, files[] }`, returning `{ ok: true }`. Needs spam protection —
a honeypot field plus rate limiting by IP is sufficient at this volume.

### 2.5 What happens after you send (`#next`)

Four numbered steps with a time commitment each: Immediately / Within a day / 1–3 days / Same week.
Numbering is justified here because it is a genuine sequence. White background band to separate
it from the paper sections around it.

### 2.6 FAQ (`#faq`)

21 questions across 5 categories: `help`, `scope`, `dota`, `billing`, `security`, plus `all`.

Each question is a `<details class="q" data-cat="…">` containing a `<summary>` and a
`.qa` body that opens with a `.qtag` category label.

Filtering:

- On init, each item caches `data-text` (lowercased summary + body) and its original summary HTML.
- Search and category filter are combined with AND. Hidden items are also force-closed.
- Matches are wrapped in `<mark>` **in the summary line only**, rebuilt from the cached HTML each
  pass so highlights never compound.
- The count line reads `21 questions` when unfiltered, `N of 21 questions` otherwise.
- Zero results shows `.noq`, whose button opens the ticket form, scrolls to `#support`,
  and focuses the message field.

To add a question: append a `<details class="q" data-cat="…">` block. The count and search pick it
up automatically. If a new category is needed, add a `.cat` button with a matching `data-cat`.

### 2.7 Remaining sections

- **`#shelf`** — four resource rows (handover docs, dota readmes, status history, changelog).
  Hover slides the row right and washes in a tint gradient. Replace `href="#"` with real URLs.
- **`#elsewhere`** — three cards routing non-support traffic to Start a project, Pricing, and Legal.
  The first already points at `start-project-demo.html`.

### 2.8 Note on the original section

`#support` (hero copy aside) is your original `support-section.html`, kept verbatim —
markup, classes, JS, and copy. Its hints are chattier than the newly-tightened intake form
("optional, but they speed things up", "no queue, no bot triage"). Left alone deliberately;
say the word and I'll bring it in line with the intake copy.

---

## 3. Page B — Start a project

**Job:** take a spec, an idea, or a quote request through one adaptive form, and show the sender
exactly what will land in the inbox.

**Audience:** prospective clients arriving cold, or arriving from the estimator on the pricing page.

### 3.1 Structure

```
nav
header.start        hero + availability facts + estimator carry-over bar
main
  #intake           step 1: mode picker  ·  step 2: form + live brief panel
  #howstart         how a project starts (4 steps)
  #other            alternatives (3 cards)
footer
```

### 3.2 Mode picker (step 1)

Three `.mode` cards behaving as a radio group (`role="radiogroup"` / `role="radio"`,
arrow-key navigation, `aria-checked`):

| Mode | Label | Reveals |
|---|---|---|
| `spec` | I have a spec | Project name · spec link · what the doc won't tell me |
| `idea` | I have an idea | One-line purpose · who it's for · what success looks like |
| `quote` | I need a quote | Work type chips · scope · stack and constraints |

Switching modes shows the matching `.branch` and hides the others. **Values in the shared blocks
and in the other branches persist** — switching is not destructive.

### 3.3 Fields

Branch fields (above), then two shared blocks.

**Shape of it**

| Field | id | Type | Values |
|---|---|---|---|
| Where things stand | `haveNow` | multi-select | Nothing yet · Designs · A prototype · Live product · An in-house team |
| Budget | `budget` | single-select | Under $3k · $3k–$6k · $6k–$15k · $15k+ · Monthly retainer · No idea yet |
| Timeline | `timing` | single-select | Yesterday · Within a month · 1–3 months · This year, no rush · Just exploring |
| Attachments | `fileInput` | multi file | ≤20MB each, ≤8 files |

"Nothing yet" is mutually exclusive with the other `haveNow` options in both directions.
Budget ranges mirror the tiers on the pricing page; keep them in sync if pricing moves.

**You**

| Field | id | Required |
|---|---|---|
| Name | `c-name` | yes |
| Email | `c-email` | yes |
| Company | `c-org` | no |
| Best next step | `nextStep` | defaults to "Reply by email"; alternative "20-minute call". Cannot be empty. |
| NDA needed | `ndaBox` | checkbox, appends "· NDA first" to the next-step row |

### 3.4 Copy rules for this form

Deliberately tightened after the first pass. Hold the line on these:

- A label is a label. No explanatory tail, no parenthetical philosophy.
  "Budget", not "Budget you're working with".
- Only optionality or a selection rule may ride along in `.opt`, which renders as a small
  uppercase accent tag: `optional`, `pick any`. One or two words, never a phrase.
- One `.help` line survives on the whole page (budget: "A range, not a commitment.")
  because it changes what people type. Anything else earns its place the same way or gets cut.
- Placeholders carry one thought and are examples, not instructions.
- Never explain the same thing in both the label and the placeholder.

### 3.5 The brief panel (signature element)

Sticky at `top: 88px` on desktop; falls below the form under 960px, and unsticks on any viewport
shorter than 860px. **The panel does not scroll internally** — it grows to its content, so the brief
is always readable in full.

Under 960px its job is taken over by a pinned bar at the bottom of the viewport (`#mmeter`) carrying
the same meter and label. It hides on submit and returns on "Edit and resend".

Ten rows, each `<div class="brow" data-row="…"><dt>label</dt><dd>value</dd></div>`:
`mode`, `project`, `detail`, `stands`, `budget`, `timing`, `files`, `from`, `reply`, `next`.

- Empty rows show a faint placeholder (`Anonymous so far`, `Waiting on you`, `Nothing yet`) —
  the panel is never blank, it shows the shape of the brief with its gaps.
- `setRow()` only touches the DOM when the value actually changes, then flashes the row
  (`.new`, 0.8s tint fade). Suppressed under reduced motion.
- `detailFor()` composes the gist from whichever branch is active, truncating long text
  (110–150 chars) with an ellipsis.
- `briefText()` serialises the same rows to plain text for the copy button.

**Completeness meter** — weights sum to 100:

| Signal | Weight |
|---|---|
| The gist (branch detail) | 22 |
| Email | 14 |
| Name | 12 |
| Budget | 12 |
| Timeline | 10 |
| Project name / work type | 8 |
| Where things stand | 8 |
| Attachment or spec link | 8 |
| Company | 6 |

Thresholds: `<35` Sparse — I'll have questions · `<65` Workable · `<90` Solid — enough to quote ·
else Ready to send. The meter never gates submission; it nudges.

### 3.6 Estimator carry-over

The pricing page's estimator CTA (`#contact`) should link here with query parameters:

```
start-project-demo.html?type=Cloud%20setup&stage=Already%20live&low=4060&high=6090
```

| Param | Effect |
|---|---|
| `type` | Matched case-insensitively against the work-type chips; selects the match. |
| `stage` | Displayed in the carry-over bar only. |
| `low` / `high` | Displayed as a ballpark and appended to the copied brief text. |

Any parameter present switches the page to `quote` mode and shows the carry-over bar,
which has a Clear button that resets the chip and the stored ballpark.

### 3.7 Submit and confirmation

Only name and email block submission; everything else is optional by design. Invalid fields flash
their border for 1.6s and take focus.

The confirmation swaps the form body for a receipt: a three-row timeline
(Today / In 2 days / Within a week), **Copy this brief** (writes `briefText()` to the clipboard,
with a fallback message if the Clipboard API is unavailable), and **Edit and resend**.

The confirmation sub-line branches on brief quality — a thin brief is told to expect questions
rather than a proposal.

**Backend contract (to build):** `POST /api/brief` with

```json
{
  "mode": "spec|idea|quote",
  "project": "string",
  "detail": { "…branch-specific fields…": "string" },
  "workType": "string|null",
  "have": ["string"],
  "budget": "string|null",
  "timing": "string|null",
  "next": "Reply by email|20-minute call",
  "nda": true,
  "carried": { "type": "…", "stage": "…", "low": 4060, "high": 6090 },
  "contact": { "name": "…", "email": "…", "org": "…" },
  "files": []
}
```

Server should render the same row order as the panel so the email matches what the sender saw.

---

## 4. Cross-page wiring

| From | To |
|---|---|
| Support · nav "Work with me" | `start-project-demo.html` |
| Support · "Start a project" card | `start-project-demo.html` |
| Support · footer "Work with me" | `start-project-demo.html` |
| Start a project · nav "Support" | `support-demo.html` |
| Start a project · "Already a client?" card | `support-demo.html` |
| Start a project · footer "Support" | `support-demo.html` |
| Pricing · estimator CTA and all tier CTAs | `start-project-demo.html` (add the query string on the estimator CTA) |

Remaining `href="#"` links are placeholders for pages that don't exist in this set:
Work, Blog, Pricing, Status, Privacy, Terms, changelog, docs, repos.

---

## 5. Before ship

1. Wire both forms to real endpoints; add a honeypot field and rate limiting.
2. Decide file upload strategy — presigned S3 PUT is the obvious fit given the rest of the stack.
3. Point the support desk strip at a real status source, or state plainly that it's manual.
4. Confirm the reply-time and availability claims are ones you'll actually meet; they're
   promises, not decoration.
5. Replace placeholder URLs in the resource shelf and both footers.
6. Surface a message when a file is rejected for size or count instead of dropping it silently.
7. Decide whether the original support section's copy should be tightened to match §3.4.
