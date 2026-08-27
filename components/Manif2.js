"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";

// Manifeste de transition qui ouvre le bloc clair — porté à l'identique de
// index.html. Mécanique rigoureusement identique à celle du manifeste du bloc
// sombre (fondu glissant sur 14 caractères au défilement) ; seules changent la
// variante d'alignement .manif--left et les clés de texte.
export default function Manif2() {
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
    [bigRef.current, subRef.current].forEach((el) => el && wrap(el));
    const chars = [...sec.querySelectorAll(".mch")];
    if (!chars.length) return;

    const FADE = 14;
    let raf = 0;
    const upd = () => {
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
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", upd);
    };
  }, [lang]);

  return (
    <section className="manif manif--left" id="manif2" aria-label="Transition" ref={secRef}>
      <p
        className="manif-big"
        id="manif2-big"
        ref={bigRef}
        dangerouslySetInnerHTML={{ __html: t("tr2.big") }}
      />
      <p
        className="manif-sub"
        id="manif2-sub"
        ref={subRef}
        dangerouslySetInnerHTML={{ __html: t("tr2.sub") }}
      />
    </section>
  );
}
