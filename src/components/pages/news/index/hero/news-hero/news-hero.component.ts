import {BaseElement, Component} from "@ayu-sh-kr/dota-wrap/core";
import {newsContent} from "@app/data/news-content.ts";

/**
 * Introduces the Dispatch before readers enter its chronological note feed.
 *
 * The hero owns its visual hierarchy and summary figures, leaving the index
 * component responsible only for filtering and rendering the feed below it.
 *
 * Selector: `news-hero`.
 */
@Component({selector: "news-hero", shadow: false})
export class NewsHeroComponent extends BaseElement {
  render(): string {
    const {index} = newsContent;

    return `
      <section class="news-hero layout-content layout-section-hero" aria-labelledby="news-hero-title">
        <div class="news-hero-content">
          <p class="news-eyebrow">${index.eyebrow}</p>
          <h1 class="news-hero-title type-section" id="news-hero-title">${index.titleBeforeAccent} <span>${index.titleAccent}</span> ${index.titleAfterAccent}</h1>
          <p class="news-lede type-lede">${index.summary}</p>
          <dl class="news-figures layout-grid-3">
            ${index.figures.map((figure) => `<div><dt>${figure.label}</dt><dd class="news-number">${figure.value}</dd></div>`).join("")}
          </dl>
        </div>
      </section>
    `;
  }
}
