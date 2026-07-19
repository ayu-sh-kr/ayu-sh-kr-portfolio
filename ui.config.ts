export const uiConfig = {
  meta: {
    name: "ayush-jaiswal-portfolio",
    appType: "single-page motion portfolio",
    stylingEngine: "tailwind-v4-css-first",
    defaultMode: "light",
    designTone: "Apple-inspired pin-scroll storytelling with paper, ink, and one persimmon accent",
  },
  typography: {
    fontFamily: {
      sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Inter", "Segoe UI", "sans-serif"],
      mono: ["SFMono-Regular", "Consolas", "Liberation Mono", "monospace"],
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  theme: {
    colors: {
      paper: "#FAFAF8",
      ink: "#1D1D1F",
      inkSoft: "#6E6E73",
      accent: "#FF4D00",
      accentDeep: "#C23A00",
      tint: "#FFF1EA",
    },
  },
  motion: {
    heroPin: "180vh",
    journeyPin: "450vh",
    workPin: "380vh",
    engine: "requestAnimationFrame with passive scroll and IntersectionObserver reveals",
    reducedMotion: "static flow with all content visible",
  },
  tailwind: {
    cssThemeFile: "./src/theme.css",
    rules: [
      "Use persimmon only for emphasis, progress, chips, CTA, and hover states.",
      "Animate transform and opacity only.",
      "Keep all pinned scenes readable at 360px and fully static in reduced-motion mode.",
    ],
  },
} as const;

export type UIConfig = typeof uiConfig;
