import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

/**
 * Explains how the shared typography roles should be combined and checked.
 *
 * This is the reference's decision-making section: it pairs the live specimens
 * with the constraints that keep new components aligned with existing routes.
 */
@Component({
  selector: "design-typography-guidance",
  shadow: false,
})
export class DesignTypographyGuidanceComponent extends BaseElement {
  /** Creates the static guidance element. */
  constructor() {
    super();
  }

  /** Renders role pairings, a prose sample, and a compact implementation checklist. */
  render(): string {
    return HTML`
      <section class="design-guidance design-section" aria-labelledby="design-guidance-title">
        <header class="design-section-heading">
          <p class="type-eyebrow design-eyebrow">Design grammar / 03</p>
          <h2 id="design-guidance-title" class="type-section">Consistency is in the pairing.</h2>
          <p class="type-lede">Most typographic drift starts when a local element is styled in isolation. These patterns describe how the shared roles should appear next to one another.</p>
        </header>

        <div class="design-guidance-grid">
          <article class="design-guidance-card">
            <p class="type-label">A section opens</p>
            <p class="type-section design-pair-heading">Give the reader a useful landmark.</p>
            <p class="type-lede design-pair-lede">A section heading gets one lede, then lets body copy or components do the detailed work.</p>
            <code>eyebrow → section → lede</code>
          </article>

          <article class="design-guidance-card">
            <p class="type-label">A card answers</p>
            <h3 class="design-card-heading">A concise question</h3>
            <p class="design-card-copy">Card titles should stay compact. If the explanation needs more space, the shared body role carries it without inventing a smaller heading.</p>
            <code>card title → body → compact</code>
          </article>

          <article class="design-guidance-card design-guidance-card--contrast">
            <p class="type-label">A metric changes</p>
            <p class="type-price design-estimate">₹ 124,800</p>
            <p class="design-card-copy">Use tabular figures for prices, counts, dates, and live estimates so a changing digit does not shift the surrounding layout.</p>
            <code>.type-price / [data-count]</code>
          </article>
        </div>

        <div class="design-prose-layout">
          <article class="design-prose-sample">
            <p class="type-label">Long-form reading</p>
            <h3>Designing for the return sweep</h3>
            <p>Long-form pages earn their rhythm through a readable measure and generous leading, not through a new family or improvised scale. The global body defaults establish the baseline; headings and ledes only create the hierarchy around it.</p>
            <p>Keep text in the existing role system, use semantic color tokens, and let the reader move through the page without encountering a new visual language in every component.</p>
            <a href="/blog">Read the editorial implementation <span aria-hidden="true">→</span></a>
          </article>

          <aside class="design-checklist" aria-label="Typography implementation checklist">
            <p class="type-label">Before shipping</p>
            <ol>
              <li>Choose the role by content meaning.</li>
              <li>Use the shared type token or class.</li>
              <li>Keep headings balanced and paragraphs readable.</li>
              <li>Use tabular figures for changing values.</li>
              <li>Keep touch inputs at 1rem or above.</li>
            </ol>
          </aside>
        </div>
      </section>
    `;
  }
}
