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

  /**
   * Installs the initialized router service and replays the latest path queued before initialization.
   *
   * @param routerService - Initialized application router service used for subsequent navigation.
   */
  static setRouterService(routerService: PortfolioRouterService): void {
    this.routerService = routerService;

    if (this.pendingPath !== null) {
      const pendingPath = this.pendingPath;
      this.pendingPath = null;
      this.navigate(pendingPath);
    }
  }

  /**
   * Navigates to a router-compatible path or queues the latest path until the router service is available.
   *
   * @param path - Application path accepted by the router service.
   */
  static navigate(path: string): void {
    if (!this.routerService) {
      this.pendingPath = path;
      return;
    }

    this.routerService.route(path);
  }

  /**
   * Returns whether the browser pathname exactly matches the supplied path.
   *
   * @param path - Path compared with `window.location.pathname`, excluding query and hash components.
   * @returns `true` only when the two path strings are identical.
   */
  static isCurrentPath(path: string): boolean {
    return window.location.pathname === path;
  }
}
