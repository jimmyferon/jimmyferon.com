"use client";

import { useEffect, useRef } from "react";

// Preloader 0 -> 100 (3s) porté de index.html.
// Se rejoue à chaque chargement/actualisation de la page (pas lors des
// navigations internes, comme sur le site original où le veil prend le relais).
const WORDS = ["branding", "design system", "figma expert", "ui/ux", "AI skills", "front-end"];

export default function Preloader() {
  const preRef = useRef(null);

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) { document.body.classList.add("pre-done"); return; }
    const wEl = pre.querySelector(".pre-word");
    const cEl = pre.querySelector(".pre-count");
    const bEl = pre.querySelector(".pre-bar i");
    document.body.style.overflow = "hidden";

    const D = 3000, t0 = performance.now();
    let wi = -1, rafId = 0, done = false;
    const timeouts = [];

    function swapWord(txt) {
      wEl.classList.remove("in"); wEl.classList.add("out");
      timeouts.push(setTimeout(() => {
        wEl.textContent = txt; wEl.classList.remove("out");
        void wEl.offsetWidth; wEl.classList.add("in");
      }, 110));
    }
    function frame(now) {
      const p = Math.min(1, (now - t0) / D);
      cEl.textContent = String(Math.floor(p * 100)).padStart(3, "0");
      bEl.style.transform = `scaleX(${p})`;
      bEl.style.opacity = (.35 + .65 * p).toFixed(3);
      const idx = Math.min(WORDS.length - 1, Math.floor(p * WORDS.length));
      if (idx !== wi) { wi = idx; swapWord(WORDS[idx]); }
      if (p < 1) rafId = requestAnimationFrame(frame); else finish();
    }
    function finish() {
      if (done) return; done = true;
      cEl.textContent = "100"; bEl.style.transform = "scaleX(1)"; bEl.style.opacity = "1";
      timeouts.push(setTimeout(() => {
        pre.classList.add("done");
        document.body.classList.add("pre-done");
        document.body.style.overflow = "";
        timeouts.push(setTimeout(() => { pre.style.display = "none"; }, 950));
      }, 200));
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      timeouts.forEach(clearTimeout);
      document.body.style.overflow = "";
      document.body.classList.add("pre-done");
    };
  }, []);

  return (
    <div id="preloader" aria-hidden="true" ref={preRef}>
      <div className="pre-stack">
        <div className="pre-words"><span className="pre-word"></span></div>
        <div className="pre-count">000</div>
        <div className="pre-bar"><i></i></div>
      </div>
    </div>
  );
}
