import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

@Component({
  selector: "app-footer",
  shadow: false,
})
export class AppFooterComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    return HTML`
      <footer class="site-footer" aria-label="Site footer">
        <footer-support></footer-support>
        <footer-index></footer-index>
        <footer-baseline></footer-baseline>
      </footer>
    `;
  }
}
