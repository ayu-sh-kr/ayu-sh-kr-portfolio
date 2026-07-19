const THEME_KEY = "theme";

export class GeneralUtils {
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

  static isDarkMode(): boolean {
    return document.documentElement.classList.contains("dark");
  }

  static getBrowserTheme(): string {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  static setBrowserTheme(theme: string): void {
    const isDarkMode = theme === "dark";
    document.documentElement.classList.toggle("dark", isDarkMode);
    document.documentElement.classList.toggle("light", !isDarkMode);
    document.documentElement.classList.toggle("bg-slate-950", isDarkMode);

    const colorSchemeMeta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    colorSchemeMeta?.setAttribute("content", isDarkMode ? "dark" : "light");
    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    themeColorMeta?.setAttribute("content", isDarkMode ? "#101011" : "#FAFAF8");
  }
}
