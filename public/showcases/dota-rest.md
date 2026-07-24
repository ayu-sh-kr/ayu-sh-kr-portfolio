---
slug: dota-rest
title: dota-rest
tagline: Typed data-fetching primitives for Dota apps.
kind: open source
year: 2026
status: active
stack: [TypeScript, Fetch, Events]
---

Data fetching is where a small frontend system starts to accumulate invisible rules. Loading states, errors, cancellation, response parsing, and application events all need to line up without turning every component into a mini networking library.

## Keep the network visible

`dota-rest` builds on `fetch` rather than hiding it. A request has a typed shape, a clear response boundary, and a place to handle failure. The goal is not to make HTTP disappear; it is to make the repeated edges consistent.

## Cancellation is part of correctness

Route changes and fast interactions can leave an older request running after the user has moved on. Abort signals let a component stop work it no longer owns, so a slow response cannot overwrite the current view.

<showcase-aside kind="note">A stale response is not just a performance issue. It is incorrect state arriving at the wrong time.</showcase-aside>

## Events connect without coupling

When a result belongs to more than one consumer, the application event channel keeps the loader and the view independent. A Markdown renderer can publish a result while the article and table of contents update themselves separately.

## Small primitives age well

The package is intentionally narrow. It gives applications a reliable boundary for data without dictating how they organize pages, cache records, or present an error. Those decisions remain where they can be understood.
