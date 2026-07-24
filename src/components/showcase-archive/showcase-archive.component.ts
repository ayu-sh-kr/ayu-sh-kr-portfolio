import { BaseElement, Component, HTML, HostListener, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import {
  getShowcaseProjectsByTier,
  showcaseFilters,
  ShowcaseProjectKind,
} from "@app/data/showcase-content.ts";

type ShowcaseFilter = "all" | ShowcaseProjectKind;

@Component({
  selector: "showcase-archive",
  shadow: false,
})
export class ShowcaseArchiveComponent extends BaseElement {
  private activeFilter: ShowcaseFilter = "all";

  constructor() {
    super();
  }

  @WindowListener({ event: "hashchange" })
  onHashChange(): void {
    const nextFilter = this.filterFromHash();
    if (nextFilter === this.activeFilter) {
      return;
    }

    this.activeFilter = nextFilter;
    this.updateHTML();
  }

  @HostListener({ event: "click" })
  onHostClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const filterButton = target.closest<HTMLButtonElement>("[data-showcase-filter]");
    if (!filterButton) {
      return;
    }

    event.preventDefault();
    this.setFilter(filterButton.dataset.showcaseFilter as ShowcaseFilter);
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.activeFilter = this.filterFromHash();
    this.updateHTML();
  }

  private filterFromHash(): ShowcaseFilter {
    const value = window.location.hash.replace(/^#\//, "").replaceAll("-", " ");
    return showcaseFilters.some((filter) => filter.value === value) ? (value as ShowcaseFilter) : "all";
  }

  private setFilter(filter: ShowcaseFilter): void {
    this.activeFilter = filter;
    const hash = filter === "all" ? "" : `#/${filter.replaceAll(" ", "-")}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    this.updateHTML();
  }

  private filteredProjects() {
    const archive = getShowcaseProjectsByTier("archive");
    return this.activeFilter === "all" ? archive : archive.filter((project) => project.kind === this.activeFilter);
  }

  render(): string {
    const filteredProjects = this.filteredProjects();
    const archiveCount = getShowcaseProjectsByTier("archive").length;
    const countLabel = `${filteredProjects.length} ${filteredProjects.length === 1 ? "project" : "projects"}`;

    return HTML`
      <section id="showcase-archive" class="showcase-section showcase-archive-section" aria-labelledby="showcase-archive-title">
        <div class="mx-auto max-w-6xl px-5 sm:px-8">
          <div class="showcase-archive-heading">
            <div>
              <p class="showcase-eyebrow showcase-reveal" data-showcase-reveal>Archive</p>
              <h2 id="showcase-archive-title" class="showcase-title mt-4 showcase-reveal" data-showcase-reveal>Everything else worth keeping.</h2>
            </div>
            <span class="showcase-section-note showcase-reveal" data-showcase-reveal>${archiveCount} projects in the archive</span>
          </div>
          <div class="showcase-filter-row mt-10" role="group" aria-label="Filter projects by kind">
            ${showcaseFilters
              .map(
                (filter) => `
                  <button class="showcase-filter ${filter.value === this.activeFilter ? "is-active" : ""}" type="button" data-showcase-filter="${filter.value}" aria-pressed="${filter.value === this.activeFilter}">
                    ${filter.label}
                  </button>
                `,
              )
              .join("")}
            <span class="showcase-filter-count" aria-live="polite">${countLabel}</span>
          </div>
          <div class="showcase-row-list mt-6">
            ${filteredProjects.map((project) => `<showcase-project-row project-slug="${project.slug}"></showcase-project-row>`).join("")}
          </div>
          ${filteredProjects.length === 0
            ? `<p class="showcase-empty-state" data-showcase-reveal data-showcase-reveal-now>No projects in this category yet. <button type="button" data-showcase-filter="all">Show all</button></p>`
            : ""}
        </div>
      </section>
    `;
  }
}
