"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import { SVX, SVX_CATS } from "@/lib/services-data";
import Roll from "@/components/Roll";
import { openCal } from "@/components/CalEmbed";

// Section Services — portée à l'identique de index.html.
// Deux adaptations tactiles (voir CSS) : les cartes s'ouvrent au clic plutôt
// qu'au survol, et elles s'empilent au défilement sur téléphone.
export default function Services() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;

  const [open, setOpen] = useState(false);     // panneau "Services index"
  const [sel, setSel] = useState(() => new Set()); // filtres actifs
  const [touch, setTouch] = useState(false);   // appareil sans survol
  const [active, setActive] = useState(null);  // carte ouverte au clic (tactile)

  useEffect(() => {
    // matchMedia plutôt qu'un test de largeur : c'est l'absence de survol qui
    // compte, pas la taille de l'écran.
    const mq = window.matchMedia("(hover: none)");
    const upd = () => setTouch(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  const fmtD = (d) => {
    const n = lang === "fr" ? String(d).replace(".", ",") : String(d);
    return n + (lang === "fr" ? " jour/s" : " day/s");
  };

  const toggleCat = (c) => {
    setSel((prev) => {
      const next = new Set(prev);
      if (!c) next.clear();
      else if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const cats = [...new Set(SVX.map((s) => s.cat))];
  const rows = SVX.filter((s) => sel.size === 0 || sel.has(s.cat));

  const CARDS = [
    { t: "sv.s1t", d: "sv.s1d", l: "sv.s1l" },
    { t: "sv.s2t", d: "sv.s2d", l: "sv.s2l" },
    { t: "sv.s3t", d: "sv.s3d", l: "sv.s3l" },
  ];

  return (
    <section className="sv2" id="services">
      <div className="sv2-grid">
        {/* data-rv-group : sur téléphone, ce bloc rejoue l'apparition de ses
            data-reveal quand il entre dans l'écran. Les trois cartes sont dans
            sv2-right, donc volontairement hors du groupe : elles ne bougent pas. */}
        <div className="sv2-left" data-rv-group="1">
          <p className="sv2-eyebrow" data-reveal>
            <span className="sv2-flake" aria-hidden="true"></span>
            <span>{t("sv.eyebrow")}</span>
          </p>
          <h2
            className="sv2-title"
            data-reveal
            style={{ "--rd": ".08s" }}
            dangerouslySetInnerHTML={{ __html: t("sv.title") }}
          />
          <p className="sv2-lead" data-reveal style={{ "--rd": ".16s" }}>{t("sv.lead")}</p>
          <a
            className="btnf sv2-cta"
            href="https://cal.com/jimmy-feron/intro-call"
            target="_blank"
            rel="noopener noreferrer"
            onClick={openCal}
            data-reveal
            style={{ "--rd": ".24s" }}
          >
            <Roll text={t("sv.cta")} /> <span className="arr" aria-hidden="true">→</span>
          </a>

          <div className={"svx" + (open ? " open" : "")} id="svx" data-reveal style={{ "--rd": ".3s" }}>
            <button
              className="svx-toggle"
              id="svxToggle"
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="svx-arr" aria-hidden="true">
                <svg viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" /></svg>
              </span>
              <span>{t("svx.toggle")}</span>
            </button>
            <div className="svx-panel">
              <div className="svx-filters" id="svxFilters">
                <button
                  type="button"
                  className={"svx-pill" + (sel.size === 0 ? " on" : "")}
                  onClick={() => toggleCat("")}
                >
                  {t("svx.all")}
                </button>
                {cats.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={"svx-pill" + (sel.has(c) ? " on" : "")}
                    onClick={() => toggleCat(c)}
                  >
                    {SVX_CATS[c][lang] || SVX_CATS[c].fr}
                  </button>
                ))}
              </div>
              <div className="svx-head">
                <span>{t("svx.name")}</span>
                <span>{t("svx.type")}</span>
                <span className="svx-h-time">{t("svx.time")}</span>
              </div>
              <div className="svx-list" id="svxList">
                {rows.map((s, i) => {
                  const nm = s[lang] || s.fr;
                  const subject = encodeURIComponent((lang === "fr" ? "Projet : " : "Project: ") + nm);
                  return (
                    <a
                      key={nm + i}
                      className="svx-row"
                      href={`mailto:jimmyferon08@gmail.com?subject=${subject}`}
                    >
                      <span className="svx-name">{nm}</span>
                      <span className="svx-type">{SVX_CATS[s.cat][lang] || SVX_CATS[s.cat].fr}</span>
                      <span className="svx-time">{fmtD(s.d)}</span>
                      <span className="svx-go">→ {t("svx.go")}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="sv2-right">
          {CARDS.map((c, i) => (
            <article
              key={c.t}
              className={"sv2-card" + (touch && active === i ? " on" : "")}
              data-reveal
              style={{ "--rd": `${0.1 + i * 0.1}s` }}
              // Sans survol possible, la carte s'ouvre au clic
              onClick={touch ? () => setActive((v) => (v === i ? null : i)) : undefined}
            >
              <h3>{t(c.t)}</h3>
              <div className="sv2-body">
                <p className="sv2-desc">{t(c.d)}</p>
                <ul className="sv2-list">
                  {t(c.l).split("|").map((li, j) => (
                    <li key={j}><i aria-hidden="true">{String(j + 1).padStart(2, "0")}</i><span>{li.trim()}</span></li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
