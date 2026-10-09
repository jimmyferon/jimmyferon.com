// Toutes les règles de globals.css dont un sélecteur correspond au motif,
// avec leur numéro de ligne et leur contexte @media. C'est la lecture du code
// exact d'un composant, états et points de rupture compris.
// Usage : node regles-css.mjs <chemin de globals.css> <motif (expression régulière)> [--tout]
// Sans --tout, le bloc mort de tête (globals.css:3-22, ESP-04) est ignoré.
// Exemple : node regles-css.mjs app/globals.css '\.(btnf|cta|menu-btn)\b'
import { readFileSync } from "node:fs";

const [, , FILE, PATTERN, ALL] = process.argv;
const css = readFileSync(FILE, "utf8");
const re = new RegExp(PATTERN);
const lineAt = (i) => css.slice(0, i).split("\n").length;
const stack = [];
const out = [];
let i = 0;
let head = "";
while (i < css.length) {
  const c = css[i];
  if (c === "/" && css[i + 1] === "*") { i = css.indexOf("*/", i + 2) + 2; continue; }
  if (c === "{") {
    const h = head.trim();
    const line = lineAt(i);
    if (h.startsWith("@")) { stack.push(h); head = ""; i++; continue; }
    const end = css.indexOf("}", i);
    const body = css.slice(i + 1, end).replace(/\s+/g, " ").trim();
    if (h.split(",").some((s) => re.test(s.trim())) && (ALL === "--tout" || line > 22))
      out.push(`${line}${stack.length ? " [" + stack.join(" ") + "]" : ""} ${h.replace(/\s+/g, " ")} { ${body} }`);
    head = "";
    i = end + 1;
    continue;
  }
  if (c === "}") { stack.pop(); head = ""; i++; continue; }
  head += c;
  i++;
}
console.log(out.join("\n"));
