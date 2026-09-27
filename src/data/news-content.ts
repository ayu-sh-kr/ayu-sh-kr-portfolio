/** Authored interface copy shared by the Dispatch feed and note permalink. */
export const newsContent = {
  seo: {
    title: "AI & Developer News — The Dispatch",
    description: "AI releases, open-source tools, security reports, and infrastructure updates explained with source links and context for developers.",
    keywords: ["The Dispatch", "AI news", "developer news", "open-source tools", "security news", "infrastructure updates"],
  },
  index: {
    eyebrow: "The Dispatch",
    titleBeforeAccent: "AI and developer news:",
    titleAccent: "what changed",
    titleAfterAccent: "and why it matters.",
    summary: "AI releases, open-source tools, security reports, and infrastructure updates. Short reads that explain the news, link to the source, and explore what it means for developers.",
    filterLabel: "Filter by kind",
    monthLabel: "Jump to month",
    empty: "Nothing filed under that yet.",
    blogPrompt: "Something here ran long. Those become posts.",
    blogAction: "Read the blog",
    subscription: {
      ariaLabel: "Subscribe to the Dispatch",
      title: "Get the week's notes on Friday.",
      copy: "One email, four or five items, no tracking pixels. Unsubscribe from any of them.",
    },
  },
  article: {
    back: "The Dispatch",
    eyebrow: "The Dispatch",
    notFoundEyebrow: "404",
    notFoundTitle: "Dispatch note not found",
    notFoundAction: "Browse all notes",
    loading: "Loading the note…",
    loadError: "This note could not be loaded.",
    previous: "Previous",
    next: "Next",
    more: "More from the Dispatch",
    subscription: {
      ariaLabel: "Subscribe to the Dispatch",
      title: "Get the week's notes on Friday.",
      copy: "One email, four or five items, no tracking pixels.",
    },
  },
} as const;
