---
name: md-formatting
description: "Use when a Markdown blog draft needs structural cleanup, paragraph reflow, or light editorial trimming of AI-flavored filler while preserving the article’s meaning, links, lists, and code fences."
---

# Markdown Formatting

Use this skill for blog drafts, notes, or documentation that need
Markdown presentation cleanup and, when requested, removal or
rewriting of AI-flavored filler.

## Rules

- Keep the wording unchanged unless the user explicitly asks for copy edits.
- When the user asks to remove AI-generated hints, recommendations, or
  questions, rewrite that text into direct explanatory prose while
  preserving the underlying facts.
- Add or repair heading structure when the draft is missing a clear title.
- Use the file name or article topic for the single H1 title, then
  keep section headings below it; do not promote content headings like
  “Overview” or “Introduction” to H1 when they are only body sections.
- Rewrap long paragraphs to a readable visual width; do not add or remove sentences.
- Prefer direct technical phrasing over promotional, speculative, or
  conversational filler when copy edits are requested.
- Preserve links, code fences, inline code, bullets, and emphasis exactly.
- Treat placeholder labels or inline notes as structure, not prose, when they are clearly not part of the draft text.

## Workflow

1. Read the source as text, not as prose to rewrite.
2. Apply structural Markdown changes first.
3. Reflow paragraph lines for readability.
4. Rewrite AI-flavored filler into direct prose only when the user asks
   for copy edits.
5. Verify the rendered result still says the same thing.
