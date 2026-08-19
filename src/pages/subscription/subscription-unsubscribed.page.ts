import { Component, DotaPageElement, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { letterUnsubscribeContent } from "@app/data/letter-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Newsletter unsubscribe receipt route at `/subscription/unsubscribed`.
 *
 * The shell provides receipt SEO and renders the completed view of the shared
 * `unsubscribe-flow` component.
 */
@Route({ path: "/subscription/unsubscribed", ssr: false })
@Component({ selector: "subscription-unsubscribed-page", shadow: false })
export class SubscriptionUnsubscribedPage extends DotaPageElement {
  constructor() {
    super();
  }

  /**
   * Supplies receipt SEO metadata for the private completed route.
   *
   * The done branch is selected here so route metadata describes the post-action
   * page rather than the confirmation prompt.
   */
  get seo(): SEO { return toSEO(letterUnsubscribeContent.seo.done); }

  /**
   * Composes the route shell with the completed flow view.
   *
   * The child owns receipt rendering and undo feedback; this shell fixes only
   * the route-level view property and metadata contract.
   */
  render() {
    return html`
      <app-header></app-header>
      <unsubscribe-flow view="done"></unsubscribe-flow>
      <app-footer></app-footer>
    `;
  }
}
