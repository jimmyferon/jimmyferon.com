"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import Roll from "@/components/Roll";

// Aperçu À propos — markup et classes repris de index.html.
//
// L'illustration de gauche porte deux effets : une couche de neige animée, et
// une loupe liquide qui suit le curseur. Les deux sont rendus par un canvas.
// Sur un appareil tactile il n'y a pas de curseur : la loupe n'aurait aucun
// sens et le canvas tournerait à l'image pour rien. On retombe donc sur
// l'image simple, la neige étant assurée par le calque CSS d'origine.
export default function About() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  const router = useRouter();
  const figRef = useRef(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover:hover) and (pointer:fine)");
    const upd = () => setFine(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  // Neige + loupe : portage verbatim d'index.html, monté seulement au pointeur fin.
  useEffect(() => {
    if (!fine) return;
    const fig = figRef.current;
    if (!fig) return;
    const base = fig.querySelector("img");
    if (!base) return;

    const snow = new Image();
    snow.src = "/images/pixels.png";
    const cv = document.createElement("canvas");
    cv.className = "ab-snowc";
    const ctx = cv.getContext("2d");
    const off = document.createElement("canvas"), octx = off.getContext("2d");
    let W = 0, H = 0, mx = -999, my = -999, tx = -999, ty = -999, hov = 0, hovT = 0;
    let vis = false, ready = false, raf = 0, stopped = false;
    const T = 64;

    const size = () => {
      const r = fig.getBoundingClientRect();
      W = Math.max(2, Math.round(r.width)); H = Math.max(2, Math.round(r.height));
      cv.width = W; cv.height = H; off.width = W; off.height = H;
    };
    const mount = () => {
      if (ready || !snow.complete || !snow.naturalWidth || !base.complete || !base.naturalWidth) return;
      ready = true; fig.appendChild(cv); fig.classList.add("has-snowc"); size();
    };
    snow.onload = mount;
    if (base.complete) mount(); else base.addEventListener("load", mount);

    const onEnter = () => { hovT = 1; };
    const onLeave = () => { hovT = 0; };
    const onMove = (e) => { const r = fig.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; };
    window.addEventListener("resize", size);
    fig.addEventListener("pointerenter", onEnter);
    fig.addEventListener("pointerleave", onLeave);
    fig.addEventListener("pointermove", onMove);
    const io = new IntersectionObserver((en) => { vis = en[0].isIntersecting; });
    io.observe(fig);

    const frame = (t2) => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      if (!ready || !vis || !W) return;
      mx += (tx - mx) * 0.18; my += (ty - my) * 0.18; hov += (hovT - hov) * 0.09;
      const iw = base.naturalWidth, ih = base.naturalHeight;
      const sc = Math.max(W / iw, H / ih), dw = iw * sc, dh = ih * sc;
      octx.clearRect(0, 0, W, H);
      octx.imageSmoothingEnabled = true;
      octx.globalAlpha = 1; octx.globalCompositeOperation = "source-over";
      octx.drawImage(base, W - dw, (H - dh) / 2, dw, dh);
      octx.imageSmoothingEnabled = false;
      octx.globalAlpha = 0.65; octx.globalCompositeOperation = "screen";
      const fall = (t2 * 0.016) % T;
      for (let y = -1; y <= Math.ceil(H / T); y++)
        for (let x = 0; x <= Math.ceil(W / T); x++) octx.drawImage(snow, x * T, y * T + fall, T, T);
      octx.globalAlpha = 1; octx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H); ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, 0, 0);
      if (hov > 0.02) {
        const R = 96, s = 1 + 0.55 * hov, r2 = R / s;
        ctx.save(); ctx.beginPath(); ctx.arc(mx, my, R, 0, 6.2832); ctx.clip();
        ctx.drawImage(off, mx - r2, my - r2, r2 * 2, r2 * 2, mx - R, my - R, R * 2, R * 2);
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", size);
      fig.removeEventListener("pointerenter", onEnter);
      fig.removeEventListener("pointerleave", onLeave);
      fig.removeEventListener("pointermove", onMove);
      base.removeEventListener("load", mount);
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      fig.classList.remove("has-snowc");
    };
  }, [fine]);

  const goAbout = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.__doVeil) window.__doVeil(() => router.push("/about"));
    else router.push("/about");
  };

  const cv = lang === "fr" ? "/cv/jimmy-feron-cv-fr.pdf" : "/cv/jimmy-feron-cv-en.pdf";

  return (
    <section className="ab" id="aboutprev">
      <div className="ab-figs reveal">
        <figure className="ab-fig ab-fig--bleed" ref={figRef}>
          <img
            src="/images/montagne-illustration-bleue-1200.webp"
            alt="Illustration de montagne bleue, direction artistique Jimmy Feron"
            loading="lazy"
          />
          <span className="ab-snow" aria-hidden="true"></span>
        </figure>
        <figure className="ab-fig">
          <img
            src="/images/jimmy-feron-trail-portrait-1200.webp"
            alt="Jimmy Feron, brand designer, en trail dans les Alpes"
            loading="lazy"
          />
        </figure>
      </div>

      <div className="ab-txt reveal" data-rv-group="1">
        <p className="sv2-eyebrow" data-reveal>
          <span className="sv2-flake" aria-hidden="true"></span>
          <span>{t("ab.eyebrow")}</span>
        </p>
        <h2 className="sv2-title" data-reveal style={{ "--rd": ".08s" }}>{t("ab.title")}</h2>
        {/* index.html injecte les traductions en innerHTML : ce texte contient
            un <br> qui doit être une vraie coupure, pas des caractères affichés. */}
        <p
          className="sv2-lead"
          data-reveal
          style={{ "--rd": ".16s" }}
          dangerouslySetInnerHTML={{ __html: t("ab.desc") }}
        />
        <div className="ab-ctas" data-reveal style={{ "--rd": ".24s" }}>
          <a className="btnf btn-blue" href="/about" onClick={goAbout}>
            <Roll text={t("ab.more")} /> <span className="arr" aria-hidden="true">↗</span>
          </a>
          <a className="btnf btn-ink cv-link" href={cv} target="_blank" rel="noopener noreferrer">
            <Roll text={t("ab.cv")} /> <span className="arr" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
