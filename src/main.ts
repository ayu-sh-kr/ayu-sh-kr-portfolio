import './style.css'

import { AppComponent } from "@app/app.component.ts";
import { ErrorPage, HomePage } from "@app/pages";
import { AccordionComponent, IconsComponent, PopoverComponent } from "@ayu-sh-kr/dota-ui";
import {DefaultApplicationEventListenerRegistry, initializeApp} from "@ayu-sh-kr/dota-wrap";
import { Router, RouterService } from "@ayu-sh-kr/dota-wrap/router";
import { ApplicationEventService } from "@ayu-sh-kr/dota-wrap/core";
import { registerPortfolioMarkdownTheme } from "@app/configs/markdown-theme.config.ts";
import components from "virtual:dota-components";
import { routeConfig } from "virtual:dota-routes";
const applicationEventService = ApplicationEventService.getInstance();
const applicationEventPublisher = applicationEventService.getPublisher();
const applicationEventListener = applicationEventService.getListener();

let routerService!: RouterService<Router<HTMLElement>>;

registerPortfolioMarkdownTheme();

initializeApp({
  modules: components,
  routes: routeConfig,
  externalComponents: [AccordionComponent, IconsComponent, PopoverComponent],
  errorRoute: { path: "/error", component: ErrorPage },
  defaultRoute: { path: "/", component: HomePage },
  root: AppComponent,
})
  .then((value) => {
    DefaultApplicationEventListenerRegistry.setListener(applicationEventListener);
    routerService = value.routerService;
    applicationEventPublisher.publishAsync({ name: "app:initialized", data: null });
  })
  .catch((error) => console.error(error));

export { routerService, applicationEventService, applicationEventPublisher, applicationEventListener };
