import { pricingContent } from "@app/data/pricing-content.ts";
import type { PricingStartProjectBrief } from "@app/events/pricing.events.ts";

/**
 * One fact rendered in the project brief preview and included in the prepared email.
 *
 * The preview component renders these rows while the start-project shell reuses them to compose
 * the handoff email, ensuring both surfaces describe the same brief.
 */
export interface PricingProjectBriefPreviewRow {
  /** Stable label displayed beside the brief value and used in the email body. */
  label: string;
  /** Current brief value; an empty string renders as an em dash in the preview. */
  value: string;
}

/**
 * Creates a fresh empty project brief for the shell and preview to consume.
 *
 * Arrays are created per call so a visitor's selections never leak into another component
 * instance. The initial reply route is the first option authored in pricing content.
 *
 * @returns Blank brief with the default specification form and reply route selected.
 */
export function createPricingStartProjectBrief(): PricingStartProjectBrief {
  return {
    mode: "spec",
    projectName: "",
    specLink: "",
    specNotes: "",
    idea: "",
    audience: "",
    success: "",
    workType: "",
    scope: "",
    constraints: "",
    existing: [],
    budget: "",
    timeline: "",
    files: [],
    name: "",
    email: "",
    company: "",
    nextStep: pricingContent.startProject.nextSteps[0],
    needsNda: false,
  };
}

/**
 * Builds the mode-specific facts used by the preview and prepared email.
 *
 * This is the sole summary mapping for the intake, so the email handoff cannot diverge from the
 * context a visitor reviewed in the live preview.
 *
 * @param brief - Current shell-owned project-start state.
 * @returns Ordered rows for the preview and mailto body.
 */
export function getPricingProjectBriefPreviewRows(brief: PricingStartProjectBrief): PricingProjectBriefPreviewRow[] {
  const { preview } = pricingContent.startProject;
  const mode = pricingContent.startProject.modes.find((item) => item.id === brief.mode);
  let project = brief.workType;
  let detail = [brief.scope, brief.constraints].filter(Boolean).join(" · ");

  if (brief.mode === "spec") {
    project = brief.projectName;
    detail = [brief.specLink, brief.specNotes].filter(Boolean).join(" · ");
  } else if (brief.mode === "idea") {
    project = brief.idea;
    detail = [
      brief.audience && `${preview.ideaAudiencePrefix} ${brief.audience}`,
      brief.success && `${preview.ideaSuccessPrefix}: ${brief.success}`,
    ].filter(Boolean).join(" · ");
  }

  return [
    { label: preview.rows.mode, value: mode?.label ?? "" },
    { label: preview.rows.project, value: project },
    { label: preview.rows.detail, value: detail },
    { label: preview.rows.existing, value: brief.existing.join(", ") },
    { label: preview.rows.budget, value: brief.budget },
    { label: preview.rows.timeline, value: brief.timeline },
    { label: preview.rows.attachments, value: brief.files.map((file) => file.name).join(", ") },
    { label: preview.rows.sender, value: [brief.name, brief.company].filter(Boolean).join(" · ") },
    { label: preview.rows.reply, value: brief.email },
    { label: preview.rows.nextStep, value: `${brief.nextStep}${brief.needsNda ? ` · ${preview.ndaSuffix}` : ""}` },
  ];
}

/**
 * Calculates the amount of useful context collected in a project brief.
 *
 * The progress meter and its label are derived from this value so the preview reports a consistent
 * state after every brief event.
 *
 * @param rows - Preview rows built from the current brief.
 * @returns Whole-number percentage of populated rows.
 */
export function getPricingProjectBriefProgress(rows: readonly PricingProjectBriefPreviewRow[]): number {
  return Math.round((rows.filter((row) => row.value).length / rows.length) * 100);
}

/**
 * Selects the progress guidance displayed beneath the preview meter.
 *
 * @param percentage - Completion percentage returned by `getPricingProjectBriefProgress`.
 * @returns Reader-facing guidance for the current amount of context.
 */
export function getPricingProjectBriefProgressLabel(percentage: number): string {
  const { progress } = pricingContent.startProject.preview;

  if (percentage < 35) {
    return progress.early;
  }

  if (percentage < 70) {
    return progress.partial;
  }

  return progress.complete;
}
