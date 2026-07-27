import { Component, DotaPageElement, HTML, Property, SEO, String } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import {portfolioContent} from "@app/data/portfolio-content.ts";
import {toSEO} from "@app/utils/seo.utils.ts";

/**
 * Error route at `/error`.
 *
 * It exposes the requested status and message while reusing the shared error
 * SEO content from `portfolioContent.error.seo`.
 */
@Route({ path: "/error" })
@Component({
  selector: "app-error",
  shadow: false,
})
export class ErrorPage extends DotaPageElement {
  /** Attribute `status`; HTTP-like status displayed in the error heading, defaulting to `404`. */
  @Property({ name: "status", type: String })
  status: number = 404;

  /** Attribute `message`; user-facing error text, defaulting to `Page not found`. */
  @Property({ name: "message", type: String })
  message: string = "Page not found";

  constructor() {
    super();
  }

  /** Returns error-page SEO authored in `portfolioContent.error.seo`. */
  get seo(): SEO {
    return toSEO(portfolioContent.error.seo);
  }

  /** Renders the status message and return link around the shared footer. */
  render(): string {
    return HTML`
      <main class="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[var(--background-color)] px-5 py-24 text-[var(--foreground-color)]">
        <div class="relative z-10 w-full max-w-3xl border-t border-[var(--border-color)] pt-8">
          <p class="motion-eyebrow">Request failed / ${this.status}</p>
          <h1 class="motion-display mt-8">${this.message}.</h1>
          <p class="mt-8 max-w-lg text-base leading-8 text-[var(--muted-color)]">That route does not lead anywhere yet. Return to the portfolio and keep exploring from there.</p>
          <a href="/" class="motion-button motion-button-ink mt-9">Return home <span aria-hidden="true">←</span></a>
        </div>
      </main>
      <app-footer></app-footer>
    `;
  }
}
