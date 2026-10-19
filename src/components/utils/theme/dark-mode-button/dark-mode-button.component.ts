import {TemplateResult, html} from "@ayu-sh-kr/dota-wrap/rendering";
import { AfterInit, BaseElement, BindEvent, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import { GeneralUtils } from "@app/utils/general.utils.ts";

@Component({
  selector: "dark-mode-button",
  shadow: false,
})
export class DarkModeButtonComponent extends BaseElement {
  constructor() {
    super();
  }

  @BindEvent({ event: "click", id: "#dark-button" })
  handleDark(): void {
    GeneralUtils.toggleDarkMode();
  }

  /**
   * Describes the active theme on the button. Runs after hydration, because prerendered HTML
   * always carries the light-theme label and adoption keeps it, and on every theme change.
   */
  @AfterInit()
  @WindowListener({ event: "themeChange" })
  syncThemeState(): void {
    const button = this.querySelector<HTMLButtonElement>("#dark-button");
    if (!button) {
      return;
    }
    const isDarkTheme = GeneralUtils.isDarkMode();
    const label = isDarkTheme ? "Switch to light theme" : "Switch to dark theme";
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(isDarkTheme));
    button.title = label;
  }

  /**
   * Renders one fixed template so prerendered HTML hydrates in either theme. Both icons are
   * present and CSS shows the one for the root theme class; `syncThemeState` owns the label.
   */
  render(): TemplateResult {
    return html`
      <button
        id="dark-button"
        class="dark-mode-button"
        type="button"
        aria-label="Switch to dark theme"
        aria-pressed="false"
        title="Switch to dark theme"
      >
        <svg class="dark-mode-button-sun" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3.25"></circle>
          <path
            d="M12 2.5v2M12 19.5v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2.5 12h2M19.5 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
          ></path>
        </svg>
        <svg class="dark-mode-button-moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.5 15.1A8.5 8.5 0 0 1 8.9 3.5 8.5 8.5 0 1 0 20.5 15.1Z"></path>
        </svg>
      </button>
    `;
  }
}
