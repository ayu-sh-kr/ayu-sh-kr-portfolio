import './style.css'

import { AppComponent } from "@app/app.component.ts";
import { ErrorPage, HomePage, OfflinePage } from "@app/pages";
import { AccordionComponent, IconsComponent, PopoverComponent } from "@ayu-sh-kr/dota-ui";
import {DefaultApplicationEventListenerRegistry, initializeApp} from "@ayu-sh-kr/dota-wrap";
import { Router, RouterService } from "@ayu-sh-kr/dota-wrap/router";
import { ApplicationEventService } from "@ayu-sh-kr/dota-wrap/core";
import { registerPortfolioMarkdownTheme } from "@app/configs/markdown-theme.config.ts";
import { AnalyticsEventListener } from "@app/service/analytics-event.listener.ts";
import { AnalyticsSectionTracker } from "@app/service/analytics-section-tracker.service.ts";
import { RouterUtils } from "@app/utils/router.utils.ts";
import { applyRouteMetadata } from "@app/utils/seo.utils.ts";
import components from "virtual:dota-components";
import { routeConfig } from "virtual:dota-routes";
const applicationEventService = ApplicationEventService.getInstance();
const applicationEventPublisher = applicationEventService.getPublisher();
const applicationEventListener = applicationEventService.getListener();

let routerService!: RouterService<Router<HTMLElement>>;
const analyticsSectionTracker = new AnalyticsSectionTracker();

registerPortfolioMarkdownTheme();

initializeApp({
  modules: components,
  routes: [...routeConfig, { path: "/offline", component: OfflinePage }],
  externalComponents: [AccordionComponent, IconsComponent, PopoverComponent],
  errorRoute: { path: "/error", component: ErrorPage },
  defaultRoute: { path: "/", component: HomePage },
  root: AppComponent,
  globalHooks: {
    afterEach: [
      applyRouteMetadata,
      (context) => analyticsSectionTracker.trackPage(context.url.pathname),
    ],
  },
})
  .then((value) => {
    DefaultApplicationEventListenerRegistry.setListener(applicationEventListener);
    new AnalyticsEventListener();
    analyticsSectionTracker.trackPage(window.location.pathname);
    routerService = value.routerService;
    RouterUtils.setRouterService(routerService);
    applicationEventPublisher.publishAsync({ name: "app:initialized", data: null });
  })
  .catch((error) => console.error(error));

export { routerService, applicationEventService, applicationEventPublisher, applicationEventListener };
