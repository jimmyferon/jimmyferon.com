"use client";

import { useEffect } from "react";

// Scroll fluide à inertie (molette) porté de index.html.
// Chaque cran de molette devient un glissement doux. Natif préservé sur
// tactile, listes internes scrollables, et zoom pincé.
export default function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    if (matchMedia("(pointer:coarse)").matches) return; // tactile : natif

    let target = window.scrollY, current = window.scrollY, running = false;
    const EASE = 0.045;
    const MULT = 0.944;
    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    function innerScrollable(el, dy) {
      while (el && el.nodeType === 1 && el !== document.body) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          if (dy < 0 && el.scrollTop > 0) return true;
          if (dy > 0 && el.scrollTop < el.scrollHeight - el.clientHeight - 1) return true;
        }
        el = el.parentElement;
      }
      return false;
    }
    function loop() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.4) { current = target; running = false; }
      window.scrollTo({ top: current, behavior: "instant" });
      if (running) requestAnimationFrame(loop);
    }
    const onWheel = (e) => {
      if (e.ctrlKey) return;
      if (maxScroll() <= 0) return;
      if (innerScrollable(e.target, e.deltaY)) return;
      if (e.target.closest && e.target.closest(".svx-list")) { e.preventDefault(); return; }
      e.preventDefault();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16; else if (e.deltaMode === 2) dy *= window.innerHeight;
      dy *= MULT;
      if (!running) current = window.scrollY;
      target = Math.max(0, Math.min(target + dy, maxScroll()));
      if (!running) { running = true; requestAnimationFrame(loop); }
    };
    const onScroll = () => { if (!running) { target = current = window.scrollY; } };
    const onResize = () => { target = Math.max(0, Math.min(target, maxScroll())); };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
