// Étape 4 : géométrie du logo, lue dans le SVG du code (app/icon.svg par défaut).
// Les cinq branches sont-elles la même forme ? De combien tourne-t-on de l'une à la
// suivante, et autour de quel point ? Tourné de 72° comme au survol, le logo
// retombe-t-il sur lui-même ? Donne aussi la phase des axes à 72° de la page Marque.
// Usage : node geometrie-logo.mjs [<fichier svg>]
import { readFileSync } from "node:fs";

const SRC = readFileSync(process.argv[2] || "app/icon.svg", "utf8");
const D = [...SRC.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
const pts = (d) => { const n = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => +m[0]), o = []; for (let i = 0; i < n.length; i += 2) o.push([n[i], n[i + 1]]); return o; };
const P = D.map(pts);
const C = [570, 570]; // centre de la découpe ronde (viewBox 1140, rx 570)
const deg = (r) => (r * 180) / Math.PI;
const norm = (a) => ((a % 360) + 360) % 360;
const rot = (q, c, a) => { const r = (a * Math.PI) / 180, dx = q[0] - c[0], dy = q[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; };

// Meilleure rotation rigide d'une branche sur une autre (même ordre de points)
function ajuste(A, B) {
  const m = (X) => X.reduce((s, p) => [s[0] + p[0] / X.length, s[1] + p[1] / X.length], [0, 0]);
  const ca = m(A), cb = m(B);
  let s = 0, c = 0;
  A.forEach((p, i) => { const ax = p[0] - ca[0], ay = p[1] - ca[1], bx = B[i][0] - cb[0], by = B[i][1] - cb[1]; c += ax * bx + ay * by; s += ax * by - ay * bx; });
  const th = Math.atan2(s, c), cs = Math.cos(th), sn = Math.sin(th);
  const t = [cb[0] - (cs * ca[0] - sn * ca[1]), cb[1] - (sn * ca[0] + cs * ca[1])];
  const a = 1 - cs, b = sn, det = a * a + b * b;
  const err = Math.max(...A.map((p, i) => Math.hypot(cs * p[0] - sn * p[1] + t[0] - B[i][0], sn * p[0] + cs * p[1] + t[1] - B[i][1])));
  return { angle: deg(th), centre: [(a * t[0] - b * t[1]) / det, (b * t[0] + a * t[1]) / det], err };
}
// Écart maximal si chaque branche tourne de a degrés autour de c pour donner la suivante
const ecart72 = (c, a = -72) => {
  let max = 0, s = 0, n = 0;
  for (let k = 0; k < P.length; k++) P[k].forEach((q, i) => { const r = rot(q, c, a), B = P[(k + 1) % P.length][i]; const e = Math.hypot(r[0] - B[0], r[1] - B[1]); max = Math.max(max, e); s += e * e; n++; });
  return { max, rms: Math.sqrt(s / n) };
};

console.log(`${P.length} branches, ${P.map((p) => p.length).join(" / ")} points`);
console.log("\nD'une branche à la suivante (rotation rigide la plus proche) :");
for (let k = 0; k < P.length; k++) {
  const f = ajuste(P[k], P[(k + 1) % P.length]);
  console.log(`  branche ${k + 1} → ${((k + 1) % P.length) + 1} : ${Math.abs(f.angle).toFixed(2)}°, autour de (${f.centre.map((v) => v.toFixed(1)).join(", ")}), écart de forme ${f.err.toFixed(2)} unités`);
}
let best = null;
for (let x = 450; x <= 650; x += 0.5) for (let y = 450; y <= 650; y += 0.5) { const e = ecart72([x, y]); if (!best || e.rms < best.e.rms) best = { c: [x, y], e }; }
const e0 = ecart72(C);
console.log(`\nTourné de 72° autour du centre du cercle : écart max ${e0.max.toFixed(1)} unités (${((e0.max * 34) / 1140).toFixed(2)} px à 34, ${((e0.max * 84) / 1140).toFixed(2)} px à 84)`);
console.log(`Centre qui va le mieux à 72° : (${best.c.join(", ")}), à ${Math.hypot(best.c[0] - C[0], best.c[1] - C[1]).toFixed(1)} unités du centre du cercle ; écart max ${best.e.max.toFixed(1)}`);
// Pointe extérieure de chaque branche (point 6 du tracé), vue du centre du cercle
const ap = P.map((p, k) => ({ k: k + 1, a: norm(deg(Math.atan2(p[5][1] - C[1], p[5][0] - C[0]))), r: Math.hypot(p[5][0] - C[0], p[5][1] - C[1]) }));
let ph = null;
for (let f = 0; f < 72; f += 0.01) { const e = ap.reduce((s, a) => { const d = norm(a.a - f) % 72; return s + Math.min(d, 72 - d) ** 2; }, 0); if (!ph || e < ph.e) ph = { f, e }; }
console.log(`\nAxes à 72° de la page Marque : phase ${ph.f.toFixed(1)}° (depuis l'axe x, sens horaire)`);
ap.forEach((a) => { const d = norm(a.a - ph.f) % 72; console.log(`  branche ${a.k} : pointe à ${a.a.toFixed(1)}°, rayon ${a.r.toFixed(1)}, écart à son axe ${(d > 36 ? d - 72 : d).toFixed(1)}°`); });
