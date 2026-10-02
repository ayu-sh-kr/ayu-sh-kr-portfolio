# GitHub Copilot can now use desktop apps through computer use

A task in an older desktop tool can be hard to automate when it has no API, command line, or MCP integration. GitHub is addressing that gap with **computer use** in GitHub Copilot: an agent can inspect and operate desktop apps through their visible interfaces.

Announced on October 1, the feature is in **public preview** in GitHub Copilot CLI and the GitHub Copilot app for macOS and Windows. Copilot can read accessible app content and visual context, click controls, type or edit text, use the keyboard, scroll, drag, and move through workflows across applications. That brings GUI-only tasks—like filling out an expense report or updating a presentation—within reach of an agent.

## From instructions to desktop actions

This is different from asking Copilot to generate a script or call an API. The agent works with the same interface a person sees, which can help when a legacy system exposes its functions only through a desktop app. GitHub’s launch example shows Copilot navigating an expense workflow in Safari.

To enable it in Copilot CLI, run `/computer on`; `/computer show` reports its status and `/computer off` disables it. In the Copilot app, turn on **Enable Computer Use** under Settings. On macOS, the feature needs Accessibility permission to operate controls and Screen Recording permission when it needs to inspect a window visually.

## Approval matters as much as capability

Computer use is **disabled by default**. Copilot follows the tool-permission settings for the session: you can approve an app for one session, save approval for future sessions, or decline. Administrators can also disable the feature for managed organizations. Saved “Always allow” permissions apply across Copilot CLI and the app on the same computer, so they deserve care around apps with sensitive information or high-impact actions.

The preview also has the limits of interface automation. A changed layout, dynamic page, or unexpected window can lead to a wrong click, misplaced text, or repeated action. GitHub advises reviewing the requested app and action, then checking the result—especially before anything submits or changes data. The social post accompanying the launch says the feature can work in the background; GitHub’s documentation describes desktop interaction and permissions, but does not promise that every workflow can run without affecting focus.

Computer use gives Copilot a way into software that lacks a direct integration. For stable, important workflows, an API or dedicated tool remains more predictable; the desktop route is useful when the interface is the only route available.

Sources: [GitHub Changelog — Computer use in GitHub Copilot](https://github.blog/changelog/2026-10-01-github-copilot-can-now-interact-with-desktop-apps/) · [GitHub Docs — About computer use](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/agents/computer-use) · [GitHub Docs — Using computer use in the Copilot app](https://docs.github.com/en/copilot/how-tos/github-copilot-app/computer-use)
