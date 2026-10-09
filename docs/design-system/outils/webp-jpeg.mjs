// Convertit une image WebP du site en JPEG, avec le navigateur : Figma n'affiche
// pas les WebP importés. Sert aux visuels posés dans Figma (redesign-bg de la
// carte Portfolio, sur la planche « Univers graphique »).
// Usage : node webp-jpeg.mjs <navigateur.exe> <dossier profil> <entrée.webp> <sortie.jpg>
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [, , BROWSER, PROFILE, IN, OUT] = process.argv;
const PORT = 9344;
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

const b64 = readFileSync(IN).toString("base64");
const res = await send("Runtime.evaluate", { awaitPromise: true, returnByValue: true, expression: `new Promise((ok) => {
  const i = new Image();
  i.onload = () => { const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight;
    c.getContext("2d").drawImage(i, 0, 0); ok({ w: c.width, h: c.height, d: c.toDataURL("image/jpeg", 0.92) }); };
  i.src = "data:image/webp;base64,${b64}";
})` });
const v = res.result.result.value;
writeFileSync(OUT, Buffer.from(v.d.split(",")[1], "base64"));
console.log(OUT, v.w + " × " + v.h);
ws.close(); proc.kill();
