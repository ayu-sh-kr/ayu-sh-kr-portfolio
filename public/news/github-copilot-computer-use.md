# GitHub Copilot adds computer use for desktop apps

GitHub Copilot can now click buttons, fill in fields, and move between desktop apps to complete a task. GitHub announced **computer use** on October 1, bringing the feature to **Copilot CLI and the Copilot app** in public preview on macOS and Windows.

The update gives Copilot a way to work with software that has no direct integration for an AI agent. An older business app might let a person enter information through a form, for example, without offering an API for software to do the same. Computer use lets Copilot work through that interface.

## How Copilot reads and operates desktop apps

Copilot reads the controls and labels exposed by the operating system and uses screenshots when it needs visual context. It can then click, type, scroll, drag, and navigate across applications. You can inspect those tool actions in the session.

GitHub’s launch example shows Copilot navigating an **expense-report workflow in Safari**. The same capability can help update a presentation or move information between apps: work that would otherwise require someone to operate the interface manually.

## Where the public preview is available

Computer use runs in **local sessions on macOS and Windows**. In Copilot CLI, `/computer on` enables it, `/computer show` checks its status, and `/computer off` disables it. In the Copilot app, the switch is under Settings → Computer Use.

On macOS, it needs Accessibility permission to operate controls and Screen Recording permission to inspect windows when necessary. Copilot’s own tool settings then determine whether it asks before accessing an app.

## What users can control

The feature is **off by default**. When approval is required, users can allow an app for the current session, save permission for future sessions, or decline. Saved approvals apply to both the CLI and the Copilot app on that computer. Enterprise administrators can disable the feature through managed settings.

GitHub also warns that a changed layout or unexpected window can cause misplaced text, a wrong click, or a repeated action. Users can stop an operation and should check the result, particularly when it changes records or submits a form.

The practical gain is access to tasks that previously stopped at an app’s interface. Where a direct API or dedicated tool exists, GitHub still recommends it for more predictable results. Computer use fills the gap when the work has to happen through buttons, fields, and windows.

Sources: [GitHub Changelog — Computer use announcement](https://github.blog/changelog/2026-10-01-github-copilot-can-now-interact-with-desktop-apps/) · [GitHub Docs — Capabilities, permissions and limitations](https://docs.github.com/en/copilot/concepts/agents/computer-use) · [GitHub Docs — Enabling computer use in the Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/computer-use)
