import { AfterInit, BaseElement, Component } from "@ayu-sh-kr/dota-wrap/core";
import { GeneralUtils } from "@app/utils/general.utils.ts";

@Component({
  selector: "app-root",
  shadow: false,
})
export class AppComponent extends BaseElement {
  constructor() {
    super();
  }

  @AfterInit()
  afterViewInit(): void {
    GeneralUtils.setBrowserTheme(GeneralUtils.getBrowserTheme());
  }

  render(): string {
    return "";
  }
}
