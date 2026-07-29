# Alert dialog — agent instructions

Component spec for `alert-demo.html`. This file is the contract. If a rebuild
or a future agent contradicts anything here, this file wins.

---

## 1. What this is

The browser primitive — `alert()`, `confirm()`, `prompt()` — rendered in the
ayush.dev grammar. It **stops the page and asks one question**. Nothing else
can happen until it is answered.

**It is not the notification component.** The two are opposites and must never
converge:

| | Alert dialog | Notification / toast |
|---|---|---|
| Interrupts | yes, blocking | no |
| Requires an answer | yes | no |
| Dismisses itself | **never** | yes, on a timer |
| Position | centred, top layer | corner, page layer |
| Stacking | one at a time, queued | several at once |

If a message does not need an answer, it is not this component.

---

## 2. Built on native `<dialog>`

Non-negotiable. `showModal()` supplies, for free and correctly:

- the top layer (no `z-index` war with the nav or the sticky pill)
- the focus trap
- ESC handling, via the `cancel` event
- `inert` background — the page behind is unreachable by tab and by AT
- focus return to whatever element opened it

**Do not reimplement any of these in JS.** A hand-rolled `div` modal is a
regression, not a refactor.

Two platform details the CSS must respect:

```css
/* WRONG — a bare display value defeats the UA's dialog:not([open]){display:none}
   and the dialog is permanently visible */
.dlg { display: grid; }

/* RIGHT */
.dlg[open] { display: grid; grid-template-rows: minmax(0,1fr); }
```

ESC is intercepted (`e.preventDefault()` in the `cancel` handler) so the exit
transition runs and so `pending` can refuse it. It is never disabled outright
except during `pending`.

---

## 3. Anatomy

```
dialog.dlg.dlg-surface
└── form.dlg-form            method="dialog", submit intercepted
    ├── div.dlg-body         scrolls; everything else is fixed
    │   ├── div.dlg-head
    │   │   ├── span.dlg-ic      38px round dot — the ONLY place tone appears
    │   │   └── div
    │   │       ├── h2.dlg-title
    │   │       └── p.dlg-text   optional, .soft colour
    │   ├── div.dlg-field       optional, ONE input, never two
    │   │   ├── div.dlg-lbl     label left / .dlg-hint right
    │   │   └── input.field
    │   └── p.dlg-err           async failure only, role="alert"
    └── div.dlg-foot          hairline above, actions right, primary last
```

`.dlg-surface` is shared with the static anatomy specimen on the demo page so
the card can be rendered inline without being opened. Keep it separate from
`.dlg`; `.dlg` owns position, motion, shadow and the top-layer concerns only.

---

## 4. Tokens — every value is borrowed, none invented

| Property | Value | Source |
|---|---|---|
| Surface | `#fff` + `1px solid var(--hairline)` | `.panel` |
| Radius | `var(--layout-radius-xl)` — 28px | layout |
| Padding, body | `--layout-space-6` (32), `--layout-space-5` (24) below 520 | layout |
| Padding, footer | `--layout-space-4` / `--layout-space-6` | layout |
| Shadow | `0 12px 40px -12px rgba(29,29,31,.5)` | the sticky contact pill — the one "floats above the page" shadow in the system |
| Scrim | `rgba(29,29,31,.34)` + `blur(4px)` | ink at low alpha; the blur echoes the nav bar at a quarter of its strength |
| Stacking | `var(--layout-z-modal)` | layout |
| Glyph dot | 38px, `--layout-radius-round` | layout |
| Title | 1.22rem / 600 / `-.02em` | `.title-sm` tier |
| Body copy | 15px / `--ink-soft` / 1.6 | `.soft` |
| Hint | 11.5px, weight 400, `--ink-soft` at 80% opacity, lowercase, right | established hint contract (coffee page) |
| Field | `.field` unchanged, 16px on `(pointer: coarse)` | grammar |

### Width — the one judgement call

`--dlg-w: 29rem`, capped at `38rem` (`--layout-form-max`).

This is **component-owned sizing**, in the same category as `.field`'s
`min-width: 220px` — not a page measure. The layout skill forbids adding a
container measure without a human decision, and none was added. If a formal
`--layout-dialog-max` is ever wanted, that is Ayush's call to make, not an
agent's.

---

## 5. Tones — three, colour only

Tone changes the glyph colour and the primary button's clothing. It changes
**nothing else**: same anatomy, same motion, same keyboard contract. This is
exactly how `.act` variants work.

| Tone | Maps to | Glyph | Primary | Focus lands on | Scrim dismisses |
|---|---|---|---|---|---|
| `note` | `alert()` | ink on `rgba(29,29,31,.06)` | `.btn-ink` | primary | yes |
| `ask` | `confirm()` | `--accent-deep` on `--tint` | `.btn-accent` | primary | yes |
| `risk` | destructive confirm | `--err` on `rgba(194,58,0,.1)` | `.act.v-danger` | **Cancel** | **no** |

The three glyphs share one circle and differ only in the mark inside — one
family, drawn at 24 viewBox, stroke 1.9, round caps. No emoji, no filled
warning triangle.

`note` hides the Cancel button entirely. It has one button because there is
nothing to decide.

### There is no success tone

A completed action reports itself on the button that started it — `.act`
already owns `success`. A dialog that opens only to say "done" is an
interruption with nothing to interrupt. Do not add one.

---

## 6. States

`closed → open → (pending) → closed`

`pending` exists only when a `onConfirm` handler is supplied.

**Static primary is `.btn`. Async primary is `.act`.** Never substitute one for
the other — this is the same rule the design grammar states for buttons
generally, and the dialog does not get an exception.

During `pending`:

- primary takes `data-state="pending"`, gains the spinner glyph, label swaps to `busy`
- primary, Cancel and the input all disable
- ESC is ignored, scrim click is ignored
- **the dialog does not close** — nothing can strand a request mid-flight

On resolve: the dialog closes and the promise resolves with the handler's
return value (or the field value if it returned `undefined`).

On reject: the dialog **stays open**, the primary returns to idle, the reason
prints in `.dlg-err`, and focus moves to Cancel. The user never loses the
question they were answering.

---

## 7. Motion — one idea

The dialog **arrives**. That is the whole idea.

- **Enter**: scrim fades `.22s ease`; card `opacity 0→1`, `translateY(10px) → 0`, `scale(.97) → 1` over `.26s / .28s cubic-bezier(.2,.8,.2,1)`
- **Exit**: same properties reversed at `.18s`, then `close()` after `190ms`
- Enter is armed with a double `requestAnimationFrame` after `showModal()` so the transition has a start value

Nothing else moves. The glyph does not animate. The scrim does not animate its
blur. No bounce, no spring past 1.

`prefers-reduced-motion: reduce` → opacity only, no transform, and `settle()`
closes synchronously rather than waiting out a transition that will not run.

---

## 8. Keyboard and AT contract

| Key | Behaviour |
|---|---|
| `Tab` | trapped inside, native |
| `Esc` | cancels — ignored during `pending` |
| `Enter` | submits the form → confirm. Works from inside the field. |

- `role="alertdialog"` when there is no field, `role="dialog"` when there is
  (a field means the user has work to do, not just a message to acknowledge)
- `aria-labelledby` → `.dlg-title`, `aria-describedby` → `.dlg-text`
- `.dlg-err` carries `role="alert"` so failures are announced without moving focus first
- Focus target: field if present, else Cancel for `risk`, else primary
- `risk` deliberately focuses the destructive-safe control. A confirm key is
  often already under a finger when the dialog appears.
- Page scroll is locked on `<html>` with the scrollbar width compensated as
  `padding-right`, so opening does not shift the layout behind the scrim

---

## 9. API

One node in the DOM, reused. Nothing is created or destroyed per open. The
machine writes content in and reads state out; the DOM only reflects published
state. Same separation as the action button — logic in the machine, UI reflects
it.

```js
Alert.note   ({ title, body, confirm })                    // → Promise<true>
Alert.ask    ({ title, body, confirm, cancel, onConfirm })  // → Promise<boolean|any>
Alert.risk   ({ title, body, confirm, cancel, onConfirm })  // → Promise<boolean|any>
Alert.prompt ({ title, body, confirm, cancel, field })      // → Promise<string|null>
```

`field: { label, hint, placeholder, value, guard }` — `guard(value)` returns a
boolean and the machine disables the primary when it is false. The guard lives
in the machine, never as an inline handler on the button.

**Calls serialise.** A second call while one is open goes on a queue and opens
when the first settles — the way the browser serialises its own dialogs. Two
dialogs are never on screen at once.

Cancel resolves `false`, or `null` when a field is present — matching the
browser's own return contract.

---

## 10. Copy rules

- **The title is the question.** Never "Are you sure?" — say what happens.
  "Delete the staging database?" not "Confirm deletion".
- **The body is the consequence**, in `.soft`, two lines at most. What is lost,
  what cannot be undone, what still exists.
- **The primary label is the verb from the title.** "Discard", not "OK".
  "Delete it", not "Yes".
- Cancel is named after what staying does when that is clearer: "Keep editing",
  "Not yet".
- Voice is Ayush's: human, never apologetic, never scolding. A destructive
  dialog states the cost plainly; it does not lecture the person for reaching
  for it.

---

## 11. Do not re-add

Removed on purpose. If any of these reappear, the component has drifted.

- ✗ A close **X** in the corner — Cancel and ESC are the two exits
- ✗ Auto-dismiss, countdowns, or any timer
- ✗ Stacked or nested dialogs
- ✗ A success tone or a "done" dialog
- ✗ Toast behaviour: corner placement, slide-in from an edge, several at once
- ✗ Scrolling the page behind the scrim
- ✗ A second input field
- ✗ Accent colour on a destructive primary
- ✗ A hand-rolled `div` + `z-index` modal replacing native `<dialog>`
- ✗ A bare `display` value on `.dlg` outside `[open]`
- ✗ Emoji glyphs, or a filled warning triangle

---

## 12. Pre-ship checklist

- [ ] Closed dialog is invisible — `display` is only set under `[open]`
- [ ] Tab cannot escape; the background is inert to AT
- [ ] ESC cancels; ESC during `pending` does nothing
- [ ] Enter from inside the field confirms
- [ ] Focus returns to the opening element on close, every path (OK, Cancel, ESC, scrim)
- [ ] `risk` focuses Cancel, not the destructive primary
- [ ] Scrim click dismisses `note` and `ask`, never `risk`, never during `pending`
- [ ] Async primary is `.act` with a real `pending` state, not a `.btn` with a swapped label
- [ ] Async failure leaves the dialog open with the reason visible
- [ ] Only one dialog on screen; a queued second one opens after the first settles
- [ ] Opening does not shift the page (scrollbar width compensated)
- [ ] Field is 16px on `(pointer: coarse)` — no iOS zoom on focus
- [ ] Footer stacks `column-reverse` full-width below 520px, hover lift dropped
- [ ] Long body copy scrolls inside `.dlg-body`; the footer stays put
- [ ] `prefers-reduced-motion` → fade only, no transform, no delayed close
- [ ] Checked at 320px, 768px, 1440px and at 200% browser zoom
- [ ] Checked on a landscape phone, roughly 700×360 — the dialog still fits `85svh`
- [ ] Zero raw font-size declarations outside the role tiers
- [ ] No `z-index` integer written bare

---

## 13. Open items

- **`scroll-hint` precedent applies**: the dota-core implementation section is
  not written here either. When the real component API is shared, `.dlg` wraps
  into a `<dota-alert>` with the machine as the element's controller and the
  same public verbs. Shadow DOM internals use plain CSS — Tailwind's generated
  stylesheet cannot cross the boundary.
- **`--layout-dialog-max`**: not added. Width is component-owned at `29rem`.
  Promoting it to a layout token is a human decision.
- **Wire-up**: once the site's real destructive actions exist (delete draft,
  revoke key, discard intake), replace the demo triggers with real handlers and
  delete the resolution log section.
