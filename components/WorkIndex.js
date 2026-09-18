"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import { PROJECTS } from "@/lib/projects";

// Index des projets — structure reprise de la frame Figma « Index Page »
// (grille 2 colonnes, visuels 16:9, titre et catégorie posés sur le visuel en
// bas à gauche, badge « à venir » sur les projets dont la page n'existe pas).
// Les valeurs de rendu, elles, viennent toutes de globals.css.
//
// Source unique du contenu : lib/projects.js pour les six projets, lib/i18n.js
// pour les textes affichés.

// Ordre d'affichage propre à cette page. Il ne touche pas à lib/projects.js :
// l'ordre du tableau y pilote aussi le carrousel et les sommets de la scène
// Everest, qu'un réarrangement global déplacerait.
const ORDER = ["redesign", "anya", "preshot", "bcc", "coin", "deviantart"];
const TILES = ORDER.map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean);

// Largeurs disponibles dans public/images, par projet. Elles ne sont pas
// uniformes (redesign-bg n'a pas de 1200, les posters vidéo n'ont que deux
// tailles) : on déclare donc le jeu réel plutôt que d'en supposer un.
const WIDTHS = {
  anya: [600, 1200, 1600, 2000],
  "bcc-esport-logo-identite": [600, 1200, 1600, 2000],
  preshot: [600, 1200, 1600, 2000],
  "redesign-bg": [600, 1600, 2000],
};

// Une tuile fait la moitié de la fenêtre au-dessus de 900px, et toute sa
// largeur en dessous (voir le passage à une colonne, section 15 du CSS).
const SIZES = "(max-width:900px) 100vw, 50vw";

const srcSet = (base, widths) =>
  widths.map((w) => `/images/${base}-${w}.webp ${w}w`).join(", ");

// Source du visuel au repos, alignée sur Everest.js : poster pour une vidéo,
// image pour un projet illustré, fond défilant pour la carte Portfolio.
function stillOf(p) {
  if (p.video) return { base: `${p.video}-poster`, widths: null };
  if (p.img) return { base: p.img, widths: WIDTHS[p.img] };
  return { base: p.scrollbg, widths: WIDTHS[p.scrollbg] };
}

// Lissage du suivi de souris : part de la position visée à chaque image.
// Même ordre de grandeur que l'aperçu de Client work (0.18).
const FOLLOW = 0.16;

export default function WorkIndex() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  const router = useRouter();

  // Le survol n'existe qu'au-dessus de 1024px sur un écran à curseur.
  // L'état part à null et n'est résolu qu'après le montage, pour que le rendu
  // serveur soit identique dans tous les cas.
  const [canHover, setCanHover] = useState(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width:1025px) and (hover:hover)");
    const apply = () => setCanHover(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const vids = useRef({});
  const views = useRef({});
  // Un état de suivi par tuile : position visée, position courante, boucle.
  const follow = useRef({});

  const play = (id) => {
    if (!canHover) return;
    const v = vids.current[id];
    // preload="none" : la vidéo n'est chargée qu'ici. play() renvoie une
    // promesse qui se rejette si le curseur repart avant le premier octet.
    if (v) { const r = v.play(); if (r && r.catch) r.catch(() => {}); }
  };
  const stopVid = (id) => {
    const v = vids.current[id];
    if (v) { v.pause(); v.currentTime = 0; }
  };

  // ---- « View » qui suit la souris, avec retard ----
  // Le libellé est en mix-blend-mode:difference (CSS) : sa couleur s'inverse
  // par rapport au pixel qu'il recouvre. Ici on ne gère que le déplacement,
  // lissé image par image plutôt que transitionné, pour que le retard reste
  // constant quelle que soit la vitesse du curseur.
  const step = useCallback((id) => {
    const st = follow.current[id];
    const el = views.current[id];
    if (!st || !el) return;
    st.x += (st.tx - st.x) * FOLLOW;
    st.y += (st.ty - st.y) * FOLLOW;
    el.style.transform = `translate3d(${st.x.toFixed(1)}px,${st.y.toFixed(1)}px,0) translate(-50%,-50%)`;
    const near = Math.abs(st.tx - st.x) < 0.4 && Math.abs(st.ty - st.y) < 0.4;
    if (st.on || !near) st.raf = requestAnimationFrame(() => step(id));
    else st.raf = 0;
  }, []);

  const onEnter = (id) => (e) => {
    if (!canHover) return;
    const tile = e.currentTarget;
    const r = tile.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    // On place le libellé sous le curseur sans transition à l'entrée : sinon
    // il traverse la tuile depuis sa dernière position.
    follow.current[id] = { tx: x, ty: y, x, y, on: true, raf: 0 };
    const el = views.current[id];
    if (el) el.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    follow.current[id].raf = requestAnimationFrame(() => step(id));
  };

  const onMove = (id) => (e) => {
    const st = follow.current[id];
    if (!st || !canHover) return;
    const r = e.currentTarget.getBoundingClientRect();
    st.tx = e.clientX - r.left;
    st.ty = e.clientY - r.top;
    if (!st.raf) st.raf = requestAnimationFrame(() => step(id));
  };

  const onLeave = (id) => () => {
    const st = follow.current[id];
    if (st) st.on = false;   // la boucle s'arrête d'elle-même une fois rattrapée
  };

  // Aucune boucle ne doit survivre au démontage ni à un changement de langue.
  useEffect(() => () => {
    Object.values(follow.current).forEach((st) => { if (st && st.raf) cancelAnimationFrame(st.raf); });
  }, []);

  // ---- Entrée des tuiles : repli pour les navigateurs sans view() ----
  // Là où animation-timeline: view() existe, le CSS pilote tout et cet
  // observateur ne sert à rien : on ne le monte même pas. Ailleurs, il pose
  // .px-in quand la tuile entre dans le champ, comme le reste du site.
  const gridRef = useRef(null);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const supported =
      typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline", "view()");
    const tiles = Array.from(grid.querySelectorAll(".px-tile"));
    if (supported || typeof IntersectionObserver === "undefined") {
      tiles.forEach((el) => el.classList.add("px-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("px-in"); io.unobserve(en.target); }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
    );
    tiles.forEach((el) => io.observe(el));
    // Filet de sécurité, comme Reveal.js : rien ne reste invisible.
    const failsafe = setTimeout(() => tiles.forEach((el) => el.classList.add("px-in")), 1800);
    return () => { io.disconnect(); clearTimeout(failsafe); };
  }, []);

  // Même rideau que partout ailleurs sur le site.
  const go = (e, href) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.__doVeil) window.__doVeil(() => router.push(href));
    else router.push(href);
  };

  return (
    <div className="px-grid" ref={gridRef}>
      {TILES.map((p, i) => {
        const still = stillOf(p);
        const cat = p.cat[lang];
        // Décalage en cascade : il ne sert qu'au repli. Avec view(), le
        // décalage vient de la position des tuiles dans la page.
        const style = { "--rvd": `${i * 80}ms` };

        const media = (
          <div className="px-media">
            {p.anim ? (
              // Carte Portfolio : le fond, les nuages et la neige du carrousel,
              // sans le logo animé, qui demande son propre canvas.
              <div className="rd-scroll">
                <img
                  className="rd-img"
                  src={`/images/${still.base}-1600.webp`}
                  srcSet={srcSet(still.base, still.widths)}
                  sizes={SIZES}
                  alt={p.ph}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
                <div className="rd-clouds" aria-hidden="true"></div>
                <div className="rd-shimmer" aria-hidden="true"></div>
              </div>
            ) : p.video ? (
              <video
                ref={(el) => { vids.current[p.id] = el; }}
                muted
                loop
                playsInline
                preload="none"
                poster={`/images/${still.base}.webp`}
                aria-label={p.ph}
              >
                <source src={`/images/${p.video}.webm`} type="video/webm" />
                <source src={`/images/${p.video}.mp4`} type="video/mp4" />
              </video>
            ) : (
              <img
                src={`/images/${still.base}-1600.webp`}
                srcSet={srcSet(still.base, still.widths)}
                sizes={SIZES}
                alt={p.ph}
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            )}
          </div>
        );

        const inner = (
          <>
            {media}
            <span className="px-scrim" aria-hidden="true"></span>
            {p.soon ? (
              <span className="px-soon">{t("wk.soon")}</span>
            ) : (
              <span
                className="px-view"
                aria-hidden="true"
                ref={(el) => { views.current[p.id] = el; }}
              >
                {t("wk.view")}
              </span>
            )}
            <div className="px-cap">
              <h2 className="px-name">{p.title}</h2>
              <p className="px-cat">{cat}</p>
            </div>
          </>
        );

        // Une tuile « à venir » n'est pas un lien : sa page n'existe pas.
        return p.soon ? (
          <article
            className="px-tile px-tile--soon"
            key={p.id}
            style={style}
            aria-label={`${p.title} — ${cat} — ${t("wk.soonA11y")}`}
          >
            {inner}
          </article>
        ) : (
          <a
            className="px-tile px-tile--link"
            key={p.id}
            href={`/work/${p.id}`}
            style={style}
            onClick={(e) => go(e, `/work/${p.id}`)}
            onMouseEnter={(e) => { onEnter(p.id)(e); if (p.video) play(p.id); }}
            onMouseMove={onMove(p.id)}
            onMouseLeave={() => { onLeave(p.id)(); if (p.video) stopVid(p.id); }}
          >
            {inner}
          </a>
        );
      })}
    </div>
  );
}
