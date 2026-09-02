"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";

// Manifeste — porté à l'identique de index.html.
// Chaque caractère est enveloppé dans un span.mch, dont l'opacité passe de .1 à 1
// au fil du défilement (fondu glissant sur 14 caractères, comme l'original).
export default function Manif() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  const secRef = useRef(null);
  const bigRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;

    // Découpe en caractères : on parcourt l'arbre pour préserver la balise accentuée
    const wrap = (node) => {
      [...node.childNodes].forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const c of ch.textContent) {
            const sp = document.createElement("span");
            sp.className = "mch";
            sp.textContent = c;
            frag.appendChild(sp);
          }
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && !ch.classList.contains("mch")) {
          wrap(ch);
        }
      });
    };
    /* Le texte est posé par innerHTML puis découpé en spans : si React
       réécrit ce texte (changement de langue, nouveau rendu), les spans que
       l'on tenait sont détachés et plus rien ne s'anime. On vérifie donc à
       chaque mise à jour qu'ils sont toujours dans la page, et on redécoupe
       sinon. Un observateur relance la découpe dès qu'un tel remplacement a
       lieu, sans attendre le prochain défilement. */
    let chars = [];
    const collect = () => {
      [bigRef.current, subRef.current].forEach((el) => el && wrap(el));
      chars = [...sec.querySelectorAll(".mch")];
    };
    collect();
    const alive = () => chars.length && chars[0].isConnected;
    const mo = new MutationObserver(() => { if (!alive()) { collect(); upd(); } });
    mo.observe(sec, { childList: true, subtree: true });

    const FADE = 14;
    let raf = 0;
    const upd = () => {
      if (!alive()) collect();
      if (!chars.length) return;
      const vh = innerHeight || 800, start = vh - 120;
      const r = sec.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const p = Math.max(0, Math.min(1, (start - r.top) / (vh * 0.5 + r.height * 0.5 - 120)));
      const front = p * (chars.length + FADE);
      for (let i = 0; i < chars.length; i++) {
        const k = Math.max(0, Math.min(1, (front - i) / FADE));
        chars[i].style.opacity = (0.1 + 0.9 * k).toFixed(3);
      }
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", upd);
    upd();
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", upd);
    };
  }, [lang]);

  return (
    <section className="manif" id="manif" aria-label="Manifeste" ref={secRef}>
      <p
        className="manif-big"
        id="manif-big"
        ref={bigRef}
        dangerouslySetInnerHTML={{ __html: t("mn.big") }}
      />
      <p
        className="manif-sub"
        id="manif-sub"
        ref={subRef}
        dangerouslySetInnerHTML={{ __html: t("mn.sub") }}
      />
    </section>
  );
}
