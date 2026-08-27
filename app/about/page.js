"use client";

import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import LogoReveal from "@/components/LogoReveal";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;

  return (
    <section className="page active" data-page="about">
      <div className="wrap sec uc">
        <p className="uc-eyebrow" data-rv>
          <span className="sv2-flake" aria-hidden="true"></span>
          <span>{t("uc.eyebrow")}</span>
        </p>
        <h2 className="uc-title" data-rv style={{ "--rvd": "90ms" }}>{t("uc.title")}</h2>
        <p className="uc-sub" data-rv style={{ "--rvd": "180ms" }}>{t("uc.aboutsub")}</p>
        <LogoReveal />
      </div>
      <footer className="site-footer"><Footer uid="foot-about" /></footer>
    </section>
  );
}
