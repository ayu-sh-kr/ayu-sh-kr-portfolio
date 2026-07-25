import {Component, DotaPageElement, HTML, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";

@Route({path: "/legal/terms"})
@Component({
  selector: "terms-page",
  shadow: false,
})
export class TermsPage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    return {
      title: "Terms & Conditions — ayush.dev",
      description: "The rules for reading this site, and the default rules for working with Ayush.",
      keywords: ["Ayush Jaiswal", "Terms & Conditions", "Terms of Service", "ayush.dev"],
      og: {
        title: "Terms & Conditions — ayush.dev",
        description: "Plain-English terms for ayush.dev and freelance engineering work.",
      },
    };
  }

  render(): string {
    return HTML`
      <app-header></app-header>
      <terms-view></terms-view>
      <app-footer></app-footer>
    `;
  }
}
