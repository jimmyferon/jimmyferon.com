// SAUVEGARDE — carrousel 3D d'origine (cylindre en perspective).
// Conservé tel quel pour pouvoir revenir en arrière : le hero desktop utilise
// désormais l'anneau (Ring.js). Ce fichier n'est importé nulle part ; pour
// restaurer l'ancienne version, remettre <Carousel /> dans app/page.js.

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PROJECTS, CARD_BG } from "@/lib/projects";
import { createLogoReveal } from "@/components/LogoReveal";
import { useLang } from "@/lib/LangContext";

// Carrousel du hero.
// - Au-dessus de 760px (desktop + tablette, paysage comme portrait) : cylindre
//   3D porté à l'identique de index.html — mêmes constantes, même physique de
//   drag, badge "See the project" au curseur.
// - Sur téléphone (<= 760px) : rail horizontal d'une carte à la fois, qui
//   défile tout seul en boucle et se laisse aussi faire défiler à la main.
//   Le JS 3D n'est alors pas initialisé du tout.
// Les liens pointent vers /work tant que les pages projet n'existent pas.
export default function CarouselLegacy() {
  const carRef = useRef(null);
  const stageRef = useRef(null);
  const router = useRouter();
  const { lang } = useLang();
  const [mode, setMode] = useState(null); // null au 1er rendu (SSR), puis "3d" | "column"

  useEffect(() => {
    const check = () => setMode(window.innerWidth >= 761 ? "3d" : "column");
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Logo animé des cartes qui en ont un (projet "portfolio") : mêmes options que
  // index.html, avec le callback qui fait défiler les nuages et la neige.
  // Dépend de `mode` : en basculant entre cylindre et colonne, React reconstruit
  // le DOM des cartes, donc les logos montés précédemment disparaissent avec.
  // On attend aussi que `mode` soit connu pour ne monter qu'une seule fois.
  useEffect(() => {
    // Le logo anime aussi les nuages et la neige (ils n'ont pas d'animation
    // propre : c'est son callback qui les fait défiler). Il tourne dans les
    // deux modes, et se met en veille dès qu'il sort de l'écran.
    if (!mode) return;
    const stage = stageRef.current;
    if (!stage) return;
    const insts = [];
    stage.querySelectorAll(".pcard-anim").forEach((el) => {
      const scroll = el.parentElement.querySelector(".rd-scroll");
      const clouds = scroll && scroll.querySelector(".rd-clouds");
      const snow = scroll && scroll.querySelector(".rd-shimmer");
      const r = createLogoReveal(el, {
        ink: "#1E29FF", particle: "#2A37FF", glow: "rgba(30,41,255,0.14)",
        settle: 1, loop: true, dur: 4.0, copyright: true,
        onFrame: (t, dur) => {
          const k = t / dur;
          if (clouds) clouds.style.transform = `translateX(${(-5 * k).toFixed(3)}%)`;
          if (snow) snow.style.backgroundPosition = `0 ${(110 * k).toFixed(2)}px`;
        },
      });
      r.play();
      insts.push(r);
    });
    return () => insts.forEach((r) => r.stop());
  }, [mode]);

  // Rail horizontal (téléphone) : défilement continu.
  //
  // Il était piloté par scrollLeft, et c'était la cause des saccades :
  // scrollLeft est arrondi au pixel entier par le navigateur. À cette vitesse
  // le rail avance d'environ 1,25 px par image — donc en pratique tantôt 1,
  // tantôt 2 pixels, ce qui se voit immédiatement. On anime désormais une
  // translation, qui accepte les fractions de pixel et est composée par le GPU.
  // Le glissé au doigt est repris à la main (mêmes principes que le cylindre
  // du desktop), puisqu'il n'y a plus de défilement natif.
  useEffect(() => {
    if (mode !== "column") return;
    const stage = stageRef.current;
    const track = stage && stage.querySelector(".pcol-track");
    if (!stage || !track) return;

    const CYCLE = 28; // secondes pour parcourir le jeu de cartes
    let raf = 0, last = performance.now();
    let offset = 0, half = 0;
    let dragging = false, startX = 0, startOffset = 0, vel = 0;

    const measure = () => { half = track.scrollWidth / 2; };
    measure();
    const ro = window.ResizeObserver ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(track);

    const wrap = (v) => (half > 0 ? ((v % half) + half) % half : 0);

    // Le rail contient douze cartes, soit une bande d'environ quatre écrans de
    // large, alors qu'une seule est visible. Tout garder affiché oblige le
    // navigateur à composer cette bande entière à chaque image — avec des
    // vidéos et un canvas dedans, c'est hors de portée d'un téléphone.
    // On ne laisse donc visible que la carte courante et ses deux voisines.
    // La bascule ne se fait qu'au changement de carte, pas à chaque image.
    const cards = [...track.children];
    let lastIdx = -1;
    function cull() {
      if (half <= 0 || !cards.length) return;
      const cw = half / (cards.length / 2);
      const idx = Math.floor(offset / cw);
      if (idx === lastIdx) return;
      lastIdx = idx;
      for (let i = 0; i < cards.length; i++) {
        const near = i >= idx - 1 && i <= idx + 2;
        cards[i].style.visibility = near ? "" : "hidden";
      }
    }

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (half > 0) {
        if (dragging) {
          // rien : la position suit le doigt
        } else if (Math.abs(vel) > 1) {
          offset = wrap(offset + vel * dt);   // inertie après un glissé
          vel *= 0.94;
        } else {
          offset = wrap(offset + (half / CYCLE) * dt);
        }
        track.style.transform = `translate3d(${-offset}px,0,0)`;
        cull();
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    const onDown = (e) => {
      dragging = true; vel = 0;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startOffset = offset;
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const prev = offset;
      offset = wrap(startOffset - (x - startX));
      vel = (offset - prev) * 60;   // pour prolonger le geste au relâchement
      track.style.transform = `translate3d(${-offset}px,0,0)`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      vel = Math.max(-1800, Math.min(vel, 1800));
      last = performance.now();
    };

    stage.addEventListener("touchstart", onDown, { passive: true });
    stage.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp, { passive: true });
    window.addEventListener("touchcancel", onUp, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      stage.removeEventListener("touchstart", onDown);
      stage.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchcancel", onUp);
      track.style.transform = "";
      [...track.children].forEach((c) => { c.style.visibility = ""; });
    };
  }, [mode]);

  // Rail : on ne laisse tourner que les médias visibles. Le jeu de cartes est
  // dupliqué pour la boucle, donc quatre vidéos jouaient en permanence alors
  // qu'une seule carte est à l'écran — c'était la principale source de
  // saccades sur téléphone.
  useEffect(() => {
    if (!mode) return;
    const stage = stageRef.current;
    if (!stage || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target.querySelector("video");
          if (!v) return;
          if (e.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); }
          else v.pause();
        });
      },
      { threshold: 0.02 }
    );
    stage.querySelectorAll(".pcard").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [mode]);

  // Cylindre 3D : uniquement au-dessus de 900px.
  useEffect(() => {
    if (mode !== "3d") return;
    const carousel = carRef.current;
    const stage = stageRef.current;
    if (!carousel || !stage) return;

    const FACES = PROJECTS.length;
    const STEP = 360 / FACES;
    const BASE = 0.045; // rotation auto continue (ralentie)
    let theta = 0, vel = 0, R = 0;
    let dragging = false, lastX = 0, downX = 0, suppressClick = false;
    let downCard = null, rafId = 0, pfLastW = 0, stopped = false;

    function positionFaces() {
      const w = stage.getBoundingClientRect().width;
      if (w < 10) return; // section cachée : on attend le ResizeObserver
      R = (w / 2) / Math.tan(Math.PI / FACES) * 1.28; // espacement entre cartes (1.62 d'origine, resserré)
      [...stage.children].forEach((card, i) => {
        card.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`;
      });
      pfLastW = w;
    }

    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver((entries) => {
        const w = entries[0].contentRect.width;
        if (w >= 10 && Math.abs(w - pfLastW) > 1) positionFaces();
      });
      ro.observe(stage);
    }
    positionFaces();

    function loop() {
      if (stopped) return;
      vel += (BASE - vel) * 0.05;
      if (!dragging) theta += vel;
      // -R : la carte avant revient à Z=0, donc nette
      stage.style.transform = `translateZ(${-R}px) rotateY(${theta}deg)`;
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    const onDown = (e) => {
      dragging = true;
      lastX = downX = e.clientX;
      downCard = e.target.closest(".pcard"); // mémorisé AVANT la capture
      carousel.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      theta += dx * 0.3;
      vel = Math.max(-6, Math.min(dx * 0.22, 6)); // inertie
    };
    const onUp = (e) => {
      dragging = false;
      const moved = Math.abs(e.clientX - downX);
      suppressClick = moved > 8; // glissé, pas un tap
      if (moved <= 8 && downCard) {
        const href = downCard.getAttribute("href");
        if (href) {
          if (window.__doVeil) window.__doVeil(() => router.push(href));
          else router.push(href);
        }
      }
      downCard = null;
    };
    const onClick = (e) => {
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; }
      else if (e.target.closest(".pcard")) { e.preventDefault(); } // déjà géré au pointerup
    };
    const onDragStart = (e) => e.preventDefault();

    const cursorEl = document.getElementById("cursor");
    const onMouseMove = (e) => {
      if (!cursorEl) return;
      cursorEl.style.left = e.clientX + "px";
      cursorEl.style.top = e.clientY + "px";
      if (e.target.closest(".pcard")) { cursorEl.classList.add("show"); carousel.classList.add("nocur"); }
      else { cursorEl.classList.remove("show"); carousel.classList.remove("nocur"); }
    };
    const onMouseLeave = () => {
      if (cursorEl) cursorEl.classList.remove("show");
      carousel.classList.remove("nocur");
    };

    carousel.addEventListener("pointerdown", onDown);
    carousel.addEventListener("pointermove", onMove);
    carousel.addEventListener("pointerup", onUp);
    carousel.addEventListener("click", onClick, true);
    carousel.addEventListener("dragstart", onDragStart);
    carousel.addEventListener("mousemove", onMouseMove);
    carousel.addEventListener("mouseleave", onMouseLeave);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      carousel.removeEventListener("pointerdown", onDown);
      carousel.removeEventListener("pointermove", onMove);
      carousel.removeEventListener("pointerup", onUp);
      carousel.removeEventListener("click", onClick, true);
      carousel.removeEventListener("dragstart", onDragStart);
      carousel.removeEventListener("mousemove", onMouseMove);
      carousel.removeEventListener("mouseleave", onMouseLeave);
      if (cursorEl) cursorEl.classList.remove("show");
      // On enlève les transformations 3D si on repasse en mode swipe
      stage.style.transform = "";
      [...stage.children].forEach((c) => { c.style.transform = ""; });
    };
  }, [mode, router]);

  // En colonne : ordre imposé (Portfolio, puis Anya, puis les autres), et le
  // jeu est rendu deux fois — l'animation translate le rail de la moitié de sa
  // hauteur, ce qui donne une boucle sans couture.
  const COLUMN_ORDER = ["redesign", "anya", "preshot", "bcc", "coin", "deviantart"];
  const ordered =
    mode === "column"
      ? COLUMN_ORDER.map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean)
      : PROJECTS;
  const cards = mode === "column" ? [...ordered, ...ordered] : ordered;

  const inner = (
    <>
        {cards.map((p, i) => {
          const g = CARD_BG[p.id] || ["#ededed", "#dadade"];
          const cat = (p.cat && (p.cat[lang] || p.cat.fr)) || "";
          return (
            <a
              key={p.id + "-" + i}
              className="pcard"
              href="/work"
              aria-label={`${p.title} — ${cat}`}
              aria-hidden={i >= PROJECTS.length ? "true" : undefined}
              tabIndex={i >= PROJECTS.length ? -1 : undefined}
              style={{ "--g1": g[0], "--g2": g[1] }}
            >
              <div className="thumb">
                {p.anim ? (
                  <>
                    {p.scrollbg && (
                      <div className="rd-scroll">
                        <img
                          className="rd-img"
                          src={`/images/${p.scrollbg}-1600.webp`}
                          srcSet={`/images/${p.scrollbg}-600.webp 600w, /images/${p.scrollbg}-1600.webp 1600w, /images/${p.scrollbg}-2000.webp 2000w, /images/${p.scrollbg}-2400.webp 2400w`}
                          sizes="(max-width:760px) 95vw, 52vw"
                          alt=""
                          draggable="false"
                        />
                        <div className="rd-clouds"></div>
                        <div className="rd-shimmer"></div>
                      </div>
                    )}
                    <div className="pcard-anim logorev" data-anim={p.id}></div>
                  </>
                ) : p.video ? (
                  <video
                    className="thumb-vid"
                    aria-label={p.ph || `${p.title} — ${cat}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={`/images/${p.video}-poster-600.webp`}
                  >
                    <source src={`/images/${p.video}.webm`} type="video/webm" />
                    <source src={`/images/${p.video}.mp4`} type="video/mp4" />
                  </video>
                ) : p.img ? (
                  <img
                    className="thumb-img"
                    src={`/images/${p.img}-1600.webp`}
                    srcSet={`/images/${p.img}-600.webp 600w, /images/${p.img}-1200.webp 1200w, /images/${p.img}-1600.webp 1600w, /images/${p.img}-2000.webp 2000w`}
                    sizes="(max-width:760px) 95vw, 52vw"
                    alt={p.ph || `${p.title} — ${cat}`}
                    draggable="false"
                  />
                ) : (
                  <span className="ph-name">{p.title}</span>
                )}

                {/* Barre d'identification, visible uniquement en mode swipe */}
                <div className="pcard-bar">
                  <span className="pcard-bar-txt">
                    <b>{p.title}</b>
                    <span>{cat}</span>
                  </span>
                  <span className="pcard-bar-btn" aria-hidden="true">→</span>
                </div>
              </div>
            </a>
          );
        })}
    </>
  );

  return (
    <div className={"carousel nocur" + (mode === "column" ? " is-column" : "")} id="carousel" ref={carRef}>
      <div className="stage" id="stage" ref={stageRef}>
        {mode === "column" ? <div className="pcol-track">{inner}</div> : inner}
      </div>
    </div>
  );
}
