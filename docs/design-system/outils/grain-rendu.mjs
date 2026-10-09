// Rend le motif de grain exact du code (PNG transparent 240 × 240) et capture le site.
// Usage : node grain-rendu.mjs <navigateur.exe> <dossier de sortie>
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [, , BROWSER, OUT] = process.argv;
const PORT = 9336;
const PROFILE = join(OUT, "profil");
mkdirSync(PROFILE, { recursive: true });
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
const shot = async (file, clip) => {
  const r = await send("Page.captureScreenshot", { format: "png", ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
  writeFileSync(join(OUT, file), Buffer.from(r.result.data, "base64"));
  console.log("écrit", file);
};

await send("Page.enable");

// 1. Le motif, copié de globals.css (body::after), rendu seul sur fond transparent.
const SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.55'/></svg>";
await send("Emulation.setDeviceMetricsOverride", { width: 240, height: 240, deviceScaleFactor: 1, mobile: false });
await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
let loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: "data:image/svg+xml," + encodeURIComponent(SVG) }); await loaded; await sleep(500);
await shot("grain-motif-240.png", { x: 0, y: 0, width: 240, height: 240 });

// 2. Le site, page /work, en 1440 × 900 après préchargement et rideau.
await send("Emulation.setDefaultBackgroundColorOverride", {});
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: "https://jimmyferon.com/work" }); await loaded; await sleep(6000);
await shot("site-work-1440.png");

ws.close(); proc.kill();
