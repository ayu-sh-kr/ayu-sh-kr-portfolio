declare module "virtual:dota-components" {
  import { DotaElementConstructor } from "@ayu-sh-kr/dota-wrap/core";
  const components: DotaElementConstructor[];
  export default components;
}

declare module "virtual:dota-component-registry" {
  import { ComponentRegistry } from "@ayu-sh-kr/dota-wrap";
  export const componentRegistry: ComponentRegistry;
}

declare module "virtual:dota-routes" {
  import { RouteConfig } from "@ayu-sh-kr/dota-wrap/router";
  export const routeConfig: RouteConfig<HTMLElement>[];
}

interface Window {
  portfolioRestClient: import("@ayu-sh-kr/dota-wrap/rest").RestClient;
}
