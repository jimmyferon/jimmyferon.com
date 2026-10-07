// Statistiques de grain sur des PNG : moyenne RVB, écart-type de luminance,
// écart moyen entre pixels voisins (finesse), chroma moyen (couleur du grain).
// Usage : node grain-mesure.mjs <navigateur.exe> <dossier profil> <png> [<png>…]
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const [, , BROWSER, PROFILE, ...FILES] = process.argv;
const PORT = 9337;
const proc = spawn(BROWSER, ["--headless=new", `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*",
  `--user-data-dir=${PROFILE}`, "--no-first-run", "--disable-extensions", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let seq = 0; const pend = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });

const stats = `async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const n = c.width * c.height; let r = 0, g = 0, b = 0, l = 0, l2 = 0, chroma = 0, grad = 0;
  const L = (i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  for (let i = 0; i < d.length; i += 4) {
    r += d[i]; g += d[i + 1]; b += d[i + 2];
    const v = L(i); l += v; l2 += v * v;
    chroma += Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
    if ((i / 4) % c.width < c.width - 1) grad += Math.abs(v - L(i + 4));
  }
  const m = l / n;
  return JSON.stringify({ taille: c.width + 'x' + c.height, rvb: [r / n, g / n, b / n].map(v => Math.round(v * 10) / 10),
    luminance: Math.round(m * 10) / 10, ecartType: Math.round(Math.sqrt(l2 / n - m * m) * 100) / 100,
    ecartVoisins: Math.round(grad / (n - c.height) * 100) / 100, chroma: Math.round(chroma / n * 100) / 100 });
}`;
for (const f of FILES) {
  const src = "data:image/png;base64," + readFileSync(f).toString("base64");
  const r = await send("Runtime.evaluate", { expression: `(${stats})(${JSON.stringify(src)})`, awaitPromise: true, returnByValue: true });
  console.log(basename(f).padEnd(12), r.result.result.value || JSON.stringify(r.result));
}
ws.close(); proc.kill();
