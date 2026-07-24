import type { Router, RouterService } from "@ayu-sh-kr/dota-wrap/router";

type PortfolioRouterService = RouterService<Router<HTMLElement>>;

/**
 * Single application boundary for page navigation.
 *
 * The router service is created asynchronously by initializeApp(), so navigation
 * requests made during the first component connection are held until the service
 * is available.
 */
export class RouterUtils {
  private static routerService: PortfolioRouterService | null = null;
  private static pendingPath: string | null = null;

  private constructor() {}

  static setRouterService(routerService: PortfolioRouterService): void {
    this.routerService = routerService;

    if (this.pendingPath !== null) {
      const pendingPath = this.pendingPath;
      this.pendingPath = null;
      this.navigate(pendingPath);
    }
  }

  static navigate(path: string): void {
    if (!this.routerService) {
      this.pendingPath = path;
      return;
    }

    this.routerService.route(path);
  }

  static isCurrentPath(path: string): boolean {
    return window.location.pathname === path;
  }
}
