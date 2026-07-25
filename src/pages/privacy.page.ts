import {Component, DotaPageElement, HTML, SEO} from "@ayu-sh-kr/dota-wrap/core";
import {Route} from "@ayu-sh-kr/dota-wrap/router";

@Route({path: "/legal/privacy"})
@Component({
  selector: "privacy-page",
  shadow: false,
})
export class PrivacyPage extends DotaPageElement {
  constructor() {
    super();
  }

  get seo(): SEO {
    return {
      title: "Privacy Policy — ayush.dev",
      description: "What Ayush collects, why he collects it, and how to get rid of it.",
      keywords: ["Ayush Jaiswal", "Privacy Policy", "Data Protection", "ayush.dev"],
      og: {
        title: "Privacy Policy — ayush.dev",
        description: "A plain-English privacy policy for ayush.dev and client work.",
      },
    };
  }

  render(): string {
    return HTML`
      <app-header></app-header>
      <privacy-view></privacy-view>
      <app-footer></app-footer>
    `;
  }
}
