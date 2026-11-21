import type { PagerVariant, PagerVisual } from "../pager-contract.ts";
import { indexLens } from "./index-lens.ts";
import { dateReel } from "./date-reel.ts";
import { storyStack } from "./story-stack.ts";

export const pagerVisuals: Record<PagerVariant, PagerVisual> = {
  "index-lens": indexLens, "date-reel": dateReel, "story-stack": storyStack,
};
