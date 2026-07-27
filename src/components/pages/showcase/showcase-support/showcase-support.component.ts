import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

@Component({
  selector: "showcase-support",
  shadow: false,
})
export class ShowcaseSupportComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    return HTML`
      <section id="showcase-support" class="showcase-support-section" aria-labelledby="showcase-support-title">
        <div class="mx-auto max-w-6xl px-5 sm:px-8">
          <showcase-working-method></showcase-working-method>
          <showcase-faq></showcase-faq>
          <showcase-cta></showcase-cta>
        </div>
      </section>
    `;
  }
}
