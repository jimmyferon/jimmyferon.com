"use client";

import { useEffect } from "react";

/* ---------------------------------------------------------------------------
   Effet magnétique des CTA (.cta, .btnf, .btn-dark) : le bouton suit la souris
   par parallaxe, puis revient élastiquement quand elle le quitte.

   Version déléguée. L'ancienne liait chaque bouton présent au moment où le
   hook tournait : un bouton monté plus tard (autre page, modale, changement de
   langue) pouvait rester sans effet, et le retour reposait sur une transition
   CSS que d'autres règles pouvaient neutraliser. Ici un seul écouteur sur le
   document reconnaît n'importe quel CTA, présent ou futur, et le mouvement est
   calculé image par image : même souplesse partout, sur toutes les pages.

   Rien ne se passe sans curseur : sur tactile, le CSS fige déjà ces boutons.
--------------------------------------------------------------------------- */

const SEL = ".cta,.btnf,.btn-dark";
const PULL_X = 0.25, PULL_Y = 0.35;   // part du décalage souris → bouton
const FOLLOW = 0.30;                   // lissage par image (plus haut = plus vif)
const REST = 0.15;                     // seuil de repos, en pixels

let installed = false;

function install() {
  if (installed || typeof window === "undefined") return;
  if (window.matchMedia("(hover:none)").matches) return;
  if (window.matchMedia("(pointer:coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  installed = true;

  const live = new Map();
  let running = false;

  const tick = () => {
    live.forEach((s, el) => {
      if (!el.isConnected) { live.delete(el); return; }
      s.cx += (s.tx - s.cx) * FOLLOW;
      s.cy += (s.ty - s.cy) * FOLLOW;
      if (!s.over && Math.abs(s.cx) < REST && Math.abs(s.cy) < REST) {
        el.style.transform = "";
        el.style.transition = "";
        live.delete(el);
        return;
      }
      el.style.transform = "translate(" + s.cx.toFixed(2) + "px," + s.cy.toFixed(2) + "px)";
    });
    if (live.size) requestAnimationFrame(tick);
    else running = false;
  };
  const wake = () => {
    if (!running) { running = true; requestAnimationFrame(tick); }
  };

  document.addEventListener("pointerover", (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    const el = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (!el || live.has(el)) return;

    /* On garde les transitions du thème (fond, couleur, bordure) mais pas celle
       du transform : elle s'ajouterait au lissage et le bouton traînerait. */
    const kept = getComputedStyle(el).transition
      .split(",").map((x) => x.trim())
      .filter((x) => x && !/^(transform|all)\b/.test(x))
      .join(", ");
    el.style.transition = kept || "none";

    const s = { over: true, cx: 0, cy: 0, tx: 0, ty: 0 };
    live.set(el, s);

    const onMove = (ev) => {
      const r = el.getBoundingClientRect();
      s.tx = (ev.clientX - (r.left + r.width / 2)) * PULL_X;
      s.ty = (ev.clientY - (r.top + r.height / 2)) * PULL_Y;
      wake();
    };
    const onLeave = () => {
      s.over = false; s.tx = 0; s.ty = 0;
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      wake();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    wake();
  });
}

/* Signature conservée : les composants appellent useMagnetic([lang]) ; les
   dépendances n'ont plus d'importance puisque la délégation couvre tout. */
export default function useMagnetic() {
  useEffect(() => { install(); }, []);
}
