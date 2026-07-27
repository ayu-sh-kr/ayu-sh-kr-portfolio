import { BaseElement, BindEvent, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
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

  @WindowListener({ event: "themeChange" })
  handleThemeChange(): void {
    this.updateHTML();
  }

  render(): string {
    const isDarkTheme = GeneralUtils.isDarkMode();
    const label = isDarkTheme ? "Switch to light theme" : "Switch to dark theme";
    const icon = isDarkTheme
      ? `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.25"></circle><path d="M12 2.5v2M12 19.5v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2.5 12h2M19.5 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path></svg>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.1A8.5 8.5 0 0 1 8.9 3.5 8.5 8.5 0 1 0 20.5 15.1Z"></path></svg>`;

    return `
      <button id="dark-button" class="dark-mode-button" type="button" aria-label="${label}" aria-pressed="${isDarkTheme}" title="${label}">
        ${icon}
      </button>
    `;
  }
}
