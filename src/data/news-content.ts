/** Authored interface copy shared by the Dispatch feed and note permalink. */
export const newsContent = {
  index: {
    eyebrow: "The Dispatch",
    titleBeforeAccent: "Tech news, useful tools, and the ideas",
    titleAccent: "worth",
    titleAfterAccent: "reading.",
    summary: "A running feed of technology news and practical ideas. I follow the source, explain what changed, and add the context that makes it useful.",
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
