"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import Roll from "@/components/Roll";
import useMagnetic from "@/lib/useMagnetic";
import Lake3D from "@/components/Lake3D";

const LOGO_PATHS = [
  "M70.5042 908.157L-91.9997 796.155L239.558 718.319C239.558 718.319 345.421 693.25 427.851 750.062C510.28 806.875 524.529 914.729 524.529 914.729L569.792 1252.28L407.288 1140.28L354.232 856.876L70.5042 908.157Z",
  "M734.755 1134.45L576.143 1251.89L609.933 913.003C609.933 913.003 620.516 804.728 700.971 745.152C781.427 685.577 888.079 707.042 888.079 707.042L1222.09 773.589L1063.47 891.038L778.17 849.408L734.755 1134.45Z",
  "M1147.97 579.703L1221.53 762.846L902.172 644.515C902.172 644.515 800.085 606.914 762.775 514.015C725.464 421.116 773.184 323.35 773.184 323.35L921.975 16.9999L995.53 200.144L883.155 465.668L1147.97 579.703Z",
  "M716 15L912.429 22.0001L690.843 280.629C690.843 280.629 620.222 363.382 520.151 366.219C420.079 369.056 344.883 290.437 344.883 290.437L109 44.7782L306.283 39.185L516.474 236.545L716 15Z",
  "M53.5349 226.397L109.039 37.0002L286.751 327.53C286.751 327.53 343.699 420.225 315.545 516.296C287.39 612.367 189.417 659.661 189.417 659.661L-117 808.313L-61.4959 618.916L191.054 479.813L53.5349 226.397Z",
];

function LogoSvg({ cid }) {
  return (
    <svg viewBox="0 0 1140 1140" xmlns="http://www.w3.org/2000/svg">
      <g clipPath={`url(#${cid})`}>
        {LOGO_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
      <defs><clipPath id={cid}><rect width="1140" height="1140" rx="570" /></clipPath></defs>
    </svg>
  );
}

// Porte footerHTML() : Let's talk + colonnes + CTAs + crête + bas de page.
// (Le lac 3D sera ajouté en Livraison B ; ici on garde la crête foot-ridge.)
export default function Footer({ uid = "foot" }) {
  const router = useRouter();

  // Le lac n'existe que sur desktop réel : sous 1400px on ne le monte pas du
  // tout, pour ne charger ni Three.js ni sa boucle d'animation (le CSS le
  // masque aussi, mais autant ne rien exécuter sur tablette et téléphone).
  const [showLake, setShowLake] = useState(false);
  useEffect(() => {
    const check = () => setShowLake(window.innerWidth >= 1400);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  useMagnetic([lang]);

  const go = (e, href) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.__doVeil) window.__doVeil(() => router.push(href));
    else router.push(href);
  };

  // Lets talk : révélation caractère par caractère, exactement comme les deux
  // manifestes. index.html traite les trois blocs dans la même boucle
  // (buildManif : manif, manif2, letstalk) — c'est la même mécanique, pas une
  // animation à part.
  const ltRef = useRef(null);
  const bigRef = useRef(null);
  useEffect(() => {
    const sec = ltRef.current, big = bigRef.current;
    if (!sec || !big) return;

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
    wrap(big);
    const chars = [...sec.querySelectorAll(".mch")];
    if (!chars.length) return;

    const FADE = 14;
    let raf = 0;
    const upd = () => {
      const vh = window.innerHeight || 800, start = vh - 120;
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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", upd);
    upd();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", upd);
    };
  }, [lang]);

  return (
    <div className="foot-dark">
      {/* ===== Let's talk + lac d'Allos 3D ===== */}
      <div className="lt" id="letstalk" ref={ltRef}>
        <p className="lt-eyebrow" data-rv><span className="sv2-flake" aria-hidden="true"></span><span>{t("lt.eyebrow")}</span></p>
        {/* Pas de data-rv sur .lt-inner : le titre a sa propre révélation
            lettre par lettre, un fondu de bloc par-dessus l'écraserait. */}
        <div className="lt-inner">
          <p className="lt-big" ref={bigRef}>{t("lt.big")}</p>
          <a className="btnf btnf-ghost lt-cta" data-rv style={{ "--rvd": "120ms" }} href="https://cal.com/jimmy-feron/intro-call" target="_blank" rel="noopener noreferrer">
            <Roll text={t("lt.cta")} /> <span className="arr" aria-hidden="true">→</span>
          </a>
        </div>
        {showLake && <Lake3D />}
        <p className="lt-alt" data-rv style={{ "--rvd": "180ms" }} dangerouslySetInnerHTML={{ __html: t("lt.alt") }} />
      </div>

      {/* ===== Footer body ===== */}
      <div className="foot-body">
        <div className="foot-glow"></div>
        <div className="foot-pad">
          <div className="foot-top" data-rv>
            <a href="/" className="foot-logo" aria-label="Jimmy Feron" onClick={(e) => go(e, "/")}>
              <LogoSvg cid={`clip_${uid}`} />
            </a>
            <div className="foot-cols">
              <div className="foot-col">
                <h4>{t("foot.menu")}</h4>
                <a href="/" onClick={(e) => go(e, "/")}>{t("nav.home")} <span aria-hidden="true">↗</span></a>
                <a href="/work" onClick={(e) => go(e, "/work")}>{t("nav.work")} <span aria-hidden="true">↗</span></a>
                <a href="/about" onClick={(e) => go(e, "/about")}>{t("foot.about")} <span aria-hidden="true">↗</span></a>
                <div className="menu-logo" aria-hidden="true"><LogoSvg cid={`clip_menu_${uid}`} /></div>
              </div>
              <div className="foot-col">
                <h4>{t("foot.connect")}</h4>
                <a href="https://www.linkedin.com/in/jimmyferon/" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
                <a href="https://instagram.com/jimmy.ocks" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
                <a href="https://x.com/Sh0ocks" target="_blank" rel="noopener noreferrer">X <span aria-hidden="true">↗</span></a>
                <a href="https://www.malt.fr/profile/jimmyferon1" target="_blank" rel="noopener noreferrer">Malt <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>
          <div className="foot-mid" data-rv style={{ "--rvd": "90ms" }}>
            <p className="f-hook">{t("foot.hook")}</p>
            <a className="f-mail" href="mailto:jimmyferon08@gmail.com">jimmyferon08@gmail.com</a>
            <div className="foot-cta-row">
              <div className="foot-cta-pair">
                <a className="btnf btnf-blue" href="https://www.linkedin.com/in/jimmyferon/" target="_blank" rel="noopener noreferrer"><Roll text={t("cta.together")} /> <span className="arr" aria-hidden="true">↗</span></a>
                <a className="btnf btnf-ghost" href="/about" onClick={(e) => go(e, "/about")}><Roll text={t("foot.about")} /> <span className="arr" aria-hidden="true">→</span></a>
              </div>
              <div className="foot-figma"><span className="fmark"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M336,176a80,80,0,0,0,0-160H176a80,80,0,0,0,0,160,80,80,0,0,0,0,160,80,80,0,1,0,80,80V176Z" /><circle cx="336" cy="256" r="80" /></svg></span><span>Figma® <b>Expert</b></span></div>
            </div>
          </div>
          <div className="foot-ridge" aria-hidden="true" data-rv style={{ "--rvd": "140ms" }}>
            <svg className="ridge" viewBox="0 0 1200 170" preserveAspectRatio="none">
              <polyline points="0,150 90,128 168,142 268,76 352,122 436,98 540,50 624,116 718,72 806,108 912,26 1006,120 1098,94 1200,134" />
              <text x="514" y="40" className="peak">+3 700</text>
              <text x="884" y="16" className="peak">+4 810</text>
              <text x="244" y="66" className="peak">+2 460</text>
            </svg>
          </div>
          <div className="foot-bot" data-rv style={{ "--rvd": "190ms" }}>
            <span className="foot-copy">{t("foot.copy")}</span>
            <span className="foot-loc">{t("foot.loc")}</span>
            <button className="foot-topbtn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>{t("foot.top")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
