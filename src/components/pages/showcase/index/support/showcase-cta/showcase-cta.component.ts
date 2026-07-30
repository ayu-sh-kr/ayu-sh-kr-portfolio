import { BaseElement, BindEvent, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { publishAnalyticsEvent } from "@app/utils/analytics.utils.ts";

/**
 * Provides the final contact actions for the showcase support section.
 *
 * It stays deliberately stateless: the mail link starts a project inquiry and
 * the pricing link hands visitors to the separate engagement options page.
 *
 * Selector: `showcase-cta`.
 */
@Component({
  selector: "showcase-cta",
  shadow: false,
})
export class ShowcaseCtaComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Publishes the selected showcase CTA before the browser follows its link. */
  @BindEvent({event: "click", id: "[data-analytics-cta]"})
  trackCtaClick(event: Event): void {
    const action = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-analytics-cta]")?.dataset.analyticsCta;
    if (action !== "conversation" && action !== "pricing") {
      return;
    }

    publishAnalyticsEvent({
      eventName: "cta_click",
      params: {action, surface: "showcase_cta"},
    });
  }

  /** Renders the inquiry and pricing actions used at the end of the page. */
  render(): string {
    return HTML`
      <div id="showcase-contact" class="showcase-cta showcase-reveal" data-showcase-reveal>
        <p class="showcase-eyebrow">Start with the outcome</p>
        <h2 class="showcase-display mt-5">Have something to <span class="text-[var(--primary-color)]">build?</span></h2>
        <div class="mt-9 flex flex-wrap justify-center gap-3">
          <a class="app-link app-link--button app-link--accent" data-analytics-cta="conversation" href="mailto:akjaiswal2003@gmail.com?subject=Project%20inquiry">Start a conversation <span aria-hidden="true">→</span></a>
          <a class="app-link app-link--button app-link--ghost" data-analytics-cta="pricing" href="/pricing">See ways to work together</a>
        </div>
      </div>
    `;
  }
}
