import { Component, DotaPageElement, SEO } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { Route } from "@ayu-sh-kr/dota-wrap/router";
import { subscriptionVerifyContent } from "@app/data/subscription-verify-content.ts";
import { toSEO } from "@app/utils/seo.utils.ts";

/**
 * Newsletter double-opt-in confirmation route at `/subscription/verify`.
 *
 * The shell supplies SEO and delegates token confirmation and recovery states
 * to the `subscription-verify` component.
 */
@Route({ path: "/subscription/verify", ssr: false })
@Component({ selector: "subscription-verify-page", shadow: false })
export class SubscriptionVerifyPage extends DotaPageElement {
  constructor() {
    super();
  }

  /**
   * Supplies authored SEO metadata for the private verification route.
   *
   * Verification outcome text is selected by the child after the token request,
   * so the shell uses stable route metadata here.
   */
  get seo(): SEO { return toSEO(subscriptionVerifyContent.seo); }

  /**
   * Composes the route shell with the token-verification component.
   *
   * The child starts confirmation after connect and owns recovery states; this
   * page remains a declarative route boundary.
   */
  render() {
    return html`
      <app-header></app-header>
      <subscription-verify></subscription-verify>
      <app-footer></app-footer>
    `;
  }
}
