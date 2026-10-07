// Mesure des styles calculés sur la prod, desktop 1440x900 et mobile 390x844.
// Usage : node mesurer-styles.mjs <navigateur.exe> <dossier de sortie> [url de base]
// Aucune dépendance : Chromium headless piloté par le protocole DevTools,
// via le WebSocket intégré à Node 24. Profil temporaire dans le dossier de sortie.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [, , BROWSER, OUT, BASE = "https://jimmyferon.com"] = process.argv;
const PORT = 9333;
const profile = path.join(OUT, "profil-headless");
fs.mkdirSync(profile, { recursive: true });

const proc = spawn(BROWSER, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*",
  `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
  "--disable-extensions", "--hide-scrollbars", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("le navigateur headless ne répond pas");
}

const ws = new WebSocket(await target());
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let seq = 0;
const pending = new Map(), waiters = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else if (msg.method) waiters.filter((w) => w.m === msg.method).forEach((w) => { w.r(msg); waiters.splice(waiters.indexOf(w), 1); });
});
const send = (method, params = {}) => new Promise((r) => {
  const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params }));
});
const once = (m) => new Promise((r) => waiters.push({ m, r }));

await send("Page.enable");
await send("Runtime.enable");

// Script exécuté dans la page : typo des éléments porteurs de texte, et boîtes
// des éléments porteurs d'une classe. Dédoublonné par signature.
const EXTRACT = `(() => {
  const STATE = /^(in|on|rv|rv-in|open|active|show|lit|compact|on-dark|menu-open|turning|docked|nocur|is-column|has-snowc|pre-done|done|cover|leave)$/;
  const sig = (el) => {
    const c = (el.getAttribute("class") || "").split(/\\s+/).filter((x) => x && !STATE.test(x));
    return el.tagName.toLowerCase() + (c.length ? "." + c.join(".") : "");
  };
  const path = (el) => {
    const p = []; let n = el;
    for (let i = 0; i < 3 && n && n !== document.body; i++) { p.unshift(sig(n)); n = n.parentElement; }
    return p.join(" > ");
  };
  const vis = (el) => !!(el.getClientRects().length) && getComputedStyle(el).visibility !== "hidden";
  const rs = getComputedStyle(document.documentElement);
  const root = {};
  ["--paper","--ink","--blue","--line","--line-2","--muted","--muted-2","--pad","--hh","--cardw","--e","--rv-e","--rv-d","--rv-y"]
    .forEach((v) => { root[v] = rs.getPropertyValue(v).trim(); });
  const body = getComputedStyle(document.body);
  const type = new Map(), box = new Map();
  const SKIP = new Set(["SCRIPT","STYLE","LINK","META","NOSCRIPT","BR","CANVAS","VIDEO","IMG","SOURCE"]);
  document.querySelectorAll("body *").forEach((el) => {
    if (SKIP.has(el.tagName) || el.closest("svg")) return;
    const cs = getComputedStyle(el);
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    if (text) {
      const k = path(el);
      const v = { ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), fs: cs.fontSize, fw: cs.fontWeight,
        lh: cs.lineHeight, ls: cs.letterSpacing, tt: cs.textTransform, st: cs.fontStyle, col: cs.color,
        vis: vis(el), txt: text.slice(0, 34) };
      if (type.has(k)) type.get(k).n++; else type.set(k, { ...v, n: 1 });
    }
    if (el.getAttribute("class")) {
      const k = sig(el);
      if (box.has(k)) { box.get(k).n++; return; }
      const r = el.getBoundingClientRect();
      box.set(k, { n: 1, vis: vis(el), w: Math.round(r.width), h: Math.round(r.height),
        pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(" "),
        mar: [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].join(" "),
        gap: cs.rowGap + " / " + cs.columnGap, rad: cs.borderRadius, sh: cs.boxShadow,
        bf: cs.backdropFilter, fi: cs.filter, bg: cs.backgroundColor, op: cs.opacity,
        bt: cs.borderTopWidth + " " + cs.borderTopStyle + " " + cs.borderTopColor,
        bb: cs.borderBottomWidth + " " + cs.borderBottomStyle + " " + cs.borderBottomColor });
    }
  });
  return JSON.stringify({
    url: location.pathname, vw: innerWidth, vh: innerHeight, root,
    mq: { hoverNone: matchMedia("(hover:none)").matches, coarse: matchMedia("(pointer:coarse)").matches },
    body: { fs: body.fontSize, lh: body.lineHeight, ff: body.fontFamily },
    fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family + " " + f.weight + " " + f.style),
    type: Object.fromEntries(type), box: Object.fromEntries(box),
  });
})()`;

const CONFIGS = [
  { name: "desktop", width: 1440, height: 900, dpr: 1, mobile: false, touch: false },
  { name: "mobile", width: 390, height: 844, dpr: 3, mobile: true, touch: true },
];
const PAGES = ["/", "/work", "/about"];
const results = {};
for (const c of CONFIGS) {
  await send("Emulation.setDeviceMetricsOverride", { width: c.width, height: c.height, deviceScaleFactor: c.dpr, mobile: c.mobile });
  await send("Emulation.setTouchEmulationEnabled", { enabled: c.touch, maxTouchPoints: c.touch ? 5 : 1 });
  for (const p of PAGES) {
    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url: BASE + p });
    await loaded;
    await send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => true)", awaitPromise: true });
    await sleep(4500);   // préchargement 3 s + levée du rideau
    const res = await send("Runtime.evaluate", { expression: EXTRACT, returnByValue: true });
    if (res.result && res.result.exceptionDetails) { console.error(c.name, p, res.result.exceptionDetails.text); continue; }
    results[c.name + " " + p] = JSON.parse(res.result.result.value);
    console.log("ok", c.name, p, "| types:", Object.keys(results[c.name + " " + p].type).length,
      "| boîtes:", Object.keys(results[c.name + " " + p].box).length);
  }
}
fs.writeFileSync(path.join(OUT, "mesures.json"), JSON.stringify(results, null, 1));
ws.close();
proc.kill();
console.log("écrit :", path.join(OUT, "mesures.json"));
