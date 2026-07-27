import {BaseElement, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {escapeHtml} from "@app/utils/html.utils.ts";

@Component({
  selector: "showcase-figure",
  shadow: false,
})
export class ShowcaseFigureComponent extends BaseElement {
  @Property({name: "src", type: String})
  src = "";

  @Property({name: "caption", type: String})
  caption = "";

  constructor() {
    super();
  }

  render(): string {
    const safeSource = /^(?:https?:\/\/|\/)/.test(this.src) ? this.src : "";
    if (!safeSource) {
      return "";
    }

    return HTML`
      <figure class="showcase-figure">
        <img src="${escapeHtml(safeSource)}" alt="${escapeHtml(this.caption)}" loading="lazy" decoding="async">
        ${this.caption ? `<figcaption>${escapeHtml(this.caption)}</figcaption>` : ""}
      </figure>
    `;
  }
}
