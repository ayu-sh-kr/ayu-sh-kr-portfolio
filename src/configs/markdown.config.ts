import {registerPortfolioMarkdownHighlight} from "@app/configs/markdown-highlight.config.ts";
import {registerPortfolioMarkdownTheme} from "@app/configs/markdown-theme.config.ts";
import {startMarkdownCode} from "@app/service/markdown-code.service.ts";

/**
 * Applies the portfolio's Markdown setup when this module first loads: the theme, the
 * highlight.js grammars, and article code presentation. The `md-view` loader imports it before
 * defining the element, so highlight.js and `dota-md` load only with routes that render Markdown.
 */
registerPortfolioMarkdownTheme();
registerPortfolioMarkdownHighlight();
const stopMarkdownCode = startMarkdownCode();
import.meta.hot?.dispose(stopMarkdownCode);
