import type { AccordionStyleConfig } from "@ayu-sh-kr/dota-ui";

/** Shared class applied to every FAQ instance of Dota's accordion component. */
export const DOTA_FAQ_ACCORDION_CLASS = "dota-faq-accordion";

const faqAccordionStyle = {
  container: "dota-faq-accordion-container",
  button: {
    base: "dota-faq-accordion-button",
    size: { md: "" },
    color: { gray: { solid: "", ghost: "" } },
  },
  paragraph: "dota-faq-accordion-answer",
} satisfies AccordionStyleConfig;

/** Serialized style slots consumed by every FAQ `dota-accordion` instance. */
export const DOTA_FAQ_ACCORDION_CONFIG = JSON.stringify(faqAccordionStyle);
