import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";

/**
 * A semantic color role shown in the design grammar.
 *
 * The label is reader-facing while `token` is the exact CSS custom property a
 * component consumes for that relationship.
 */
type ColorRole = {
  /** Human-readable name displayed alongside the color swatch. */
  label: string;
  /** Semantic CSS custom property represented by the swatch. */
  token: string;
};

/**
 * A grouped set of related roles in the application color contract.
 *
 * Groups are rendered as separate catalog cards so maintainers can compare
 * related responsibilities without treating the catalog as a second palette.
 */
type ColorRoleGroup = {
  /** Reader-facing category for the related roles. */
  name: string;
  /** Brief usage boundary that explains when the group is appropriate. */
  description: string;
  /** Semantic roles that belong to the category. */
  roles: ColorRole[];
};

/**
 * The complete role vocabulary available to application components.
 *
 * Tokens intentionally match the aliases in `color.css`, making this section a
 * maintainable inspection surface rather than a second color definition.
 */
const COLOR_ROLE_GROUPS: ColorRoleGroup[] = [
  {
    name: "Canvas",
    description: "Establishes the page, elevated surfaces, and their boundaries.",
    roles: [
      { label: "Page background", token: "--background-color" },
      { label: "Surface", token: "--surface-color" },
      { label: "Surface hover", token: "--surface-hover-color" },
      { label: "Border", token: "--border-color" },
    ],
  },
  {
    name: "Content",
    description: "Builds readable hierarchy without inventing one-off text colors.",
    roles: [
      { label: "Foreground", token: "--foreground-color" },
      { label: "Muted", token: "--muted-color" },
      { label: "Muted strong", token: "--muted-strong-color" },
    ],
  },
  {
    name: "Action",
    description: "Keeps interactive primary states unified in both theme modes.",
    roles: [
      { label: "Primary", token: "--primary-color" },
      { label: "Primary hover", token: "--primary-color-hover" },
      { label: "Primary strong", token: "--primary-color-strong" },
      { label: "Primary subtle", token: "--primary-color-subtle" },
      { label: "On primary", token: "--primary-color-on" },
    ],
  },
  {
    name: "Contrast",
    description: "Provides deliberate inversion for dark panels and high-emphasis moments.",
    roles: [
      { label: "Contrast background", token: "--contrast-background-color" },
      { label: "Contrast foreground", token: "--contrast-foreground-color" },
      { label: "Contrast muted", token: "--contrast-muted-color" },
      { label: "Contrast border", token: "--contrast-border-color" },
    ],
  },
  {
    name: "Mix ramp",
    description: "Centralizes translucent lines, washes, shadows, and focus halos.",
    roles: [
      { label: "Subtle", token: "--subtle-color" },
      { label: "Border strong", token: "--border-strong-color" },
      { label: "Primary wash", token: "--primary-color-wash" },
      { label: "Primary ring", token: "--primary-color-ring" },
      { label: "Scrim", token: "--scrim-color" },
    ],
  },
  {
    name: "Status",
    description: "Communicates outcome independently from the active brand family.",
    roles: [
      { label: "Success", token: "--success-color" },
      { label: "Warning", token: "--warning-color" },
      { label: "Danger", token: "--danger-color" },
    ],
  },
];

/**
 * Shows the semantic color roles available to all pages.
 *
 * Component styles receive color only through the role variables shown here.
 */
@Component({
  selector: "design-color-roles",
  shadow: false,
})
export class DesignColorRolesComponent extends BaseElement {
  /** Creates the static color-role element. */
  constructor() {
    super();
  }

  /** Renders the complete semantic role inventory. */
  render(): string {
    return HTML`
      <section id="design-color-roles" class="design-color-roles design-section" aria-labelledby="design-color-roles-title">
        <div class="design-color-section-intro">
          <p class="type-eyebrow design-eyebrow">Semantic roles</p>
          <h2 id="design-color-roles-title" class="type-section-heading design-section-heading">Choose purpose, not a shade.</h2>
          <p class="type-body design-color-section-copy">A component should name what a color does. The token resolves the appropriate light or dark value centrally, so the same markup remains legible in either mode.</p>
        </div>

        <div class="design-color-role-grid">
          ${COLOR_ROLE_GROUPS.map((group) => HTML`
            <article class="design-color-role-group" aria-labelledby="design-color-role-${group.name.toLowerCase()}">
              <h3 id="design-color-role-${group.name.toLowerCase()}" class="type-card-title design-color-role-title">${group.name}</h3>
              <p class="type-compact design-color-role-description">${group.description}</p>
              <ul class="design-color-role-list">
                ${group.roles.map((role) => HTML`
                  <li>
                    <span class="design-color-role-swatch" style="--design-swatch: var(${role.token});"></span>
                    <span class="design-color-role-label">${role.label}</span>
                    <code>${role.token}</code>
                  </li>
                `).join("")}
              </ul>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }
}
