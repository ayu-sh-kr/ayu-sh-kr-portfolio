import { BaseElement, BindEvent, Component } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";

/** Compares a CSS glass surface with its solid fallback; it does not simulate Apple's material. */
@Component({ selector: "ui-glass-showcase", shadow: false })
export class UiGlassShowcaseComponent extends BaseElement {
  /** Changes the local material without replacing the control or losing keyboard focus. */
  @BindEvent({ event: "click", id: "[data-glass-toggle]" })
  toggleMaterial(event: Event): void {
    const panel = this.querySelector("[data-glass-panel]");
    const solid = panel?.classList.toggle("is-solid") ?? false;
    const button = event.target as HTMLButtonElement;
    button.setAttribute("aria-pressed", String(solid));
    button.textContent = solid ? "Show glass surface" : "Show solid surface";
  }

  /** Keeps text on a strong backing while allowing the surrounding scenery to show through. */
  render() {
    return html`
      <figure class="ui-glass-specimen">
        <div class="ui-glass-scene">
          <div class="ui-glass-orbit" aria-hidden="true"></div>
          <div data-glass-panel class="ui-glass-panel">
            <span>Reading room</span><strong>Keep the content in focus</strong>
            <p>The surface suggests a layer. The text still needs a clear background.</p>
          </div>
        </div>
        <button data-glass-toggle type="button" aria-pressed="false">Show solid surface</button>
        <figcaption>CSS glassmorphism with an opaque comparison. This is a web specimen, not an implementation of Liquid Glass.</figcaption>
      </figure>
    `;
  }
}
