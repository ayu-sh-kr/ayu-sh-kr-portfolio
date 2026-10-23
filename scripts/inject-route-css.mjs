// Experiment: link each prerendered page's component CSS in its <head>.
import fs from "node:fs"; import path from "node:path";
const [dist, src] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(path.join(dist, ".vite/manifest.json"), "utf8"));
const selectorToCss = {};
const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(path.join(src, "components")).filter(f => f.endsWith(".ts"))) {
  const m = fs.readFileSync(f, "utf8").match(/selector:\s*["']([a-z0-9-]+)["']/);
  const entry = manifest[path.relative(path.dirname(src), f)];
  if (m && entry?.css) selectorToCss[m[1]] = entry.css;
}
let pages = 0, links = 0;
for (const html of walk(dist).filter(f => f.endsWith(".html"))) {
  let s = fs.readFileSync(html, "utf8");
  const css = new Set(); for (const [sel, files] of Object.entries(selectorToCss)) if (s.includes("<" + sel)) files.forEach(c => css.add(c));
  if (!css.size) continue;
  const tags = [...css].map(c => `<link rel="stylesheet" crossorigin href="/${c}">`).join("");
  s = s.replace(/(<link rel="stylesheet" crossorigin="" href="\/assets\/index-[^"]+\.css">)/, `$1${tags}`);
  fs.writeFileSync(html, s); pages++; links += css.size;
}
console.log(`selectors with css: ${Object.keys(selectorToCss).length}, pages: ${pages}, links: ${links}`);
