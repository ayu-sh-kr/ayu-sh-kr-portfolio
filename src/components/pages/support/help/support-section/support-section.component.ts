import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

/**
 * Composes the three parts of the answers-first support experience.
 *
 * The `/support` route uses this element as its help section. It owns the 80rem
 * section container and reading order only: `support-intro` renders the authored
 * invitation, `support-quick-help` resolves common questions inline, and
 * `support-ticket` owns the optional message flow. Keeping those responsibilities
 * separate lets interaction changes stay within the component that owns the state.
 *
 * Selector: `support-section`.
 */
@Component({ selector: "support-section", shadow: false })
export class SupportSectionComponent extends BaseElement {
  /** Creates the layout-only support help shell. */
  constructor() {
    super();
  }

  /** Returns the support journey in the order visitors encounter it. */
  render(): string {
    return HTML`
      <section id="support" class="support-section layout-page layout-section layout-stack layout-stack-xl" aria-labelledby="support-title">
        <support-intro></support-intro>
        <support-quick-help></support-quick-help>
        <support-ticket></support-ticket>
      </section>
    `;
  }
}
