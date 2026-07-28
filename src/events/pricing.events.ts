/** Published when an estimator type card changes; the result component recalculates its range. */
export const PRICING_ESTIMATOR_TYPE_EVENT = "pricing:estimator-type" as const;

/** Published when an estimator stage card changes; the result component recalculates its range. */
export const PRICING_ESTIMATOR_STAGE_EVENT = "pricing:estimator-stage" as const;

/** Published by the project-start selector so its shell can replace the branch form. */
export const PRICING_START_PROJECT_MODE_EVENT = "pricing:start-project-mode" as const;

/** Published by a branch form whenever a field changes, keeping the shell preview current. */
export const PRICING_START_PROJECT_FIELD_EVENT = "pricing:start-project-field" as const;

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
 * The project-start shell owns the complete brief and consumes this update to keep
 * its preview and prepared email in sync without reaching into child DOM.
 */
export interface PricingStartProjectFieldChange {
  /** Branch-specific field to replace in the shell's project brief. */
  field: PricingStartProjectField;
  /** Latest text value supplied by the visitor. */
  value: string;
}
