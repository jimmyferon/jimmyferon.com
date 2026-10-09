// Quelle police dessine réellement chaque texte ? (CSS.getPlatformFontsForNode)
// Usage : node polices-rendues.mjs <navigateur.exe> <dossier profil> [url]
import { spawn } from "node:child_process";
const [, , BROWSER, PROFILE, URL = "https://jimmyferon.com/"] = process.argv;
const PORT = 9334;
const proc = spawn(BROWSER, ["--headless=new", `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*",
  `--user-data-dir=${PROFILE}`, "--no-first-run", "--disable-extensions", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
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

await send("Page.enable"); await send("DOM.enable"); await send("CSS.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
const loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: URL }); await loaded; await sleep(4500);
const { result: { root } } = await send("DOM.getDocument", { depth: -1 });
const SEL = [
  ["bouton .btnf : flèche", ".sv2-cta .arr"], ["bouton .btnf : libellé (lettre roll)", ".sv2-cta .rl .t"],
  ["CTA header : flèche ↗", ".cta-arr"], ["footer : flèche ↗", ".foot-col a span"],
  ["Benefits : route (→ en mono)", ".bn3-route"], ["hero : base (↔ en mono)", ".hb-cell:nth-child(2) .hb-val"],
  ["Services index : → Démarrer", ".svx-go"], ["FAQ : + / −", ".fq-x"],
  ["titre display", ".sv2-title"], ["texte courant", ".sv2-lead"], ["mot du préchargement", ".pre-word"],
];
for (const [label, sel] of SEL) {
  const { result } = await send("DOM.querySelector", { nodeId: root.nodeId, selector: sel });
  if (!result || !result.nodeId) { console.log(label.padEnd(38), "— introuvable"); continue; }
  // compte les glyphes des nœuds texte directement enfants de l'élément, police par police
  const r = await send("CSS.getPlatformFontsForNode", { nodeId: result.nodeId });
  const fonts = (r.result?.fonts || []).map((f) => `${f.familyName}${f.isCustomFont ? " (web)" : " (système)"} ×${f.glyphCount}`);
  console.log(label.padEnd(38), fonts.join(" + ") || "(aucun glyphe direct)");
}
ws.close(); proc.kill();
