---
name: consent-notice
description: Use when implementing, modifying, reviewing, or wiring the portfolio's persistent privacy notice and consent state. Covers the Consent service, guarded storage, notice/consent modes, pre-hydration visibility, accessibility, motion, and bottom-chrome height coordination.
---

# Consent Notice

Treat the consent notice as a persistent, non-blocking view of a state machine. It is mounted before the routed app and must remain truthful to `public/legal/privacy.md`.

## Source of truth

Read these files before changing behavior:

- `src/service/consent.service.ts` — state, choices, versioned persistence, and subscribers;
- `src/service/storage.service.ts` — the only storage boundary;
- `src/components/utils/consent-notice/consent-notice.component.ts` and `.css` — rendering, interaction, motion, and height publication;
- `index.html` — pre-hydration theme and consent guards and body ordering;
- `public/legal/privacy.md` — the legal claims the notice must match.

Do not touch `localStorage` directly from the service or component. `AppStorage` probes browser storage once and falls back to memory when access or writes fail, including private-browsing and blocked-storage cases.

## State machine

The service owns decisions; the component only observes and renders them:

```text
unknown  --boot(mode)--> shown    --decide(choice)--> settled
unknown  --boot(mode)--> dormant  (versioned choice already exists)
settled  --reset()-----> unknown
shown    --setMode()---> shown    (choice cleared before re-render)
```

- `shown` is a current unanswered notice.
- `settled` means the visitor answered during this page lifetime.
- `dormant` means a valid versioned answer existed at boot.
- Keep `settled` and `dormant` distinct; they are visually alike but have different analytics and lifecycle meaning.
- Views use `Consent.observe()`, which immediately supplies a defensive snapshot and returns an unsubscribe function. They must not read storage or subscribe through a one-shot event API.
- Call `Consent.boot()` once from the connected lifecycle. Call `decide()` only for explicit button choices. `Esc`, timers, and an unrecorded close control are not valid dismissals.

## Modes and legal coupling

`notice` is the current portfolio mode: anonymous cookieless analytics, local preferences, a privacy-policy link, and one `Got it` acknowledgement. `consent` is conditional and must only be enabled when the site actually loads a purpose requiring prior permission; its `Essential only` and `Accept all` actions have equal visual weight.

Changing what the site stores, loads, or measures requires updating the notice copy and the matching privacy-policy section in the same change. Never ship a notice/policy mismatch. Bump the storage schema version when an old answer should no longer count as a decision.

The current storage is namespaced as `ayu-sh-kr.com:notice` and is written through `AppStorage` with a versioned JSON envelope. Use the service API rather than depending on the envelope shape in views or bootstrap code.

## Component and bootstrap contract

- Keep `<consent-notice>` first in `<body>` so it is first in keyboard order while remaining visually pinned to the bottom.
- Use `role="region"` with `aria-labelledby`; this surface does not block and must never claim `dialog` semantics.
- Do not add `aria-live`, a scrim, or an Escape dismissal. The notice is present at load and should not interrupt a screen reader.
- The inline `data-consent-state` guard prevents a prerendered notice from flashing for returning visitors. Keep it synchronized with the service's schema and valid-choice rules.
- Use a scoped connected/disconnected lifecycle pair. Disconnect the state subscription, `ResizeObserver`, exit timer, and root height variable on teardown.
- Keep authored copy in the component's mode map or a page-owned data module; do not duplicate it in unrelated templates.

## Bottom chrome and layout

The notice owns `--chrome-consent-h`. A `ResizeObserver` must republish its measured height after wrapping changes and the value must be removed when the notice closes or disconnects. Toasts and sticky bottom controls derive their offset from this variable; do not add a new z-index level or hard-coded breakpoint for the notice.

Use the existing layout tokens and pinned-bottom utility. Keep the notice as an ink floating surface, reserve no page accent budget for it, and let the copy's minimum measure determine wrapping. Buttons remain pills and do not become full-width merely because the viewport is narrow.

## Motion and verification

The notice is a persistent condition, so motion is restrained: a short fade and small vertical translation on entry/exit. Under `prefers-reduced-motion: reduce`, use opacity only and a short linear transition. Preserve the height publication during entry and clear it before the exit completes.

Verify changes with:

1. a type/build check;
2. a fresh visit, a valid stored answer, an outdated version, malformed storage, and storage access failure;
3. both modes and every explicit choice;
4. keyboard focus order and visible focus rings;
5. narrow wrapping, reduced motion, and coexistence with toast/sticky bottom controls;
6. a privacy-policy review whenever copy, storage, analytics, or consent semantics change.
