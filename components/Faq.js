"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";

// FAQ — markup, classes et comportement repris de index.html.
// L'ouverture est un clic volontaire dans la page : elle reste active partout,
// y compris sur téléphone. index.html anime la hauteur en écrivant maxHeight
// depuis scrollHeight ; on fait pareil, et on recalcule après un changement de
// langue puisque la réponse traduite n'a pas la même hauteur.
export default function Faq() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  const [open, setOpen] = useState(null);
  const listRef = useRef(null);

  const N = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.querySelectorAll(".fq-item").forEach((it) => {
      const a = it.querySelector(".fq-a");
      if (!a) return;
      a.style.maxHeight = it.classList.contains("open") ? a.scrollHeight + "px" : "0px";
    });
  }, [open, lang]);

  return (
    <section className="fq" id="faq" data-rv-group="1">
      <p className="sv2-eyebrow" data-reveal>
        <span className="sv2-flake" aria-hidden="true"></span>
        <span>{t("fq.eyebrow")}</span>
      </p>
      <h2 className="fq-title" data-reveal style={{ "--rd": ".08s" }}>{t("fq.title")}</h2>

      <div className="fq-list" ref={listRef} data-reveal style={{ "--rd": ".16s" }}>
        {N.map((n) => {
          const isOpen = open === n;
          return (
            <div className={"fq-item" + (isOpen ? " open" : "")} key={n}>
              <button
                type="button"
                className="fq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen((v) => (v === n ? null : n))}
              >
                <i>{String(n).padStart(2, "0")}</i>
                <span>{t("fq.q" + n)}</span>
                <span className="fq-x" aria-hidden="true">{isOpen ? "\u2212" : "+"}</span>
              </button>
              <div className="fq-a">
                <p>{t("fq.a" + n)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
