# Grammar index — agent instructions

Paired with `grammar-index-demo.html`. This is the bridge page for the
design-grammar family: one section per grammar, each with context and a
door into the page. It is **Design grammar · 00** — the index is the
zeroth page, so it does not collide with any existing page number.

---

## Numbering is fixed and must not be renumbered

The existing pages already self-label in their eyebrow and footer, and
they cross-reference each other. Renumbering the index means editing
three other files.

| № | Grammar | File |
|---|---|---|
| 00 | Index | `grammar-index-demo.html` |
| 01 | Components & colour | `design-grammar.html` |
| 02 | Typography | `typography-demo.html` |
| 03 | Interaction | `interaction-grammar-v2.html` |
| 04 | Layout | `layout-grammar.html` |
| 05 | Notification | `toast-v2-demo.html` · `alert-demo.html` |

Colour is **not** a separate grammar — it lives inside 01 at `#tokens`.
If it is ever split into its own page, it takes the next free number; it
does not become 01a and everything else does not shift.

Notification is one grammar with **two** doors. Both carry the numeral
`05`. That is deliberate — it says the two surfaces are one layer. Do
not renumber them 05 and 06.

---

## Structure — one section per grammar, in this order

```
section-num  →  h2.title  →  p.lead  →  a.door  →  nav.jump
```

- The **lead** is the context: two or three sentences on what the layer
  settles, in Ayush's voice. Not a feature list — the door already
  carries the feature list.
- The **door** is the whole tile as a single `<a>`. It holds the ghost
  numeral, the title with a trailing arrow, a one-line contents
  description, the source filename in `.kv`, and a `.facts` readout.
- The **jump strip** is a separate `<nav>` of deep links *outside* the
  door. Anchors never nest, so the deep links can never live inside it.

Sections 06–08 are the page's own content and are what stop this being
a link list:

- **06 · Who owns what** — the ownership table plus the precedence note.
- **07 · Where to start** — five tasks routed to a reading order.
- **08 · Before it ships** — the six shared checks.

---

## Door anatomy — white body, dark numbers panel

The door is split by role, exactly as the coffee and pricing pages
already split theirs:

| Half | Carries | Surface |
|---|---|---|
| `.door-body` | `.door-l` label, the one-line definition, the filename, `Open the page →` | white, washes to `--tint` on hover |
| `.door-stats` | `.door-k` grammar number, then the counts | `--ink`, deepens to `#000` on hover |

**Numbers live on the dark half. Prose lives on the white half.** Never
the other way round, and never a door with the numbers set small and
grey at the edge of a white box — that was the first version and it is
the reason this section exists.

The counts are set at `--fs-title-sm` in white, semibold, tabular, with
their unit beneath in `.micro` at 55% white. They are the largest thing
on the door because they are the most interesting thing on it. The unit
label goes **under** the numeral, never beside it — beside it, the
numerals stop lining up and the tabular figures are wasted.

**The door never repeats the `h2` above it.** The section heading
already names the grammar; the door opens with `.door-l` — "What it
settles" — and then a single sentence at `--fs-lead`, weight 500, in
full `--ink` rather than grey. That sentence is the definition of the
layer in Ayush's voice, and it is the only line of real prose on the
door.

The card itself carries `overflow: hidden` and the radius, so the dark
panel bleeds to the edge and inherits the clip. That is why no nested
radius appears anywhere in the door — do not add one to `.door-stats`.

## Door behaviour — wash and nudge, never lift

- **Parent state:** `.door-body` washes to `--tint` over `.25s`, the
  border inks up to `--ink`, and `.door-stats` deepens to `#000`. One
  state, expressed on both halves of one object.
- **One child move:** the `.arr` travels `translateX(4px)` over `.25s`.

Wash is the sanctioned behaviour for a route, and a door is a route.

**Never give the door `translateY`.** Deep lift is reserved for a card
in a grid that is itself the link. These are full-width rows, and lift
XOR nudge is the rule — a container lifts, or a mark inside it travels,
never both.

The counts do not animate. They are readout, not decoration, and they
carry `font-variant-numeric: tabular-nums`.

## Contrast — checked, not assumed

| Pairing | Ratio |
|---|---|
| White numeral on `--ink` | 16.8 |
| 55% white unit label on `--ink` | 5.9 |
| `--accent` `.door-k` on `--ink` | 5.1 |
| `--accent-deep` arrow on `--tint` | 4.9 |
| `--ink` prose on `--tint` | 15.2 |

Arrows are `--accent-deep`, never `--accent` — full accent on the tint
wash falls to 3.0 and fails. This matches the arrow colour used on the
interaction page.

## Accent budget

**Zero `.btn-accent` on this page.** An index has no single primary
action — it has five equal ones. The doors are plain surfaces and the
one filled button at the foot is `.btn-ink`.

Accent appears in exactly six places: the display headline span, the
`.section-num` numerals, the active TOC rail marker, the counters in the
ship checklist, the `.door-k` grammar number on each dark panel, and the
door arrows in `--accent-deep`. Adding a seventh means taking one away.

The tint wash counts as accent too, but only while a pointer is on the
door — a resting page shows orange in small marks and nowhere else.

---

## Facts must stay true

Every number in a `.facts` strip is a count of something real in the
page it points at. They are the page's proof, so a stale one is worse
than none. Re-check them whenever a grammar page gains a section:

| Door | Claim | Where it comes from |
|---|---|---|
| 01 | 10 sections, 6 colour tokens | `design-grammar.html` section count; the six swatches in `#tokens` |
| 02 | 14 roles, 7 fluid, 7 fixed, 0 webfonts | the role table in `typography/SKILL.md` |
| 03 | 9 families, 16 verbs, 6 durations | the hero chips on `interaction-grammar-v2.html` |
| 04 | 4 measures, 10 space steps, 3 breakpoints, 7 z-levels | the tables in `layout/SKILL.md` |
| 05 | 8 toast sections, 6 rail positions, 3 alert tones | section ids in `toast-v2-demo.html`; `#position`; "Three tones" in `alert-demo.html` |

Hero chips are the same rule: `5 grammars · 2 token files · 1 accent ·
0 webfonts` are all verifiable. **Never put a round unverified number in
a chip** to make the page look substantial.

---

## Links to wire

`layout-grammar.html` and its seven `#` targets are written against the
sections in `layout/SKILL.md` and must be confirmed against the real
page. If the page uses `s01`-style ids like typography does, update the
jump strip to match. Every other href in the file points at a page that
exists.

---

## Do not re-add

These were considered and left out. They do not come back without a
reason written down here.

- **A grid of five cards.** It made the page a launcher, not a
  reference — there was nowhere for the context or the deep links to go.
- **A plain white door with the counts set small and grey at the right
  edge.** Five identical pale slabs, and the most interesting content on
  each one rendered as the least visible thing on it.
- **The grammar title repeated inside the door**, under the `h2` that
  already says it.
- **A ghost numeral watermark on the door.** With the dark panel
  carrying `.door-k`, two identifiers competed and neither won.
- **A `.btn-accent` "Start here" in the hero.** Five equal doors; a
  primary action would be a lie about which one to read.
- **Deep lift on the doors.** Reserved for grid cards. See above.
- **A total section count in a hero chip** ("46 specimens"). It goes
  stale silently the moment any grammar page gains a section.
- **A second display-tier element** anywhere below the hero.
- **Icons on the doors.** The family has no icon set; the numeral is
  the identifier.
- **A colour swatch preview inside door 01.** It duplicated the target
  page and made the door the only unequal one in the set.

---

## Ship checklist

1. Exactly one `.display`, in the hero, and zero `.btn-accent`.
2. All five grammars present, numbered 01–05, notification carrying two
   doors both numbered 05.
3. Every `.facts` number re-verified against its source page.
4. Every href resolves — including all seven `layout-grammar.html`
   anchors.
5. No anchor nested inside the door.
6. Doors wash, ink up and nudge; nothing lifts.
7. Every door splits white prose from dark numbers, stacking below
   700px with the dark panel underneath.
8. No door repeats the `h2` above it.
9. Scrollspy highlights all eight sections; TOC hidden below 1100px.
10. Reduced-motion block mirrors every transition, and the
   `data-rm="on"` block mirrors the media query exactly.
11. Zero raw `font-size`, `max-width`, `padding`, `gap`, `z-index` or
    `border-radius` values outside the inlined token block.
12. No horizontal scrollbar at 320, 768, 1440, or at 200% zoom.
13. Footer eyebrow reads `Design grammar · 00`.
