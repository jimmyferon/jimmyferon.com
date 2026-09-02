"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import Everest from "@/components/Everest";
import Manif from "@/components/Manif";
import Services from "@/components/Services";
import ClientWork from "@/components/ClientWork";
import Benefits from "@/components/Benefits";
import Manif2 from "@/components/Manif2";
import About from "@/components/About";
import Faq from "@/components/Faq";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import { openCal } from "@/components/CalEmbed";

// Un span par caractère : c'est ce qu'exige le grain de .m-acc (voir index.html).
const grain = (txt) =>
  txt.split("").map((c, i) => (
    <span className="mch" key={i}>{c === " " ? "\u00A0" : c}</span>
  ));

// Page d'accueil — hero repris à l'identique de index.html.
export default function Home() {
  const { lang } = useLang();

  // Le hero desktop montre le massif de l'Everest, tablette et téléphone
  // gardent le carrousel. Le choix n'est fait qu'une fois dans le navigateur :
  // les deux ne sont jamais montés en même temps, et le rendu serveur reste
  // identique dans les deux cas.
  const [wide, setWide] = useState(null);
  useEffect(() => {
    /* Au-dessus de 1024 px : le massif. En dessous, tablette et téléphone
       partagent la colonne de projets. Le critère est la largeur seule :
       tester le pointeur excluait l'aperçu « responsive » des outils de
       développement, qui simule un écran tactile. */
    const mq = window.matchMedia("(min-width:1025px)");
    const upd = () => setWide(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;

  return (
    <section className="page active" id="home" data-page="home">
      <div className="hero">
        <div className="home-glow"></div>

        {/* Bloc haut du hero — téléphone uniquement (masqué au-dessus de 760px) */}
        {/* Les mots accentués reprennent le grain gris de "du concept au sommet",
            qui exige un span par caractère (comme dans index.html). */}
        <h1
          className="hero-mtitle"
          data-reveal
          style={{ "--rd": ".25s" }}
          aria-label={t("hero.mt0") + ". " + t("hero.mtA") + t("hero.mtB") + t("hero.mtC") + t("hero.mtD")}
        >
          <span aria-hidden="true">{t("hero.mt0")}</span>
          <br aria-hidden="true" />
          <span aria-hidden="true">{t("hero.mtA")}</span>
          <em className="m-acc" aria-hidden="true">{grain(t("hero.mtB"))}</em>
          <span aria-hidden="true">{t("hero.mtC")}</span>
          {/* En anglais la phrase est plus courte et ne tenait que sur 3 lignes,
              ce qui remontait tout le bloc : on descend "altitude" pour garder
              les 4 lignes du français. */}
          {lang === "en" && <br aria-hidden="true" />}
          <em className="m-acc" aria-hidden="true">{grain(t("hero.mtD"))}</em>
        </h1>

        {/* Ligne d'infos : remplace le bloc Rôle / Base / Statut, trop haut ici */}
        <p className="hero-meyebrow" data-reveal style={{ "--rd": ".7s" }}>
          <span>{t("home.role")}</span>
          <span aria-hidden="true">·</span>
          <span>{t("home.base")}</span>
          <span aria-hidden="true">·</span>
          <span>{t("hero.mstatus")}</span>
        </p>

        <div className="hero-mcta" data-reveal style={{ "--rd": "1.05s" }}>
          <a
            className="btnf btnf-ink"
            href="https://cal.com/jimmy-feron/intro-call"
            target="_blank"
            rel="noopener noreferrer"
            onClick={openCal}
          >
            {t("lt.cta")} <span className="arr" aria-hidden="true">→</span>
          </a>
          <a
            className="btnf btnf-blue"
            href="https://www.linkedin.com/in/jimmyferon/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("cta.together")} <span className="arr" aria-hidden="true">↗</span>
          </a>
        </div>

        {/* Scène de l'ascension : pleine largeur, du bas du header jusqu'au
            filet de .hb-grid. Elle passe sous les textes du hero, qui restent
            au-dessus. */}
        {wide === true && <Everest />}

        <div className="home-mid" data-reveal style={{ "--rd": ".15s" }}>
          {wide === false && <Carousel />}
        </div>

        {/* Invitation à faire défiler, sous le carrousel (téléphone) */}
        <div className="hero-mscroll" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        <div className="home-bottom">
          <div className="hb-top">
            <div className="home-msg">
              <div className="nm" data-reveal style={{ "--rd": ".3s" }}>Jimmy Feron</div>
              <p
                data-reveal
                style={{ "--rd": ".4s" }}
                dangerouslySetInnerHTML={{ __html: t("home.blurb") }}
              />
            </div>
            {/* Version d'origine, conservée pour la tablette (masquée sur grand
                écran, où elle rejoint la grille du dessous). */}
            <div className="hero-scroll" data-reveal style={{ "--rd": ".5s" }}>
              <span>{t("hero.scroll")}</span>
            </div>
          </div>

          <div className="hb-grid" data-reveal style={{ "--rd": ".58s" }}>
            <div className="hb-cell">
              <span className="hb-lbl">{t("hero.lblRole")}</span>
              <span className="hb-val">{t("home.role")}</span>
            </div>
            <div className="hb-cell">
              <span className="hb-lbl">{t("hero.lblBase")}</span>
              <span className="hb-val">{t("home.base")}</span>
            </div>
            <div className="hb-cell">
              <span className="hb-lbl">{t("hero.lblStatus")}</span>
              <span className="hb-val"><i className="dot"></i><span>{t("home.status")}</span></span>
            </div>
            {/* Sur grand écran, l'invitation à faire défiler rejoint cette ligne
                en quatrième colonne, calée à droite sur la marge du site :
                même élément, même trait qui bat qu'à l'origine. */}
            <div className="hero-scroll hero-scroll-grid" aria-hidden="true">
              <span>{t("hero.scroll")}</span>
            </div>
          </div>
        </div>
      </div>

      <Manif />

      {/* Structure reprise telle quelle de index.html : la section Services et
          le bloc pinzone2 (fond noir puis retour au fond clair) vivent dans un
          même conteneur .pinzone, et les deux wraps se chevauchent par marges
          négatives pour découper les crêtes. */}
      <div className="pinzone">
        <Services />

        <div className="pinzone2">
          <div className="dark-wrap" id="darkwrap">
            <ClientWork />
            <Benefits />
          </div>

          {/* Retour au fond clair : même crête en sens inverse, puis les trois
              sections du bloc clair, dans l'ordre d'index.html. */}
          <div className="light-wrap" id="lightwrap">
            <Manif2 />
            <About />
            <Faq />
          </div>
        </div>
      </div>

      <footer className="site-footer"><Footer uid="foot-home" /></footer>
    </section>
  );
}
