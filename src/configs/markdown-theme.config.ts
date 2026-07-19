import {THEMES, type ColorName, type Theme} from "@ayu-sh-kr/dota-md";

/** `dota-md` accepts a color-map key at runtime; this app owns `primary`. */
export const portfolioMarkdownColor = "primary" as ColorName;

/**
 * Markdown keeps its structure in dota-md while this app owns its identity.
 * Only the portfolio's primary accent and font are introduced here; neutral
 * text, surfaces, and borders continue to inherit from the surrounding page.
 */
export const portfolioMarkdownTheme: Theme = {
  name: "portfolio",
  fontFamily: "var(--primary-font)",
  typography: {
    pre: "blog-markdown-code-block",
  },
  color: {
    [portfolioMarkdownColor]: {
      selection: "selection:bg-[var(--primary-color)] selection:text-[var(--primary-color-on)]",
      a: {
        text: "text-[var(--primary-color-strong)]",
        hover: "hover:text-[var(--primary-color-hover)]",
        focus: "focus-visible:outline-[var(--primary-color)]",
      },
      code: {
        text: "text-[var(--primary-color-strong)]",
        background: "bg-[var(--primary-color-subtle)]",
      },
      blockquote: {
        border: "border-[var(--primary-color)]",
      },
      hr: {
        border: "border-[var(--primary-color)]",
      },
      button: {
        text: "text-[var(--primary-color-strong)]",
        border: "border-[var(--primary-color)]",
        focus: "focus-visible:outline-[var(--primary-color)]",
      },
    },
  },
};

export const registerPortfolioMarkdownTheme = (): void => {
  THEMES[portfolioMarkdownTheme.name] = portfolioMarkdownTheme;
};
