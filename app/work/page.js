"use client";

import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import WorkIndex from "@/components/WorkIndex";
import Footer from "@/components/Footer";

export default function WorkPage() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;

  return (
    <section className="page active" data-page="work">
      {/* Bandes de verre : le contenu qui entre et sort du cadre passe
          derrière elles et s'y trouble. Purement décoratives, masquées
          sous 1025px (voir section 15 du CSS). */}
      <div className="px-glass px-glass--top" aria-hidden="true"></div>
      <div className="px-glass px-glass--bot" aria-hidden="true"></div>

      <div className="px">
        {/* Le bloc de tête du wireframe est un label court et centré : il
            porte le h1 de la page plutôt que d'en ajouter un second. */}
        <div className="px-intro">
          <h1 className="sv2-eyebrow px-h1">
            <span className="sv2-flake" aria-hidden="true"></span>
            <span>{t("wk.eyebrow")}</span>
          </h1>
        </div>
        <WorkIndex />
      </div>

      <footer className="site-footer"><Footer uid="foot-work" /></footer>
    </section>
  );
}
