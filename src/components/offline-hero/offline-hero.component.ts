import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

@Component({
  selector: "offline-hero",
  shadow: false,
})
export class OfflineHeroComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    return HTML`
      <section class="offline-section offline-hero-section" aria-labelledby="offline-title">
        <div class="offline-panel-inner">
          <div class="offline-glyph" data-offline-glyph role="img" aria-label="Searching for a Wi-Fi connection">
            <svg viewBox="0 0 200 172" aria-hidden="true">
              <path class="offline-mark" data-offline-mark="outer" d="M20 64 A115 115 0 0 1 180 64"></path>
              <path class="offline-mark" data-offline-mark="middle" d="M48 96 A75 75 0 0 1 152 96"></path>
              <path class="offline-mark" data-offline-mark="inner" d="M76 128 A36 36 0 0 1 124 128"></path>
              <circle class="offline-mark offline-dot" data-offline-mark="base" cx="100" cy="150" r="10"></circle>
            </svg>
          </div>

          <p class="offline-eyebrow" data-offline-eyebrow>Connection lost</p>
          <h1 id="offline-title" class="offline-display"><span data-offline-title-lead>You're</span> <span data-offline-title-accent>offline.</span></h1>
          <p class="offline-lede" data-offline-lede>This page can't reach the server right now. It will load again when your network comes back — I'm already checking.</p>
          <p class="offline-status" data-offline-status aria-live="polite">
            <span class="offline-status-dot" aria-hidden="true"></span>
            <span data-offline-status-text>Trying to reconnect…</span>
          </p>
          <div class="offline-actions">
            <button class="offline-button offline-button-ink" type="button" data-offline-action="retry" data-offline-retry>Try again</button>
            <a class="offline-button offline-button-ghost" href="/">Back to home</a>
          </div>
        </div>

        <div class="offline-cue" data-offline-cue aria-hidden="true">
          <span>Still stuck? Ways to fix it</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
        </div>
      </section>
    `;
  }
}
