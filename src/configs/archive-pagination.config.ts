import type { PagerVariant } from "@app/components/navigation/archive-pagination/pager-contract.ts";

/** The portfolio default can be changed here or overridden for a Vite build. */
export const archivePaginationConfig: { variant: PagerVariant } = { variant: "date-reel" };

export function resolvePagerVariant(value: unknown, fallback = archivePaginationConfig.variant): PagerVariant {
  switch (value) {
    case "index-lens": case "date-reel": case "story-stack": return value;
    default: return fallback;
  }
}

export const configuredPagerVariant = resolvePagerVariant(import.meta.env.VITE_ARCHIVE_PAGINATION_VARIANT);
