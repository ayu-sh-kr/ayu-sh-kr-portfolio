import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { portfolioContent } from "@app/data/portfolio-content.ts";

@Component({
  selector: "footer-index",
  shadow: false,
})
export class FooterIndexComponent extends BaseElement {
  constructor() {
    super();
  }

  render(): string {
    const { externalMarker, groups } = portfolioContent.footer.index;

    return HTML`
      <section class="footer-index-section" aria-labelledby="footer-index-title">
        <div class="footer-content">
          <h2 id="footer-index-title" class="sr-only">Site index</h2>
          <div class="footer-index-grid">
            ${groups
              .map(
                (group) => `
                  <section class="footer-index-group" aria-labelledby="footer-index-group-${group.number}">
                    <div class="footer-index-group-head">
                      <span class="footer-index-group-number">${group.number}</span>
                      <h3 id="footer-index-group-${group.number}" class="footer-index-group-title">${group.title}</h3>
                    </div>
                    <nav aria-label="${group.title}">
                      ${group.links
                        .map(
                          (link) => `
                            <a class="app-link app-link--nav footer-index-link" href="${link.href}" ${"external" in link && link.external ? 'target="_blank" rel="noreferrer"' : ""}>
                              <span class="footer-index-tick" aria-hidden="true">›</span>
                              <span>${link.label}</span>
                              ${"external" in link && link.external ? `<span class="footer-index-external" aria-label="External link">${externalMarker}</span>` : ""}
                            </a>
                          `,
                        )
                        .join("")}
                    </nav>
                  </section>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }
}
