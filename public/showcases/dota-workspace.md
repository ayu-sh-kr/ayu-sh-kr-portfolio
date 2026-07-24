---
slug: dota-workspace
title: dota-workspace
tagline: A monorepo toolchain for building web-component apps.
kind: open source
year: 2026
status: active
stack: [TypeScript, Web Components, Vite]
---

The hard part of a web-component project is rarely the component. It is the glue around it: routing, lifecycle, events, styles, and a build that knows what exists.

<showcase-metrics items="8|packages,1|workspace"></showcase-metrics>

## The problem was repetition

Every app started with the same hand-written setup. Components were easy enough to create, but the surrounding conventions were scattered across examples and copied boilerplate. That made small apps feel heavier than the platform they were using.

<showcase-aside kind="note">The goal was not to hide the platform. It was to make the good path obvious while keeping the DOM and browser APIs visible.</showcase-aside>

## A core, then satellites

`dota-core` defines the component model. Routing, event wiring, UI primitives, and Markdown live in smaller packages around it. An app can adopt the pieces it needs without taking on a large runtime abstraction.

The preloader scans decorated classes and turns them into a component graph at build time. That keeps registration explicit in the source while removing the manual import list that tends to drift.

## It runs this site

This portfolio, its blog, and the showcase reader all run on the workspace. That matters more than a polished demo: the ergonomics have to survive real pages, async content, dark mode, and the occasional half-finished idea.

The result is a small toolkit with a clear bias: use native elements first, add framework behavior where it removes repetition, and leave an escape hatch whenever an application needs one.
