// Lit la table 'name' d'un WOFF2 (famille, style, nom complet, version, licence).
// Usage : node nom-police.mjs <fichier.woff2>
import fs from "node:fs";
import zlib from "node:zlib";
const buf = fs.readFileSync(process.argv[2]);
if (buf.toString("ascii", 0, 4) !== "wOF2") throw new Error("pas un WOFF2");
const numTables = buf.readUInt16BE(12);
const totalCompressed = buf.readUInt32BE(20);
const KNOWN = ["cmap","head","hhea","hmtx","maxp","name","OS/2","post","cvt ","fpgm","glyf","loca","prep","CFF ","VORG","EBDT","EBLC","gasp","hdmx","kern","LTSH","PCLT","VDMX","vhea","vmtx","BASE","GDEF","GPOS","GSUB","EBSC","JSTF","MATH","CBDT","CBLC","COLR","CPAL","SVG ","sbix","acnt","avar","bdat","bloc","bsln","cvar","fdsc","feat","fmtx","fvar","gvar","hsty","just","lcar","mort","morx","opbd","prop","trak","Zapf","Silf","Glat","Gloc","Feat","Sill"];
let off = 48;
const base128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const b = buf[off++]; v = (v << 7) | (b & 0x7f); if (!(b & 0x80)) return v; } };
const tables = [];
for (let i = 0; i < numTables; i++) {
  const flags = buf[off++];
  const tag = (flags & 0x3f) === 63 ? buf.toString("ascii", off, (off += 4)) : KNOWN[flags & 0x3f];
  const origLength = base128();
  const version = flags >> 6;
  const transformed = (tag === "glyf" || tag === "loca") ? version === 0 : version !== 0;
  const length = transformed ? base128() : origLength;
  tables.push({ tag, length });
}
const data = zlib.brotliDecompressSync(buf.subarray(off, off + totalCompressed));
let pos = 0; let name = null;
for (const t of tables) { if (t.tag === "name") name = data.subarray(pos, pos + t.length); pos += t.length; }
const count = name.readUInt16BE(2), strOff = name.readUInt16BE(4);
const LABEL = { 0: "copyright", 1: "famille", 2: "style", 4: "nom complet", 5: "version", 6: "nom PostScript", 13: "licence", 16: "famille typo", 17: "style typo" };
const seen = new Set();
for (let i = 0; i < count; i++) {
  const r = 6 + i * 12;
  const pid = name.readUInt16BE(r), nid = name.readUInt16BE(r + 6), len = name.readUInt16BE(r + 8), o = name.readUInt16BE(r + 10);
  if (!(nid in LABEL) || seen.has(nid)) continue;
  const raw = name.subarray(strOff + o, strOff + o + len);
  const s = pid === 3 || pid === 0 ? Buffer.from(raw).swap16().toString("utf16le") : raw.toString("latin1");
  seen.add(nid);
  console.log(LABEL[nid].padEnd(15), s.slice(0, 160));
}
console.log("tables          ", tables.map((t) => t.tag).join(" "));
