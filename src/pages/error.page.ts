import { Component, DotaPageElement, HTML, Property, SEO, String } from "@ayu-sh-kr/dota-wrap/core";
import { Route } from "@ayu-sh-kr/dota-wrap/router";

@Route({ path: "/error" })
@Component({
  selector: "app-error",
  shadow: false,
})
export class ErrorPage extends DotaPageElement {
  @Property({ name: "status", type: String })
  status: number = 404;

  @Property({ name: "message", type: String })
  message: string = "Page not found";

  constructor() {
    super();
  }

  get seo(): SEO {
    return {
      title: "404 — Ayush Jaiswal",
      description: "The requested portfolio page could not be found.",
      keywords: ["404", "Ayush Jaiswal"],
      og: {
        title: "404 — Page not found",
        description: "The requested portfolio page could not be found.",
      },
    };
  }

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
    `;
  }
}
