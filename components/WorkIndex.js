"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import { PROJECTS } from "@/lib/projects";

// Index des projets — structure reprise de la frame Figma « Index Page »
// (grille 2 colonnes, visuels 16:9, titre et catégorie posés en bas à gauche
// du visuel, badge « à venir » sur les projets dont la page n'existe pas).
// Les valeurs de rendu, elles, viennent toutes de globals.css.
//
// Source unique du contenu : lib/projects.js pour les six projets, lib/i18n.js
// pour les textes affichés — la description bilingue est evo.<id>, et non
// PROJECTS[].over qui n'existe qu'en français.

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

export default function WorkIndex() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  const router = useRouter();

  // Lecture des vidéos au survol : réservée aux écrans à curseur, au-dessus
  // de 1024px. L'état part à null et n'est résolu qu'après le montage, pour
  // que le rendu serveur soit identique dans tous les cas.
  const [canHover, setCanHover] = useState(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width:1025px) and (hover:hover)");
    const apply = () => setCanHover(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const vids = useRef({});

  const play = (id) => {
    if (!canHover) return;
    const v = vids.current[id];
    // preload="none" : la vidéo n'est chargée qu'ici. play() renvoie une
    // promesse qui se rejette si le curseur repart avant le premier octet.
    if (v) { const r = v.play(); if (r && r.catch) r.catch(() => {}); }
  };
  const stop = (id) => {
    const v = vids.current[id];
    if (v) { v.pause(); v.currentTime = 0; }
  };

  // Même rideau que partout ailleurs sur le site.
  const go = (e, href) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.__doVeil) window.__doVeil(() => router.push(href));
    else router.push(href);
  };

  return (
    <div className="px-grid">
      {PROJECTS.map((p, i) => {
        const still = stillOf(p);
        const cat = p.cat[lang];
        // Délais en cascade pour l'apparition au scroll sous 1024px.
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
            <span className="px-veil" aria-hidden="true"></span>
            <span className="px-scrim" aria-hidden="true"></span>
            {p.soon ? (
              <span className="px-soon">{t("wk.soon")}</span>
            ) : (
              <span className="px-view" aria-hidden="true">{t("wk.view")}</span>
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
            data-rv
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
            data-rv
            style={style}
            onClick={(e) => go(e, `/work/${p.id}`)}
            onMouseEnter={p.video ? () => play(p.id) : undefined}
            onMouseLeave={p.video ? () => stop(p.id) : undefined}
          >
            {inner}
          </a>
        );
      })}
    </div>
  );
}
