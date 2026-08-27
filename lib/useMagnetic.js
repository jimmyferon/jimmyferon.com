"use client";

import { useEffect } from "react";

// Porte bindMagnetic() du site original : les CTA (.cta, .btnf, .btn-dark)
// suivent la souris (parallaxe) puis reviennent élastiquement.
// À appeler dans un composant client ; il (re)lie tous les CTA présents.
export default function useMagnetic(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll(".cta,.btnf,.btn-dark");
    const cleanups = [];
    els.forEach((el) => {
      if (el.dataset.mag) return;
      el.dataset.mag = "1";
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(dx * 0.25).toFixed(1)}px,${(dy * 0.35).toFixed(1)}px)`;
      };
      const onLeave = () => {
        el.style.transition = "transform .55s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "translate(0,0)";
        setTimeout(() => { el.style.transition = ""; }, 560);
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        delete el.dataset.mag;
      });
    });
    return () => cleanups.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
