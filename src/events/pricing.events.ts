/** Published when an estimator type card changes; the result component recalculates its range. */
export const PRICING_ESTIMATOR_TYPE_EVENT = "pricing:estimator-type" as const;

/** Published when an estimator stage card changes; the result component recalculates its range. */
export const PRICING_ESTIMATOR_STAGE_EVENT = "pricing:estimator-stage" as const;

/** Published by the project-start selector so its shell can replace the branch form. */
export const PRICING_START_PROJECT_MODE_EVENT = "pricing:start-project-mode" as const;

/**
 * Published by a branch form whenever one of its focused fields changes.
 *
 * The start-project shell owns the complete brief, consumes this event, and forwards an updated
 * snapshot to the independent preview component.
 */
export const PRICING_START_PROJECT_FIELD_EVENT = "pricing:start-project-field" as const;

/**
 * Published by the project-start shell whenever its retained brief changes.
 *
 * The independent preview listens for this event and re-renders from the supplied snapshot rather
 * than reading shell state or form controls directly.
 */
export const PRICING_START_PROJECT_PREVIEW_EVENT = "pricing:start-project-preview" as const;

/**
 * Published by the attachment component whenever its locally owned file list changes.
 *
 * The attachment component owns file selection, removal, and upload progress; the project-start
 * shell consumes this event only to keep the retained brief and prepared email in sync.
 */
export const PRICING_START_PROJECT_FILES_EVENT = "pricing:start-project-files" as const;

/**
 * Identifies the three starting points offered by the project intake.
 *
 * The selector publishes one of these values and the project shell maps it to a
 * focused form component; it is not a pricing tier or a backend project status.
 */
export type PricingStartProjectMode = "spec" | "idea" | "quote";

/**
 * Names a value supplied by one of the three branch-specific project forms.
 *
 * These keys are the portion of the live brief owned by the branch forms. Shared
 * scope and contact fields remain inside the project-start shell.
 */
export const PRICING_START_PROJECT_FIELDS = [
  "projectName",
  "specLink",
  "specNotes",
  "idea",
  "audience",
  "success",
  "workType",
  "scope",
  "constraints",
] as const;

/** Union of the runtime branch field keys published by the three focused form components. */
export type PricingStartProjectField = (typeof PRICING_START_PROJECT_FIELDS)[number];

/** Progress of one attachment through the temporary-upload handoff owned by the attachment component. */
export type PricingStartProjectAttachmentStatus = "pending" | "uploading" | "uploaded" | "error";

/**
 * One file selected for the project brief.
 *
 * The attachment component creates and owns these records locally; the shell only ever receives
 * copies through {@link PRICING_START_PROJECT_FILES_EVENT} for the preview and prepared email.
 */
export interface PricingStartProjectAttachment {
  /** Stable identity used to remove or update this attachment without disturbing the others. */
  id: string;
  /** Original file name shown in the preview and prepared email. */
  name: string;
  /** File size in bytes, used only for the visible size label. */
  size: number;
  /** Current stage of the temporary-upload handoff for this file. */
  status: PricingStartProjectAttachmentStatus;
  /** Temporary storage key returned once the dummy upload completes. */
  key?: string;
}

/**
 * Complete client-side state for the pricing project-start brief.
 *
 * The project-start shell owns this state while visitors complete the intake. It publishes a
 * snapshot through {@link PRICING_START_PROJECT_PREVIEW_EVENT}; the preview renders that snapshot
 * without owning or mutating form input state.
 */
export interface PricingStartProjectBrief {
  /** Selected focused form. */
  mode: PricingStartProjectMode;
  /** Project name supplied with an existing specification. */
  projectName: string;
  /** Existing specification URL. */
  specLink: string;
  /** Context that the specification does not capture. */
  specNotes: string;
  /** One-line purpose supplied by an idea-stage visitor. */
  idea: string;
  /** People who should benefit from the proposed work. */
  audience: string;
  /** Outcome that defines success for an idea. */
  success: string;
  /** Work category selected for a quote request. */
  workType: string;
  /** Work that must be included in a quote. */
  scope: string;
  /** Optional technical or delivery constraints. */
  constraints: string;
  /** Existing project assets or capabilities selected by the visitor. */
  existing: string[];
  /** Budget range selected from pricing-aligned choices. */
  budget: string;
  /** Delivery timing selected by the visitor. */
  timeline: string;
  /** Attachments selected in the attachment component, shown in the preview and prepared email. */
  files: PricingStartProjectAttachment[];
  /** Required sender name. */
  name: string;
  /** Required sender email. */
  email: string;
  /** Optional sender organisation. */
  company: string;
  /** Preferred reply route. */
  nextStep: string;
  /** Whether the visitor needs an NDA before sharing additional material. */
  needsNda: boolean;
}

/**
 * Payload emitted by either estimator selector.
 *
 * The estimator result validates this authored ID before it updates its local
 * calculation, so malformed events cannot produce a misleading range.
 */
export interface PricingEstimatorSelection {
  /** Authored estimator type or stage identifier. */
  id: string;
}

/**
 * Payload emitted after the start-project selector changes mode.
 *
 * The start-project shell consumes it and renders the corresponding branch form
 * while retaining values collected in the other branches.
 */
export interface PricingStartProjectModeSelection {
  /** Newly selected project starting point. */
  mode: PricingStartProjectMode;
}

/**
 * Payload emitted as a branch form changes its local fields.
 *
 * The project-start shell owns the complete brief and consumes this update before publishing a
 * snapshot for the preview. It also reuses the shared summary mapping for the prepared email.
 */
export interface PricingStartProjectFieldChange {
  /** Branch-specific field to replace in the shell's project brief. */
  field: PricingStartProjectField;
  /** Latest text value supplied by the visitor. */
  value: string;
}

/**
 * Payload emitted after the attachment component's locally owned file list changes.
 *
 * The shell replaces its retained `files` with this snapshot; it never mutates the list itself.
 */
export interface PricingStartProjectFilesChange {
  /** Complete current set of attachments owned by the attachment component. */
  files: PricingStartProjectAttachment[];
}
