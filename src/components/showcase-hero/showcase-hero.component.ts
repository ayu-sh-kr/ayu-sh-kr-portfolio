import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { showcaseProjects } from "@app/data/showcase-content.ts";

@Component({
  selector: "showcase-hero",
  shadow: false,
})
export class ShowcaseHeroComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const openSourceCount = showcaseProjects.filter((project) => project.kind === "open source").length;
    const clientCount = showcaseProjects.filter((project) => project.kind === "client work").length;

    return HTML`
      <div id="showcase-hero-wrap" class="showcase-pin-wrap">
        <section class="showcase-pin-stage showcase-hero-stage" aria-labelledby="showcase-hero-title">
          <div id="showcase-hero-inner" class="mx-auto max-w-5xl px-5 text-center sm:px-8">
            <p class="showcase-eyebrow">Showcase</p>
            <h1 id="showcase-hero-title" class="showcase-display mt-5">
              Things I’ve designed, built, and <span class="text-[var(--primary-color)]">shipped.</span>
            </h1>
            <p class="showcase-lede mx-auto mt-7 max-w-2xl">
              From production backend infrastructure to open-source tooling and client work, these are the things that made it out into the world.
            </p>
            <p class="showcase-count mt-7" aria-label="${showcaseProjects.length} projects, ${openSourceCount} open source, ${clientCount} client">
              <strong>${showcaseProjects.length}</strong> projects <span aria-hidden="true">·</span>
              <strong>${openSourceCount}</strong> open source <span aria-hidden="true">·</span>
              <strong>${clientCount}</strong> client
            </p>
          </div>
          <span class="showcase-scroll-hint" aria-hidden="true">Scroll <span>↓</span></span>
        </section>
      </div>
    `;
  }
}

