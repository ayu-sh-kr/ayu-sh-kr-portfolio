---
name: playwright-debugging
description: Debug this portfolio in a real browser with Playwright CLI. Use for rendered UI defects, hydration verification, route transitions, browser-console failures, and network-request analysis. Use Microsoft Edge only.
---

# Playwright Debugging

Use the project’s `.playwright/cli.config.json`, which selects the `msedge` channel. Do not use, install, download, or fall back to Chrome, Chromium, Firefox, WebKit, or another browser.

## Workflow

1. Confirm `npx` is available with `command -v npx`.
2. Start the required app server, usually `pnpm preview` for a production-build check.
3. Run Playwright CLI without `--browser` or an alternative `--config`, so it loads the repository’s Edge-only configuration:

   ```sh
   npx --yes --package @playwright/cli playwright-cli open http://127.0.0.1:4173/
   ```

4. Take a snapshot before using element references and again after every navigation or meaningful UI change.
5. Use `requests`, `request <index>`, and `console error` to collect browser evidence. Use `eval` or `run-code` only when the CLI commands cannot measure the required DOM or hydration state.
6. Close the Playwright session and stop any local server when finished. Keep any deliberate artifacts under `output/playwright/`.

## SSG hydration checks

Open the canonical trailing-slash route in preview. Test the extensionless equivalent separately and confirm it receives a redirect before the page loads. Verify the direct route host remains connected through initial hydration, then inspect network requests to ensure prerendered content is not loaded again.

If Edge is unavailable, report that blocker. Never substitute another browser.
