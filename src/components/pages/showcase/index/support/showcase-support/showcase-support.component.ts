import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

/**
 * Groups the reusable support content shown after the project sections.
 *
 * It is a layout shell only: working-method copy, FAQ behavior, and contact
 * actions remain separate child components so each can evolve independently.
 *
 * Selector: `showcase-support`.
 */
@Component({
  selector: "showcase-support",
  shadow: false,
})
export class ShowcaseSupportComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Renders the working method, FAQ, and contact call-to-action in order. */
  render(): string {
    return HTML`
      <section id="showcase-support" class="showcase-support-section layout-page layout-section-end" aria-labelledby="showcase-support-title">
        <div>
          <showcase-working-method></showcase-working-method>
          <showcase-faq></showcase-faq>
          <showcase-cta></showcase-cta>
        </div>
      </section>
    `;
  }
}
