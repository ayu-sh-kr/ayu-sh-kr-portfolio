import { BaseElement, Component, WindowListener } from "@ayu-sh-kr/dota-wrap/core";
import {html} from "@ayu-sh-kr/dota-wrap/rendering";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { GeneralUtils } from "@app/utils/general.utils.ts";
import { RouterUtils } from "@app/utils/router.utils.ts";

@Component({
  selector: "app-root",
  shadow: false,
})
export class AppComponent extends BaseElement {
  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    GeneralUtils.setBrowserTheme(GeneralUtils.getBrowserTheme());
    this.offlineRouteTimer = window.setTimeout(() => {
      this.offlineRouteTimer = null;
      if (!navigator.onLine) {
        this.navigateToOffline();
      }
    }, 0);
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    if (this.offlineRouteTimer !== null) {
      window.clearTimeout(this.offlineRouteTimer);
      this.offlineRouteTimer = null;
    }
  }

  @WindowListener({ event: "offline" })
  onOffline(): void {
    this.navigateToOffline();
  }

  private offlineRouteTimer: number | null = null;

  private navigateToOffline(): void {
    if (RouterUtils.isCurrentPath("/offline")) {
      return;
    }

    RouterUtils.navigate("/offline");
  }

  render() {
    return html``;
  }
}
