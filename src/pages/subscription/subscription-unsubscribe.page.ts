import { Component, DotaPageElement, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { letterUnsubscribeContent } from "@app/data/letter-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Newsletter unsubscribe confirmation route at `/subscription/unsubscribe`.
 *
 * The shell provides confirmation-page SEO and renders the confirm view of the
 * shared `unsubscribe-flow` component.
 */
@Route({ path: "/subscription/unsubscribe", ssr: false })
@Component({ selector: "subscription-unsubscribe-page", shadow: false })
export class SubscriptionUnsubscribePage extends DotaPageElement {
  constructor() {
    super();
  }

  /**
   * Supplies confirmation SEO metadata for the private unsubscribe route.
   *
   * This shell renders the pre-action branch of the shared unsubscribe flow, so
   * its metadata describes confirmation rather than the completed receipt.
   */
  get seo(): SEO { return toSEO(letterUnsubscribeContent.seo.confirm); }

  /**
   * Composes the route shell with the confirmation flow view.
   *
   * Query parsing and action state remain inside `unsubscribe-flow`, keeping the
   * route class focused on navigation and metadata.
   */
  render() {
    return html`
      <app-header></app-header>
      <unsubscribe-flow view="confirm"></unsubscribe-flow>
      <app-footer></app-footer>
    `;
  }
}
