// Le double CTA du hero mobile tient-il en 11 px / .06em ?
// Usage : node cta-mobile.mjs <navigateur.exe> <dossier profil>
import { spawn } from "node:child_process";

const [, , BROWSER, PROFILE] = process.argv;
const PORT = 9338;
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
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Emulation.setEmitTouchEventsForMouse", { enabled: true });

// Mesure : largeur attribuée par la flexbox contre largeur naturelle du contenu (libellé, écart, flèche, retraits).
const MEASURE = `(async () => {
  await document.fonts.ready;
  return [...document.querySelectorAll('.hero-mcta .btnf')].map((b) => {
    const cs = getComputedStyle(b);
    const clone = b.cloneNode(true);
    clone.style.cssText = 'position:absolute;visibility:hidden;width:max-content;flex:none;min-width:0';
    b.parentNode.appendChild(clone);
    const natural = clone.getBoundingClientRect().width;
    clone.remove();
    return { label: b.textContent.replace(/\\s+/g, ' ').trim().slice(0, 40), fontSize: cs.fontSize, letterSpacing: cs.letterSpacing,
      allotted: Math.round(b.getBoundingClientRect().width * 100) / 100, natural: Math.round(natural * 100) / 100,
      fits: natural <= b.getBoundingClientRect().width + 0.5 };
  });
})()`;
const STYLE11 = `(() => { const s = document.createElement('style'); s.id = 'essai11';
  s.textContent = '.hero-mcta .btnf{font-size:11px !important;letter-spacing:.06em !important}'; document.head.appendChild(s); return true; })()`;

for (const lang of ["fr", "en"]) {
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  let loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url: "https://jimmyferon.com/" }); await loaded;
  await evaluate(`localStorage.setItem('jf-lang', '${lang}'); true`);
  loaded = once("Page.loadEventFired");
  await send("Page.reload", {}); await loaded; await sleep(5000);
  console.log(`== ${lang} · 390 · actuel (10 px, .05em)`); console.log(JSON.stringify(await evaluate(MEASURE)));
  await evaluate(STYLE11);
  console.log(`== ${lang} · 390 · essai (11 px, .06em)`); console.log(JSON.stringify(await evaluate(MEASURE)));
  // Plus petite largeur d'écran où les deux boutons tiennent encore en 11 px.
  let min = null;
  for (let w = 390; w >= 300; w -= 2) {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(120);
    const r = await evaluate(MEASURE);
    if (r.every((b) => b.fits)) min = w; else break;
  }
  console.log(`== ${lang} · plus petite largeur qui tient en 11 px : ${min}`);
}
ws.close(); proc.kill();
