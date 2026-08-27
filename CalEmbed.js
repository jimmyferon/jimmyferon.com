"use client";

import { useEffect } from "react";

export const CAL_LINK = "jimmy-feron/intro-call";

/**
 * Ouvre la réservation dans une modale plutôt que dans un nouvel onglet.
 *
 * Si l'embed n'a pas encore été chargé — connexion lente, bloqueur de scripts —
 * on ne fait rien et le lien reprend son cours normal vers cal.com. Le bouton
 * garde donc toujours son href : la modale est un confort, pas une dépendance.
 */
export function openCal(e, link = CAL_LINK) {
  if (typeof window === "undefined" || typeof window.Cal !== "function") return;
  e.preventDefault();
  window.Cal("modal", {
    calLink: link,
    config: { theme: "dark", layout: "month_view" },
  });
}

/**
 * Installe l'amorce officielle de cal.com puis configure l'apparence.
 * L'amorce met les appels en file d'attente : un clic passé avant la fin du
 * chargement d'embed.js ouvre quand même la modale, une seule fois.
 */
export default function CalEmbed() {
  useEffect(() => {
    if (typeof window.Cal === "function") return;

    (function (C, A, L) {
      const p = function (a, ar) { a.q.push(ar); };
      const d = C.document;
      C.Cal =
        C.Cal ||
        function () {
          const cal = C.Cal;
          const ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () { p(api, arguments); };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else {
              p(cal, ar);
            }
            return;
          }
          p(cal, ar);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    window.Cal("init", { origin: "https://cal.com" });
    window.Cal("ui", {
      theme: "dark",
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }, []);

  return null;
}
