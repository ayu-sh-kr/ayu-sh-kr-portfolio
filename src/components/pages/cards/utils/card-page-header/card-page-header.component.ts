import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";

/**
 * Provides the shared application identity above focused card routes.
 *
 * The route composes this independently from the card deck so its page-wide
 * alignment and reusable brand mark do not become part of deck interaction.
 *
 * Reach Out and About Me supply their own destination through attributes while
 * this utility preserves the same brand alignment and header rhythm.
 *
 * Selector: `card-page-header`.
 */
@Component({ selector: "card-page-header", shadow: false })
export class CardPageHeaderComponent extends BaseElement {
  /** Attribute `link-label`; visible destination label for the focused route. */
  @Property({ name: "link-label", type: String })
  linkLabel = "";

  /** Attribute `link-href`; route opened by the header's secondary navigation link. */
  @Property({ name: "link-href", type: String })
  linkHref = "/";

  constructor() {
    super();
  }

  /** Renders the persistent brand and the route-specific continuation. */
  render(): string {
    return HTML`
      <header class="card-page-header layout-page">
        <app-brand></app-brand>
        <a class="app-link app-link--nav card-page-header__link" href="${this.linkHref}">${this.linkLabel}</a>
      </header>
    `;
  }
}
