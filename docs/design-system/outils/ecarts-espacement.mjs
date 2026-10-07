// Écarts entre les espacements du code et l'échelle Figma (base 4, 14 pas).
// Chaque valeur fixe de padding, margin ou gap est rattachée au pas le plus
// proche ; à égale distance, au pas supérieur. Sortie : tableau Markdown.
// Usage : node ecarts-espacement.mjs <chemin de globals.css> [<racine du dépôt>]
//
// Sont écartés :
// - le CSS mort : classes absentes de app/, components/ et lib/, premier bloc
//   « correctifs mobile » (globals.css:3-22), blocs 480 et 680 (ESP-04, BRK-02),
//   et les trois sélecteurs de DEAD ci-dessous ;
// - les marges et rythmes de section, restés dans la collection responsive ;
// - les décalages de la crête (valeurs négatives ou supérieures à 112).
import fs from "fs";
import path from "path";

const [, , FILE, ROOT = "."] = process.argv;
const STEPS = [4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112];
const SECTIONS = [".sv2", ".cw", ".ab", ".fq", ".lt", ".manif", ".manif--left", ".foot-pad", ".sec", ".wrap.sec",
  ".dark-wrap", ".light-wrap", ".dark-wrap,.light-wrap", ".home-bottom", "nav", "main"];
// Morts sans que le test des classes le voie (audit, annexe B et CMP-05) : règle
// sans effet, badge inatteignable, classe citée seulement dans des sélecteurs JS.
const DEAD = [".home-msg .rl", ".cursor-badge", ".btn-dark"];
const near = (v) => STEPS.reduce((b, s) => {
  const ds = Math.abs(s - v), db = Math.abs(b - v);
  return ds < db || (ds === db && s > b) ? s : b;
});

// Textes du JS, pour reconnaître les classes vivantes.
const js = [];
const walk = (d) => fs.existsSync(d) && fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (/\.(js|jsx|mjs)$/.test(e.name)) js.push(fs.readFileSync(p, "utf8"));
});
["app", "components", "lib"].forEach((d) => walk(path.join(ROOT, d)));
const source = js.join("\n");
const alive = new Map();
const isAlive = (cls) => {
  if (!alive.has(cls)) alive.set(cls, new RegExp(`(^|[^\\w-])${cls.replace(/[-]/g, "\\-")}([^\\w-]|$)`).test(source));
  return alive.get(cls);
};

// Parseur minimal, avec le contexte @media et le rang du bloc de premier niveau.
let css = fs.readFileSync(FILE, "utf8").replace(/url\("data:image\/svg\+xml[^"]*"\)/g, "url(grain)").replace(/\/\*[\s\S]*?\*\//g, "");
const rules = [];
let block = -1;
function parse(src, ctx, top) {
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i);
    if (open < 0) break;
    const head = src.slice(i, open).trim().replace(/\s+/g, " ");
    let depth = 1, j = open + 1;
    while (j < src.length && depth) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; j++; }
    const body = src.slice(open + 1, j - 1);
    if (head.startsWith("@media") || head.startsWith("@supports")) { if (top) block++; parse(body, [...ctx, head], false); }
    else if (!head.startsWith("@")) rules.push({ sel: head, ctx, block: ctx.length ? block : -1, body });
    i = j;
  }
}
parse(css, [], true);

const firstMobileBlock = rules.find((r) => r.ctx[0] === "@media(max-width:760px)")?.block;
const out = new Map();
for (const r of rules) {
  const media = r.ctx.join(" & ");
  if (r.block === firstMobileBlock || /max-width:\s?(480|680)px/.test(media)) continue;
  const parts = r.sel.split(",").map((s) => s.trim());
  const live = parts.filter((p) => !DEAD.includes(p) && (p.match(/\.[\w-]+/g) || []).every((c) => isAlive(c.slice(1))));
  if (!live.length || SECTIONS.includes(r.sel.replace(/\s+/g, ""))) continue;
  for (const d of r.body.split(";")) {
    const k = d.indexOf(":");
    const prop = d.slice(0, k).trim(), val = d.slice(k + 1).trim();
    if (!/^(padding|margin)(-(top|right|bottom|left|block|inline))?$|^(row-|column-)?gap$/.test(prop)) continue;
    for (const m of val.matchAll(/(?<![\w(,.-])(\d+(?:\.\d+)?)px(?![\w)])/g)) {
      const v = Number(m[1]);
      if (v === 0 || v > 112 || STEPS.includes(v)) continue;
      if (/clamp|calc|min\(|max\(/.test(val)) continue;
      const key = v;
      if (!out.has(key)) out.set(key, []);
      out.get(key).push(`${media ? "[" + media.replace(/@media/g, "").replace(/\s/g, "") + "] " : ""}${live.join(", ")} {${prop}}`);
    }
  }
}
console.log("| Code | Pas | Écart | Où (règles vivantes) |");
console.log("|---|---|---|---|");
[...out.keys()].sort((a, b) => a - b).forEach((v) => {
  const s = near(v), uses = [...new Set(out.get(v))];
  console.log(`| ${v} | ${s} | ${s - v > 0 ? "+" : "−"}${Math.abs(s - v)} | ${uses.map((u) => "`" + u + "`").join(" · ")} |`);
});
