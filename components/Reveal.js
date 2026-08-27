"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reveal au scroll : les éléments marqués [data-rv] montent en fondu quand ils
// entrent dans le viewport. Actif uniquement sous 1024px (le CSS ne masque les
// éléments qu'à cette taille) ; sur desktop tout reste visible.
// Robuste : si pas d'IntersectionObserver ou reduced-motion, on révèle tout ;
// et un filet de sécurité révèle tout après 1,8 s au cas où.
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    let io = null;
    let fallback = null;

    // On laisse le DOM de la nouvelle page se monter avant d'observer.
    const id = requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll("[data-rv]"));
      if (!els.length) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || typeof IntersectionObserver === "undefined") {
        els.forEach((el) => el.classList.add("rv-in"));
        return;
      }

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("rv-in");
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
      );

      els.forEach((el) => {
        el.classList.remove("rv-in");
        io.observe(el);
      });

      fallback = setTimeout(() => {
        els.forEach((el) => el.classList.add("rv-in"));
      }, 1800);
    });

    return () => {
      cancelAnimationFrame(id);
      if (io) io.disconnect();
      if (fallback) clearTimeout(fallback);
    };
  }, [pathname]);

  // Portage exact du "reveal on scroll" d'index.html : les éléments .reveal
  // (Client work, Benefits, About…) montent en fondu dès que leur haut passe
  // sous 92 % de la hauteur de fenêtre. Même seuil, mêmes déclencheurs
  // (scroll, resize, load) et même relance à 30 ms que l'original — index.html
  // la fait après chaque changement de page, ici après chaque changement de
  // route. Actif à toutes les tailles d'écran, comme dans index.html.
  useEffect(() => {
    const revealInView = () => {
      const vh = window.innerHeight;
      document.querySelectorAll(".reveal").forEach((el) => {
        if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("in");
      });
    };
    const t = setTimeout(revealInView, 30);
    window.addEventListener("scroll", revealInView, { passive: true });
    window.addEventListener("resize", revealInView);
    window.addEventListener("load", revealInView);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", revealInView);
      window.removeEventListener("resize", revealInView);
      window.removeEventListener("load", revealInView);
    };
  }, [pathname]);

  // Révélation au scroll, version téléphone.
  // Les éléments marqués data-reveal apparaissent normalement d'un bloc à la
  // fin du préchargement (body.pre-done). Sur un écran de téléphone, une
  // section est loin sous la ligne de flottaison : quand on y arrive, son
  // animation est terminée depuis longtemps et rien ne bouge.
  // Un conteneur marqué data-rv-group rejoue donc l'apparition de ses
  // data-reveal quand il entre dans l'écran, en gardant les délais --rd déjà
  // posés dans le markup. Pour une nouvelle section : poser l'attribut sur le
  // bloc à animer, rien d'autre à brancher.
  useEffect(() => {
    const groups = Array.from(document.querySelectorAll("[data-rv-group]"));
    if (!groups.length) return;
    // On observe le bloc entier : tous ses éléments partent ensemble, décalés
    // par les délais --rd déjà posés dans le markup. C'est ce rendu d'ensemble
    // qui a été retenu, plutôt qu'un déclenchement élément par élément.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("rv");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.1 }
    );
    groups.forEach((g) => io.observe(g));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
