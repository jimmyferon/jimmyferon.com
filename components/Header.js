"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import Roll from "@/components/Roll";
import useMagnetic from "@/lib/useMagnetic";

const NAV = {
  fr: {
    home: "Accueil", work: "Projets", about: "À propos", cta: "Get in touch",
    menu: "Menu", close: "Fermer",
    lblMenu: "Menu", lblSocial: "Réseaux", lblContact: "Contact",
    hook: "Une idée en tête ?",
  },
  en: {
    home: "Home", work: "Work", about: "About", cta: "Get in touch",
    menu: "Menu", close: "Close",
    lblMenu: "Menu", lblSocial: "Social media", lblContact: "Contact",
    hook: "Got an idea in mind?",
  },
};

const LOGO_PATHS = [
  "M70.5042 908.157L-91.9997 796.155L239.558 718.319C239.558 718.319 345.421 693.25 427.851 750.062C510.28 806.875 524.529 914.729 524.529 914.729L569.792 1252.28L407.288 1140.28L354.232 856.876L70.5042 908.157Z",
  "M734.755 1134.45L576.143 1251.89L609.933 913.003C609.933 913.003 620.516 804.728 700.971 745.152C781.427 685.577 888.079 707.042 888.079 707.042L1222.09 773.589L1063.47 891.038L778.17 849.408L734.755 1134.45Z",
  "M1147.97 579.703L1221.53 762.846L902.172 644.515C902.172 644.515 800.085 606.914 762.775 514.015C725.464 421.116 773.184 323.35 773.184 323.35L921.975 16.9999L995.53 200.144L883.155 465.668L1147.97 579.703Z",
  "M716 15L912.429 22.0001L690.843 280.629C690.843 280.629 620.222 363.382 520.151 366.219C420.079 369.056 344.883 290.437 344.883 290.437L109 44.7782L306.283 39.185L516.474 236.545L716 15Z",
  "M53.5349 226.397L109.039 37.0002L286.751 327.53C286.751 327.53 343.699 420.225 315.545 516.296C287.39 612.367 189.417 659.661 189.417 659.661L-117 808.313L-61.4959 618.916L191.054 479.813L53.5349 226.397Z",
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const [compact, setCompact] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useMagnetic([lang]);

  // Scroll : header compact (>70px) + détection du footer noir sous le header (on-dark)
  useEffect(() => {
    // Portage exact de la détection d'index.html : le header passe en sombre
    // quand le wrap noir (#darkwrap, la crête) occupe ~la moitié du header
    // (seuil -140px pondéré par la largeur d'écran), repasse en clair quand le
    // wrap blanc (#lightwrap) le recouvre, et redevient sombre sur le footer.
    const upd = () => {
      const hdrEl = document.querySelector("header");
      const k = Math.max(0.55, Math.min(1, window.innerWidth / 1200));
      const hh = (hdrEl && hdrEl.offsetHeight) || 64;
      let dark = false;
      const dw = document.getElementById("darkwrap");
      if (dw) {
        const r = dw.getBoundingClientRect();
        if (r.height > 0 && r.top <= -140 * k && r.bottom > hh) dark = true;
      }
      const lw = document.getElementById("lightwrap");
      if (lw) {
        const r = lw.getBoundingClientRect();
        if (r.height > 0 && r.top <= -140 * k && r.bottom > hh) dark = false;
      }
      document.querySelectorAll(".site-footer").forEach((f) => {
        const r = f.getBoundingClientRect();
        if (r.height > 0 && r.top <= hh * 0.5 && r.bottom > 0) dark = true;
      });
      setOnDark(dark);
      setCompact((window.scrollY || window.pageYOffset || 0) > 70);
    };
    upd();
    // index.html relance la détection 80 ms après un changement de page
    // (hashchange) : on fait pareil après chaque changement de route, le temps
    // que la mise en page se stabilise.
    const t80 = setTimeout(upd, 80);
    const onScroll = () => requestAnimationFrame(upd);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", upd);
    return () => {
      clearTimeout(t80);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", upd);
    };
  }, [pathname]);

  // Menu ouvert : la page reste scrollable (comme les références).
  // Fermeture : Échap ou clic en dehors du header (le menu est DANS le header).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    const onClick = (e) => {
      if (!e.target.closest("header")) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [menuOpen]);

  // Sécurité : on ferme le menu quand on repasse en desktop (redimensionnement).
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const t = NAV[lang];
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const go = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    // Logo/Accueil : si déjà sur home, on remonte simplement en haut
    if (href === "/" && pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (pathname === href) return;
    if (typeof window !== "undefined" && window.__doVeil) window.__doVeil(() => router.push(href));
    else router.push(href);
  };

  const cls = [compact ? "compact" : "", onDark ? "on-dark" : "", menuOpen ? "menu-open" : ""].filter(Boolean).join(" ");

  return (
    <header className={cls}>
      <nav>
        <div className="nav-logo">
          <a href="/" className="logo" aria-label="Accueil — Jimmy Feron" onClick={(e) => go(e, "/")}>
            <svg viewBox="0 0 1140 1140" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip_logo)">
                {LOGO_PATHS.map((d, i) => <path key={i} d={d} />)}
              </g>
              <defs>
                <clipPath id="clip_logo"><rect width="1140" height="1140" rx="570" /></clipPath>
              </defs>
            </svg>
          </a>
        </div>

        <div className={"nav-mid" + (menuOpen ? " open" : "")} id="menu">
          <a href="/" className="roll" data-active={isActive("/")} onClick={(e) => go(e, "/")}><Roll text={t.home} /></a>
          <a href="/work" className="roll" data-active={isActive("/work")} onClick={(e) => go(e, "/work")}><Roll text={t.work} /></a>
          <a href="/about" className="roll" data-active={isActive("/about")} onClick={(e) => go(e, "/about")}><Roll text={t.about} /></a>
        </div>

        <div className="lang" id="lang">
          <button className="lang-trigger" aria-haspopup="true">
            {lang.toUpperCase()}{" "}
            <span className="arr" aria-hidden="true"><svg viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" /></svg></span>
          </button>
          <div className="lang-menu">
            <button className={lang === "fr" ? "on" : ""} onClick={() => setLang("fr")}>FR</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
        </div>

        <a href="https://www.linkedin.com/in/jimmyferon/" target="_blank" rel="noopener noreferrer" className="cta nav-cta">
          <Roll text={t.cta} />{" "}
          <span className="cta-arr" aria-hidden="true">↗</span>
        </a>

        <button
          className={"menu-btn" + (menuOpen ? " open" : "")}
          aria-expanded={menuOpen}
          aria-controls="hx"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="flake" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              {/* 3 axes : toujours visibles */}
              <g strokeWidth="2.6">
                <path d="M12 2.4v19.2" />
                <path d="M3.7 7.2l16.6 9.6" />
                <path d="M20.3 7.2L3.7 16.8" />
              </g>
              {/* branches : apparaissent à l'ouverture = vrai flocon */}
              <g className="fdetail" strokeWidth="2.2">
                <path d="M9.7 3.6L12 5.5l2.3-1.9" />
                <path d="M9.7 20.4L12 18.5l2.3 1.9" />
                <path d="M6.6 6.3L6.6 8.9 4.35 10.2" />
                <path d="M17.4 17.7L17.4 15.1 19.65 13.8" />
                <path d="M17.4 6.3L17.4 8.9 19.65 10.2" />
                <path d="M6.6 17.7L6.6 15.1 4.35 13.8" />
              </g>
            </svg>
          </span>
          {menuOpen ? t.close : t.menu}
        </button>
      </nav>

      {/* ===== Extension du header : le bloc s'agrandit (pas de panneau séparé) ===== */}
      <div className="hx" id="hx" aria-hidden={!menuOpen}>
        <div className="hx-in">
          <div className="hx-body">
            <div className="hx-grid">
              <div className="hx-colL">
                <p className="hx-label">{t.lblMenu}</p>
                {/* Volontairement une div, pas une balise nav : évite d'hériter
                    de la règle globale du header (hauteur 64px, centrage,
                    padding 56px) qui écrasait la mise en page du menu. */}
                <div className="hx-nav" role="navigation" aria-label={t.lblMenu}>
                  <a href="/" onClick={(e) => go(e, "/")}>{t.home}</a>
                  <a href="/work" onClick={(e) => go(e, "/work")}>{t.work}</a>
                  <a href="/about" onClick={(e) => go(e, "/about")}>{t.about}</a>
                </div>
              </div>

              <div className="hx-colR">
                <p className="hx-label">{t.lblSocial}</p>
                <div className="hx-links">
                  <a href="https://www.linkedin.com/in/jimmyferon/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <a href="https://instagram.com/jimmy.ocks" target="_blank" rel="noopener noreferrer">Instagram</a>
                  <a href="https://x.com/Sh0ocks" target="_blank" rel="noopener noreferrer">X</a>
                  <a href="https://www.malt.fr/profile/jimmyferon1" target="_blank" rel="noopener noreferrer">Malt</a>
                </div>
              </div>
            </div>

            <div className="hx-bot">
              <div className="hx-lang">
                <button className={lang === "fr" ? "on" : ""} onClick={() => setLang("fr")}>FR</button>
                <span aria-hidden="true">/</span>
                <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
              </div>
              <div className="hx-contact">
                <p className="hx-label">{t.lblContact}</p>
                <p className="hx-hook">{t.hook}</p>
                <a className="hx-mail" href="mailto:jimmyferon08@gmail.com">jimmyferon08@gmail.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
