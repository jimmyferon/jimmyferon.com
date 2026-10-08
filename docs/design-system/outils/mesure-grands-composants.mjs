// Étape 3, partie 2 : boîtes et styles calculés des grands composants
// (header, bouton menu, boutons icônes, carte projet, modale, FAQ, footer,
// étiquettes de sommet, altimètres, mode d'emploi, cartes et lignes Services,
// crête), en 1440 × 900 à la souris puis en 390 × 844 au doigt.
// Captures de référence en option (lac de Let's talk, header, modale…).
// Usage : node mesure-grands-composants.mjs <navigateur.exe> <dossier profil> [<dossier captures>]
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [, , BROWSER, PROFILE, SHOTS] = process.argv;
const PORT = 9340;
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

// Outils injectés dans la page : boîte (coordonnées de la fenêtre) et styles calculés utiles.
const HELPERS = `window.__m = (() => {
  const r2 = (x) => Math.round(x * 100) / 100;
  const P = ['padding','gap','font-family','font-size','font-weight','line-height','letter-spacing','color','background-color',
    'border-top','border-bottom','border-radius','box-shadow','opacity','backdrop-filter','margin-top','min-height','clip-path','transform'];
  const keep = (k, v) => !(v === 'normal' && k !== 'line-height') && v !== 'none' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)' && v !== 'auto';
  const one = (el) => { const b = el.getBoundingClientRect(), cs = getComputedStyle(el), o = { box: [r2(b.x), r2(b.y), r2(b.width), r2(b.height)].join(' ') };
    for (const p of P) { const v = cs.getPropertyValue(p); if (keep(p, v)) o[p] = v.length > 140 ? v.slice(0, 140) + '…' : v; } return o; };
  return (sel, all) => { const els = [...document.querySelectorAll(sel)]; if (!els.length) return null;
    return all ? els.slice(0, all).map(one) : one(els[0]); };
})(); true`;
const measure = async (list) => { await evaluate(HELPERS); const out = {};
  for (const [sel, n] of list) out[sel] = await evaluate(`window.__m(${JSON.stringify(sel)}, ${n || 0})`); return out; };
const click = (sel) => evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (e) e.click(); return !!e; })()`);
const scrollTo = (sel, block = "start") => evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (e) e.scrollIntoView({ block: '${block}' }); return !!e; })()`);
const shot = async (name, sel) => {
  if (!SHOTS) return;
  const r = await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const b = e.getBoundingClientRect();
    return { x: b.x + scrollX, y: b.y + scrollY, w: b.width, h: b.height }; })()`);
  if (!r) return;
  const s = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  writeFileSync(join(SHOTS, name + ".png"), Buffer.from(s.result.data, "base64"));
};
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const result = {};
await send("Page.enable");

// ---------- Desktop 1440 × 900, souris ----------
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
let loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: "https://jimmyferon.com/" }); await loaded;
await sleep(7000); // préchargement de 3 s, rideau, dessin des courbes
const D = {};
D.header = await measure([["header"], ["nav"], [".logo svg"], [".nav-mid"], [".nav-mid a", 3], [".lang-trigger"], [".lang-trigger .arr svg"], [".cta"], [".cta .cta-arr"]]);
await shot("header-haut", "header");
await evaluate(`document.querySelector('.lang').classList.add('open'); true`); await sleep(500);
D.lang = await measure([[".lang-menu"], [".lang-menu button", 2]]);
await evaluate(`document.querySelector('.lang').classList.remove('open'); true`);
D.everest = await measure([[".ev-meta"], [".ev-route"], [".ev-altnum"], [".ev-mark", 2], [".ev-mark-alt"], [".ev-mark-name"], [".ev-mark-proj"],
  [".ev-edge", 1], [".ev-help"], [".ev-help-body"], [".ev-help-body > span", 3], [".ev-full-btn"], [".hb-grid"]]);
await shot("aide-centree", ".ev-help");
await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', code: 'KeyD', bubbles: true })); true`); await sleep(300);
await evaluate(`window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', code: 'KeyD', bubbles: true })); true`); await sleep(1500);
D.aideRangee = await measure([[".ev-help"], [".ev-help-btn"], [".ev-help-btn svg"]]);
await click(".ev-help-btn"); await sleep(1500);
D.aideOuverte = await measure([[".ev-help"], [".ev-help-body"], [".ev-help-body > span", 3]]);
await shot("aide-ouverte", ".ev-help");
await click(".ev-mark"); await sleep(4500);
D.modale = await measure([[".ev-modal"], [".ev-modal-wrap"], [".ev-modal-box"], [".ev-modal-shot"], [".ev-modal-txt"], [".ev-modal-camp"],
  [".ev-modal-txt h3"], [".ev-modal-cat"], [".ev-modal-over"], [".ev-modal-meta"], [".ev-modal-meta dt"], [".ev-modal-meta dd"],
  [".ev-modal-txt .btnf"], [".ev-modal-x"], [".ev-modal-x svg"], [".ev-modal-nav"], [".ev-modal-arrow", 2], [".ev-modal-arrow svg"], [".ev-modal-count"]]);
await shot("modale", ".ev-modal-wrap");
await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`); await sleep(800);
await evaluate(`window.scrollTo(0, 400); true`); await sleep(1500);
D.headerCompact = await measure([["header"], ["nav"]]);
await shot("header-compact", "header");
await scrollTo(".sv2"); await sleep(1500); await click(".svx-toggle"); await sleep(1200);
D.services = await measure([[".sv2-grid"], [".sv2-left"], [".sv2-right"], [".sv2-card"], [".sv2-card h3"], [".sv2-desc"], [".sv2-list"], [".sv2-list li", 2],
  [".sv2-list li i"], [".sv2-list li span"], [".svx-head"], [".svx-row", 2], [".svx-name"], [".svx-type"], [".svx-time"], [".svx-go"], [".svx-list"]]);
D.crete = await measure([[".dark-wrap"], [".light-wrap"], [".bn3-alt"], [".bn3-flagpin"]]);
await scrollTo(".fq"); await sleep(1500);
D.faq = await measure([[".fq-title"], [".fq-list"], [".fq-item", 2], [".fq-q"], [".fq-q i"], [".fq-q > span:not(.fq-x)"], [".fq-x"]]);
await click(".fq-q"); await sleep(1200);
D.faqOuverte = await measure([[".fq-item.open"], [".fq-a"], [".fq-a p"], [".fq-item.open .fq-x"], [".fq-item.open .fq-q i"]]);
await shot("faq", ".fq-list");
await scrollTo(".foot-dark"); await sleep(5000);
D.letsTalk = await measure([[".foot-dark"], [".lt"], [".lt-eyebrow"], [".lt-inner"], [".lt-big"], [".lt-cta"], [".lt-3d"], [".lt-alt"]]);
await shot("lets-talk", ".lt");
await scrollTo(".foot-body"); await sleep(1500);
D.footer = await measure([[".foot-body"], [".foot-pad"], [".foot-top"], [".foot-logo svg"], [".foot-cols"], [".foot-col", 2], [".foot-col h4"],
  [".foot-col a", 2], [".menu-logo"], [".foot-mid"], [".f-hook"], [".f-mail"], [".foot-cta-row"], [".foot-cta-pair"], [".foot-cta-pair .btnf", 2],
  [".foot-figma"], [".foot-figma .fmark"], [".foot-ridge"], [".foot-ridge svg"], [".foot-bot"], [".foot-copy"], [".foot-loc"], [".foot-topbtn"], [".foot-glow"]]);
await shot("footer", ".foot-body");
result.desktop = D;

// ---------- Mobile 390 × 844, au doigt ----------
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: "https://jimmyferon.com/" }); await loaded;
await sleep(7000);
const M = {};
M.header = await measure([["header"], ["nav"], [".logo svg"], [".menu-btn"], [".menu-btn .flake"]]);
await shot("mobile-header-haut", "header");
M.carte = await measure([[".pcard"], [".pcard .thumb"], [".pcard-bar"], [".pcard-bar-txt"], [".pcard-bar-txt b"], [".pcard-bar-txt span"], [".pcard-bar-btn"]]);
await shot("mobile-carte", ".pcard");
await click(".menu-btn"); await sleep(1500);
M.menu = await measure([["header"], [".menu-btn"], [".hx-body"], [".hx-grid"], [".hx-label", 3], [".hx-nav a", 3], [".hx-links"], [".hx-links a", 2],
  [".hx-bot"], [".hx-lang"], [".hx-lang button", 2], [".hx-lang span"], [".hx-contact"], [".hx-hook"], [".hx-mail"]]);
await shot("mobile-menu", "header");
await click(".menu-btn"); await sleep(1000);
await evaluate(`window.scrollTo(0, 400); true`); await sleep(1500);
M.headerCompact = await measure([["header"], [".menu-btn"]]);
await shot("mobile-header-compact", "header");
await scrollTo(".sv2-card"); await sleep(1500);
M.services = await measure([[".sv2-card"], [".sv2-card h3"], [".sv2-desc"]]);
await scrollTo(".svx-toggle", "center"); await sleep(800); await click(".svx-toggle"); await sleep(1200);
M.lignes = await measure([[".svx-row", 2], [".svx-name"], [".svx-time"], [".svx-head"]]);
M.crete = await measure([[".dark-wrap"], [".light-wrap"]]);
await scrollTo(".cw-shot"); await sleep(1500);
M.clientWork = await measure([[".cw-row"], [".cw-shot"], [".cw-shot-btn"]]);
await scrollTo(".fq"); await sleep(1500);
M.faq = await measure([[".fq-item"], [".fq-q"], [".fq-x"]]);
await scrollTo(".foot-dark"); await sleep(2000);
M.footer = await measure([[".lt"], [".lt-eyebrow"], [".lt-inner"], [".lt-big"], [".lt-cta"], [".foot-body"], [".foot-pad"], [".foot-top"], [".foot-cols"],
  [".foot-mid"], [".f-mail"], [".foot-cta-row"], [".foot-cta-pair"], [".foot-cta-pair .btnf", 2], [".foot-ridge"], [".foot-ridge svg"], [".foot-bot"]]);
result.mobile = M;

console.log(JSON.stringify(result, null, 1));
ws.close(); proc.kill();
