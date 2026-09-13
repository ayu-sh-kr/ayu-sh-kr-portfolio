/** Authored interface copy shared by the Dispatch feed and note permalink. */
export const newsContent = {
  index: {
    eyebrow: "The Dispatch",
    titleBeforeAccent: "Short notes on backend, infra, and the things I",
    titleAccent: "actually",
    titleAfterAccent: "shipped.",
    summary: "Thirty seconds each. Release notes worth reading, an AWS bill that changed shape, one paragraph of opinion. Anything that needs more than that becomes a blog post. Filed weekly since January 2025.",
    figures: [
      {label: "Notes filed", value: "148"},
      {label: "This week", value: "4"},
      {label: "Median read", value: "38s"},
    ],
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
