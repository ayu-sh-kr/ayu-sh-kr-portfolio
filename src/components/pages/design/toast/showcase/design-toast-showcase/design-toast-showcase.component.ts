import { BaseElement, Component, HostListener, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { designToastContent } from "@app/data/design-toast-content.ts";
import { Toast, type ToastPosition } from "@app/service/toast.service.ts";

/**
 * Interactive specimen section for the `/design/toast` reference route.
 *
 * It delegates every example to the production {@link Toast} singleton, then re-renders only
 * its selected position control. The persistent host—not this page—owns all toast lifecycle.
 *
 * Selector: `design-toast-showcase`.
 */
@Component({ selector: "design-toast-showcase", shadow: false })
export class DesignToastShowcaseComponent extends BaseElement {
  /** Anchor reflected by the selected position control after each render. */
  private selectedPosition: ToastPosition = "bottom-right";

  /** Creates the interactive specimen section; the shared host owns all toast DOM. */
  constructor() {
    super();
  }

  /**
   * Handles the two interactive areas rendered by this section.
   *
   * Position controls update only the reference-page selection and the shared
   * rail. Specimen controls call {@link Toast}, keeping the page free of a
   * second toast implementation.
   */
  @HostListener({ event: "click" })
  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const position = target.closest<HTMLButtonElement>("[data-toast-position]")?.dataset.toastPosition as ToastPosition | undefined;
    if (position) {
      this.selectedPosition = position;
      Toast.position(position);
      this.updateHTML();
      return;
    }

    const specimen = target.closest<HTMLButtonElement>("[data-toast-specimen]")?.dataset.toastSpecimen;
    if (!specimen) {
      return;
    }
    switch (specimen) {
      case "note":
        Toast.note("Copied the deploy command");
        break;
      case "done":
        Toast.done("Backup finished — 412 MB");
        break;
      case "fail":
        Toast.fail("Couldn’t reach the mail service");
        break;
      case "undo":
        Toast.done("Draft deleted", {
          action: { label: "Undo", onClick: () => "Draft restored" },
        });
        break;
      case "coalesce":
        Toast.note("Draft saved", { id: "design-toast-autosave" });
        break;
      case "promise":
        void Toast.promise(
          new Promise<boolean>((resolve) => window.setTimeout(() => resolve(true), 1800)),
          { id: "design-toast-deploy", pending: "Deploying to staging", done: "Staging is live", fail: "Deployment failed" },
        );
        break;
      default:
        return;
    }
  }

  /** Renders live API triggers and position controls. */
  render(): string {
    const { showcase } = designToastContent;
    return HTML`
      <section class="design-toast-showcase layout-page layout-section" aria-labelledby="design-toast-showcase-title">
        <div class="design-toast-showcase__heading layout-stack layout-stack-sm">
          <p class="type-eyebrow">${showcase.eyebrow}</p>
          <h2 id="design-toast-showcase-title" class="type-section">${showcase.title}</h2>
          <p class="type-lede">${showcase.lede}</p>
        </div>
        <div class="design-toast-showcase__grid layout-grid-auto-sm">
          ${showcase.kinds.map((item) => HTML`
            <article class="design-toast-card design-toast-card--${item.tone}">
              <p class="type-label">${item.tone}</p>
              <h3 class="type-card-title">${item.title}</h3>
              <p>${item.body}</p>
              <button type="button" data-toast-specimen="${item.id}">${item.action}</button>
            </article>
          `).join("")}
        </div>
        <div class="design-toast-position">
          <div class="layout-stack layout-stack-sm">
            <p class="type-eyebrow">Rail position</p>
            <h3 class="type-subsection">Six corners, one property.</h3>
            <p>Position belongs to the shared rail, so it changes where later notifications open without rebuilding the host.</p>
          </div>
          <div class="design-toast-position__choices" aria-label="Toast rail position">
            ${showcase.positions.map((position) => HTML`<button type="button" data-toast-position="${position.id}" aria-pressed="${String(this.selectedPosition === position.id)}">${position.label}</button>`).join("")}
          </div>
        </div>
      </section>
    `;
  }
}
