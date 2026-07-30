import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "offline-troubleshoot",
  shadow: false,
})
export class OfflineTroubleshootComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const { actions, lastTry, troubleshooting, states } = portfolioContent.offline;
    const content = states.offline;

    return HTML`
      <section class="offline-section offline-troubleshoot-section" aria-labelledby="offline-troubleshoot-title">
        <div class="offline-panel-inner offline-troubleshoot-content">
          <p class="offline-eyebrow">${troubleshooting.eyebrow}</p>
          <h2 id="offline-troubleshoot-title" class="offline-display offline-display-small">${troubleshooting.title}</h2>

          <div class="offline-tries">
            ${troubleshooting.tries
              .map(
                (item) => HTML`
                  <div class="offline-try">
                    <span class="offline-try-icon" aria-hidden="true">
                      ${item.icon}
                    </span>
                    <div><h3>${item.title}</h3><p>${item.body}</p></div>
                  </div>
                `,
              )
              .join("")}
          </div>

          <div class="offline-actions offline-actions-secondary">
            <action-button id="offline-troubleshoot-retry" action="offline.retry" variant="accent" label="${content.retryLabel}" busy-label="Checking…" done-label="Connected" fail-label="Try again" data-offline-retry></action-button>
            <a class="offline-button offline-button-ghost" href="${actions.homeHref}">${actions.homeLabel}</a>
          </div>
          <p class="offline-meta" data-offline-meta>${lastTry.justNow}</p>
        </div>
      </section>
    `;
  }
}
