import {html, TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import { BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import {
  designInteractionContent,
  type InteractionFamily,
} from "@app/data/design-interaction-content.ts";

/** Provides the compact route-level index that links each family in reading order. */
@Component({ selector: "design-interaction-nav", shadow: false })
export class DesignInteractionNavComponent extends BaseElement {
  /** Creates the static fragment navigation. */
  constructor() {
    super();
  }

  /** Renders one named navigation group from the authored interaction family catalog. */
  private renderGroup(group: InteractionFamily["group"]) {
    return designInteractionContent.families
      .filter((family) => family.group === group)
      .map(
        (family) =>
          html`<a href="#${family.id}">${family.number} · ${family.title}</a>`,
      );
  }

  /** Renders the scrollable small-screen-safe navigation strip and contract shortcut. */
  render(): TemplateResult {
    const { navigation } = designInteractionContent;

    return html` <nav
      class="design-interaction-nav layout-page layout-section-sm"
      aria-label="${navigation.ariaLabel}"
    >
      <div class="layout-row layout-row-tight">
        ${navigation.groups.map(
          (group) => html`<span class="type-label">${group}</span>${this.renderGroup(group)}`
        )}<a href="${navigation.useCase.href}">${navigation.useCase.label}</a
        ><a href="${navigation.contract.href}">${navigation.contract.label}</a>
      </div>
    </nav>`;
  }
}
