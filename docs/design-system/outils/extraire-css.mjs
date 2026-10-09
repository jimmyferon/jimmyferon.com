// Usage : node extraire-css.mjs <chemin de globals.css> [section]
// Analyse globals.css : règles (avec leur contexte @media), puis inventaires.
// section : colors | type | motion | radius | shadow | effects | media | spacing | z | all
import fs from "fs";
const file = process.argv[2];
const what = process.argv[3] || "all";
let css = fs.readFileSync(file, "utf8");
const GRAIN = "url(data:grain)";
css = css.replace(/url\("data:image\/svg\+xml[^"]*"\)/g, GRAIN).replace(/\/\*[\s\S]*?\*\//g, "");

// ---- parseur minimal : règles imbriquées dans @media / @supports ----
const rules = [], keyframes = {};
function parse(src, ctx) {
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i);
    if (open < 0) break;
    const head = src.slice(i, open).trim();
    // trouve l'accolade fermante correspondante
    let depth = 1, j = open + 1;
    while (j < src.length && depth) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; j++; }
    const body = src.slice(open + 1, j - 1);
    if (head.startsWith("@media") || head.startsWith("@supports")) parse(body, [...ctx, head.replace(/\s+/g, " ")]);
    else if (head.startsWith("@keyframes")) keyframes[head.split(/\s+/)[1]] = body.replace(/\s+/g, " ").trim();
    else if (head.startsWith("@font-face")) rules.push({ sel: "@font-face", ctx, decls: decls(body) });
    else rules.push({ sel: head.replace(/\s+/g, " "), ctx, decls: decls(body) });
    i = j;
  }
}
function decls(body) {
  const out = []; let depth = 0, cur = "";
  for (const ch of body) {
    if (ch === "(") depth++; else if (ch === ")") depth--;
    if (ch === ";" && depth === 0) { if (cur.trim()) out.push(cur.trim()); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.map((d) => { const k = d.indexOf(":"); return [d.slice(0, k).trim(), d.slice(k + 1).trim()]; });
}
parse(css, []);
const where = (r) => (r.ctx.length ? "[" + r.ctx.join(" & ") + "] " : "") + r.sel;

const show = (title, map, fmt) => {
  console.log("\n==== " + title + " ====");
  [...map.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([k, v]) =>
    console.log(fmt ? fmt(k, v) : `${String(v.length).padStart(3)}×  ${k}\n        ${[...new Set(v)].slice(0, 14).join(" | ")}${new Set(v).size > 14 ? " …" : ""}`));
};
const add = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };

if (what === "colors" || what === "all") {
  const m = new Map();
  const RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black|transparent|currentColor)\b/g;
  rules.forEach((r) => r.decls.forEach(([p, v]) => (v.match(RE) || []).forEach((c) =>
    add(m, c.replace(/\s+/g, "").toLowerCase(), `${where(r)} {${p}}`))));
  show("COULEURS (valeur brute → usages)", m);
}
if (what === "type" || what === "all") {
  console.log("\n==== TYPO (règles qui posent font-*) ====");
  rules.forEach((r) => {
    const f = {}; r.decls.forEach(([p, v]) => { if (/^(font-family|font-weight|font-size|line-height|letter-spacing|text-transform|font-style|font)$/.test(p)) f[p] = v; });
    if (Object.keys(f).length) console.log(where(r) + "  →  " + Object.entries(f).map(([k, v]) => k.replace("font-", "f-") + ":" + v).join("; "));
  });
}
if (what === "motion" || what === "all") {
  const d = new Map(), e = new Map();
  rules.forEach((r) => r.decls.forEach(([p, v]) => {
    if (/^(transition|animation)(-duration|-timing-function|-delay)?$/.test(p)) {
      (v.match(/(?<![\w.-])\d*\.?\d+m?s\b/g) || []).forEach((x) => add(d, x, `${where(r)} {${p}}`));
      (v.match(/cubic-bezier\([^)]*\)|var\(--[\w-]+\)|\b(?:ease-in-out|ease-in|ease-out|ease|linear|steps\(\d+\))\b/g) || []).forEach((x) => add(e, x.replace(/\s+/g, ""), `${where(r)} {${p}}`));
    }
  }));
  show("DURÉES / DÉLAIS", d);
  show("COURBES", e);
  console.log("\n==== KEYFRAMES ====");
  Object.entries(keyframes).forEach(([k, v]) => console.log(k + " : " + v));
}
if (what === "radius" || what === "all") {
  const m = new Map();
  rules.forEach((r) => r.decls.forEach(([p, v]) => { if (/radius/.test(p)) add(m, v, where(r)); }));
  show("RAYONS", m);
}
if (what === "shadow" || what === "all") {
  const m = new Map();
  rules.forEach((r) => r.decls.forEach(([p, v]) => { if (/shadow/.test(p)) add(m, p + ": " + v, where(r)); }));
  show("OMBRES", m);
}
if (what === "effects" || what === "all") {
  const m = new Map();
  rules.forEach((r) => r.decls.forEach(([p, v]) => {
    if (/^(filter|backdrop-filter|mix-blend-mode|opacity|mask-image|clip-path|background-image)$/.test(p) || v.includes(GRAIN) || /gradient\(/.test(v))
      add(m, p + ": " + v.slice(0, 140), where(r));
  }));
  show("EFFETS (filtres, fusions, dégradés, grain, opacités)", m);
}
if (what === "media" || what === "all") {
  const m = new Map();
  rules.forEach((r) => r.ctx.forEach((c) => add(m, c, r.sel)));
  show("MEDIA / SUPPORTS (requête → nb de règles)", m, (k, v) => `${String(v.length).padStart(3)} règles  ${k}`);
}
if (what === "spacing" || what === "all") {
  const m = new Map();
  rules.forEach((r) => r.decls.forEach(([p, v]) => {
    if (/^(padding|margin|gap|row-gap|column-gap)(-\w+)?$|^padding-block$|^inset$/.test(p))
      (v.match(/-?\d*\.?\d+(px|rem|em|vh|vw|svh|%)|clamp\([^()]*(\([^()]*\)[^()]*)*\)|calc\([^()]*(\([^()]*\)[^()]*)*\)|var\(--[\w-]+\)/g) || []).forEach((x) => add(m, x, `${where(r)} {${p}}`));
  }));
  show("ESPACEMENTS (padding / margin / gap)", m);
}
if (what === "z" || what === "all") {
  const m = new Map();
  rules.forEach((r) => r.decls.forEach(([p, v]) => { if (p === "z-index") add(m, v, where(r)); }));
  show("Z-INDEX", m);
}
