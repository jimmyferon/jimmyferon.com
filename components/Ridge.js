"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Crête de transition : amplitude qui grandit au scroll.
// Portage verbatim du bloc d'index.html. Au repos la découpe est une ligne
// PLATE à 385px du haut du wrap ; à mesure que le bloc entre dans l'écran les
// sept sommets se déploient vers leur amplitude réelle (262 / 150 / 278 / 0 /
// 270 / 142 / 236 px), avec une sortie en ease-out. Tout est mis à l'échelle
// par k = largeur/1200, borné entre 0.55 et 1.
//
// Sans ce code la crête reste figée à son amplitude finale : elle ne bouge pas
// au scroll, et le sommet central se retrouve 385px trop haut par rapport au
// site d'origine.
export default function Ridge() {
  const pathname = usePathname();

  useEffect(() => {
    const wraps = [
      document.getElementById("darkwrap"),
      document.getElementById("lightwrap"),
    ].filter(Boolean);
    if (!wraps.length) return;

    const PTS = [[0, 262], [16, 150], [32, 278], [61, 0], [78, 270], [89, 142], [100, 236]];
    const FLAT = 385;

    const upd = () => {
      const vh = window.innerHeight || 800;
      const k = Math.max(0.55, Math.min(1, window.innerWidth / 1200));
      // Sur desktop, le réglage d'index.html au caractère près.
      // Sur téléphone il fallait scroller bien trop loin avant de voir la
      // crête bouger : l'écran est court, et attendre que le haut du wrap
      // arrive à 375px du bas repoussait tout le déploiement en fin de course.
      // On démarre donc plus tôt, sur une course plus courte, pour que la
      // crête se dessine pendant qu'elle traverse l'écran.
      const mob = window.innerWidth <= 760;
      const RUN = mob ? Math.max(200, vh * 0.75) : Math.max(200, vh * 1.3 - 375);
      wraps.forEach((w) => {
        // Les deux crêtes n'arrivent pas dans les mêmes conditions sur
        // téléphone : la noire est précédée d'un bloc clair très court, la
        // blanche d'une longue ascension. Elles ont donc leur propre amorce.
        // Repère : au moment où la première bande de fond devient visible, la
        // noire est déployée à 47 % et la blanche à 74 %.
        const START = mob ? (w.id === "darkwrap" ? 40 : -98) : 375;
        const r = w.getBoundingClientRect();
        let p = (vh - START - r.top) / RUN;
        p = Math.max(0, Math.min(1, p));
        const e = 1 - Math.pow(1 - p, 2);
        const poly =
          "polygon(" +
          PTS.map((pt) => pt[0] + "% " + ((FLAT + (pt[1] - FLAT) * e) * k).toFixed(1) + "px").join(",") +
          ",100% 100%,0% 100%)";
        w.style.clipPath = poly;
        w.style.webkitClipPath = poly;
      });
    };

    const onScroll = () => requestAnimationFrame(upd);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", upd);
    upd();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", upd);
    };
  }, [pathname]);

  return null;
}
