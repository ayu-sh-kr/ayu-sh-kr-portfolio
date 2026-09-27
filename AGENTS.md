# Repository agent guidance

Read the relevant project skill before changing its domain. Work from the current repository state and preserve unrelated changes.

## Branches, commits, and pull requests

Use [atomic-domain-commits](.agents/skills/github/atomic-domain-commits/SKILL.md) to plan and create focused commits. Inspect staged and unstaged changes, keep each commit to one coherent unit, and verify the resulting history. Do not rewrite or discard someone else's work.

Prefix **branch names**, **commit subjects**, and **pull request titles** with the action. Use `feat`, `fix`, `add`, `patch`, `chores`, `bump`, or another accurate action prefix. Branches use `prefix/short-description`; commit subjects and PR titles use `prefix: concise imperative description`. Prefer `patch` for a patch; `pathc` is a typo. Examples:

- `add/jevgrep-news`, `add: publish Jevgrep news brief`, `add: Publish Jevgrep news brief`
- `fix/mobile-prose-padding`, `fix: restore mobile prose padding`, `fix: Restore mobile prose padding`

Keep changes to guidance/skills in their own focused commit, apart from content or product changes. Create a reviewable PR when the task calls for repository delivery. Do not merge it unless requested.

## Code and content

For implementation changes, consult [clean-code](.agents/skills/code-quality/clean-code/SKILL.md), [code-structure](.agents/skills/code-quality/code-structure/SKILL.md), and [code-documentation](.agents/skills/documentation/code-documentation/SKILL.md) as relevant to the files being edited. Follow their ownership, maintainability, and TSDoc guidance; document actual behavior.

For blog articles and Dispatch news, use [portfolio-writing](.agents/skills/content/portfolio-writing/SKILL.md) with [application-voice](.agents/skills/content/application-voice/SKILL.md), [seo-optimization](.agents/skills/content/seo-optimization/SKILL.md), and [blog-wiring](.agents/skills/content/blog-wiring/SKILL.md) where applicable. Distinguish `/blog/` articles from `/news/` Dispatch notes and wire the route to every required publishing surface.

When the user requests an SVG diagram for a blog or news article, use [blog-svg-diagrams](.agents/skills/documentation/blog-svg-diagrams/SKILL.md). Read the current theme, keep the diagram explanatory and accessible, use a root-relative asset URL, and render it to inspect legibility and geometry before delivery.
