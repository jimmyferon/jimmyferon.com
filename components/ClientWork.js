"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import Roll from "@/components/Roll";

// Section Client work — portée à l'identique de index.html :
// - mêmes classes .reveal (eyebrow, titre, liste) révélées au scroll par
//   Reveal.js, exactement comme le revealInView() de l'original ;
// - portage verbatim de l'aperçu image (.cw-preview) qui suit le curseur au
//   survol des lignes, avec la même inertie, la même rotation liée à la
//   vitesse et le même zoom.
// Seule adaptation : les liens pointent vers /work tant que les pages projet
// n'existent pas (l'identifiant du projet passe par data-pv, puisque le href
// ne le porte plus).
// Visuels des trois projets : aperçu qui suit le curseur sur desktop,
// image posée dans la ligne sur téléphone. Même fichier dans les deux cas.
const SRC = {
  anya: "/images/anya-enseigne-identite-1200.webp",
  preshot: "/images/preshot-app-esport-1200.webp",
  redesign: "/images/netflix-redesign-ux-1200.webp",
};

export default function ClientWork() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  const router = useRouter();
  const listRef = useRef(null);

  const go = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.__doVeil) window.__doVeil(() => router.push("/work"));
    else router.push("/work");
  };

  // ---- preview image au hover : code d'index.html, ligne pour ligne ----
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const prev = document.createElement("img");
    prev.className = "cw-preview";
    prev.alt = "";
    prev.setAttribute("aria-hidden", "true");
    list.appendChild(prev);
    let active = false, stopped = false;
    let tx = 0, ty = 0, x = 0, y = 0, lastX = 0, lastY = 0, rot = 0, trot = 0, scale = 0.96, tscale = 0.96;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    function move(e) {
      const r = list.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      const vx = e.clientX - lastX;
      lastX = e.clientX; lastY = e.clientY;
      trot = clamp(vx * 0.45, -10, 10);
    }
    function loop() {
      if (stopped) return;
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      rot += (trot - rot) * 0.12;
      scale += (tscale - scale) * 0.15;
      trot *= 0.86;
      prev.style.left = x + "px"; prev.style.top = y + "px";
      prev.style.transform = "translate(-50%,-50%) rotate(" + rot.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
      if (active) requestAnimationFrame(loop);
    }
    const cleanups = [];
    list.querySelectorAll(".cw-row").forEach((row) => {
      const id = row.getAttribute("data-pv") || "";
      const onEnter = (e) => {
        const s = SRC[id]; if (!s) return;
        prev.src = s;
        const r = list.getBoundingClientRect();
        tx = x = e.clientX - r.left; ty = y = e.clientY - r.top; lastX = e.clientX; lastY = e.clientY;
        tscale = 1;
        prev.classList.add("on");
        if (!active) { active = true; requestAnimationFrame(loop); }
      };
      const onLeave = () => {
        prev.classList.remove("on"); tscale = 0.96;
        setTimeout(() => { if (!prev.classList.contains("on")) active = false; }, 320);
      };
      row.addEventListener("mouseenter", onEnter);
      row.addEventListener("mousemove", move);
      row.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        row.removeEventListener("mouseenter", onEnter);
        row.removeEventListener("mousemove", move);
        row.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => {
      stopped = true; active = false;
      cleanups.forEach((fn) => fn());
      if (prev.parentNode) prev.parentNode.removeChild(prev);
    };
  }, []);

  // Apparition en fondu de chaque ligne au scroll. L'effet se contente de
  // poser une classe : tout le visuel vit dans la media query <=760px, donc le
  // rendu desktop validé n'est pas touché. Aucun effet de survol ni de clic
  // sur téléphone, ils sont neutralisés en CSS.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows = Array.from(list.querySelectorAll(".cw-row"));
    if (!rows.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.1 }
    );
    rows.forEach((r) => io.observe(r));

    return () => io.disconnect();
  }, []);

  const ROWS = [
    { id: "anya", n: "cw.p1n", ty: "cw.p1t", y: "cw.p1y" },
    { id: "preshot", n: "cw.p2n", ty: "cw.p2t", y: "cw.p2y" },
    { id: "redesign", n: "cw.p3n", ty: "cw.p3t", y: "cw.p3y" },
  ];

  return (
    <section className="cw" id="clientwork">
      <div className="cw-head">
        <div className="cw-head-in">
          <p className="sv2-eyebrow reveal">
            <span className="sv2-flake" aria-hidden="true"></span>
            <span>{t("cw.eyebrow")}</span>
          </p>
          <h2 className="cw-title reveal">{t("cw.title")}</h2>
        </div>
      </div>
      <div className="cw-list reveal" ref={listRef}>
        {ROWS.map((r) => (
          <a className="cw-row" href="/work" data-pv={r.id} key={r.id} onClick={go}>
            <span className="cw-name">{t(r.n)}</span>
            <span className="cw-type">{t(r.ty)}</span>
            <span className="cw-year">{t(r.y)}</span>
            {/* Visuel réservé au téléphone (masqué au-dessus de 760px) : sur
                mobile il n'y a pas de survol, donc l'aperçu qui suit le curseur
                sur desktop devient une image posée dans la ligne, avec le même
                badge flèche que la barre des cartes du carrousel. */}
            <span className="cw-shot" aria-hidden="true">
              <img className="cw-shot-img" src={SRC[r.id]} alt="" loading="lazy" decoding="async" />
              <span className="cw-shot-btn">→</span>
            </span>
          </a>
        ))}
      </div>
      <a className="btnf btnf-ghost cw-all" href="/work" onClick={go}>
        <Roll text={t("cw.all")} /> <span className="arr" aria-hidden="true">→</span>
      </a>
    </section>
  );
}
