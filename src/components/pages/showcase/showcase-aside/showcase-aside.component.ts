import {BeforeInit, BaseElement, Component, HTML, Property, String} from "@ayu-sh-kr/dota-wrap/core";

type AsideKind = "note" | "warn" | "quote";

@Component({
  selector: "showcase-aside",
  shadow: false,
})
export class ShowcaseAsideComponent extends BaseElement {
  @Property({name: "kind", type: String})
  kind: AsideKind = "note";

  private content = "";

  constructor() {
    super();
  }

  @BeforeInit()
  captureContent(): void {
    this.content = this.innerHTML.trim();
  }

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
