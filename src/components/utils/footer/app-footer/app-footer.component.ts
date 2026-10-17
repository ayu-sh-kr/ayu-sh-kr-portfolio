import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";

@Component({
  selector: "app-footer",
  shadow: false,
})
export class AppFooterComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): TemplateResult {
    return html`
      <footer class="site-footer" aria-label="Site footer">
        <footer-support></footer-support>
        <footer-index></footer-index>
        <footer-baseline></footer-baseline>
      </footer>
    `;
  }
}
