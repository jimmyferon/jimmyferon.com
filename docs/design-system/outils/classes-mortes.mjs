// Usage : node classes-mortes.mjs <racine>
// Version stricte : une classe compte comme utilisée seulement si elle apparaît
// comme mot dans une chaîne littérale du JS (className, classList, querySelector,
// innerHTML, chaînes i18n). Les noms de variables et de propriétés ne comptent pas.
import fs from "fs"; import path from "path";
const root = process.argv[2];
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8")
  .replace(/url\("data:[^"]*"\)/g, "url()").replace(/\/\*[\s\S]*?\*\//g, "");
const classes = new Set();
css.replace(/([^{}]+)\{/g, (m, s) => {
  (s.match(/\.([a-zA-Z_][\w-]*)/g) || []).forEach((c) => classes.add(c.slice(1)));
  return m;
});
const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (/\.(js|jsx)$/.test(e.name)) files.push(p);
});
["app", "components", "lib"].forEach((d) => walk(path.join(root, d)));
const tokens = new Set();
const LIT = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
files.forEach((f) => {
  const s = fs.readFileSync(f, "utf8");
  (s.match(LIT) || []).forEach((l) =>
    l.slice(1, -1).split(/[^\w-]+/).forEach((t) => t && tokens.add(t)));
});
const unused = [...classes].filter((c) => !tokens.has(c)).sort();
console.log("Déclarées :", classes.size, "| sans usage strict :", unused.length);
console.log(unused.join("  "));
