import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
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
  private renderGroup(group: InteractionFamily["group"]): string {
    return designInteractionContent.families
      .filter((family) => family.group === group)
      .map(
        (family) =>
          HTML`<a href="#${family.id}">${family.number} · ${family.title}</a>`,
      )
      .join("");
  }

  /** Renders the scrollable small-screen-safe navigation strip and contract shortcut. */
  render(): string {
    const { navigation } = designInteractionContent;

    return HTML`
      <nav class="design-interaction-nav layout-page layout-section-sm" aria-label="${navigation.ariaLabel}">
        <div class="layout-row layout-row-tight">
          ${navigation.groups.map((group) => HTML`<span class="type-label">${group}</span>${this.renderGroup(group)}`).join("")}<a href="${navigation.contract.href}">${navigation.contract.label}</a>
        </div>
      </nav>`;
  }
}
