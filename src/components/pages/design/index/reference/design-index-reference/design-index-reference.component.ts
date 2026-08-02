import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import {
  designContent,
  type DesignGrammarDoor,
  type DesignGrammarSection,
} from "@app/data/design-content.ts";

/**
 * The route map, ownership contract, and shipping floor for `/design`.
 *
 * One full-width door opens each live grammar without nesting its fragment
 * links. Once connected, an intersection observer keeps the wide-screen rail
 * aligned with the section in the reading band; teardown disconnects it when
 * the route unmounts so revisiting the index cannot retain stale nodes.
 *
 * Selector: `design-index-reference`.
 */
@Component({ selector: "design-index-reference", shadow: false })
export class DesignIndexReferenceComponent extends BaseElement {
  /** Observer that drives the section rail only while this route instance is connected. */
  private sectionObserver: IntersectionObserver | null = null;

  /** Creates the static reference element before its scoped lifecycle installs scroll tracking. */
  constructor() {
    super();
  }

  /** Observes every indexed section after Dota has rendered and bound the route's DOM. */
  @OnEvent("connected", true)
  observeSections(): void {
    const links = Array.from(this.querySelectorAll<HTMLAnchorElement>("[data-design-index-nav]"));

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const activeSection = entries.find((entry) => entry.isIntersecting)?.target.id;
        if (activeSection) {
          this.updateActiveRailLink(links, activeSection);
        }
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );

    this.querySelectorAll<HTMLElement>("[data-design-index-section]").forEach((section) => {
      this.sectionObserver?.observe(section);
    });
  }

  /** Releases the observer and its route-local element references when Dota removes this page. */
  @OnEvent("disconnected", true)
  stopObservingSections(): void {
    this.sectionObserver?.disconnect();
    this.sectionObserver = null;
  }

  /** Renders the five grammar doors followed by the shared ownership and shipping guidance. */
  render(): string {
    const { index, sections } = designContent;

    return HTML`
      <div class="design-index-reference layout-page">
        <div class="design-index-reference__shell">
          <aside class="design-index-reference__rail" aria-label="${index.rail.ariaLabel}">
            <nav class="design-index-reference__toc">
              <p class="type-label">${index.rail.structureLabel}</p>
              ${sections.slice(0, 2).map((section) => this.renderRailLink(section)).join("")}
              <p class="type-label">${index.rail.behaviourLabel}</p>
              ${sections.slice(2).map((section) => this.renderRailLink(section)).join("")}
              <p class="type-label">${index.rail.contractLabel}</p>
              ${index.rail.contractLinks.map((link) => HTML`<a data-design-index-nav href="${link.href}">${link.label}</a>`).join("")}
            </nav>
          </aside>
          <div class="design-index-reference__content">
            ${sections.map((section, sectionIndex) => this.renderGrammarSection(section, sectionIndex === 0)).join("")}
            ${this.renderOwnership()}
            ${this.renderRoutes()}
            ${this.renderShipChecklist()}
          </div>
        </div>
      </div>
    `;
  }

  /** Marks the rail link whose fragment matches the latest section in the observer's reading band. */
  private updateActiveRailLink(links: HTMLAnchorElement[], activeSection: string): void {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSection}`);
    });
  }

  /** Renders one rail destination so the grammar and contract groups share identical accessible links. */
  private renderRailLink(section: Pick<DesignGrammarSection, "id" | "number" | "title">): string {
    return HTML`<a data-design-index-nav href="#${section.id}">${section.number} · ${section.title}</a>`;
  }

  /** Renders the contextual section, its single-purpose route doors, and non-nested fragment shortcuts. */
  private renderGrammarSection(section: DesignGrammarSection, isFirst: boolean): string {
    return HTML`
      <section id="${section.id}" data-design-index-section class="design-index-reference__section layout-section ${isFirst ? "layout-section-flush" : ""}" aria-labelledby="${section.id}-title">
        <p class="design-index-reference__number type-eyebrow">${section.number}</p>
        <h2 id="${section.id}-title" class="type-section">${section.title}</h2>
        <p class="type-lede">${section.lede}</p>
        <div class="design-index-reference__doors">
          ${section.doors.map((door) => this.renderDoor(section.number, door)).join("")}
        </div>
        <nav class="design-index-reference__jumps" aria-label="${designContent.index.labels.sectionNavigationPrefix} ${section.title}">
          <p class="type-label">${designContent.index.labels.jump}</p>
          ${section.jumps.map((jump) => HTML`<a href="${jump.href}">${jump.label}</a>`).join("")}
        </nav>
      </section>
    `;
  }

  /** Renders one complete route door with prose in the surface and metrics in its contrast panel. */
  private renderDoor(number: string, door: DesignGrammarDoor): string {
    return HTML`
      <a class="design-index-door" href="${door.href}">
        <span class="design-index-door__body">
          <span class="type-label">${designContent.index.labels.doorPurpose}</span>
          <span class="design-index-door__description">${door.description}</span>
          <code class="design-index-door__source">${door.source}</code>
          <span class="design-index-door__open">${designContent.index.labels.doorAction} <span aria-hidden="true">→</span></span>
        </span>
        <span class="design-index-door__stats">
          <span class="type-label">${designContent.index.labels.grammarPrefix} ${number}</span>
          <span class="design-index-door__facts">
            ${door.facts.map((fact) => HTML`<span><b data-count>${fact.value}</b><small>${fact.label}</small></span>`).join("")}
          </span>
        </span>
      </a>
    `;
  }

  /** Renders the decision-boundary table and its precedence note for resolving apparent conflicts. */
  private renderOwnership(): string {
    const { ownership } = designContent.index;

    return HTML`
      <section id="map" data-design-index-section class="design-index-reference__section layout-section" aria-labelledby="map-title">
        <p class="design-index-reference__number type-eyebrow">${ownership.number}</p>
        <h2 id="map-title" class="type-section">${ownership.title}</h2>
        <p class="type-lede">${ownership.lede}</p>
        <div class="design-index-reference__table" role="region" aria-label="${ownership.ariaLabel}">
          <div class="design-index-reference__table-row design-index-reference__table-row--head" role="row">
            ${ownership.headers.map((header) => HTML`<span role="columnheader">${header}</span>`).join("")}
          </div>
          ${designContent.ownership.map((item) => HTML`
            <div class="design-index-reference__table-row" role="row">
              <strong role="cell">${item.layer}</strong><span role="cell">${item.owns}</span><span role="cell">${item.excludes}</span><code role="cell">${item.source}</code>
            </div>
          `).join("")}
        </div>
        <aside class="design-index-reference__note" aria-label="${ownership.note.ariaLabel}">
          <p class="type-label">${ownership.note.label}</p>
          <p>${ownership.note.body}</p>
          <p><strong>${ownership.note.warning}</strong> ${ownership.note.resolution}</p>
        </aside>
      </section>
    `;
  }

  /** Renders common work as a reading path so maintainers open only the grammar they need. */
  private renderRoutes(): string {
    const { routes } = designContent.index;

    return HTML`
      <section id="routes" data-design-index-section class="design-index-reference__section layout-section" aria-labelledby="routes-title">
        <p class="design-index-reference__number type-eyebrow">${routes.number}</p>
        <h2 id="routes-title" class="type-section">${routes.title}</h2>
        <p class="type-lede">${routes.lede}</p>
        <dl class="design-index-reference__routes">
          ${designContent.routes.map((route) => HTML`<div><dt>${route.task}</dt><dd>${route.path}</dd></div>`).join("")}
        </dl>
      </section>
    `;
  }

  /** Renders the shared final checks and links back to the first grammar for the next implementation step. */
  private renderShipChecklist(): string {
    const { ship } = designContent.index;

    return HTML`
      <section id="ship" data-design-index-section class="design-index-reference__section layout-section-end" aria-labelledby="ship-title">
        <p class="design-index-reference__number type-eyebrow">${ship.number}</p>
        <h2 id="ship-title" class="type-section">${ship.title}</h2>
        <p class="type-lede">${ship.lede}</p>
        <ol class="design-index-reference__checks">
          ${designContent.checks.map((check) => HTML`<li>${check}</li>`).join("")}
        </ol>
        <p class="design-index-reference__accent-note"><strong>${ship.accentWarning}</strong> ${ship.accentResolution}</p>
        <div class="design-index-reference__actions layout-row">
          ${ship.actions.map((action) => HTML`<a class="${action.className}" href="${action.href}">${action.label}</a>`).join("")}
        </div>
      </section>
    `;
  }
}
