"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { PROJECTS, RING_TILES } from "@/lib/projects";

/* ---------------------------------------------------------------------------
   Anneau du hero — desktop et tablette uniquement (le mobile garde le
   carrousel en colonne, voir Carousel.js).

   Les vignettes parcourent un tracé fermé et irrégulier, dessiné à la main
   puis relevé en 24 points. Le tracé lui-même ne tourne jamais : ce sont les
   vignettes qui avancent dessus, en restant horizontales.

   Au survol, toute la page s'assombrit sauf la vignette visée, qui grandit et
   se découvre. L'ancienne version du carrousel est conservée dans
   Carousel.legacy.js.
--------------------------------------------------------------------------- */

/* Tracé relevé : offsets depuis le centre, dans un cadre de référence de
   1502 de large. */
const SHAPE = [
  [-3, -219], [94, -240], [195, -236], [275, -202],
  [306, -147], [305, -93], [292, -46], [246, -8],
  [195, 34], [166, 101], [120, 147], [52, 168],
  [-24, 181], [-108, 185], [-167, 181], [-226, 160],
  [-272, 122], [-293, 67], [-290, 21], [-276, -21],
  [-242, -67], [-192, -118], [-133, -164], [-74, -198],
];

const REF_W = 1502;
const REF_H = 861;
const TILE_H = 165;      // hauteur constante, identique pour toutes
const PERIOD = 70;       // secondes pour un tour complet
const KX = 1.45;         // étirement horizontal du tracé
const KY = 1.40;         // étirement vertical — c'est lui qui creuse le centre
const NUDGE = [2, 20];   // décalage fin de l'anneau, en pixels
const FRIC = 0.94;       // friction du glisser

/* Le tracé est lissé en spline fermée puis ré-échantillonné à pas d'arc
   constant : sans ça les vignettes se tasseraient dans les virages serrés. */
function buildPath() {
  const n = SHAPE.length;
  const at = (i) => SHAPE[((i % n) + n) % n];
  const dense = [];
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let j = 0; j < 24; j++) {
      const t = j / 24, t2 = t * t, t3 = t2 * t;
      dense.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  const cum = [0];
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1], b = dense[i % dense.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[dense.length];
  return (u) => {
    const target = (((u % 1) + 1) % 1) * total;
    let lo = 0, hi = dense.length;
    while (lo < hi - 1) { const m = (lo + hi) >> 1; if (cum[m] <= target) lo = m; else hi = m; }
    const seg = cum[lo + 1] - cum[lo] || 1;
    const f = (target - cum[lo]) / seg;
    const a = dense[lo], b = dense[(lo + 1) % dense.length];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  };
}

/* Le centre de la boîte du tracé n'est pas (0,0) : on le retranche pour que
   l'anneau soit bien centré sur le logo. */
const SHAPE_C = (() => {
  const xs = SHAPE.map((p) => p[0]), ys = SHAPE.map((p) => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
})();

export default function Ring() {
  const { lang } = useLang();
  const router = useRouter();
  const stageRef = useRef(null);
  const stateRef = useRef({ ang: 0, vel: 0, drag: null, tiles: [] });
  const [hot, setHot] = useState(null);

  useEffect(() => {
    const st = stageRef.current;
    if (!st) return;
    const S = stateRef.current;
    const path = buildPath();
    S.tiles = Array.from(st.querySelectorAll(".rg-tile")).map((el, i) => ({
      el, base: i / RING_TILES.length, ratio: RING_TILES[i].r,
    }));
    if (!S.tiles.length) return;

    // Ordre d'empilement figé : la dernière coiffe la première, puis chaque
    // vignette passe au-dessus de la suivante. Il ne bouge jamais.
    const N = S.tiles.length;
    S.tiles.forEach((t, i) => {
      t.el.style.zIndex = 10 + ((((N - 2 - i) % N) + N) % N);
    });

    const place = () => {
      const W = st.clientWidth, H = st.clientHeight;
      if (!W || !H) return;
      const k = Math.min(W / REF_W, H / REF_H) || 1;
      const h = TILE_H * k;
      S.tiles.forEach((t) => {
        const pt = path(t.base + S.ang / (Math.PI * 2));
        const x = W / 2 + (pt[0] - SHAPE_C[0]) * k * KX + NUDGE[0];
        const y = H / 2 + (pt[1] - SHAPE_C[1]) * k * KY + NUDGE[1];
        const w = h * t.ratio;
        t.el.style.width = w.toFixed(1) + "px";
        t.el.style.height = h.toFixed(1) + "px";
        t.el.style.transform =
          "translate(" + (x - w / 2).toFixed(1) + "px," + (y - h / 2).toFixed(1) + "px) scale(var(--sc))";
      });
    };

    let raf = 0, last = performance.now(), stopped = false;
    const tick = (now) => {
      if (stopped) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!S.drag) {
        S.ang += (Math.PI * 2 / PERIOD) * dt + S.vel;
        S.vel *= FRIC;
        if (Math.abs(S.vel) < 1e-6) S.vel = 0;
      }
      place();
    };
    raf = requestAnimationFrame(tick);

    const down = (e) => {
      S.drag = { x: e.clientX, y: e.clientY, a: S.ang, last: e.clientX };
      S.vel = 0;
      st.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      if (!S.drag) return;
      const r = st.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const a0 = Math.atan2(S.drag.y - cy, S.drag.x - cx);
      const a1 = Math.atan2(e.clientY - cy, e.clientX - cx);
      let d = a1 - a0;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      S.ang = S.drag.a + d;
      S.vel = (e.clientX - S.drag.last) * 0.00004;
      S.drag.last = e.clientX;
    };
    const up = () => { S.drag = null; };
    st.addEventListener("pointerdown", down);
    st.addEventListener("pointermove", move);
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => st.addEventListener(ev, up));
    window.addEventListener("resize", place);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      st.removeEventListener("pointerdown", down);
      st.removeEventListener("pointermove", move);
      ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => st.removeEventListener(ev, up));
      window.removeEventListener("resize", place);
    };
  }, []);

  // Le voile couvre toute la page : on le signale au document, qui fait alors
  // passer le hero au-dessus du header et du bloc du bas.
  useEffect(() => {
    document.body.classList.toggle("rg-spot", hot !== null);
    return () => document.body.classList.remove("rg-spot");
  }, [hot]);

  const go = (e, id) => {
    e.preventDefault();
    const href = "/work";
    if (typeof window !== "undefined" && window.__doVeil) window.__doVeil(() => router.push(href));
    else router.push(href);
  };

  const proj = (t) => PROJECTS.find((p) => p.id === t.p) || {};
  const cur = hot === null ? null : RING_TILES[hot];
  const curP = cur ? proj(cur) : null;

  return (
    <div className={"rg" + (hot !== null ? " spot" : "")} ref={stageRef}>
      {RING_TILES.map((t, i) => {
        const p = proj(t);
        const label = p.title || "";
        return (
          <a
            key={i}
            className={"rg-tile" + (hot === i ? " hot" : "")}
            href="/work"
            aria-label={`${label} — ${(p.cat && p.cat[lang]) || ""}`}
            onClick={(e) => go(e, t.p)}
            onPointerEnter={() => setHot(i)}
            onPointerLeave={() => setHot((v) => (v === i ? null : v))}
          >
            {t.video ? (
              <video
                aria-label={p.ph || label}
                autoPlay
                loop
                muted
                playsInline
                poster={`/images/${t.src}-poster-600.webp`}
              >
                <source src={`/images/${t.src}.webm`} type="video/webm" />
                <source src={`/images/${t.src}.mp4`} type="video/mp4" />
              </video>
            ) : (
              <img
                src={`/images/${t.src}`}
                srcSet={t.w600 ? `/images/${t.w600} 600w, /images/${t.src} 1200w` : undefined}
                sizes={t.w600 ? "(max-width:1024px) 30vw, 20vw" : undefined}
                alt={p.ph || label}
                draggable="false"
                loading="lazy"
              />
            )}
          </a>
        );
      })}

      <div className="rg-veil" aria-hidden="true"></div>

      <div className="rg-cap" aria-hidden={hot === null}>
        <span className="l">{curP ? (curP.cat && curP.cat[lang]) || "" : ""}</span>
        <span className="mid">{curP ? curP.title : ""}</span>
        <span className="r">
          {hot === null ? "" : (
            <>
              <span className="idx">{String(hot + 1).padStart(2, "0")}</span>
              {" / " + String(RING_TILES.length).padStart(2, "0")}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
