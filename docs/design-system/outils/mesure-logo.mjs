// Étape 4 : vide autour du logo du header, en haut de page et en header compact,
// en 1440 × 900 à la souris puis en 390 × 844 au doigt. C'est la mesure qui fixe
// la zone de protection de la page Marque (le plus petit vide du site).
// Usage : node mesure-logo.mjs <navigateur.exe> <dossier profil> [<url>]
import { spawn } from "node:child_process";

const [, , BROWSER, PROFILE, URL = "https://jimmyferon.com/"] = process.argv;
const PORT = 9343;
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
const evaluate = async (x) => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result.result.value;

// Vide entre le logo et le bord intérieur des bordures du header
const MESURE = `(() => {
  const R = (el) => { const b = el.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom].map((v) => +v.toFixed(2)); };
  const h = document.querySelector("header"), cs = getComputedStyle(h);
  const H = R(h), L = R(document.querySelector("header .logo svg"));
  const bt = parseFloat(cs.borderTopWidth), bb = parseFloat(cs.borderBottomWidth), bl = parseFloat(cs.borderLeftWidth);
  return { header: H, logo: L, bordures: [cs.borderTopColor, cs.borderBottomColor],
    vide: { haut: +(L[1] - H[1] - bt).toFixed(2), bas: +(H[3] - bb - L[3]).toFixed(2), gauche: +(L[0] - H[0] - bl).toFixed(2) } };
})()`;

await send("Page.enable");
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
  await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url: URL }); await loaded;
  await sleep(6000); // préchargement, rideau
  console.log(`${w} haut de page`, JSON.stringify(await evaluate(MESURE)));
  await evaluate("scrollTo({ top: 400, behavior: 'instant' }); true"); // header compact au-delà de 70 px
  await sleep(1500);
  console.log(`${w} compact`, JSON.stringify(await evaluate(MESURE)));
}
ws.close(); proc.kill();
