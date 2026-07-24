---
slug: dota-wrap
title: dota-wrap
tagline: A typed wrapper for authoring native web components.
kind: open source
year: 2026
status: active
stack: [TypeScript, Decorators, DOM]
---

Web components are a strong primitive, but a production application still needs conventions for properties, rendering, lifecycle, events, and routing. `dota-wrap` is the layer that makes those conventions pleasant to use.

## Keep the platform in the driver’s seat

The wrapper does not replace custom elements with a second component model. A class still becomes a real element, its markup is still ordinary HTML, and the browser still owns the lifecycle. The library adds typed decorators and a small set of helpers around that model.

## Make lifecycle work explicit

Connected and disconnected handlers are scoped to the component that owns them. Event bindings survive re-rendering through delegation. Properties are declared next to the fields they update. These are small details, but they make a long-lived UI easier to reason about.

<showcase-metrics items="native|DOM foundation,typed|component contracts"></showcase-metrics>

## The wrapper should stay boring

The best framework layer is one an engineer can leave. If an application needs a browser API directly, it should be able to use it. If a component needs a custom rendering strategy, it should not have to fight a hidden scheduler.

That is the standard for the package: remove ceremony, preserve escape hatches, and let the platform remain legible.
