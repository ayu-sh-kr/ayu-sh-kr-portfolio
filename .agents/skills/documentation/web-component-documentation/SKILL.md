---
name: web-component-documentation
description: Use when documenting Dota custom elements or reviewing their generated custom-elements.json and web-types.json contract. Covers factual class, property, event, lifecycle, and rendering documentation.
---

# Web Component Documentation

Read the complete class, decorators, template, base class, consumers, and generated metadata before writing documentation. Document the observable Custom Element contract, not implementation trivia.

For each component, establish:

- purpose and composition boundary;
- every `@Property` attribute name, type, default, allowed values, and visible effect;
- meaningful `@State` values and rendered branches;
- incoming `@BindEvent`, `@HostListener`, `@WindowListener`, `@OnEvent`, and lifecycle behavior;
- emitted events, child/slot expectations, route parameters, services, and styling/shadow-DOM constraints.

Put one consumer-facing class TSDoc block above the component decorator and focused comments immediately above public properties. Never invent defaults, events, reactivity, or callback order. Check `custom-elements.json` and `web-types.json` after source changes; generated metadata is an output, not the source of truth.
