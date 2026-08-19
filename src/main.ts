import './style.css'

import { AppComponent } from "@app/app.component.ts";
import { ErrorPage, HomePage, OfflinePage } from "@app/pages";
import { RestClient } from "@ayu-sh-kr/dota-rest";
import { AccordionComponent, IconsComponent, PopoverComponent } from "@ayu-sh-kr/dota-ui";
import {DefaultApplicationEventListenerRegistry, initializeApp} from "@ayu-sh-kr/dota-wrap";
import { Router, RouterService } from "@ayu-sh-kr/dota-wrap/router";
import { ApplicationEventService } from "@ayu-sh-kr/dota-wrap/core";
import { dotaHydration } from "@ayu-sh-kr/dota-wrap/ssr";
import { registerPortfolioMarkdownTheme } from "@app/configs/markdown-theme.config.ts";
import { AnalyticsEventListener } from "@app/service/analytics-event.listener.ts";
import { AnalyticsSectionTracker } from "@app/service/analytics-section-tracker.service.ts";
import { ActionButtonDispatcher } from "@app/service/action-button-dispatcher.service.ts";
import { RouterUtils } from "@app/utils/router.utils.ts";
import { applyRouteMetadata } from "@app/utils/seo.utils.ts";
import components from "virtual:dota-components";
import { routeConfig } from "virtual:dota-routes";

const applicationEventService = ApplicationEventService.getInstance();
const applicationEventPublisher = applicationEventService.getPublisher();
const applicationEventListener = applicationEventService.getListener();
export const restClient = RestClient.builder()
  .baseUrl(import.meta.env.VITE_API_BASE_URL)
  .build();

window.portfolioRestClient = restClient;

let routerService!: RouterService<Router<HTMLElement>>;
const analyticsSectionTracker = new AnalyticsSectionTracker();

registerPortfolioMarkdownTheme();

// The initial router transition runs during `initializeApp`. Register the
// analytics listener first so its page and section events are not lost.
DefaultApplicationEventListenerRegistry.setListener(applicationEventListener);
new AnalyticsEventListener();
new ActionButtonDispatcher();

export const applicationReady = initializeApp({
  modules: components,
  routes: [...routeConfig, { path: "/offline", component: OfflinePage }],
  externalComponents: [AccordionComponent, IconsComponent, PopoverComponent],
  errorRoute: { path: "/error", component: ErrorPage },
  defaultRoute: { path: "/", component: HomePage },
  root: AppComponent,
  plugins: [dotaHydration({ mismatch: "warn" })],
  globalHooks: {
    afterEach: [
      applyRouteMetadata,
      (context) => analyticsSectionTracker.trackPage(context.url.pathname),
    ],
  },
})
  .then((value) => {
    analyticsSectionTracker.trackPage(window.location.pathname);
    routerService = value.routerService;
    RouterUtils.setRouterService(routerService);
    applicationEventPublisher.publishAsync({ name: "app:initialized", data: null });
  });

applicationReady.catch((error) => console.error(error));

export { routerService, applicationEventService, applicationEventPublisher, applicationEventListener };
