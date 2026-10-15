import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import kotlin from "highlight.js/lib/languages/kotlin";
import lua from "highlight.js/lib/languages/lua";
import markdown from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";
import properties from "highlight.js/lib/languages/properties";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import highlightjs from "markdown-it-highlightjs/core";
import {MDService} from "@ayu-sh-kr/dota-md";

/**
 * highlight.js grammars bundled for fenced code. `dota-md` ships no highlighter, so this list
 * is the whole set of languages the portfolio can color; aliases such as `ts`, `sh`, `md`,
 * `yml`, `html` and `text` resolve through the grammars themselves. Add a grammar here when an
 * article uses a new fence language, otherwise the block renders as plain escaped text.
 */
const languages = {bash, java, javascript, json, kotlin, lua, markdown, plaintext, properties, sql, typescript, xml, yaml};

/**
 * Installs highlight.js on the shared Markdown renderer.
 * Keeps the `hljs language-*` classes the article code styles rely on, and detects the
 * language of untagged fences among the bundled grammars. Call before the first render.
 */
export function registerPortfolioMarkdownHighlight(): void {
  MDService.configure({
    plugins: [[highlightjs, {hljs, auto: true, code: true, register: languages}]],
  });
}
