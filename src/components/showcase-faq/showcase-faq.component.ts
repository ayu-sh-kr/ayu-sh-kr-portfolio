import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { showcaseSupport } from "@app/data/showcase-content.ts";

@Component({
  selector: "showcase-faq",
  shadow: false,
})
export class ShowcaseFaqComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const accordionConfig = JSON.stringify({
      container: "showcase-faq-accordion",
      button: {
        base: "showcase-faq-accordion-button",
        size: { md: "" },
        color: { gray: { ghost: "showcase-faq-accordion-button-color" } },
      },
      paragraph: "showcase-faq-accordion-answer",
    });

    return HTML`
      <div class="showcase-faq-block">
        <p class="showcase-eyebrow showcase-reveal" data-showcase-reveal>Common questions</p>
        <h2 id="showcase-support-title" class="showcase-title mt-4 showcase-reveal" data-showcase-reveal>Useful context before we start.</h2>
        <div class="showcase-faq-list mt-10">
          ${showcaseSupport.faq
            .map(
              (item) => HTML`
                <dota-accordion
                  classname="showcase-faq-accordion"
                  header="${item.question}"
                  description="${item.answer}"
                  config='${accordionConfig}'
                ></dota-accordion>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }
}
