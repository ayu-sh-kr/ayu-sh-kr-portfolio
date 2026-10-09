/** Article metadata supplied by any reading surface to sharing controls. */
export type ArticleShareInput = {
  /** Authored headline, used in native share and text-based platform links. */
  title: string;
  /** Absolute canonical HTTP(S) URL; referral parameters and hashes are stripped. */
  url: string;
  /** Optional author included in a copied reference. */
  author?: string;
  /** Optional publication date included in a copied reference. */
  date?: string;
};

/** Supported social destinations; their URL formats are maintained in one generator. */
export type SharePlatform = "linkedin" | "whatsapp" | "x";

/** Normalizes article metadata for sharing; rejects unsafe or malformed destinations. */
export const getArticleShareData = (input: ArticleShareInput) => {
  try {
    const canonical = new URL(input.url);
    if (!["https:", "http:"].includes(canonical.protocol) || canonical.username || canonical.password) {
      return null;
    }
    canonical.search = "";
    canonical.hash = "";
    const url = canonical.href;
    const reference = `${input.author ? `${input.author}. ` : ""}“${input.title}”${input.date ? ` (${input.date})` : ""}. ${url}`;
    return {title: input.title, url, reference};
  } catch {
    return null;
  }
};

/** Builds a platform-specific URL from validated sharing data, encoding each payload once. */
export const getArticleShareUrl = (platform: SharePlatform, data: {title: string; url: string}): string => {
  switch (platform) {
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${data.title}\n${data.url}`)}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}`;
  }
};
