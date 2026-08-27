"use client";

import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import Roll from "@/components/Roll";
import Footer from "@/components/Footer";
import useMagnetic from "@/lib/useMagnetic";

export default function WorkPage() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  useMagnetic([lang]);
  const cvHref = lang === "en" ? "/cv/jimmy-feron-cv-en.pdf" : "/cv/jimmy-feron-cv-fr.pdf";

  return (
    <section className="page active" data-page="work">
      <div className="wrap sec uc">
        <p className="uc-eyebrow" data-rv>
          <span className="sv2-flake" aria-hidden="true"></span>
          <span>{t("uc.eyebrow")}</span>
        </p>
        <h2 className="uc-title" data-rv style={{ "--rvd": "90ms" }}>{t("uc.title")}</h2>
        <p className="uc-sub" data-rv style={{ "--rvd": "180ms" }}>{t("uc.sub")}</p>
        <svg className="uc-art" viewBox="0 0 520 240" aria-hidden="true" data-rv style={{ "--rvd": "260ms" }}>
          <path className="uc-line" d="M10 210 L90 150 L150 196 L230 96 L310 186 L376 132 L440 190 L510 160" />
          <path className="uc-line" d="M60 214 C120 198,200 210,300 206 C380 202,440 212,470 210" opacity=".45" />
          <g>
            <path className="uc-line" d="M402 206 v-64" />
            <rect className="uc-line" x="372" y="118" width="60" height="34" rx="3" />
            <path className="uc-line" d="M378 146 L426 124" style={{ stroke: "#1E29FF" }} />
          </g>
          <circle cx="120" cy="80" r="1.6" fill="rgba(17,17,17,.4)" />
          <circle cx="200" cy="52" r="1.4" fill="rgba(17,17,17,.35)" />
          <circle cx="330" cy="70" r="1.6" fill="rgba(17,17,17,.4)" />
          <circle cx="428" cy="60" r="1.3" fill="rgba(17,17,17,.3)" />
        </svg>
        <div className="uc-cv" data-rv style={{ "--rvd": "320ms" }}>
          <p>{t("uc.cvline")}</p>
          <a className="btnf btn-ink cv-link" href={cvHref} target="_blank" rel="noopener noreferrer">
            <Roll text={t("uc.cta")} /> <span className="arr" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <footer className="site-footer"><Footer uid="foot-work" /></footer>
    </section>
  );
}
