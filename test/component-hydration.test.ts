import "reflect-metadata";
import {afterEach, expect, it} from "vitest";
import {hydrate, isTemplateResult, render, setHydrationEmit, update} from "@ayu-sh-kr/dota-wrap/rendering";
import {HomePage} from "@app/pages/home.page.ts";
import {AppHeaderComponent} from "@app/components/utils/header/app-header/app-header.component.ts";
import {BlogListComponent} from "@app/components/pages/blog/index/archive/blog-list/blog-list.component.ts";
import {NewsIndexComponent} from "@app/components/pages/news/index/news-index/news-index.component.ts";
import {ActionButtonComponent} from "@app/components/utils/action-button/action-button.component.ts";
import {ArticleShareComponent} from "@app/components/utils/article-share/article-share.component.ts";
import {DesignIndexReferenceComponent} from "@app/components/pages/design/index/reference/design-index-reference/design-index-reference.component.ts";

import {PricingProjectSpecFormComponent} from "@app/components/pages/pricing/start-project/project-spec-form/project-spec-form.component.ts";
import {PricingProjectQuoteFormComponent} from "@app/components/pages/pricing/start-project/project-quote-form/project-quote-form.component.ts";
import {PricingProjectIdeaFormComponent} from "@app/components/pages/pricing/start-project/project-idea-form/project-idea-form.component.ts";

const components = [HomePage, AppHeaderComponent, BlogListComponent, NewsIndexComponent, ActionButtonComponent, ArticleShareComponent, DesignIndexReferenceComponent, PricingProjectSpecFormComponent, PricingProjectQuoteFormComponent, PricingProjectIdeaFormComponent];

afterEach(() => {
  setHydrationEmit(false);
});

it.each(components)("adopts prerendered nodes without duplicating the tree", (Component) => {
  const name = `test-hydration-${Component.name.toLowerCase()}`;
  if (!customElements.get(name)) customElements.define(name, Component);
  const component = new Component();
  if (component instanceof ArticleShareComponent) {
    component.articleTitle = "Java & <Redis>";
    component.canonicalUrl = "https://www.ayu-sh-kr.com/blog/example/";
  }
  if (component instanceof PricingProjectSpecFormComponent) component.specNotes = "</textarea><script>example & text</script>";
  if (component instanceof PricingProjectQuoteFormComponent) component.scope = "Scope & constraints";
  if (component instanceof PricingProjectIdeaFormComponent) component.success = "Keep <input> text literal";
  const output = component.render();
  expect(isTemplateResult(output)).toBe(true);
  setHydrationEmit(true);
  const serverRoot = document.createElement("div");
  render(serverRoot, output);
  const clientRoot = document.createElement("div");
  clientRoot.innerHTML = serverRoot.innerHTML;
  for (const attribute of serverRoot.attributes) clientRoot.setAttribute(attribute.name, attribute.value);
  const nodes = [...clientRoot.querySelectorAll("*")];
  expect(nodes.length).toBeGreaterThan(0);
  const view = hydrate(clientRoot, component.render(), {mismatch: "throw"});
  expect(clientRoot.querySelectorAll("*")).toHaveLength(nodes.length);
  nodes.forEach((node, index) => expect(clientRoot.querySelectorAll("*")[index]).toBe(node));
  update(view, component.render());
  expect(clientRoot.querySelectorAll("*")).toHaveLength(nodes.length);
  nodes.forEach((node, index) => expect(clientRoot.querySelectorAll("*")[index]).toBe(node));
  expect(clientRoot.textContent).not.toContain("[object Object]");
  const textarea = clientRoot.querySelector("textarea");
  if (textarea) {
    expect(textarea.value).not.toContain("<!--dh:");
    expect(textarea.value).not.toContain("<!--/dh:");
    expect(clientRoot.querySelector("script")).toBeNull();
  }
});

it("patches a text property while retaining the native button", () => {
  const component = new ActionButtonComponent();
  component.label = "Before & after";
  const root = document.createElement("div");
  const view = render(root, component.render());
  const button = root.querySelector("button");
  component.label = "<Continue>";
  update(view, component.render());
  expect(root.querySelector("button")).toBe(button);
  expect(root.querySelector(".action-button__label")?.textContent).toBe("<Continue>");
  expect(root.querySelector("continue")).toBeNull();
});
