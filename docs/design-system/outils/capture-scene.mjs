// Capture d'un élément du site sur fond transparent (scènes WebGL : lac,
// Everest, Mont Blanc), pour le poser dans Figma sur ses propres fonds.
// Tout le reste de la page est masqué, fonds et grain compris.
// Usage : node capture-scene.mjs <navigateur.exe> <dossier profil> <sortie.png> <chemin> <sélecteur> [<sélecteur de défilement>] [<attente ms>] [<cadre>] [<échelle>]
// <cadre> : l'élément dont la boîte sert de découpe (par défaut le sélecteur ; utile quand la scène déborde de la page).
// Exemple (lac de Let's talk) : node capture-scene.mjs brave.exe /tmp/profil lac.png / .lt-3d .foot-dark 6000 .lt 1
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const [, , BROWSER, PROFILE, OUT, PATH = "/", SEL, SCROLL, WAIT = "5000", FRAME = SEL, SCALE = "1"] = process.argv;
const PORT = 9342;
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
await send("Page.navigate", { url: "https://jimmyferon.com" + PATH }); await loaded;
await sleep(7000); // préchargement, rideau
if (SCROLL) await evaluate(`document.querySelector(${JSON.stringify(SCROLL)}).scrollIntoView({ block: 'start' }); true`);
await sleep(+WAIT); // la scène se dessine
// Tout devient transparent, sauf l'élément visé.
await evaluate(`(() => { const s = document.createElement('style'); s.textContent =
  '*,*::before,*::after{background:transparent!important;box-shadow:none!important}' +
  'body::after,header::after{display:none!important}' +
  'body *{visibility:hidden!important}' + ${JSON.stringify(SEL)} + '{visibility:visible!important}';
  document.head.appendChild(s); return true; })()`);
await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
await sleep(800);
const r = await evaluate(`(() => { const b = document.querySelector(${JSON.stringify(FRAME)}).getBoundingClientRect();
  return { x: b.x + scrollX, y: b.y + scrollY, w: b.width, h: b.height }; })()`);
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: +SCALE } });
writeFileSync(OUT, Buffer.from(shot.result.data, "base64"));
console.log(OUT, Math.round(r.w) + " × " + Math.round(r.h) + " (×" + SCALE + ")");
ws.close(); proc.kill();
