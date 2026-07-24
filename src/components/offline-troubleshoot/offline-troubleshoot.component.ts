import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

@Component({
  selector: "offline-troubleshoot",
  shadow: false,
})
export class OfflineTroubleshootComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    return HTML`
      <section class="offline-section offline-troubleshoot-section" aria-labelledby="offline-troubleshoot-title">
        <div class="offline-panel-inner offline-troubleshoot-content">
          <p class="offline-eyebrow">Get back online</p>
          <h2 id="offline-troubleshoot-title" class="offline-display offline-display-small">Three things to try.</h2>

          <div class="offline-tries">
            <div class="offline-try">
              <span class="offline-try-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 12.5a10 10 0 0 1 14 0M8 16a5.5 5.5 0 0 1 8 0"></path><circle cx="12" cy="19.5" r="1.4"></circle></svg>
              </span>
              <div><h3>Check Wi-Fi or data</h3><p>Toggle it off and on, or switch to a network with a stronger signal.</p></div>
            </div>
            <div class="offline-try">
              <span class="offline-try-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-1.5 5.5"></path><path d="M20 5v6h-6"></path></svg>
              </span>
              <div><h3>Give it a second</h3><p>Moving through a lift, tunnel, or dead spot? The signal usually returns on its own.</p></div>
            </div>
            <div class="offline-try">
              <span class="offline-try-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="7" rx="1.5"></rect><rect x="4" y="13" width="16" height="7" rx="1.5"></rect><path d="M7.5 7.5h.01M7.5 16.5h.01"></path></svg>
              </span>
              <div><h3>Might be the server</h3><p>If everything else loads fine, it's on my side — and it won't stay down long.</p></div>
            </div>
          </div>

          <div class="offline-actions offline-actions-secondary">
            <button class="offline-button offline-button-accent" type="button" data-offline-action="retry" data-offline-retry>Try again</button>
            <a class="offline-button offline-button-ghost" href="/">Back to home</a>
          </div>
          <p class="offline-meta" data-offline-meta>Last tried just now</p>
        </div>
      </section>
    `;
  }
}
