import { Component, DotaPageElement, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { subscriptionPreferencesContent } from "@app/data/subscription-preferences-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Newsletter preference-management route at `/subscription/preference`.
 *
 * The page shell supplies SEO and delegates token loading and editable state to
 * the `subscription-preference` component.
 */
@Route({ path: "/subscription/preference", ssr: false })
@Component({ selector: "subscription-preference-page", shadow: false })
export class SubscriptionPreferencePage extends DotaPageElement {
  constructor() {
    super();
  }

  /**
   * Supplies authored SEO metadata for the token-linked preference route.
   *
   * The page shell owns route metadata while the child component owns token
   * loading and editable preference state.
   */
  get seo(): SEO { return toSEO(subscriptionPreferencesContent.seo); }

  /**
   * Composes the route shell with the preference component.
   *
   * No token work happens here; the child reads the current URL after connect so
   * this page remains a thin route boundary.
   */
  render() {
    return html`
      <app-header></app-header>
      <subscription-preference></subscription-preference>
      <app-footer></app-footer>
    `;
  }
}
