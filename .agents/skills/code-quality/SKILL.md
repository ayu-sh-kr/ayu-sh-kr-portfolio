---
name: code-quality
description: Use when reviewing or modifying TypeScript Dota web components for maintainability, lifecycle correctness, event wiring, cleanup, and repository conventions. Prefer scoped @OnEvent lifecycle handlers over direct callback overrides and legacy init hooks.
---

# Code Quality

Apply focused quality checks to Dota web components without changing behavior unnecessarily. Favor framework decorators, explicit teardown, stable handler references, and small methods that are easy to verify.

## Lifecycle and event rules

Use scoped lifecycle events for component setup and teardown:

```ts
@OnEvent("connected", true)
onConnected(): void {
  // DOM and framework bindings are ready.
}

@OnEvent("disconnected", true)
onDisconnected(): void {
  // Remove external listeners, observers, timers, and pending frames.
}
```

Import `OnEvent` from `@ayu-sh-kr/dota-wrap/event`. The `true` flag scopes the handler to the component's event channel, so lifecycle subscriptions do not leak between instances.

## Event listener selection

Prefer the core listener decorators when the target and event are simple:

```ts
import {
  DocumentListener,
  HostListener,
  WindowListener,
} from "@ayu-sh-kr/dota-wrap/core";

@WindowListener({ event: "resize" })
onResize(): void {}

@DocumentListener({ event: "focusin" })
onDocumentFocus(event: FocusEvent): void {}

@HostListener({ event: "click" })
onHostClick(event: MouseEvent): void {}
```

Use `WindowListener` for global window events, `DocumentListener` for document-level events, and `HostListener` for events dispatched by the component host. Keep manual `addEventListener` calls for dynamic targets, non-default listener options such as `{ passive: true }`, or APIs that are not represented by these decorators (for example, `MediaQueryList`).

Prefer these patterns over:

- `disconnectedCallback()` overrides for component cleanup.
- `@AfterViewInit` or `@AfterInit()` as the default connected/setup hook.
- Manual lifecycle event subscriptions when a decorator expresses the same intent.
- Manual `addEventListener`/`removeEventListener` pairs when a simple core listener decorator expresses the same target and event.

Use `@AfterInit()` only when the operation specifically depends on the framework's post-init phase and cannot be represented by the connected lifecycle event. Never put DOM setup in a constructor.

## Quality review

When changing a component:

- Inspect existing decorators and imports before introducing a new lifecycle mechanism.
- Keep setup and teardown symmetric: every window/document/host listener, observer, timer, and animation frame must have a corresponding cleanup action.
- Store callbacks as stable `readonly` fields when APIs require the same function reference for removal.
- Avoid duplicate listeners when a component can connect more than once.
- Keep render methods side-effect free; perform DOM work after connection.
- Run the project's typecheck/build after lifecycle changes and search for remaining legacy patterns in the touched area.
