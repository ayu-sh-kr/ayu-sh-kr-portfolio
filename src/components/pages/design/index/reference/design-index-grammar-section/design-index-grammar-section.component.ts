import "./design-index-grammar-section.component.css";
import {BaseElement, Component, Property, String} from "@ayu-sh-kr/dota-wrap/core";
import {html, type TemplateResult} from "@ayu-sh-kr/dota-wrap/rendering";
import {designContent, type DesignGrammarDoor} from "@app/data/design-content.ts";

/**
 * Owns one grammar section, selected by its stable authored ID rather than serialized HTML.
 *
 * Used by the parent reference shell. Shared visual rules remain in the feature
 * stylesheet; this element owns its section markup. Selector: `design-index-grammar-section`.
 */
@Component({selector: "design-index-grammar-section", shadow: false})
export class DesignIndexGrammarSectionComponent extends BaseElement {
  /** Authored grammar ID, supplied through `section-key`; defaults to the first section. */
  @Property({name: "section-key", type: String})
  sectionKey = designContent.sections[0]!.id;

  /** Resolves the authored section and renders its route doors and fragment shortcuts. */
  render(): TemplateResult {
    const section = designContent.sections.find((item) => item.id === this.sectionKey);
    if (!section) {
      return html``;
    }
    const isFirst = section === designContent.sections[0];
    return html`
      <section
        id="${section.id}"
        data-design-index-section
        class="design-index-reference__section layout-section ${isFirst ? "layout-section-flush" : ""}"
        aria-labelledby="${section.id}-title"
      >
        <p class="design-index-reference__number type-eyebrow">${section.number}</p>
        <h2 id="${section.id}-title" class="type-section">${section.title}</h2>
        <p class="type-lede">${section.lede}</p>
        <div class="design-index-reference__doors">
          ${section.doors.map((door) => this.renderDoor(section.number, door))}
        </div>
        <nav
          class="design-index-reference__jumps"
          aria-label="${designContent.index.labels.sectionNavigationPrefix} ${section.title}"
        >
          <p class="type-label">${designContent.index.labels.jump}</p>
          ${section.jumps.map((jump) => html`<a href="${jump.href}">${jump.label}</a>`)}
        </nav>
      </section>
    `;
  }

  /** Renders one route door with its purpose, source path, and authored metrics. */
  private renderDoor(number: string, door: DesignGrammarDoor) {
    return html`
      <a class="design-index-door" href="${door.href}">
        <span class="design-index-door__body">
          <span class="type-label">${designContent.index.labels.doorPurpose}</span>
          <span class="design-index-door__description">${door.description}</span>
          <code class="design-index-door__source">${door.source}</code>
          <span class="design-index-door__open"
            >${designContent.index.labels.doorAction} <span aria-hidden="true">→</span></span
          >
        </span>
        <span class="design-index-door__stats">
          <span class="type-label">${designContent.index.labels.grammarPrefix} ${number}</span>
          <span class="design-index-door__facts">
            ${door.facts.map(
              (fact) => html`<span><b data-count>${fact.value}</b><small>${fact.label}</small></span>`
            )}
          </span>
        </span>
      </a>
    `;
  }
}
