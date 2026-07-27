import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

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

  /** Renders the inquiry and pricing actions used at the end of the page. */
  render(): string {
    return HTML`
      <div id="showcase-contact" class="showcase-cta showcase-reveal" data-showcase-reveal>
        <p class="showcase-eyebrow">Start with the outcome</p>
        <h2 class="showcase-display mt-5">Have something to <span class="text-[var(--primary-color)]">build?</span></h2>
        <div class="mt-9 flex flex-wrap justify-center gap-3">
          <a class="showcase-button showcase-button-accent" href="mailto:akjaiswal2003@gmail.com?subject=Project%20inquiry">Start a conversation <span aria-hidden="true">→</span></a>
          <a class="showcase-button showcase-button-ghost" href="/pricing">See ways to work together</a>
        </div>
      </div>
    `;
  }
}
