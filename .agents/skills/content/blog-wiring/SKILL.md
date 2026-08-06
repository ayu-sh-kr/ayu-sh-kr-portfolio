---
name: blog-wiring
description: Use when adding or updating blog Markdown in this workspace and wiring it into the Dota Web blog listing and article routes. Covers the public source location, live blog catalog shape, metadata, and route validation.
---

# Blog Wiring

Use this skill when a Markdown post is being created or updated and must appear in the Dota Web blog.

## Source of truth

Do not assume this workspace auto-discovers Markdown. Read the current `BlogPost` type and nearby entries in [blogs.config.ts](/Volumes/project-workspace/dota/ayu-sh-kr-portfolio/src/configs/blogs.config.ts) before editing. The catalog and route implementation are the source of truth; this skill records the workflow, not a frozen schema.

Place the Markdown source under:

~~~text
public/blogs/<category-folder>/<File-Name>.md
~~~

## Current catalog convention

At the time of writing, each `blogPosts` entry provides a stable `slug`, ISO `date`, `writer`, `header`, SEO `description` and `keywords`, `category`, root-relative `source`, and `minutes`. Use the actual type if it changes.

Keep category and source aligned:

~~~ts
category: "tutorial",
source: "/blogs/tutorial/My-Post.md",
~~~

## Wiring steps

1. Create or confirm the Markdown file under `public/blogs/`.
2. Read the live catalog type and route code.
3. Add a complete catalog entry with accurate metadata, keywords, and reading time.
4. Confirm that the configured `source` exists and the `slug` matches the article route.
5. Check the diff for whitespace and leave unrelated worktree changes untouched.

## Common mistakes

- Following an obsolete `path` field or category list rather than the live `BlogPost` type.
- Pointing `source` at a folder or filename that does not exist under `public`.
- Adding a title and description that differ from the article's actual scope or contain keyword padding.

## Summary

Place the Markdown file under `public/blogs/`, then register it through the current `blogPosts` contract. Verify the source and slug against the code that resolves the article.
