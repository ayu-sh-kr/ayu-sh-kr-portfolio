---
name: blog-svg-diagrams
description: Create and repair compact, accessible SVG diagrams embedded in Markdown blog posts under public/blogs, using the portfolio theme, readable flow geometry, root-relative assets, and rendered validation. Use when a blog code block should become a diagram, a blog SVG is too tall, off-theme, clipped, or has broken connectors.
---

# Blog SVG Diagrams

Create short explanatory diagrams for the portfolio’s Markdown articles. This
skill complements `svg-api-flow-diagrams`: use that skill for application and
runtime behavior; use this one for reader-facing technical explanations such as
AI pipelines, BCI signal paths, architecture summaries, and concept flows.

## Workflow

1. Read the surrounding Markdown section and identify the one lesson the image
   must communicate. Keep the diagram narrower than the prose argument.
2. Replace a text/code flow only when the visual makes the sequence easier to
   scan. Preserve the surrounding explanation and add descriptive alt text.
3. Store the SVG beside the article at:

   ```text
   public/blogs/<category>/assets/<descriptive-name>.svg
   ```

4. Reference it with a root-relative public URL, not a path relative to the
   article route:

   ```md
   ![Short, descriptive explanation of the diagram](/blogs/news/assets/example.svg)
   ```

## Visual grammar

- Use the portfolio’s matcha palette as standalone fallbacks:
  - background `#f8faf2`;
  - ink `#242c12`;
  - primary `#5d702d`;
  - border `#d9e2bd` or `#92a951`;
  - subtle surfaces `#ecf0df` and `#d9e2bd`.
- Use a light rounded canvas, compact cards, restrained shadows, and one
  typography hierarchy. Avoid unrelated blue/purple product palettes.
- Include `<title>` and `<desc>` with `role="img"` and
  `aria-labelledby` on the root SVG.
- Keep cards scannable: a short stage label, title, and at most two body lines.
  Move explanation into the Markdown paragraph, not into oversized cards.

## Layout and connector rules

- Prefer a horizontal three-step flow for short pipelines.
- For four to six steps, use a two-row serpentine layout to reduce vertical
  space. Make the direction obvious with orthogonal connectors.
- Reserve a visible corridor between every card. A connector must have a real
  tail and shaft; an arrowhead alone is not a connector.
- End every connector exactly at the destination boundary and begin it at the
  source boundary. Do not start or finish outside a card.
- For a turn, route through a clear gutter with at most the needed 90-degree
  turns. Keep the full horizontal and vertical path free of cards and labels.
- Use consistent card dimensions within a row and keep at least 18px between
  text baselines and card edges.
- Reduce the `viewBox` height after layout is correct; do not compress text to
  make a tall diagram fit.

## Repair checklist

When a connector looks broken, write down each card’s bounding box and repair
the route from boundaries. For example, if a top-right card leads to a lower
middle card, route from the source bottom center to a clear horizontal gutter,
then vertically into the destination top edge. Do not move only the arrowhead.

When arrows appear as tips, increase the gap between cards or reduce card width
so the shaft is visible. Keep `marker-end` on the complete path and use a
consistent stroke such as `#5d702d` with `stroke-linecap="round"`.

## Validation

Run:

```sh
xmllint --noout public/blogs/news/assets/<file>.svg
git diff --check
```

Render the SVG to a bitmap with the available system preview tool and inspect
the full image. Check title and body baselines, card overlap, connector tails,
arrowhead destinations, outer padding, and whether the diagram is readable at
the article column width. Re-render after every geometry correction.

Also verify that:

- the Markdown image URL resolves from `/blog/<slug>/`;
- the SVG is copied into the production output by the public directory;
- the alt text describes the relationship rather than repeating the filename;
- unrelated diagrams and worktree changes remain untouched.
