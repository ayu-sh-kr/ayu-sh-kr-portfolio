import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "offline-hero",
  shadow: false,
})
export class OfflineHeroComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const { actions, states } = portfolioContent.offline;
    const content = states.offline;

    return HTML`
      <section class="offline-section offline-hero-section" aria-labelledby="offline-title">
        <div class="offline-panel-inner">
          <div class="offline-glyph" data-offline-glyph role="img" aria-label="${content.glyphLabel}">
            <svg viewBox="0 0 200 172" aria-hidden="true">
              <path class="offline-mark" data-offline-mark="outer" d="M20 64 A115 115 0 0 1 180 64"></path>
              <path class="offline-mark" data-offline-mark="middle" d="M48 96 A75 75 0 0 1 152 96"></path>
              <path class="offline-mark" data-offline-mark="inner" d="M76 128 A36 36 0 0 1 124 128"></path>
              <circle class="offline-mark offline-dot" data-offline-mark="base" cx="100" cy="150" r="10"></circle>
            </svg>
          </div>

          <p class="offline-eyebrow" data-offline-eyebrow>${content.eyebrow}</p>
          <h1 id="offline-title" class="offline-display"><span data-offline-title-lead>${content.titleLead}</span> <span data-offline-title-accent>${content.titleAccent}</span></h1>
          <p class="offline-lede" data-offline-lede>${content.lede}</p>
          <p class="offline-status" data-offline-status aria-live="polite">
            <span class="offline-status-dot" aria-hidden="true"></span>
            <span data-offline-status-text>${content.status}</span>
          </p>
          <div class="offline-actions">
            <button class="offline-button offline-button-ink" type="button" data-offline-action="retry" data-offline-retry>${content.retryLabel}</button>
            <a class="offline-button offline-button-ghost" href="${actions.homeHref}">${actions.homeLabel}</a>
          </div>
        </div>

      </section>
    `;
  }
}
