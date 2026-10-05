# Duplicate block components in Markdown and SSG

## Cause confirmed on 5 October 2026

The portfolio emitted invalid HTML before hydration. This affects block components embedded in Markdown, including all fifteen UI design examples, `showcase-metrics`, and `showcase-aside`.

The installed `@ayu-sh-kr/dota-md` 0.0.17 delegates Markdown parsing to markdown-it. A custom element with its opening and closing tags on the same line is treated as inline HTML:

```md
<ui-skeuomorphic-showcase example="clock"></ui-skeuomorphic-showcase>
```

`MDService.renderHtml` returns a paragraph containing that host. The SSG renderer mounts the component and puts its block content inside it:

```html
<p><ui-skeuomorphic-showcase example="clock">
  <figure>…clock…</figure>
</ui-skeuomorphic-showcase></p>
```

This is invalid paragraph content. Under the [HTML parsing rules for the “in body” mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inbody), a `figure` start tag closes an open paragraph. The intervening custom host is popped from the parser’s stack too. The resulting figure is outside the host. On upgrade, the empty host renders a new figure while the original remains beside it.

This is a Markdown/SSG integration defect, not evidence that Dota Core calls every component twice. Markdown-it’s treatment of custom tags is expected; our authoring syntax failed to account for the block content those elements produce. The SSG output lacked a check for this invalid nesting.

## Workaround used in the portfolio

Wrap block custom elements in an explicit HTML block, with blank lines around it:

```md
Text before the example.

<div>
<ui-skeuomorphic-showcase example="clock"></ui-skeuomorphic-showcase>
</div>

Text after the example.
```

Markdown recognizes the `div` as a raw HTML block and adds no paragraph around the component. The serialized figure stays inside its host when parsed. This applies to every component that renders block content, regardless of its visual style. `display: block` in CSS cannot repair HTML parsing.

The fix covers all fifteen UI studies and the existing metrics/aside embeds in showcase articles. The wrapper has no style and adds no duplicate content. Component hydration and CSS animation continue normally.

## Why the earlier attempts missed it

The previous tests inserted isolated, valid custom-element markup. They never rendered the actual Markdown source, so they missed the surrounding paragraph. Counting figures in the generated string also passed: it contains one figure before a browser repairs its structure.

Delaying connection and skipping a mount when a host contains a server figure cannot fix this: the browser has already moved that figure outside the host. The server-figure bypass and its tests have been removed. The small existing microtask deferral remains for live DOM insertion, independently of this authoring fix.

## Regression coverage and upstream follow-up

`test/ui-design-showcase-markdown.test.ts` uses the real `MDService` to process the article. It failed on all fifteen paragraph-wrapped hosts before the source fix. It now checks that all fifteen remain outside paragraphs, each renders one direct figure during SSG, and strict hydration of the serialized result retains one figure per host. A second check scans every runtime Markdown file for paragraph-wrapped block components.

The test environment is happy-dom, not a browser HTML parser. These assertions enforce valid nesting directly; they do not claim browser visual verification. The repository's Playwright debugging skill requires Edge, which is unavailable in this execution environment.

For Dota Markdown, document explicit HTML block wrappers or provide an opt-in block-component rule that recognizes registered block selectors before paragraph generation. Do not classify every custom element as block: inline icons and text components may belong in paragraphs. For Dota SSG, add a real HTML5 parse round-trip test so browser tree repair cannot silently invalidate component ownership.

Acceptance in Edge: load the prerendered article directly, confirm fifteen hosts and fifteen figures after initialization, check each figure remains inside its own host, then navigate away and back. Repeat at a narrow viewport. The record deck should stay still while its disc turns.
