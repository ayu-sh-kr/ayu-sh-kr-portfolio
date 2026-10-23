import "./design-index-rail.component.css";
import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {html, type TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import {designContent, type DesignGrammarSection} from "@app/data/design-content.ts";

/**
 * Renders the reference rail; the parent shell owns section observation across siblings.
 *
 * Used by the parent reference shell. Shared visual rules remain in the feature
 * stylesheet; this element owns its section markup. Selector: `design-index-rail`.
 */
@Component({selector: "design-index-rail", shadow: false})
export class DesignIndexRailComponent extends BaseElement {
  /** Renders the grammar and contract destinations in their authored reading order. */
  render(): TemplateResult {
    const {index, sections} = designContent;
    return html`
      <aside class="design-index-reference__rail" aria-label="${index.rail.ariaLabel}">
        <nav class="design-index-reference__toc">
          <p class="type-label">${index.rail.structureLabel}</p>
          ${sections.slice(0, 2).map((section) => this.renderRailLink(section))}
          <p class="type-label">${index.rail.behaviourLabel}</p>
          ${sections.slice(2).map((section) => this.renderRailLink(section))}
          <p class="type-label">${index.rail.contractLabel}</p>
          ${index.rail.contractLinks.map(
            (link) => html`<a data-design-index-nav href="${link.href}">${link.label}</a>`
          )}
        </nav>
      </aside>
    `;
  }

  /** Shares one native fragment-link shape between the two navigation groups. */
  private renderRailLink(section: Pick<DesignGrammarSection, "id" | "number" | "title">) {
    return html`<a data-design-index-nav href="#${section.id}"
      >${section.number} · ${section.title}</a
    >`;
  }
}
