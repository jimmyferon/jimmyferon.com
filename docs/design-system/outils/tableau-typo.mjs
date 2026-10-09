// Usage : node tableau-typo.mjs <mesures.json>
// Croise desktop et mobile pour chaque élément porteur de texte (toutes pages).
import fs from "fs";
const r = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const px = (v) => (v === "normal" ? "normal" : String(Math.round(parseFloat(v) * 100) / 100));
const rows = new Map();
for (const [k, v] of Object.entries(r)) {
  const [vp, page] = k.split(" ");
  for (const [sel, t] of Object.entries(v.type)) {
    const key = sel;
    if (!rows.has(key)) rows.set(key, { pages: new Set() });
    const row = rows.get(key);
    row.pages.add(page);
    if (!row[vp] || (!row[vp].vis && t.vis)) row[vp] = t;
  }
}
const fmt = (t) => t
  ? `${t.ff.replace("Bricolage Grotesque", "Bric").replace("Space Mono", "Mono")} ${t.fw} ${px(t.fs)}/${px(t.lh)} ls${px(t.ls)} ${t.tt === "none" ? "" : t.tt.slice(0, 2)}${t.st === "italic" ? " it" : ""}${t.vis ? "" : " [caché]"}`
  : "—";
const list = [...rows.entries()].sort((a, b) => (a[1].desktop?.ff || a[1].mobile?.ff || "").localeCompare(b[1].desktop?.ff || b[1].mobile?.ff || "")
  || parseFloat(b[1].desktop?.fs || 0) - parseFloat(a[1].desktop?.fs || 0));
for (const [sel, row] of list) {
  const d = fmt(row.desktop), m = fmt(row.mobile);
  const txt = (row.desktop || row.mobile).txt;
  console.log(`${sel}\n    D: ${d}\n    M: ${m}${d === m ? "   (=)" : ""}\n    « ${txt} »  [${[...row.pages].join(" ")}]`);
}
