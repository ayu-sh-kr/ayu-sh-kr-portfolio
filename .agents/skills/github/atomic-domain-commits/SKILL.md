---
name: atomic-domain-commits
description: Create local Git commits by coherent domain and feature unit, keeping related TypeScript and CSS together without pushing.
---

# Atomic Domain Commits

Use this skill when preparing local commits for an existing working tree.

## Commit boundaries

- Inspect both staged and unstaged changes before altering the index. Preserve work that is unrelated to the requested commit sequence.
- Work through one product domain at a time. Finish its independent feature units before staging files from another domain.
- Commit one concrete unit at a time. For a UI component or page shell, its TypeScript and matching CSS belong together, but sibling components—even within the same feature—belong in separate commits.
- Treat shared primitives, content models, route registration, generated metadata, and configuration as their own units unless a single component cannot function without a narrowly scoped part of one of them.
- A domain controls ordering, not commit size: finish its smallest units before moving to the next domain. Never make a catch-all “whole domain” or “whole feature” commit.
- Prefer the smallest independently understandable commit. Do not batch unrelated cleanup, infrastructure, or generated-file updates with a component unless that update is necessary for that component to work.
- When a file contains changes for multiple units, stage only the relevant hunks or defer it until its own focused commit.

## Workflow

1. Review status, staged changes, unstaged changes, and diffs. Before the first commit, ensure the index contains only the intended unit; do not let earlier staging leak into it.
2. Commit requested workflow or tooling changes in their own commit before product work.
3. Within each domain, stage one concrete unit, review the staged diff, and make one concise imperative commit. For a component, include only that component’s paired files and its unavoidable narrow dependencies.
4. Commit shared registration or generated artifacts separately after their source units, unless they can be isolated to one unit.
5. Verify the resulting history and report commit hashes plus any deliberately uncommitted work. Do not push.

Never rewrite existing commits, discard changes, or push unless the user explicitly requests it.
