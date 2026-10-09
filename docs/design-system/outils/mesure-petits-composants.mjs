// Étape 3 : boîtes des petits composants (boutons, CTA, liens roll, filtres)
// et encre réelle des flèches → et ↗, en 1440 × 900 à la souris.
// Usage : node mesure-petits-composants.mjs <navigateur.exe> <dossier profil>
import { spawn } from "node:child_process";

const [, , BROWSER, PROFILE] = process.argv;
const PORT = 9339;
const proc = spawn(BROWSER, ["--headless=new", `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*",
  `--user-data-dir=${PROFILE}`, "--no-first-run", "--disable-extensions", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let seq = 0; const pend = new Map(), waiters = [];
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  else if (m.method) waiters.filter((w) => w.m === m.method).forEach((w) => { w.r(m); waiters.splice(waiters.indexOf(w), 1); }); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const once = (m) => new Promise((r) => waiters.push({ m, r }));
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
const loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: "https://jimmyferon.com/" }); await loaded;
await sleep(6000); // préchargement de 3 s, puis apparitions
await evaluate(`document.querySelector('.svx-toggle')?.click(); true`);
await sleep(1500);

// Boîtes et métriques de police (encre du glyphe d'après le canevas, même pile de polices).
const MEASURE = `(async () => {
  await document.fonts.ready;
  const r2 = (x) => Math.round(x * 100) / 100;
  const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const box = (el) => { const b = el.getBoundingClientRect(); return [r2(b.width), r2(b.height)].join(' x '); };
  const ink = (el, ch) => { const cs = getComputedStyle(el); const c = document.createElement('canvas').getContext('2d');
    c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; const m = c.measureText(ch);
    return { glyph: ch, avance: r2(m.width), encreL: r2(m.actualBoundingBoxLeft + m.actualBoundingBoxRight),
      encreH: r2(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent), montante: r2(m.actualBoundingBoxAscent) }; };
  const css = (el) => { const cs = getComputedStyle(el); return { pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
    bord: cs.borderTopWidth, ecart: cs.columnGap, police: cs.fontSize + ' / ' + cs.lineHeight + ' / ' + cs.letterSpacing }; };
  const out = {};
  out.btnf = [...document.querySelectorAll('.btnf')].filter(vis).map((b) => { const a = b.querySelector('.arr'), r = b.querySelector('.roll');
    return { classe: b.className, libelle: b.innerText.replace(/\\s+/g, ' ').trim(), boite: box(b), ...css(b),
      roll: r ? box(r) : null, fleche: a ? box(a) : null, encre: a ? ink(a, a.textContent.trim()) : null }; });
  out.cta = [...document.querySelectorAll('.cta')].filter(vis).map((b) => { const a = b.querySelector('.cta-arr');
    return { libelle: b.innerText.replace(/\\s+/g, ' ').trim(), boite: box(b), ...css(b), roll: box(b.querySelector('.roll')),
      fleche: box(a), encre: ink(a, a.textContent.trim()) }; });
  out.nav = [...document.querySelectorAll('.nav-mid a')].filter(vis).map((a) => ({ libelle: a.innerText.trim(), boite: box(a), ...css(a),
    fenetre: box(a.querySelector('.rl')), couleur: getComputedStyle(a).color }));
  out.filtres = [...document.querySelectorAll('.svx-pill')].filter(vis).slice(0, 3).map((p) => ({ libelle: p.innerText.trim(), boite: box(p), ...css(p) }));
  out.rangee = (() => { const f = document.querySelector('.svx-filters'); return f ? { ...css(f), boite: box(f) } : null; })();
  return out;
})()`;
console.log(JSON.stringify(await evaluate(MEASURE), null, 1));

// Encre en pixels : capture à l'échelle 8 de la flèche du premier bouton → et du CTA ↗.
const PIX = (b64, sc) => `(async () => { const img = new Image(); img.src = 'data:image/png;base64,${b64}'; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data; const bg = [d[0], d[1], d[2]]; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) { const k = (j * c.width + i) * 4;
    if (Math.abs(d[k] - bg[0]) + Math.abs(d[k + 1] - bg[1]) + Math.abs(d[k + 2] - bg[2]) > 120) { x0 = Math.min(x0, i); y0 = Math.min(y0, j); x1 = Math.max(x1, i); y1 = Math.max(y1, j); } }
  return { encreL: (x1 - x0 + 1) / ${sc}, encreH: (y1 - y0 + 1) / ${sc}, haut: y0 / ${sc}, gauche: x0 / ${sc} }; })()`;
for (const sel of [".sv2-cta .arr", ".cta .cta-arr"]) {
  const rect = await evaluate(`(() => { const e = document.querySelector('${sel}'); e.scrollIntoView({ block: 'center' });
    const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; })()`);
  await sleep(1200);
  // Le clip de CDP se compte depuis le haut du document : on ajoute le défilement.
  const r = await evaluate(`(() => { const b = document.querySelector('${sel}').getBoundingClientRect();
    return { x: b.x + scrollX, y: b.y + scrollY, w: b.width, h: b.height }; })()`);
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 8 } });
  console.log(`== encre en pixels ${sel} (boîte ${r.w.toFixed(2)} x ${r.h.toFixed(2)})`, JSON.stringify(await evaluate(PIX(shot.result.data, 8))));
}
ws.close(); proc.kill();
