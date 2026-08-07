import {BeforeInit, BaseElement, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";

/** Visual variants supported by an authored aside in showcase Markdown. */
type AsideKind = "note" | "warn" | "quote";

/**
 * Captures authored aside content and wraps it in the matching showcase callout.
 *
 * Markdown rendering supplies the element's initial child content. The `kind`
 * attribute selects the label and visual variant while the captured content is
 * kept as the body of the callout.
 *
 * Selector: `showcase-aside`.
 */
@Component({
  selector: "showcase-aside",
  shadow: false,
})
export class ShowcaseAsideComponent extends BaseElement {
  /** Attribute `kind`; accepts `note`, `warn`, or `quote`, defaulting to `note`. */
  @Property({name: "kind", type: String})
  kind: AsideKind = "note";

  /** Initial child markup captured from Markdown before the host is re-rendered. */
  private content = "";

  constructor() {
    super();
  }

  @BeforeInit()
  /** Saves Markdown-provided child content before the component renders over it. */
  beforeViewInit(): void {
    this.content = this.innerHTML.trim();
  }

  /** Renders the captured content with a safe, known visual variant and label. */
  render(): string {
    const kind: AsideKind = this.kind === "warn" || this.kind === "quote" ? this.kind : "note";
    const label = kind === "quote" ? "Field note" : kind === "warn" ? "Watch for this" : "Worth knowing";

    return HTML`
      <aside class="showcase-aside showcase-aside-${kind}">
        <span class="showcase-aside-label">${label}</span>
        <div>${this.content}</div>
      </aside>
    `;
  }
}
