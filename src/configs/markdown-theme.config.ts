import {THEMES, type ColorName, type Theme} from "@ayu-sh-kr/dota-md";

/** `dota-md` accepts a color-map key at runtime; this app owns `primary`. */
export const portfolioMarkdownColor = "primary" as ColorName;

/** Fluid reading size shared by paragraph, list, and table content. */
const markdownProseText = "text-[clamp(1.125rem,1rem+0.3vw,1.25rem)]";

/**
 * Markdown keeps its structure in dota-md while this app owns its identity.
 * Only the portfolio's primary accent and font are introduced here; neutral
 * text, surfaces, and borders continue to inherit from the surrounding page.
 */
export const portfolioMarkdownTheme: Theme = {
  name: "portfolio",
  fontFamily: "var(--primary-font)",
  typography: {
    h1: "text-[clamp(2.25rem,1.75rem+2vw,3.5rem)] font-bold",
    h2: "text-[clamp(1.75rem,1.5rem+0.8vw,2.25rem)] font-semibold",
    h3: "text-[clamp(1.375rem,1.2rem+0.45vw,1.75rem)] font-semibold",
    h4: "text-[clamp(1.125rem,1rem+0.3vw,1.25rem)] font-semibold",
    h5: "text-[clamp(1rem,0.9rem+0.2vw,1.125rem)] font-semibold",
    h6: "text-[clamp(0.875rem,0.8rem+0.15vw,1rem)] font-semibold",
    p: markdownProseText,
    li: markdownProseText,
    table: markdownProseText,
    th: `${markdownProseText} font-semibold`,
    td: markdownProseText,
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
