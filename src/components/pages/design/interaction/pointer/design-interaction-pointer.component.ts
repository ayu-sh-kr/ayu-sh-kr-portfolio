import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designInteractionContent } from "@app/data/design-interaction-content.ts";

const POINTER_VARIANTS = ["pointer-lift", "pointer-deep", "pointer-ink", "pointer-wash", "pointer-nudge", "pointer-press"] as const;

/** Documents the small pointer responses that confirm a reachable element without carrying meaning. */
@Component({ selector: "design-interaction-pointer", shadow: false })
export class DesignInteractionPointerComponent extends BaseElement {
  /** Creates the static pointer specimen collection. */
  constructor() {
    super();
  }

  /** Renders live hover/focus specimens plus the lift-versus-nudge comparison. */
  render(): string {
    const { pointer } = designInteractionContent;
    return HTML`
      <section id="pointer" class="design-interaction-section layout-page layout-section" aria-labelledby="pointer-title">
        <header class="design-interaction-heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${pointer.eyebrow}</p>
          <h2 id="pointer-title" class="type-section">${pointer.title}</h2>
          <p class="type-lede">${pointer.lede}</p>
        </header>
        <div class="design-interaction-spec-grid layout-grid-auto-sm">${pointer.specimens
          .map((specimen, index) => HTML`<button type="button" class="design-interaction-pointer ${POINTER_VARIANTS[index]}">
            <strong>${specimen.label}</strong>
            <span>${specimen.value}</span>
          </button>`,
          )
          .join("")}</div>
        <div class="design-interaction-pair layout-grid-2">
          <article>
            <p class="type-label">${pointer.do.label}</p>
            <a class="app-link app-link--arrow design-interaction-row" href="${pointer.do.href}">${pointer.do.linkLabel} <span aria-hidden="true">→</span>
            </a>
            <p>${pointer.do.body}</p>
          </article>
          <article>
            <p class="type-label">${pointer.never.label}</p>
            <button type="button" class="design-interaction-row design-interaction-row--bad">${pointer.never.rowLabel} <span aria-hidden="true">→</span>
            </button>
            <p>${pointer.never.body}</p>
          </article>
        </div>
      </section>`;
  }
}
