import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { DOTA_FAQ_ACCORDION_CLASS, DOTA_FAQ_ACCORDION_CONFIG } from "@app/components/utils/faq/dota-faq-accordion.ts";
import { showcaseSupport } from "@app/data/showcase-content.ts";

/**
 * Renders the showcase FAQ from the shared support content model.
 *
 * Each authored question becomes a Dota accordion item. The component owns the
 * accordion configuration, while question and answer copy stays in
 * `showcaseSupport` so content changes do not require template edits.
 *
 * Selector: `showcase-faq`.
 */
@Component({
  selector: "showcase-faq",
  shadow: false,
})
export class ShowcaseFaqComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Renders the shared FAQ entries with the showcase accordion styling contract. */
  render(): string {
    return HTML`
      <div class="showcase-faq-block">
        <p class="showcase-eyebrow showcase-reveal" data-showcase-reveal>Common questions</p>
        <h2 id="showcase-support-title" class="showcase-title mt-4 showcase-reveal" data-showcase-reveal>Useful context before we start.</h2>
        <div class="showcase-faq-list mt-10">
          ${showcaseSupport.faq
            .map(
              (item) => HTML`
                <dota-accordion
                  classname="${DOTA_FAQ_ACCORDION_CLASS}"
                  header="${item.question}"
                  description="${item.answer}"
                  config='${DOTA_FAQ_ACCORDION_CONFIG}'
                ></dota-accordion>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }
}
