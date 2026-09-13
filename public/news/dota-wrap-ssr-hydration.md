# Dota Wrap now ships server-rendered markup with hydration

Dota Wrap can now generate route markup during the Vite build and let the same custom elements adopt it in the browser. The first response contains the actual page content, while hydration attaches behavior without replacing a matching tree.

This portfolio is the first production-shaped application running on that path. Blog articles, showcase pages, and the new Dispatch permalinks are generated as real documents that remain readable before client JavaScript finishes.

## What changed in practice

The useful work was not serializing templates. It was defining stable boundaries: route metadata must exist during generation, component output must be deterministic, and browser-only lifecycles cannot rewrite server content before hydration inspects it.

Mismatch warnings stay enabled because silent replacement would hide the exact regressions SSR is meant to prevent. Dynamic Markdown surfaces also retain their generated content and skip a duplicate request when the hydrated document is already present.

Web components did not need a framework runtime to gain a server-rendered first paint. They needed an explicit build contract and careful lifecycle ownership. That is a much smaller dependency and a more reusable result.
