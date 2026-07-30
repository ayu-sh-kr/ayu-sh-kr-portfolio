# Build Instructions — Action Buttons (Loading Contract) for ayush.dev

You are adding the **action button** system to Ayush's site: one component, one contract, for every button that triggers async work — subscribe, send, save, delete, book, retry. The whole point is that these buttons **cannot drift**. There are many of them across the app; each must show the same loading behaviour, obey the same states, and look like the same family. We achieve that by making the button a **pure state-renderer** driven by a shared **event bus** — it carries no work of its own, so there is nothing to implement differently, and therefore nothing to get wrong.

Design system unchanged: paper/ink, one persimmon accent (#FF4D00), system SF type, hairline borders, `cubic-bezier(.2,.8,.2,1)` easing. Tailwind v3+, vanilla JS/regular CSS in the demo; a dota component in production. No animation libraries.

```css
--paper:#FAFAF8; --ink:#1D1D1F; --ink-soft:#6E6E73;
--hairline:rgba(29,29,31,.1);
--accent:#FF4D00; --accent-deep:#C23A00; --tint:#FFF1EA;
--ok:#1F7A3D; --err:#C23A00;   /* status colors — used only on the transient success/error flash */
```

---

## 0. The core idea (read this first)

A button must never own its loading state. If it does, every place that uses one re-implements `setLoading / await / setLoading(false)`, and they diverge — someone forgets the error case, someone animates a different spinner, someone allows a double-click.

So we split three concerns that are usually tangled in one `onclick`:

1. **Trigger** — the interaction (click / Enter / Space). The button’s only job here is to *announce intent* on the bus. It does not know what the work is.
2. **Work** — a **handler**, registered once per action name, does the async work. It lives in exactly one place.
3. **Presentation** — the button subscribes to *its own action’s lifecycle* on the bus and renders state. It is a function of bus events, nothing else.

Because the button has no logic beyond "reflect what the bus says about my id," it is structurally incapable of deviating. Variants change **color, never behaviour**.

```
 interaction ──▶ Bus.trigger(action,id,payload)
                      │
                 dispatcher ──▶ handler(action)  ──resolves──▶ Bus.resolve(id)
                      │                            └─throws───▶ Bus.reject(id)
                      ▼                                              │
              button locks pending ◀───────────────────────────────┘
              button renders success / error, then returns to idle
```

## 1. The state machine (Contract A — states & transitions)

A button is **always in exactly one** of these. There are no other states.

```
        trigger              resolve
 idle ──────────▶ pending ──────────▶ success ──(2.2s)──▶ idle
   ▲                 │                                      │
   │                 │   reject                             │
   │                 └───────────▶ error ──(2.6s)──▶ idle ──┘
   └──────────────────────────────────────────────────────┘
```

| State | Trigger in | Visual | Interactive? |
|---|---|---|---|
| `idle` | (default / after reset) | label only | yes (if enabled) |
| `pending` | `action:trigger` for my id | spinner + busy label | **no — locked** |
| `success` | `action:resolve` for my id | drawn check + done label | no (auto-resets) |
| `error` | `action:reject` for my id | drawn cross + fail label | no (auto-resets) |

**Rules that never bend:**
- `success` and `error` are **transient** — they auto-return to `idle` after 2.2s / 2.6s. They are feedback, not resting states.
- The state is written to `data-state` on the element. **All visuals derive from `data-state`** via CSS. JS sets one attribute; CSS does the rest. This is what keeps variants from expressing state differently.
- A button in `pending` ignores further triggers (see Contract B).

## 2. Trigger (Contract B — interaction → intent)

On `click`, `Enter`, or `Space`, the button publishes and **immediately locks**:

```js
function fire(){
  if(state==='pending' || btn.hasAttribute('disabled')) return;  // no double-fire, ever
  Bus.trigger(btn.dataset.action, btn.dataset.id, collectPayload(btn));
}
```

- The button **does not call the handler** — it only publishes intent. Trigger is decoupled from work, which is why the *same* action can be fired from anywhere else (a keyboard shortcut, another component, a bus message) and this button will still reflect it. The demo proves this with "Fire remotely" controls.
- `action` (`data-action`, e.g. `newsletter.subscribe`) names *what to do*. `id` (`data-id`) names *this instance*, so the button can recognise events meant for it. Two buttons may share an action but must have distinct ids.
- `payload` is gathered at fire time by `collectPayload` (form fields, selection, etc.). Keep this the one place that reads the DOM for input.

## 3. Kill / resolve (Contract C — what ends `pending`)

Exactly one of two bus events returns a pending button to a settled state:

```js
Bus.resolve(id, message?)   // pending → success
Bus.reject(id, message?)    // pending → error
```

- The button listens for events **matching its own id** and transitions. Nothing else can unstick it.
- These are normally published by the **dispatcher** when the handler settles — but *anyone* on the bus can publish them (an admin action, a websocket push, a cancel). That’s intended: the kill signal is identity-addressed, not owned by the click site.
- **A handler that never settles is a bug made visible, not hidden.** The dispatcher arms a `PENDING_TIMEOUT` (12s) killer that publishes `reject(id,'Timed out')`. A button therefore can *never* be stuck spinning forever — the worst case is a visible timeout error the user can retry.

```js
const PENDING_TIMEOUT = 12000;
Bus.on('action:trigger', async ({action,id,payload})=>{
  const fn = handlers[action];
  if(!fn){ Bus.reject(id,'No handler'); return; }
  const killer = setTimeout(()=> Bus.reject(id,'Timed out'), PENDING_TIMEOUT);
  try{ const msg = await fn(payload); clearTimeout(killer); Bus.resolve(id,msg); }
  catch(err){ clearTimeout(killer); Bus.reject(id, err?.message); }
});
```

## 4. Enable / disable (Contract D — when a button is interactive)

A button is **disabled** if *any* of these hold; **enabled** otherwise:

1. state is `pending` (in-flight — always locked), **or**
2. it carries an explicit `disabled` attribute or `data-locked` (an app-level precondition), **or**
3. it declares a **guard** (`data-guard="scope"`) whose function returns false.

Guards are evaluated **only at rest** (`idle`) — a pending button is locked regardless. A guard is a named predicate registered once:

```js
registerGuard('newsletter', ()=> /\S+@\S+\.\S+/.test(emailField.value.trim()));
registerGuard('delete',     ()=> confirmCheckbox.checked);
```

The button re-checks its guard when it hears `action:refresh` for its scope (or a global refresh). So a form field enables/disables the submit button **without touching the button**:

```html
<input oninput="Bus.refresh('newsletter')" ...>
```

This keeps preconditions declarative and out of the button. A field says "something changed in my scope"; the button re-evaluates itself.

## 5. The event bus (pub-sub)

A tiny identity-addressed bus. Four contract verbs plus generic `on/emit`. In production this is dota’s bus; the contract is framework-agnostic.

```js
const Bus = (function(){
  const subs = {};
  const on   = (t,fn)=>{ (subs[t] ||= new Set()).add(fn); return ()=>subs[t].delete(fn); };
  const emit = (t,d)=>{ (subs[t]||[]).forEach(fn=>fn(d)); };
  return {
    on, emit,
    trigger:(action,id,payload)=>emit('action:trigger',{action,id,payload}),
    resolve:(id,message)=>emit('action:resolve',{id,message}),
    reject: (id,message)=>emit('action:reject',{id,message}),
    refresh:(scope)=>emit('action:refresh',{scope}),
    handle: (action,fn)=>{ handlers[action]=fn; }
  };
})();
```

**Bus topics (the whole vocabulary — do not add ad-hoc ones):**

| Topic | Payload | Who publishes | Who listens |
|---|---|---|---|
| `action:trigger` | `{action,id,payload}` | the button (on interaction) | dispatcher + the button (→pending) |
| `action:resolve` | `{id,message?}` | dispatcher / anyone | the matching button (→success) |
| `action:reject` | `{id,message?}` | dispatcher / anyone | the matching button (→error) |
| `action:refresh` | `{scope?}` | inputs / app state | buttons in that scope (re-guard) |

## 6. Markup contract (how a button declares itself)

Everything a button needs is declarative attributes — no per-button JS.

```html
<button class="act v-accent"
        data-action="support.send"   <!-- WHAT: handler key -->
        data-id="send"               <!-- WHO:  unique instance id -->
        data-guard="support"         <!-- optional: guard scope -->
        data-label="Send message"    <!-- idle text -->
        data-busy="Sending"          <!-- pending text -->
        data-done="Sent"             <!-- success text -->
        data-fail="Failed — retry">  <!-- error text -->
  <span class="lbl">Send message</span>
</button>
```

Boot once: `document.querySelectorAll('.act[data-action]').forEach(initButton)`. Every action button on every page is now wired identically.

## 7. Design grammar (Contract E — one look, four variants)

Variants are **color only**. They share geometry, motion, spinner, check, cross, and every state transition. A variant may never change *behaviour* or *which glyph* a state uses.

- **Geometry:** 999px pill, `.85rem 1.6rem` padding, 15px/500 label, `gap:.55rem` between glyph and label. Hover lifts `-2px` (suppressed in `pending`/`disabled`).
- **Variants:**
  - `v-accent` — filled persimmon → `--accent-deep` on hover. The one primary CTA per context.
  - `v-ink` — filled ink → black. Neutral primary (subscribe, save-as-primary).
  - `v-ghost` — hairline border → ink border on hover. Secondary.
  - `v-danger` — white with `--err` text/border. Destructive only.
- **Glyphs (fixed per state, all `currentColor`):** `pending` → 16px spinner; `success` → self-drawing check; `error` → self-drawing cross. The glyph sits *left* of the label; label text swaps with it.
- **Status flash:** on `success` the pill briefly recolors to `--ok` (ghost/danger keep white bg, green text/border); on `error` to `--err`. This is the **only** place `--ok`/`--err` appear, and only for ~2s. Orange stays scarce — the spinner borrows `currentColor`, it is not accent-on-everything.
- **Width stability:** busy/done/fail labels should be similar length to the idle label so the pill doesn’t jump. If a label must grow, the pill may animate width but never reflow neighbours.

All state visuals hang off `data-state`:

```css
.act[data-state="pending"]{cursor:progress}
.act[data-state="success"]{background:var(--ok); border-color:var(--ok); color:#fff}
.act[data-state="error"]{background:#fff; border-color:var(--err); color:var(--err)}
.act[disabled]{opacity:.45; cursor:not-allowed; transform:none}
```

## 8. Accessibility

- Real `<button>`; keyboard `Enter`/`Space` fire the same path as click.
- `pending` sets the native `disabled` attribute — so it’s unfocusable-activatable and announced as unavailable. (If you need it to stay focused, use `aria-disabled="true"` + guard the handler instead; pick one approach site-wide.)
- Announce settle states politely: mirror the button’s state into an `aria-live="polite"` region, or set `aria-label` to the busy/done/fail text. Don’t rely on the drawn glyph alone.
- Visible `:focus-visible` ring (2px accent, offset 3px) on every variant.
- `prefers-reduced-motion`: spinner stops rotating (show a static ring), check/cross appear already-drawn, hover-lift and transitions off. States still change; only motion is removed.

## 9. Files

```
action-button/
├── action-button.css     # .act + variants + data-state visuals + glyphs
├── bus.js                # the pub-sub bus + four verbs
├── action-button.js      # initButton() state machine + guards + dispatcher
└── handlers.js           # app work: Bus.handle('name', async fn) — the ONLY place work lives
```

Production (dota): `<action-button action="…" id="…" variant="accent" guard="…">` renders the same markup and speaks the same bus. The state machine, the four verbs, and the guard registry are unchanged — only the render layer differs. Keep the payload/guard/message contract identical so a page can’t tell it’s driving the component vs. the demo.

## 10. Adding a new button (the entire procedure)

1. Drop the markup with a unique `data-id` and the right `data-action` + `data-*` labels.
2. If it needs a precondition, add `data-guard="scope"` and `registerGuard('scope', predicate)`, and have the relevant input call `Bus.refresh('scope')`.
3. Register the work once: `Bus.handle('your.action', async payload => { … return doneMessage })`.
4. Done. You wrote **zero** loading, disabling, error, or double-click code — the contract supplied all of it.

## 11. Acceptance checklist

- [ ] Every action button is `.act[data-action][data-id]`, booted by one `initButton` loop — no per-button JS
- [ ] State lives only in `data-state`; all visuals derive from it via CSS
- [ ] Interaction publishes `action:trigger` and locks `pending`; a second click/keypress while pending does nothing
- [ ] Only `action:resolve` / `action:reject` (by id) end `pending`; nothing else can
- [ ] The same action fired from an unrelated control updates the button (trigger is decoupled)
- [ ] A handler that never settles hits the dispatcher timeout and shows `error` — no infinite spinner is possible
- [ ] `success`/`error` are transient and auto-return to `idle`
- [ ] Disabled iff pending, or explicit lock, or a failing guard; guards re-checked on `action:refresh`
- [ ] Four variants differ in color only; identical geometry, motion, glyphs, and transitions
- [ ] `--ok`/`--err` appear only on the transient flash; accent stays scarce; spinner uses `currentColor`
- [ ] Keyboard-operable, `:focus-visible` ring, settle states announced politely
- [ ] Reduced motion: no spin/draw/lift; states still change; fully usable
- [ ] Adding a button = markup + optional guard + one `Bus.handle` — no new loading code
