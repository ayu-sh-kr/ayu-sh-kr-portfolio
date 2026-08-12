import type { PageSeoContent } from "@app/data/seo-content.ts";
import { siteIdentity } from "@app/data/portfolio-content.ts";

/** Authored copy and metadata for the offline recovery page. */
export const offlineContent = {
  seo: {
    title: `Connection status — ${siteIdentity.name}`,
    description: `Connection status and recovery options for the ${siteIdentity.name} portfolio.`,
    keywords: ["Connection status", "Offline page", siteIdentity.name],
    ogTitle: `Connection status — ${siteIdentity.name}`,
    ogDescription: "Connection status and recovery options for the portfolio.",
  } satisfies PageSeoContent,
  nav: {
    ariaLabel: "Offline navigation",
    brand: siteIdentity.brand,
    brandHref: "/",
    offlineStatus: "Offline mode",
    onlineStatus: "Connection active",
  },
  states: {
    offline: {
      glyphLabel: "Searching for a Wi-Fi connection",
      eyebrow: "Connection lost",
      titleLead: "You're",
      titleAccent: "offline.",
      lede: "The portfolio cannot reach the server. This page will check the connection again automatically.",
      status: "Trying to reconnect…",
      code: "ERR_NETWORK · offline",
      retryLabel: "Try again",
    },
    online: {
      glyphLabel: "Wi-Fi connection is active",
      eyebrow: "Connection restored",
      titleLead: "You're",
      titleAccent: "online.",
      lede: "The connection has been restored. You can now return to the portfolio.",
      status: "Connection available.",
      code: "NETWORK · online",
      retryLabel: "Continue to home",
    },
  },
  messages: {
    checking: "Trying to reach the server…",
    stillOffline: "Still no connection. Check your network and try again.",
  },
  scrollContainerLabel: "Connection help",
  navigation: {
    fallbackHref: "/",
    returnLabel: "Back to previous page",
  },
  troubleshooting: {
    eyebrow: "Get back online",
    title: "Three things to try.",
    tries: [
      {
        title: "Check Wi-Fi or data",
        body: "Toggle it off and on, or switch to a network with a stronger signal.",
        icon: `<svg viewBox="0 0 24 24"><path d="M5 12.5a10 10 0 0 1 14 0M8 16a5.5 5.5 0 0 1 8 0"></path><circle cx="12" cy="19.5" r="1.4"></circle></svg>`,
      },
      {
        title: "Wait briefly",
        body: "Temporary signal loss can resolve without intervention, particularly while moving between networks.",
        icon: `<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-1.5 5.5"></path><path d="M20 5v6h-6"></path></svg>`,
      },
      {
        title: "Check other services",
        body: "If other sites load normally, the portfolio server may be temporarily unavailable.",
        icon: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="7" rx="1.5"></rect><rect x="4" y="13" width="16" height="7" rx="1.5"></rect><path d="M7.5 7.5h.01M7.5 16.5h.01"></path></svg>`,
      },
    ],
  },
  footer: {
    source: "Served from the portfolio edge",
  },
  lastTry: {
    justNow: "Last tried just now",
    secondsAgo: "Last tried {seconds}s ago",
  },
} as const;
