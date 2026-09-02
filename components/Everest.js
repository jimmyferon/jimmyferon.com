"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import { PROJECTS } from "@/lib/projects";
import evJson from "@/data/evdata.json";

/* ---------------------------------------------------------------------------
   Ascension de l'Everest — scène du hero (desktop et tablette).

   Le massif est dessiné en courbes de niveau à partir du relief réel
   (SRTM_GL3 via DEM.Net). Au chargement les courbes se dessinent des vallées
   vers les sommets : la scène existe sans qu'on ait à faire défiler la page.

   Le visiteur se déplace ensuite librement sur tout le massif : ZQSD ou les
   flèches dans les quatre directions, la souris pour pivoter la caméra. Six
   sommets réels portent un drapeau, un projet chacun ; cliquer un drapeau y
   emmène le grimpeur puis ouvre la fiche du projet.

   La molette et le défilement tactile ne sont jamais capturés : qui veut
   simplement lire la page fait défiler.

   Sur téléphone ce composant n'est pas monté du tout : le carrousel en colonne
   d'origine reste seul (voir app/page.js ; Carousel.js n'est pas modifié).
--------------------------------------------------------------------------- */

/* ---- réglages, tout est ici -------------------------------------------- */
const SIZE     = 256;    // largeur du terrain en unités de scène (55 km de large)
const EXAG     = 1.30;   // exagération verticale du relief
const INTERVAL = 90;     // équidistance des courbes de niveau, en mètres
const MOVE     = 17;     // vitesse de déplacement, en unités par seconde
const DRAG_V   = 0.006;  // sensibilité de la souris pour pivoter la caméra
const CAM_D    = 17;     // recul de la caméra derrière le grimpeur
const CAM_H    = 6.5;    // hauteur de la caméra au-dessus du grimpeur
const FLY_S    = 1.4;    // durée du vol vers un drapeau cliqué, en secondes
const REVEAL_S = 2.8;    // durée du dévoilement des courbes, en secondes
const TRAIL_N  = 3000;   // longueur maximale de la trace laissée derrière soi

const THREE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

export default function Everest() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  const router = useRouter();

  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const altRef = useRef(null);
  const markRefs = useRef([]);          // les étiquettes HTML des drapeaux
  const apiRef = useRef(null);          // pont vers la scène (vol vers un drapeau)

  const [ready, setReady] = useState(false);   // les courbes ont fini de se dessiner
  const [open, setOpen] = useState(-1);        // index du projet ouvert en modale

  const MARKS = evJson.marks;

  /* La scène s'arrête au filet du bas du hero (bord haut de .hb-grid) : on
     mesure, plutôt que de figer une hauteur qui casserait au changement de
     langue ou de fenêtre. */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const hero = wrap.parentElement;
    const grid = hero && hero.querySelector(".hb-grid");
    if (!hero || !grid) return;
    const measure = () => {
      const h = grid.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      wrap.style.height = Math.max(240, Math.round(h)) + "px";
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [lang]);

  /* Clic sur une étiquette : la scène emmène le grimpeur, puis ouvre la fiche. */
  const goTo = useCallback((i) => {
    if (apiRef.current) apiRef.current.flyTo(i, () => setOpen(i));
    else setOpen(i);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;

    let stopped = false;
    let raf = 0;
    let cleanup = () => {};

    /* Three.js est déjà chargé par le lac et la montagne : on réutilise le même
       marqueur pour ne pas télécharger la bibliothèque deux fois. */
    const withThree = (cb) => {
      if (window.THREE) return cb();
      const existing = document.querySelector("script[data-three]");
      if (existing) return existing.addEventListener("load", cb, { once: true });
      const sc = document.createElement("script");
      sc.src = THREE_SRC;
      sc.async = true;
      sc.setAttribute("data-three", "1");
      sc.addEventListener("load", cb, { once: true });
      document.head.appendChild(sc);
    };

    withThree(() => {
      if (stopped || !window.THREE) return;
      const THREE = window.THREE;
      const EV = evJson;

      /* ---- décodage du relief -------------------------------------------
         Chaque valeur est l'écart avec la case de gauche (première colonne :
         écart avec la ligne du dessus), recentré sur 648 et écrit en base36. */
      const N = EV.n, EMIN = EV.min, RANGE = EV.max - EV.min;
      const HS = (RANGE / EV.wMeters) * SIZE * EXAG;
      const LUT = {};
      "0123456789abcdefghijklmnopqrstuvwxyz".split("").forEach((c, i) => { LUT[c] = i; });

      const E = new Float32Array(N * N);
      let colStart = 0;
      for (let y = 0; y < N; y++) {
        let acc = 0;
        for (let x = 0; x < N; x++) {
          const k = y * N + x;
          const delta = (LUT[EV.d[2 * k]] * 36 + LUT[EV.d[2 * k + 1]]) - 648;
          if (x === 0) { colStart += delta; acc = colStart; }
          else acc += delta;
          E[k] = EMIN + (acc / EV.steps) * RANGE;
        }
      }

      const hOf = (m) => ((m - EMIN) / RANGE) * HS;
      const xOf = (gx) => (gx / (N - 1) - 0.5) * SIZE;
      const zOf = (gy) => (gy / (N - 1) - 0.5) * SIZE;

      /* Altitude du sol sous n'importe quel point, interpolée entre les quatre
         cases voisines : le grimpeur épouse le terrain au lieu de sauter de
         case en case. */
      const groundM = (wx, wz) => {
        const gx = Math.max(0, Math.min(N - 1.001, (wx / SIZE + 0.5) * (N - 1)));
        const gy = Math.max(0, Math.min(N - 1.001, (wz / SIZE + 0.5) * (N - 1)));
        const x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
        const a = E[y0 * N + x0], b = E[y0 * N + x0 + 1];
        const c = E[(y0 + 1) * N + x0], d = E[(y0 + 1) * N + x0 + 1];
        return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
      };
      const groundY = (wx, wz) => hOf(groundM(wx, wz));

      /* ---- scène --------------------------------------------------------- */
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); }
      catch (e) { return; }                      // pas de WebGL : le hero reste lisible
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0xF5F5F5, 110, 340);
      const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 900);

      /* ---- courbes de niveau (marching squares) --------------------------
         Les sommets sont écrits par niveau croissant : le dévoilement n'est
         alors qu'une plage de dessin qui s'étend, des vallées vers le sommet. */
      const verts = [];
      const levelEnd = [];
      const levels = [];
      for (let L = Math.ceil(EMIN / INTERVAL) * INTERVAL; L < EV.max; L += INTERVAL) levels.push(L);

      const cut = (x0, y0, v0, x1, y1, v1, L, out) => {
        const f = (L - v0) / (v1 - v0);
        out.push(xOf(x0 + (x1 - x0) * f), hOf(L), zOf(y0 + (y1 - y0) * f));
      };

      for (let li = 0; li < levels.length; li++) {
        const L = levels[li];
        for (let y = 0; y < N - 1; y++) {
          const r0 = y * N, r1 = (y + 1) * N;
          for (let x = 0; x < N - 1; x++) {
            const a = E[r0 + x], b = E[r0 + x + 1], c = E[r1 + x + 1], d = E[r1 + x];
            const cs = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
            if (cs === 0 || cs === 15) continue;
            const e = [];
            if ((cs & 8) !== ((cs & 4) << 1)) cut(x, y, a, x + 1, y, b, L, e);
            if ((cs & 4) !== ((cs & 2) << 1)) cut(x + 1, y, b, x + 1, y + 1, c, L, e);
            if ((cs & 2) !== ((cs & 1) << 1)) cut(x + 1, y + 1, c, x, y + 1, d, L, e);
            if (((cs & 1) << 3) !== (cs & 8)) cut(x, y + 1, d, x, y, a, L, e);
            for (let i = 0; i < e.length; i++) verts.push(e[i]);   // 6 ou 12 valeurs
          }
        }
        levelEnd.push(verts.length / 3);
      }

      const cGeo = new THREE.BufferGeometry();
      cGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      cGeo.setDrawRange(0, 0);
      scene.add(new THREE.LineSegments(cGeo, new THREE.LineBasicMaterial({
        color: 0x111111, transparent: true, opacity: 0.4,
      })));

      /* ---- la voie normale sud, en repère discret vers le sommet ---------- */
      const R = EV.route;
      const rv = [];
      for (let i = 0; i < R.length; i++) rv.push(xOf(R[i][0]), hOf(R[i][2]) + 0.3, zOf(R[i][1]));
      const rGeo = new THREE.BufferGeometry();
      rGeo.setAttribute("position", new THREE.Float32BufferAttribute(rv, 3));
      scene.add(new THREE.Line(rGeo, new THREE.LineBasicMaterial({
        color: 0x1E29FF, transparent: true, opacity: 0.22,
      })));

      /* ---- mâts des drapeaux ---------------------------------------------- */
      const markPos = EV.marks.map((m) => new THREE.Vector3(xOf(m.x), hOf(m.e), zOf(m.y)));
      const markMesh = markPos.map((p) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(
          [0, 0, 0, 0, 3.4, 0, 0, 3.4, 0, 2, 2.95, 0, 2, 2.95, 0, 0, 2.5, 0], 3));
        const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x1E29FF }));
        m.position.copy(p);
        m.visible = false;
        scene.add(m);
        return m;
      });

      /* ---- le grimpeur et sa trace ---------------------------------------- */
      const dGeo = new THREE.BufferGeometry();
      dGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
      const climber = new THREE.Points(dGeo, new THREE.PointsMaterial({
        color: 0x1E29FF, size: 9, sizeAttenuation: false,
      }));
      climber.visible = false;
      scene.add(climber);

      const trail = new Float32Array(TRAIL_N * 3);
      let trailN = 0;
      const tGeo = new THREE.BufferGeometry();
      tGeo.setAttribute("position", new THREE.BufferAttribute(trail, 3));
      tGeo.setDrawRange(0, 0);
      scene.add(new THREE.Line(tGeo, new THREE.LineBasicMaterial({ color: 0x1E29FF })));

      /* ---- état ----------------------------------------------------------- */
      const start = markPos[0];                        // on démarre au camp de base
      const pos = new THREE.Vector3(start.x, 0, start.z);
      const summit = markPos[markPos.length - 1];
      let yaw = Math.atan2(start.z - summit.z, start.x - summit.x);  // face à l'Everest
      let yawT = yaw;
      let revealed = false, t0 = null;
      let fly = null;                                  // vol en cours vers un drapeau
      const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

      const wide = new THREE.Vector3(0, HS * 1.05 + 22, SIZE * 0.6);
      const half = SIZE / 2 - 4;

      /* ---- clavier : les quatre directions --------------------------------- */
      const keys = {};
      const MAP = {
        KeyW: "f", KeyZ: "f", ArrowUp: "f",
        KeyS: "b", ArrowDown: "b",
        KeyA: "l", KeyQ: "l", ArrowLeft: "l",
        KeyD: "r", ArrowRight: "r",
      };
      const heroOnScreen = () => {
        const hero = wrap.parentElement;
        return hero ? hero.getBoundingClientRect().bottom > window.innerHeight * 0.45 : false;
      };
      const typing = (el) =>
        el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

      const onKeyDown = (e) => {
        const a = MAP[e.code];
        if (!a || !revealed || typing(e.target) || !heroOnScreen()) return;
        if (e.code.indexOf("Arrow") === 0) e.preventDefault();  // les flèches marchent, la molette défile
        keys[a] = true;
        fly = null;                                             // reprendre la main annule le vol
      };
      const onKeyUp = (e) => { const a = MAP[e.code]; if (a) keys[a] = false; };
      const onBlur = () => { Object.keys(keys).forEach((k) => { keys[k] = false; }); };

      /* ---- souris : pivoter la caméra --------------------------------------- */
      let drag = false, dragX = 0;
      const onDown = (e) => {
        drag = true;
        dragX = e.clientX;
        if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId);
        cv.classList.add("turning");
      };
      const onMove = (e) => {
        if (!drag) return;
        yawT -= (e.clientX - dragX) * DRAG_V;
        dragX = e.clientX;
      };
      const onUp = () => { drag = false; cv.classList.remove("turning"); };

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("blur", onBlur);
      cv.addEventListener("pointerdown", onDown);
      cv.addEventListener("pointermove", onMove);
      ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => cv.addEventListener(ev, onUp));

      /* ---- vol vers un drapeau, déclenché par le clic sur son étiquette ------ */
      apiRef.current = {
        flyTo(i, done) {
          const p = markPos[i];
          const far = Math.hypot(p.x - pos.x, p.z - pos.z);
          /* Déjà sur place, ou animations réduites : on ouvre la fiche tout de
             suite plutôt que de jouer un vol immobile. */
          if (reduce || far < 1.5) {
            pos.x = p.x; pos.z = p.z;
            if (done) done();
            return;
          }
          fly = {
            fx: pos.x, fz: pos.z, tx: p.x, tz: p.z,
            yaw0: yaw, yaw1: Math.atan2(pos.z - p.z, pos.x - p.x),
            t: 0, done,
          };
        },
      };

      /* ---- dimensions -------------------------------------------------------- */
      const resize = () => {
        const w = wrap.clientWidth || window.innerWidth;
        const h = wrap.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", resize);
      resize();

      camera.position.copy(wide);
      camera.lookAt(0, HS * 0.35, 0);

      /* ---- boucle ------------------------------------------------------------ */
      const proj = new THREE.Vector3();
      const camWant = new THREE.Vector3();
      let last = performance.now();

      const frame = (now) => {
        if (stopped) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        /* dévoilement, au chargement, sans défilement */
        if (!revealed) {
          if (t0 === null) t0 = now;
          const p = reduce ? 1 : Math.min(1, (now - t0) / (REVEAL_S * 1000));
          const eased = 1 - Math.pow(1 - p, 2.4);
          cGeo.setDrawRange(0, levelEnd[Math.min(levels.length - 1, Math.floor(eased * levels.length))] || 0);
          if (p >= 1) {
            revealed = true;
            cGeo.setDrawRange(0, Infinity);
            climber.visible = true;
            markMesh.forEach((m) => { m.visible = true; });
            setReady(true);
          }
        }

        /* déplacement libre : quatre directions, relatives au regard */
        if (revealed && !fly) {
          let f = 0, s = 0;
          if (keys.f) f += 1;
          if (keys.b) f -= 1;
          if (keys.r) s += 1;
          if (keys.l) s -= 1;
          if (f || s) {
            const step = (MOVE * dt) / Math.hypot(f, s);
            const dirX = -Math.cos(yaw), dirZ = -Math.sin(yaw);   // l'avant, dos à la caméra
            pos.x += (dirX * f - dirZ * s) * step;
            pos.z += (dirZ * f + dirX * s) * step;
            pos.x = Math.max(-half, Math.min(half, pos.x));
            pos.z = Math.max(-half, Math.min(half, pos.z));
          }
        }

        /* vol vers un drapeau : la caméra suit la même mécanique, en accéléré */
        if (fly) {
          fly.t = Math.min(1, fly.t + dt / FLY_S);
          const e = fly.t < 0.5 ? 2 * fly.t * fly.t : 1 - Math.pow(-2 * fly.t + 2, 2) / 2;
          pos.x = fly.fx + (fly.tx - fly.fx) * e;
          pos.z = fly.fz + (fly.tz - fly.fz) * e;
          let dy = fly.yaw1 - fly.yaw0;
          while (dy > Math.PI) dy -= Math.PI * 2;
          while (dy < -Math.PI) dy += Math.PI * 2;
          yawT = fly.yaw0 + dy * e;
          if (fly.t >= 1) { const cb = fly.done; fly = null; if (cb) cb(); }
        }

        yaw += (yawT - yaw) * Math.min(1, dt * 8);

        /* le grimpeur épouse le sol et laisse sa trace derrière lui */
        pos.y = groundY(pos.x, pos.z) + 0.35;
        climber.position.copy(pos);

        /* La trace ne gagne un point que tous les 0,6 unité : on n'envoie à la
           carte graphique que ce nouveau point, pas les trois mille autres. */
        const li = (trailN - 1) * 3;
        if (trailN < TRAIL_N &&
            (trailN === 0 || Math.hypot(pos.x - trail[li], pos.z - trail[li + 2]) > 0.6)) {
          const o = trailN * 3;
          trail[o] = pos.x; trail[o + 1] = pos.y; trail[o + 2] = pos.z;
          trailN++;
          tGeo.setDrawRange(0, trailN);
          const attr = tGeo.attributes.position;
          attr.updateRange = { offset: o, count: 3 };
          attr.needsUpdate = true;
        }

        /* caméra derrière le grimpeur, jamais sous le terrain */
        const cx = pos.x + Math.cos(yaw) * CAM_D;
        const cz = pos.z + Math.sin(yaw) * CAM_D;
        camWant.set(cx, Math.max(pos.y + CAM_H, groundY(cx, cz) + 3.2), cz);
        camera.position.lerp(camWant, Math.min(1, dt * (revealed ? 3 : 1)));
        camera.lookAt(pos.x, pos.y + 1.6, pos.z);

        if (altRef.current) {
          altRef.current.textContent = Math.round(groundM(pos.x, pos.z))
            .toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ");
        }

        /* les étiquettes suivent leur mât à l'écran */
        const w = wrap.clientWidth, h = wrap.clientHeight;
        for (let i = 0; i < markPos.length; i++) {
          const el = markRefs.current[i];
          if (!el) continue;
          proj.set(markPos[i].x, markPos[i].y + 4.8, markPos[i].z).project(camera);
          if (!revealed || proj.z > 1) { el.style.opacity = "0"; el.style.pointerEvents = "none"; continue; }
          el.style.transform = "translate(-50%,-100%) translate("
            + Math.round((proj.x * 0.5 + 0.5) * w) + "px,"
            + Math.round((-proj.y * 0.5 + 0.5) * h) + "px)";
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
        }

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        window.removeEventListener("resize", resize);
        cv.removeEventListener("pointerdown", onDown);
        cv.removeEventListener("pointermove", onMove);
        ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => cv.removeEventListener(ev, onUp));
        cGeo.dispose(); rGeo.dispose(); dGeo.dispose(); tGeo.dispose();
        renderer.dispose();
        apiRef.current = null;
      };
    });

    return () => { stopped = true; cleanup(); };
  }, []);

  /* Échap ferme la fiche */
  useEffect(() => {
    if (open < 0) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const fmt = (n) => n.toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ");
  const openMark = open >= 0 ? MARKS[open] : null;
  const openProj = openMark ? PROJECTS.find((p) => p.id === openMark.p) : null;
  const shot = (p) => p.video ? "/images/" + p.video + "-poster.webp"
    : p.img ? "/images/" + p.img + "-1600.webp"
    : "/images/" + p.scrollbg + "-1600.webp";

  const goWork = (e) => {
    e.preventDefault();
    setOpen(-1);
    if (window.__doVeil) window.__doVeil(() => router.push("/work"));
    else router.push("/work");
  };

  return (
    <div className="ev" ref={wrapRef}>
      <canvas className="ev-gl" ref={canvasRef} aria-label={t("ev.a11y")}></canvas>

      <div className="ev-meta" aria-hidden="true">
        <span className="ev-route">{t("ev.route")}</span><br />
        {t("ev.alt")} <span className="ev-altnum" ref={altRef}>5 289</span> M
      </div>

      {/* Étiquettes des sommets : de vrais boutons, donc atteignables à la
          souris comme au clavier. Leur position est recalculée à chaque image. */}
      <div className={"ev-marks" + (ready ? " on" : "")}>
        {MARKS.map((m, i) => {
          const p = PROJECTS.find((x) => x.id === m.p);
          return (
            <button
              key={m.k}
              type="button"
              className="ev-mark"
              ref={(el) => { markRefs.current[i] = el; }}
              onClick={() => goTo(i)}
            >
              <span className="ev-mark-alt">{fmt(m.alt)} m</span>
              <span className="ev-mark-name">{t(m.k)}</span>
              <span className="ev-mark-proj">{p ? p.title : ""}</span>
            </button>
          );
        })}
      </div>

      <p className={"ev-keys" + (ready ? " on" : "")} aria-hidden="true">
        <span className="ev-kgroup"><kbd>Z</kbd><kbd>Q</kbd><kbd>S</kbd><kbd>D</kbd></span>
        {t("ev.move")}
        <i className="ev-sep"></i>
        {t("ev.turn")}
        <i className="ev-sep"></i>
        {t("ev.flags")}
      </p>

      {/* Fiche du projet, en surimpression */}
      {openProj && (
        <div className="ev-modal" role="dialog" aria-modal="true" aria-label={openProj.title}>
          <div className="ev-modal-veil" onClick={() => setOpen(-1)}></div>
          <div className="ev-modal-box">
            <button type="button" className="ev-modal-x" onClick={() => setOpen(-1)} aria-label={t("ev.close")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div className="ev-modal-shot">
              <img src={shot(openProj)} alt={openProj.ph} draggable="false" />
            </div>
            <div className="ev-modal-txt">
              <span className="ev-modal-camp">{t(openMark.k)} — {fmt(openMark.alt)} m</span>
              <h3>{openProj.title}</h3>
              <p className="ev-modal-cat">{openProj.cat[lang]}</p>
              <p className="ev-modal-over">{openProj.over}</p>
              <dl className="ev-modal-meta">
                <div><dt>{t("hero.lblRole")}</dt><dd>{openProj.role[lang]}</dd></div>
                <div><dt>{t("ev.year")}</dt><dd>{openProj.year}</dd></div>
              </dl>
              <a className="btnf btnf-ink" href="/work" onClick={goWork}>
                {t("ev.see")} <span className="arr" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
