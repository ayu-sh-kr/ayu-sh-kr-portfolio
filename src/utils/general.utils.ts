const THEME_KEY = "theme";

/** Provides browser theme detection, persistence, and document-level theme updates. */
export class GeneralUtils {
  /** Toggles the current document theme, persists it, and publishes a `themeChange` window event. */
  static toggleDarkMode(): void {
    const isDarkMode = !this.isDarkMode();
    this.setBrowserTheme(isDarkMode ? "dark" : "light");
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { isDarkMode },
      }),
    );
  }

  /**
   * Returns whether the document currently has the `dark` theme class.
   *
   * @returns `true` when dark mode is active on the document root.
   */
  static isDarkMode(): boolean {
    return document.documentElement.classList.contains("dark");
  }

  /**
   * Resolves the saved browser theme or falls back to the operating system preference.
   *
   * @returns `dark` or `light`; saved values take precedence over the media-query preference.
   */
  static getBrowserTheme(): string {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  /**
   * Applies a browser theme to document classes and theme-related meta tags.
   *
   * @param theme - Uses `dark` for dark mode; every other value applies the light theme.
   */
  static setBrowserTheme(theme: string): void {
    const isDarkMode = theme === "dark";
    document.documentElement.classList.toggle("dark", isDarkMode);
    document.documentElement.classList.toggle("light", !isDarkMode);
    document.documentElement.classList.toggle("bg-slate-950", isDarkMode);

    const colorSchemeMeta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    colorSchemeMeta?.setAttribute("content", isDarkMode ? "dark" : "light");
    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--background-color").trim();
    if (backgroundColor) {
      themeColorMeta?.setAttribute("content", backgroundColor);
    }
  }
}
