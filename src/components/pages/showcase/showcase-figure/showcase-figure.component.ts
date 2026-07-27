import {BaseElement, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {escapeHtml} from "@app/utils/html.utils.ts";

/**
 * Renders a Markdown-authored image with a caption and safe source handling.
 *
 * Only absolute HTTP(S) sources and root-relative paths are accepted. Invalid
 * sources render no figure, preventing authored content from producing an
 * unexpected image URL.
 *
 * Selector: `showcase-figure`.
 */
@Component({
  selector: "showcase-figure",
  shadow: false,
})
export class ShowcaseFigureComponent extends BaseElement {
  /** Attribute `src`; accepts an HTTP(S) URL or root-relative image path. */
  @Property({name: "src", type: String})
  src = "";

  /** Attribute `caption`; becomes both the image alt text and optional caption. */
  @Property({name: "caption", type: String})
  caption = "";

  constructor() {
    super();
  }

  /** Renders the validated image source and escaped caption, or nothing if invalid. */
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
