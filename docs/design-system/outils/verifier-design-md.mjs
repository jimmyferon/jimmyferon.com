// Étape 4, partie 2 : contrôle de structure du DESIGN.md (format @google/design.md),
// sans dépendance ni réseau. Front matter lisible, aucune clé en double, couleurs
// et dimensions dans un format CSS, propriétés connues du format, chaque référence
// {groupe.jeton} résolue (front matter et texte), les huit sections canoniques dans
// l'ordre. Les jetons qu'aucun composant ne cite sont comptés à part : le lint du
// format ne les signale qu'en avertissement.
// Usage : node verifier-design-md.mjs [<fichier>]   (sortie 1 s'il y a un problème)
import { readFileSync } from "node:fs";

const src = readFileSync(process.argv[2] || "docs/design-system/DESIGN.md", "utf8");
const lines = src.split(/\r?\n/);
const problemes = [];
const avertissements = [];

if (lines[0] !== "---") problemes.push("le fichier ne commence pas par ---");
const fin = lines.indexOf("---", 1);
if (fin < 0) problemes.push("front matter non fermé");
const corps = lines.slice(fin + 1).join("\n");

// Lecture par indentation : 0 groupe, 2 jeton, 4 propriété.
const arbre = {};
const vus = new Set();
let g = null, t = null;
lines.slice(1, fin).forEach((l, i) => {
  if (!l.trim()) return;
  const m = /^( *)([^:]+):(?: (.*))?$/.exec(l);
  if (!m) return problemes.push(`ligne ${i + 2} illisible : ${l}`);
  const ind = m[1].length, cle = m[2].trim(), val = m[3] === undefined ? null : m[3].trim();
  const id = ind === 0 ? cle : ind === 2 ? `${g}.${cle}` : `${g}.${t}.${cle}`;
  if (vus.has(id)) problemes.push(`clé en double : ${id}`);
  vus.add(id);
  if (ind === 0) { g = cle; arbre[g] = val === null ? {} : val; }
  else if (ind === 2) { t = cle; arbre[g][t] = val === null ? {} : val; }
  else if (ind === 4) arbre[g][t][cle] = val;
  else problemes.push(`indentation inattendue, ligne ${i + 2}`);
});

for (const k of ["name", "colors", "typography", "rounded", "spacing", "components"]) if (!(k in arbre)) problemes.push(`clé absente : ${k}`);

const sansGuillemets = (v) => (v || "").replace(/^"(.*)"$/, "$1");
const COULEUR = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$|^rgba?\(\d{1,3},\d{1,3},\d{1,3}(,(0|1|0?\.\d+))?\)$/;
const DIMENSION = /^-?\d+(\.\d+)?(px|em|rem)$/;
for (const [k, v] of Object.entries(arbre.colors || {})) if (!COULEUR.test(sansGuillemets(v))) problemes.push(`couleur illisible : ${k} = ${v}`);
for (const grp of ["rounded", "spacing"]) for (const [k, v] of Object.entries(arbre[grp] || {})) if (!DIMENSION.test(v)) problemes.push(`dimension illisible : ${grp}.${k} = ${v}`);

const TYPO = new Set(["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "fontFeature", "fontVariation"]);
const COMPOSANT = new Set(["backgroundColor", "textColor", "typography", "rounded", "padding", "size", "height", "width"]);
for (const [k, o] of Object.entries(arbre.typography || {})) for (const p of Object.keys(o)) if (!TYPO.has(p)) avertissements.push(`propriété typo hors format : ${k}.${p}`);
for (const [k, o] of Object.entries(arbre.components || {})) for (const p of Object.keys(o)) if (!COMPOSANT.has(p)) avertissements.push(`propriété de composant hors format : ${k}.${p}`);

// Références, dans le front matter et dans le texte
const refs = [...src.matchAll(/\{([a-z]+)\.([a-z0-9-]+)\}/g)];
for (const [, grp, tok] of refs) if (!arbre[grp] || typeof arbre[grp] !== "object" || !(tok in arbre[grp])) problemes.push(`référence cassée : {${grp}.${tok}}`);
const citesParComposant = new Set();
for (const o of Object.values(arbre.components || {})) for (const v of Object.values(o)) { const m = /\{([a-z]+)\.([a-z0-9-]+)\}/.exec(v || ""); if (m) citesParComposant.add(`${m[1]}.${m[2]}`); }
const orphelins = ["colors", "typography", "rounded", "spacing"].flatMap((grp) => Object.keys(arbre[grp] || {}).map((tok) => `${grp}.${tok}`)).filter((id) => !citesParComposant.has(id));

// Sections canoniques, dans l'ordre du format
const CANON = ["Overview", "Colors", "Typography", "Layout", "Elevation & Depth", "Shapes", "Components", "Do's and Don'ts"];
const h2 = [...corps.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
const rang = CANON.map((c) => h2.indexOf(c));
CANON.forEach((c, i) => { if (rang[i] < 0) problemes.push(`section absente : ${c}`); });
for (let i = 1; i < rang.length; i++) if (rang[i] >= 0 && rang[i - 1] >= 0 && rang[i] < rang[i - 1]) problemes.push(`ordre : « ${CANON[i]} » avant « ${CANON[i - 1]} »`);

console.log(JSON.stringify({
  jetons: Object.fromEntries(["colors", "typography", "rounded", "spacing", "components"].map((k) => [k, Object.keys(arbre[k] || {}).length])),
  references: refs.length,
  sections: h2,
  problemes,
  avertissements,
  orphelins: { nombre: orphelins.length, liste: orphelins },
}, null, 2));
process.exit(problemes.length ? 1 : 0);
