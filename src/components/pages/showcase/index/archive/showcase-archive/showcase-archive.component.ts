import { BaseElement, Component, HTML, HostListener, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import {
  getShowcaseProjectsByTier,
  showcaseFilters,
  ShowcaseProjectKind,
  type ShowcaseProject,
} from "@app/data/showcase-content.ts";

/**
 * Filters available in the archive list, including the unfiltered view.
 *
 * The values are also used in the URL hash so a selected archive category can
 * be shared and restored after navigation.
 */
type ShowcaseFilter = "all" | ShowcaseProjectKind;

/**
 * Lists archive-tier projects and keeps the selected kind in the URL hash.
 *
 * The showcase page owns the surrounding layout; this element owns only the
 * archive filter state and composes each result as a `showcase-project-row`.
 * Hash changes update the list without reloading the page.
 *
 * Selector: `showcase-archive`.
 */
@Component({
  selector: "showcase-archive",
  shadow: false,
})
export class ShowcaseArchiveComponent extends BaseElement {
  /** Current archive filter, mirrored in the optional URL hash. */
  private activeFilter: ShowcaseFilter = "all";

  constructor() {
    super();
  }

  @WindowListener({ event: "hashchange" })
  /** Reconciles the rendered filter when browser navigation changes the hash. */
  syncFilterWithHash(): void {
    const nextFilter = this.filterFromHash();
    if (nextFilter === this.activeFilter) {
      return;
    }

    this.activeFilter = nextFilter;
    this.updateHTML();
  }

  @HostListener({ event: "click" })
  /** Applies a valid archive filter selected through delegated button clicks. */
  applyFilterFromClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const filterButton = target.closest<HTMLButtonElement>("[data-showcase-filter]");
    if (!filterButton) {
      return;
    }

    event.preventDefault();
    const filter = filterButton.dataset.showcaseFilter;
    if (!filter || !showcaseFilters.some((option) => option.value === filter)) {
      return;
    }

    this.setFilter(filter as ShowcaseFilter);
  }

  @OnEvent("connected", true)
  /** Initializes the archive state after the element has been rendered. */
  initializeArchiveFilter(): void {
    this.activeFilter = this.filterFromHash();
    this.updateHTML();
  }

  /** Converts the current hash to a known filter, falling back to `all`. */
  private filterFromHash(): ShowcaseFilter {
    const value = window.location.hash.replace(/^#\//, "").replaceAll("-", " ");
    return showcaseFilters.some((filter) => filter.value === value) ? (value as ShowcaseFilter) : "all";
  }

  /** Updates local filter state and writes the shareable archive hash. */
  private setFilter(filter: ShowcaseFilter): void {
    this.activeFilter = filter;
    const hash = filter === "all" ? "" : `#/${filter.replaceAll(" ", "-")}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    this.updateHTML();
  }

  /** Returns archive projects matching the selected filter. */
  private filteredProjects(): ShowcaseProject[] {
    const archive = getShowcaseProjectsByTier("archive");
    return this.activeFilter === "all" ? archive : archive.filter((project) => project.kind === this.activeFilter);
  }

  /** Renders filter controls, result count, and the current archive rows. */
  render(): string {
    const filteredProjects = this.filteredProjects();
    const archiveCount = getShowcaseProjectsByTier("archive").length;
    const countLabel = `${filteredProjects.length} ${filteredProjects.length === 1 ? "project" : "projects"}`;

    return HTML`
      <section id="showcase-archive" class="showcase-section showcase-archive-section" aria-labelledby="showcase-archive-title">
        <div class="mx-auto max-w-[var(--layout-page-max)] px-5 sm:px-8">
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
