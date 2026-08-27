"use client";

import { useEffect, useRef } from "react";

// Lac d'Allos 3D (Three.js) porté de index.html.
// Courbes de niveau (marching squares) + hachures d'eau, révélation au scroll,
// rotation lente + drag. Three.js chargé via CDN (r128).
export default function Lake3D() {
  const cvRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    let cleanupFns = [];
    let stopped = false;

    function loadThree() {
      return new Promise((resolve, reject) => {
        if (window.THREE) return resolve(window.THREE);
        const existing = document.querySelector('script[data-three]');
        if (existing) {
          existing.addEventListener("load", () => resolve(window.THREE));
          existing.addEventListener("error", reject);
          return;
        }
        const sc = document.createElement("script");
        sc.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        sc.async = true;
        sc.setAttribute("data-three", "1");
        sc.onload = () => resolve(window.THREE);
        sc.onerror = reject;
        document.head.appendChild(sc);
      });
    }

    async function init() {
      let LAC, THREE;
      try {
        const res = await fetch("/lacdata.json");
        LAC = await res.json();
      } catch (e) { return; }
      try { THREE = await loadThree(); } catch (e) { return; }
      if (stopped || !THREE || !cv) return;

      var renderer, scene, camera, group, waterGeo, waterLS, contourThin, contourIdx,
        cumThin = [0], cumIdx = [0], NLEV = 0, drawP = 0, vis = false;
      var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
      var dragT = 0, dragV = 0, dragging = false, lastX = 0;
      var smooth = function (t) { return t * t * (3 - 2 * t); };

      function build() {
        try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { return; }
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        group = new THREE.Group(); scene.add(group);

        var N = LAC.n, D36 = "0123456789abcdefghijklmnopqrstuvwxyz";
        var dec = function (c) { return D36.indexOf(c); };
        var hm = new Float32Array(N * N), s = LAC.grid36, hmax = 0, hmin = 1;
        for (var k = 0; k < N * N; k++) { var v = (dec(s[k * 2]) * 36 + dec(s[k * 2 + 1])) / 1000; hm[k] = v; if (v > hmax) hmax = v; if (v < hmin) hmin = v; }
        for (var k2 = 0; k2 < N * N; k2++) { hm[k2] = (hm[k2] - hmin) / (hmax - hmin + 1e-6); }
        var mask = LAC.mask;
        var wlev = (LAC.wlev - hmin) / (hmax - hmin + 1e-6);

        var W = 7.6, D = 7.6, H = 1.7;
        var X = function (i) { return (i / (N - 1) - 0.5) * W; };
        var Z = function (j) { return (j / (N - 1) - 0.5) * D; };

        NLEV = 34;
        var thin = [], idx = [];
        for (var li = 0; li < NLEV; li++) {
          var lv = 0.012 + (li / (NLEV - 1)) * 0.948, y = lv * H;
          var out = (li % 5 === 0) ? idx : thin;
          for (var j = 0; j < N - 1; j++) {
            for (var i = 0; i < N - 1; i++) {
              var a = hm[j * N + i], b = hm[j * N + i + 1], c = hm[(j + 1) * N + i + 1], d = hm[(j + 1) * N + i];
              var m = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0);
              if (m === 0 || m === 15) continue;
              var tt = function (p, q) { return (lv - p) / (q - p); };
              var top = [X(i + tt(a, b)), y, Z(j)], rgt = [X(i + 1), y, Z(j + tt(b, c))],
                bot = [X(i + tt(d, c)), y, Z(j + 1)], lft = [X(i), y, Z(j + tt(a, d))];
              var push = function (e1, e2) { out.push(e1[0], e1[1], e1[2], e2[0], e2[1], e2[2]); };
              if (m === 1 || m === 14) push(lft, bot); else if (m === 2 || m === 13) push(bot, rgt);
              else if (m === 3 || m === 12) push(lft, rgt); else if (m === 4 || m === 11) push(top, rgt);
              else if (m === 6 || m === 9) push(top, bot); else if (m === 7 || m === 8) push(top, lft);
              else if (m === 5) { push(top, lft); push(bot, rgt); } else if (m === 10) { push(top, rgt); push(bot, lft); }
            }
          }
          cumThin.push(thin.length / 3); cumIdx.push(idx.length / 3);
        }
        var mk = function (arr, op) {
          var g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.BufferAttribute(Float32Array.from(arr), 3));
          var mat = new THREE.LineBasicMaterial({ color: 0xF5F5F5, transparent: true, opacity: op, depthTest: false, depthWrite: false });
          var ls = new THREE.LineSegments(g, mat); group.add(ls); return g;
        };
        contourThin = mk(thin, 0.26); contourIdx = mk(idx, 0.6);

        var wy = wlev * H + 0.012, wseg = [];
        for (var j2 = 0; j2 < N - 1; j2 += 1) {
          var run = -1;
          for (var i2 = 0; i2 < N; i2++) {
            var wet = (i2 < N) && (mask[j2 * N + i2] === "1");
            if (wet && run < 0) run = i2;
            if ((!wet || i2 === N - 1) && run >= 0) {
              var iend2 = wet ? i2 : i2 - 1;
              if (iend2 - run >= 1 && (j2 % 2 === 0)) { wseg.push(X(run), wy, Z(j2), X(iend2), wy, Z(j2)); }
              run = -1;
            }
          }
        }
        if (wseg.length >= 6) {
          waterGeo = new THREE.BufferGeometry();
          waterGeo.setAttribute("position", new THREE.BufferAttribute(Float32Array.from(wseg), 3));
          var wmat = new THREE.LineBasicMaterial({ color: 0x1E29FF, transparent: true, opacity: .55, depthTest: false, depthWrite: false });
          waterLS = new THREE.LineSegments(waterGeo, wmat); group.add(waterLS);
        }

        group.position.y = -0.52;
        resize();
      }
      function resize() {
        if (!renderer) return;
        var w = cv.clientWidth || 10, hg = cv.clientHeight || 10;
        renderer.setSize(w, hg, false); camera.aspect = w / hg; camera.updateProjectionMatrix();
      }
      function draw(t) {
        if (!renderer) return;
        var lv = Math.max(0, Math.min(NLEV, Math.ceil(NLEV * Math.max(0, drawP * 1.04 - 0.01))));
        if (waterLS) { waterLS.material.opacity = 0.55 * smooth(clamp((drawP - 0.5) / 0.35, 0, 1)); }
        if (contourThin) contourThin.setDrawRange(0, cumThin[lv]);
        if (contourIdx) contourIdx.setDrawRange(0, cumIdx[lv]);
        dragV += (dragT - dragV) * 0.14;
        var ang = -0.7 + Math.sin(t * 0.00022) * 0.065 + dragV;
        var rad = 8.2;
        camera.position.set(Math.sin(ang) * rad, 3.15, Math.cos(ang) * rad);
        camera.lookAt(0, 0.32, 0);
        renderer.render(scene, camera);
      }
      var rafId;
      function loop(t) { if (stopped) return; if (vis) draw(t); rafId = requestAnimationFrame(loop); }
      function upd() {
        var r = cv.getBoundingClientRect(), vh = innerHeight;
        vis = !(r.bottom < 0 || r.top > vh);
        if (!vis) return;
        drawP = clamp(((vh - r.top) - vh * 0.09) / (vh * 0.94), 0, 1);
      }
      var onScroll = function () { requestAnimationFrame(upd); };
      var onResize = function () { upd(); resize(); };
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onResize);
      build();
      // Le canvas peut ne pas avoir sa taille finale au 1er rendu (Three chargé en
      // différé, polices, layout) : on recalcule dès que ses dimensions changent.
      var ro = null;
      if (window.ResizeObserver) {
        ro = new ResizeObserver(function () { resize(); });
        ro.observe(cv);
      }
      // Filets de sécurité : quelques resize après stabilisation du layout.
      var t1 = setTimeout(resize, 100);
      var t2 = setTimeout(resize, 300);
      var t3 = setTimeout(resize, 700);
      cv.style.pointerEvents = "auto"; cv.style.cursor = "grab";
      var onDown = function (e) { dragging = true; lastX = e.clientX; try { cv.setPointerCapture(e.pointerId); } catch (_) { } cv.style.cursor = "grabbing"; };
      var onMove = function (e) { if (!dragging) return; dragT += (e.clientX - lastX) * 0.005; lastX = e.clientX; };
      var onUp = function () { dragging = false; cv.style.cursor = "grab"; };
      cv.addEventListener("pointerdown", onDown);
      addEventListener("pointermove", onMove);
      addEventListener("pointerup", onUp);
      upd(); rafId = requestAnimationFrame(loop);

      cleanupFns.push(() => {
        removeEventListener("scroll", onScroll);
        removeEventListener("resize", onResize);
        cv.removeEventListener("pointerdown", onDown);
        removeEventListener("pointermove", onMove);
        removeEventListener("pointerup", onUp);
        if (ro) ro.disconnect();
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        if (rafId) cancelAnimationFrame(rafId);
        if (renderer) { try { renderer.dispose(); } catch (_) { } }
      });
    }

    init();
    return () => { stopped = true; cleanupFns.forEach((fn) => fn()); };
  }, []);

  return <canvas className="lt-3d" id="lt-3d" ref={cvRef} aria-hidden="true"></canvas>;
}
