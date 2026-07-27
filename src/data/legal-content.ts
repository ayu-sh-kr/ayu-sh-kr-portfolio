import {siteIdentity} from "@app/data/portfolio-content.ts";
import type {PageSeoContent} from "@app/data/seo-content.ts";

/** SEO content for the privacy policy route. */
export const privacySeo: PageSeoContent = {
  title: `Privacy Policy — ${siteIdentity.domain}`,
  description: "What Ayush Kumar collects, why he collects it, and how to get rid of it.",
  keywords: [siteIdentity.name, "Privacy Policy", "Data Protection", siteIdentity.domain],
  ogTitle: `Privacy Policy — ${siteIdentity.domain}`,
  ogDescription: `A plain-English privacy policy for ${siteIdentity.domain} and client work.`,
};

/** SEO content for the terms and conditions route. */
export const termsSeo: PageSeoContent = {
  title: `Terms & Conditions — ${siteIdentity.domain}`,
  description: "The rules for reading this site, and the default rules for working with Ayush Kumar.",
  keywords: [siteIdentity.name, "Terms & Conditions", "Terms of Service", siteIdentity.domain],
  ogTitle: `Terms & Conditions — ${siteIdentity.domain}`,
  ogDescription: `Plain-English terms for ${siteIdentity.domain} and freelance engineering work.`,
};
