"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import { PROJECTS } from "@/lib/projects";
import evJson from "@/data/evdata.json";

/* ---------------------------------------------------------------------------
   L'Himalaya — scène du hero (desktop et tablette).

   Le massif est dessiné en courbes de niveau à partir du relief réel
   (SRTM_GL3 via DEM.Net). Au chargement les courbes se dessinent des vallées
   vers les sommets : la scène existe sans qu'on ait à faire défiler la page.

   Le visiteur se déplace ensuite librement : ZQSD ou les flèches dans les
   quatre directions, la souris pour pivoter la caméra à l'horizontale comme à
   la verticale. Six sommets réels portent un drapeau, un projet chacun ;
   cliquer le drapeau ou son étiquette y emmène le grimpeur puis ouvre la fiche.

   La molette et le défilement tactile ne sont jamais capturés : qui veut
   simplement lire la page fait défiler.

   Sur téléphone ce composant n'est pas monté du tout : le carrousel en colonne
   d'origine reste seul (voir app/page.js ; Carousel.js n'est pas modifié).
--------------------------------------------------------------------------- */

/* ---- réglages, tout est ici -------------------------------------------- */
const SIZE     = 256;     // largeur du terrain en unités de scène (55 km de large)
const EXAG     = 1.30;    // exagération verticale du relief
const INTERVAL = 90;      // équidistance des courbes de niveau, en mètres
const MOVE     = 17;      // vitesse de déplacement, en unités par seconde
const ACCEL    = 5.5;     // souplesse des départs et des arrêts (plus bas = plus mou)
const DRAG_X   = 0.0026;  // sensibilité de la souris à l'horizontale
const DRAG_Y   = 0.0020;  // sensibilité de la souris à la verticale
const TURN_SM  = 4.5;     // amortissement de la rotation (plus bas = plus doux)
const CAM_SM   = 3.0;     // amortissement du suivi de caméra
const CAM_D    = 17;      // recul de la caméra derrière le grimpeur
const CAM_H    = 6.5;     // hauteur de la caméra au-dessus du grimpeur
const PITCH_MIN = -0.30;  // regard vers le haut (caméra basse)
const PITCH_MAX = 1.10;   // regard plongeant (caméra haute)
const FLY_S    = 1.6;     // durée du vol vers un drapeau, en secondes
const REVEAL_S = 2.8;     // durée du dévoilement des courbes, en secondes
const TRAIL_N  = 46;      // longueur de la trace : elle s'efface derrière soi
const TRAIL_D  = 0.7;     // distance entre deux points de trace
const FIG_H    = 2.4;     // hauteur du grimpeur, en unités de scène

const PAPER = { r: 0.961, g: 0.961, b: 0.961 };   // #F5F5F5, la couleur du fond
const BLUE  = { r: 0.118, g: 0.161, b: 1.0 };     // #1E29FF

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
  const [touched, setTouched] = useState(false); // le visiteur a pris les commandes
  const [open, setOpen] = useState(-1);        // index du projet ouvert en modale
  const [mounted, setMounted] = useState(false);

  const MARKS = evJson.marks;

  useEffect(() => { setMounted(true); }, []);

  /* La scène s'arrête au filet du bas du hero (bord haut de .hb-grid).
     On additionne les offsetTop plutôt que de lire un rectangle à l'écran :
     les blocs du hero arrivent en glissant, et un rectangle mesuré pendant
     cette animation aurait donné une hauteur trop grande. */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const hero = wrap.parentElement;
    const grid = hero && hero.querySelector(".hb-grid");
    if (!hero || !grid) return;

    const measure = () => {
      let y = 0;
      for (let el = grid; el && el !== hero; el = el.offsetParent) y += el.offsetTop;
      wrap.style.height = Math.max(240, Math.round(y)) + "px";
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    ro.observe(grid);
    const later = setTimeout(measure, 1400);   // après les animations d'entrée
    window.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      clearTimeout(later);
      window.removeEventListener("load", measure);
    };
  }, [lang]);

  /* Clic sur un drapeau : la scène emmène le grimpeur, puis ouvre la fiche. */
  const goTo = useCallback((i) => {
    setTouched(true);
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
         cases voisines : le grimpeur épouse le terrain. */
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

      /* ---- drapeaux : mât et fanion pleins, tournés vers la caméra --------- */
      const markPos = EV.marks.map((m) => new THREE.Vector3(xOf(m.x), hOf(m.e), zOf(m.y)));
      const flagMat = new THREE.MeshBasicMaterial({ color: 0x1E29FF, side: THREE.DoubleSide });
      const poleMat = new THREE.LineBasicMaterial({ color: 0x1E29FF });
      const hitMat = new THREE.MeshBasicMaterial({
        transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
      });
      const hitboxes = [];

      const markGroups = markPos.map((p, i) => {
        const g = new THREE.Group();
        g.position.copy(p);

        const pole = new THREE.BufferGeometry();
        pole.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 4.4, 0], 3));
        g.add(new THREE.Line(pole, poleMat));

        const tri = new THREE.BufferGeometry();
        tri.setAttribute("position", new THREE.Float32BufferAttribute(
          [0.06, 4.4, 0, 2.7, 3.85, 0, 0.06, 3.3, 0], 3));
        g.add(new THREE.Mesh(tri, flagMat));

        /* Zone de clic généreuse autour du drapeau, invisible mais présente :
           on peut viser le fanion, le mât, ou juste à côté. */
        const hit = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5.4), hitMat);
        hit.position.set(1.1, 2.6, 0);
        hit.userData.mark = i;
        g.add(hit);
        hitboxes.push(hit);

        g.visible = false;
        scene.add(g);
        return g;
      });

      /* ---- le grimpeur : une silhouette de traileur, bâtons compris --------
         Quinze segments dessinés à plat, tournés vers la caméra à chaque image,
         et animés par la distance parcourue. */
      const SEG = 15;
      const figPos = new Float32Array(SEG * 2 * 3);
      const figGeo = new THREE.BufferGeometry();
      figGeo.setAttribute("position", new THREE.BufferAttribute(figPos, 3));
      const figure = new THREE.LineSegments(figGeo, new THREE.LineBasicMaterial({ color: 0x1E29FF }));
      figure.visible = false;
      scene.add(figure);

      const poseFigure = (phase, moving) => {
        const S = FIG_H;
        let n = 0;
        const seg = (ax, ay, bx, by) => {
          figPos[n++] = ax * S; figPos[n++] = ay * S; figPos[n++] = 0;
          figPos[n++] = bx * S; figPos[n++] = by * S; figPos[n++] = 0;
        };
        const HIP = 0.46, SHO = 0.78, HEAD = 0.90, HR = 0.075;
        const sw = moving ? 1 : 0.18;                 // amplitude du pas
        const p = phase;

        seg(0, HIP, 0, SHO);                          // buste
        /* tête : un losange, quatre segments */
        seg(0, HEAD - HR, HR, HEAD); seg(HR, HEAD, 0, HEAD + HR);
        seg(0, HEAD + HR, -HR, HEAD); seg(-HR, HEAD, 0, HEAD - HR);

        const leg = (ph) => {
          const th = Math.sin(ph) * 0.52 * sw;                    // cuisse
          const kn = th - 0.42 * Math.max(0, Math.sin(ph)) * sw;  // le genou plie devant
          const kx = Math.sin(th) * 0.24, ky = HIP - Math.cos(th) * 0.24;
          const fx = kx + Math.sin(kn) * 0.24, fy = ky - Math.cos(kn) * 0.24;
          seg(0, HIP, kx, ky);
          seg(kx, ky, fx, fy);
        };
        leg(p); leg(p + Math.PI);

        const arm = (ph) => {
          const a = Math.sin(ph) * 0.55 * sw;
          const ex = Math.sin(a) * 0.17, ey = SHO - Math.cos(a) * 0.17;
          const hx = ex + Math.sin(a * 0.5 + 0.5) * 0.19, hy = ey - Math.cos(a * 0.5 + 0.5) * 0.19;
          seg(0, SHO, ex, ey);
          seg(ex, ey, hx, hy);
          /* le bâton part de la main et se plante devant ou derrière */
          seg(hx, hy, hx + Math.sin(a) * 0.30, 0);
        };
        arm(p + Math.PI); arm(p);

        figGeo.attributes.position.needsUpdate = true;
      };
      poseFigure(0, false);

      /* ---- trace : courte, elle s'efface derrière le grimpeur --------------
         Les couleurs vont du bleu (la tête) au fond de page (la queue) : la
         trace se dissout au lieu de rester dessinée sur la carte. */
      const tPos = new Float32Array(TRAIL_N * 3);
      const tCol = new Float32Array(TRAIL_N * 3);
      const tGeo = new THREE.BufferGeometry();
      tGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3));
      tGeo.setAttribute("color", new THREE.BufferAttribute(tCol, 3));
      tGeo.setDrawRange(0, 0);
      scene.add(new THREE.Line(tGeo, new THREE.LineBasicMaterial({ vertexColors: true })));
      const pts = [];                                  // du plus ancien au plus récent

      const paintTrail = () => {
        const n = pts.length;
        for (let i = 0; i < n; i++) {
          const q = pts[i];
          tPos[i * 3] = q.x; tPos[i * 3 + 1] = q.y; tPos[i * 3 + 2] = q.z;
          const f = n < 2 ? 1 : i / (n - 1);           // 0 = queue, 1 = tête
          const a = f * f;                             // l'effacement mord vite
          tCol[i * 3] = PAPER.r + (BLUE.r - PAPER.r) * a;
          tCol[i * 3 + 1] = PAPER.g + (BLUE.g - PAPER.g) * a;
          tCol[i * 3 + 2] = PAPER.b + (BLUE.b - PAPER.b) * a;
        }
        tGeo.setDrawRange(0, n);
        tGeo.attributes.position.needsUpdate = true;
        tGeo.attributes.color.needsUpdate = true;
      };

      /* ---- état ----------------------------------------------------------- */
      const start = markPos[0];                        // on démarre au camp de base
      const pos = new THREE.Vector3(start.x, 0, start.z);
      const vel = { x: 0, z: 0 };
      const summit = markPos[markPos.length - 1];
      let yaw = Math.atan2(start.z - summit.z, start.x - summit.x);  // face à l'Everest
      let yawT = yaw, pitch = 0.32, pitchT = pitch;
      let revealed = false, t0 = null, phase = 0, shrink = 0;
      let fly = null;
      const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

      const wide = new THREE.Vector3(0, HS * 1.05 + 22, SIZE * 0.6);
      const half = SIZE / 2 - 4;

      let engaged = false;                             // le visiteur a pris les commandes
      const engage = () => { if (!engaged) { engaged = true; setTouched(true); } };

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
        if (document.querySelector(".ev-modal")) return;   // fiche ouverte : on ne marche pas derrière
        if (e.code.indexOf("Arrow") === 0) e.preventDefault();  // les flèches marchent, la molette défile
        keys[a] = true;
        fly = null;                                   // reprendre la main annule le vol
        engage();
      };
      const onKeyUp = (e) => { const a = MAP[e.code]; if (a) keys[a] = false; };
      const onBlur = () => { Object.keys(keys).forEach((k) => { keys[k] = false; }); };
      const onScroll = () => { if (window.scrollY > 40) engage(); };

      /* ---- souris : pivoter la caméra sur deux axes -------------------------- */
      let drag = false, dragX = 0, dragY = 0, moved = 0;
      const onDown = (e) => {
        drag = true; moved = 0;
        dragX = e.clientX; dragY = e.clientY;
        if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId);
        cv.classList.add("turning");
      };
      const onMove = (e) => {
        if (!drag) return;
        const dx = e.clientX - dragX, dy = e.clientY - dragY;
        moved += Math.abs(dx) + Math.abs(dy);
        yawT -= dx * DRAG_X;
        pitchT = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitchT + dy * DRAG_Y));
        dragX = e.clientX; dragY = e.clientY;
        if (moved > 6) engage();
      };
      const onUp = (e) => {
        if (drag && moved < 6) pick(e);               // un clic net, pas un glissé
        drag = false;
        cv.classList.remove("turning");
      };

      /* ---- clic sur un drapeau dans la scène --------------------------------- */
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const pick = (e) => {
        if (!revealed) return;
        const r = cv.getBoundingClientRect();
        ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(hitboxes, false)[0];
        if (hit) {
          const i = hit.object.userData.mark;
          apiRef.current.flyTo(i, () => setOpen(i));
          engage();
        }
      };

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("blur", onBlur);
      window.addEventListener("scroll", onScroll, { passive: true });
      cv.addEventListener("pointerdown", onDown);
      cv.addEventListener("pointermove", onMove);
      ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => cv.addEventListener(ev, onUp));

      /* ---- vol vers un drapeau ----------------------------------------------- */
      apiRef.current = {
        flyTo(i, done) {
          const p = markPos[i];
          const far = Math.hypot(p.x - pos.x, p.z - pos.z);
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

      /* ---- dimensions --------------------------------------------------------- */
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

      /* ---- boucle ------------------------------------------------------------- */
      const proj = new THREE.Vector3();
      const camWant = new THREE.Vector3();
      let last = performance.now();

      const frame = (now) => {
        if (stopped) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const ease = (k) => 1 - Math.exp(-dt * k);    // amortissement stable

        /* dévoilement, au chargement, sans défilement */
        if (!revealed) {
          if (t0 === null) t0 = now;
          const p = reduce ? 1 : Math.min(1, (now - t0) / (REVEAL_S * 1000));
          const eased = 1 - Math.pow(1 - p, 2.4);
          cGeo.setDrawRange(0, levelEnd[Math.min(levels.length - 1, Math.floor(eased * levels.length))] || 0);
          if (p >= 1) {
            revealed = true;
            cGeo.setDrawRange(0, Infinity);
            figure.visible = true;
            markGroups.forEach((g) => { g.visible = true; });
            setReady(true);
          }
        }

        /* déplacement : vitesse amenée en douceur, jamais en tout ou rien */
        let wx = 0, wz = 0;
        if (revealed && !fly) {
          let f = 0, s = 0;
          if (keys.f) f += 1;
          if (keys.b) f -= 1;
          if (keys.r) s += 1;
          if (keys.l) s -= 1;
          if (f || s) {
            const k = MOVE / Math.hypot(f, s);
            const dirX = -Math.cos(yaw), dirZ = -Math.sin(yaw);
            wx = (dirX * f - dirZ * s) * k;
            wz = (dirZ * f + dirX * s) * k;
          }
        }
        vel.x += (wx - vel.x) * ease(ACCEL);
        vel.z += (wz - vel.z) * ease(ACCEL);
        if (!fly) {
          pos.x = Math.max(-half, Math.min(half, pos.x + vel.x * dt));
          pos.z = Math.max(-half, Math.min(half, pos.z + vel.z * dt));
        }

        /* vol vers un drapeau */
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

        yaw += (yawT - yaw) * ease(TURN_SM);
        pitch += (pitchT - pitch) * ease(TURN_SM);

        /* le grimpeur épouse le sol, marche, et tourne vers la caméra */
        const speed = Math.hypot(vel.x, vel.z) + (fly ? MOVE : 0);
        pos.y = groundY(pos.x, pos.z);
        phase += speed * dt * 1.5;
        poseFigure(phase, speed > 0.6);
        figure.position.copy(pos);
        figure.rotation.y = Math.atan2(camera.position.x - pos.x, camera.position.z - pos.z);

        /* trace : un point tous les TRAIL_D, la queue disparaît */
        const head = pts[pts.length - 1];
        if (!head || Math.hypot(pos.x - head.x, pos.z - head.z) > TRAIL_D) {
          pts.push({ x: pos.x, y: pos.y + 0.25, z: pos.z });
          if (pts.length > TRAIL_N) pts.shift();
          paintTrail();
        } else if (pts.length > 1 && speed < 0.6) {
          /* à l'arrêt, la trace se résorbe au lieu de rester posée */
          shrink += dt;
          if (shrink > 0.05) { shrink = 0; pts.shift(); paintTrail(); }
        }

        /* caméra : deux axes, toujours au-dessus du sol */
        const cd = CAM_D * Math.cos(pitch);
        const cx = pos.x + Math.cos(yaw) * cd;
        const cz = pos.z + Math.sin(yaw) * cd;
        const cy = pos.y + CAM_H + Math.sin(pitch) * CAM_D;
        camWant.set(cx, Math.max(cy, groundY(cx, cz) + 2.6), cz);
        camera.position.lerp(camWant, ease(revealed ? CAM_SM : 1));
        camera.lookAt(pos.x, pos.y + FIG_H * 0.6, pos.z);

        if (altRef.current) {
          altRef.current.textContent = Math.round(groundM(pos.x, pos.z))
            .toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ");
        }

        /* les étiquettes et les fanions suivent la caméra */
        const w = wrap.clientWidth, h = wrap.clientHeight;
        for (let i = 0; i < markPos.length; i++) {
          markGroups[i].rotation.y =
            Math.atan2(camera.position.x - markPos[i].x, camera.position.z - markPos[i].z);
          const el = markRefs.current[i];
          if (!el) continue;
          proj.set(markPos[i].x, markPos[i].y + 5.8, markPos[i].z).project(camera);
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
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", resize);
        cv.removeEventListener("pointerdown", onDown);
        cv.removeEventListener("pointermove", onMove);
        ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => cv.removeEventListener(ev, onUp));
        cGeo.dispose(); tGeo.dispose(); figGeo.dispose();
        renderer.dispose();
        apiRef.current = null;
      };
    });

    return () => { stopped = true; cleanup(); };
  }, []);

  /* La fiche ouverte fige la page et se ferme avec Échap */
  useEffect(() => {
    if (open < 0) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(-1); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
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

  /* La fiche est posée sur le corps de page, pas dans le hero : c'est ce qui
     lui permet de couvrir le header, qui vit dans un autre plan. */
  const modal = openProj && (
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
          <p className="ev-modal-over">{t("evo." + openProj.id)}</p>
          <dl className="ev-modal-meta">
            <div><dt>{t("hero.lblRole")}</dt><dd>{openProj.role[lang]}</dd></div>
            <div><dt>{t("ev.year")}</dt><dd>{openProj.year}</dd></div>
          </dl>
          <a className="btnf btnf-blue" href="/work" onClick={goWork}>
            {t("ev.see")} <span className="arr" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ev" ref={wrapRef}>
      <canvas className="ev-gl" ref={canvasRef} aria-label={t("ev.a11y")}></canvas>

      <div className="ev-meta" aria-hidden="true">
        <span className="ev-route">{t("ev.route")}</span><br />
        {t("ev.alt")} <span className="ev-altnum" ref={altRef}>5 289</span> M
      </div>

      {/* Étiquettes des sommets : de vrais boutons, donc atteignables à la
          souris comme au clavier. Leur position est recalculée à chaque image. */}
      <div className="ev-marks">
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

      {/* Mode d'emploi : un encadré au centre tant qu'on n'a rien touché, qui
          cède la place à un rappel discret en haut à droite. Deux blocs plutôt
          qu'un seul : une position ne se transitionne pas proprement du centre
          vers un coin, un fondu croisé si. */}
      <div className={"ev-help" + (ready && !touched ? " on" : "")} aria-hidden="true">
        <span><b>ZQSD</b> {t("ev.hMoveSep")} <b>{t("ev.hArrows")}</b> — {t("ev.hMove")}</span>
        <span><b>{t("ev.hCam")}</b> — {t("ev.hMouse")}</span>
        <span><b>{t("ev.hFlag")}</b> — {t("ev.hProject")}</span>
      </div>

      <div className={"ev-hud" + (touched ? " on" : "")} aria-hidden="true">
        <span><b>ZQSD</b> {t("ev.hMoveSep")} <b>{t("ev.hArrows")}</b> — {t("ev.hMove")}</span>
        <span><b>{t("ev.hCam")}</b> — {t("ev.hMouse")}</span>
        <span><b>{t("ev.hFlag")}</b> — {t("ev.hProject")}</span>
      </div>

      {mounted && open >= 0 ? createPortal(modal, document.body) : null}
    </div>
  );
}
