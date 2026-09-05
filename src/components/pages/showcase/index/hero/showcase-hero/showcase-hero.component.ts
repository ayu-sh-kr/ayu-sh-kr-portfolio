import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { showcaseHeroContent, showcaseProjects } from "@app/data/showcase-content.ts";

/**
 * Introduces the showcase with its authored project counts and scroll cue.
 *
 * Counts are derived from the shared project catalog during rendering, keeping
 * the hero truthful when projects are added or moved between categories. The
 * motion controller later applies scroll-driven transforms to the marked nodes.
 *
 * Selector: `showcase-hero`.
 */
@Component({
  selector: "showcase-hero",
  shadow: false,
})
export class ShowcaseHeroComponent extends BaseElement {
  constructor() {
    super();
  }

  /** Renders the showcase headline and counts from the current project catalog. */
  render(): string {
    const openSourceCount = showcaseProjects.filter((project) => project.kind === "open source").length;
    const clientCount = showcaseProjects.filter((project) => project.kind === "client work").length;
    const { counts } = showcaseHeroContent;

    return HTML`
      <div id="showcase-hero-wrap" class="layout-hero-pin-wrap">
        <section class="layout-hero-pin-stage showcase-hero-stage" aria-labelledby="showcase-hero-title">
          <div id="showcase-hero-inner" class="layout-content layout-stack layout-stack-lg text-center">
            <p class="showcase-eyebrow">${showcaseHeroContent.eyebrow}</p>
            <h1 id="showcase-hero-title" class="showcase-display mt-5">
              ${showcaseHeroContent.titleBeforeAccent} <span class="text-[var(--primary-color)]">${showcaseHeroContent.titleAccent}</span>
            </h1>
            <p class="showcase-lede mx-auto mt-7 max-w-2xl">
              ${showcaseHeroContent.summary}
            </p>
            <p class="showcase-count mt-7" aria-label="${showcaseProjects.length} ${counts.projects}, ${openSourceCount} ${counts.openSource}, ${clientCount} ${counts.client}">
              <strong>${showcaseProjects.length}</strong> ${counts.projects} <span aria-hidden="true">·</span>
              <strong>${openSourceCount}</strong> ${counts.openSource} <span aria-hidden="true">·</span>
              <strong>${clientCount}</strong> ${counts.client}
            </p>
          </div>
          <scroll-hint mode="vertical"></scroll-hint>
        </section>
      </div>
    `;
  }
}
