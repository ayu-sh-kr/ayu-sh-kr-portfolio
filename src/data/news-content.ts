/** Authored interface copy shared by the Dispatch feed and note permalink. */
export const newsContent = {
  seo: {
    title: "Tech News — The Dispatch",
    description: "Tech news across the industry, from product launches to company moves and emerging ideas. Short reads explaining what changed and why it matters.",
    keywords: ["The Dispatch", "tech news", "technology news", "technology industry", "product launches"],
  },
  index: {
    eyebrow: "The Dispatch",
    titleBeforeAccent: "Tech news:",
    titleAccent: "what changed",
    titleAfterAccent: "and why it matters.",
    summary: "From product launches to company moves and emerging ideas, I cover stories across the tech industry. Short reads with source links and context to make sense of the news.",
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
