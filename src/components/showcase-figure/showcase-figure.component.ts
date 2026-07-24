import {BaseElement, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });

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
