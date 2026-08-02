import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

/** Shows the shared focus ring at the three offsets required by real app surfaces. */
@Component({ selector: "design-interaction-focus", shadow: false })
export class DesignInteractionFocusComponent extends BaseElement {
  /** Creates the static keyboard-reference section. */
  constructor() {
    super();
  }

  /** Renders native controls that expose the focus contract without scripted focus changes. */
  render(): string {
    const { focus } = designInteractionContent;
    const [pill, field, flush] = focus.specimens;

    return HTML`
      <section id="focus" class="design-interaction-section layout-page layout-section" aria-labelledby="focus-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${focus.eyebrow}</p>
          <h2 id="focus-title" class="type-section">${focus.title}</h2>
          <p class="type-lede">${focus.lede}</p>
        </header>
        <div class="design-interaction-spec-grid layout-grid-auto-sm">
          <article>
            <p class="type-label">${pill.label}</p>
            <a class="app-link app-link--button app-link--ghost" href="${pill.href}">${pill.control}</a>
            <p>${pill.body}</p>
          </article>
          <article>
            <p class="type-label">${field.label}</p>
            <input aria-label="${field.inputAriaLabel}" value="${field.inputValue}" />
            <button type="button" class="design-interaction-card">${field.control}</button>
            <p>${field.body}</p>
          </article>
          <article>
            <p class="type-label">${flush.label}</p>
            <button type="button" class="design-interaction-flush">${flush.control}</button>
            <p>${flush.body}</p>
          </article>
        </div>
        <div class="design-interaction-note">
          <strong>${focus.note.title}</strong>
          <span>${focus.note.body}</span>
        </div>
      </section>`;
  }
}
