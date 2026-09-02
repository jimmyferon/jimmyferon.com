"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const LOGO_PATHS = [
  "M70.5042 908.157L-91.9997 796.155L239.558 718.319C239.558 718.319 345.421 693.25 427.851 750.062C510.28 806.875 524.529 914.729 524.529 914.729L569.792 1252.28L407.288 1140.28L354.232 856.876L70.5042 908.157Z",
  "M734.755 1134.45L576.143 1251.89L609.933 913.003C609.933 913.003 620.516 804.728 700.971 745.152C781.427 685.577 888.079 707.042 888.079 707.042L1222.09 773.589L1063.47 891.038L778.17 849.408L734.755 1134.45Z",
  "M1147.97 579.703L1221.53 762.846L902.172 644.515C902.172 644.515 800.085 606.914 762.775 514.015C725.464 421.116 773.184 323.35 773.184 323.35L921.975 16.9999L995.53 200.144L883.155 465.668L1147.97 579.703Z",
  "M716 15L912.429 22.0001L690.843 280.629C690.843 280.629 620.222 363.382 520.151 366.219C420.079 369.056 344.883 290.437 344.883 290.437L109 44.7782L306.283 39.185L516.474 236.545L716 15Z",
  "M53.5349 226.397L109.039 37.0002L286.751 327.53C286.751 327.53 343.699 420.225 315.545 516.296C287.39 612.367 189.417 659.661 189.417 659.661L-117 808.313L-61.4959 618.916L191.054 479.813L53.5349 226.397Z",
];

// Reproduit doVeil() du site original : rideau qui monte (cover), on exécute
// la navigation dessous, puis le rideau repart vers le haut (leave). ~580ms.
//
// Le rideau attend en plus que la navigation ait vraiment eu lieu avant de se
// relever. Sans cela, il repartait au bout de 580 ms alors que le code de la
// page visée n'était pas encore chargé : on revoyait l'ancienne page une
// demi-seconde. Le deuxième passage semblait correct parce que le navigateur
// avait gardé le fichier en mémoire. Les trois routes sont donc préchargées
// dès que le navigateur est disponible, et le relevé du rideau est déclenché
// par le changement d'adresse, avec un délai de secours si rien ne bouge.
export default function Veil() {
  const veilRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const waitRef = useRef(false);
  const fromRef = useRef(null);
  const failsafeRef = useRef(0);

  const lift = () => {
    const veil = veilRef.current;
    if (!veil) return;
    waitRef.current = false;
    clearTimeout(failsafeRef.current);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        veil.classList.remove("cover");
        veil.classList.add("leave");
        setTimeout(() => veil.classList.remove("leave"), 580);
      });
    });
  };

  useEffect(() => {
    window.__doVeil = (cb) => {
      const veil = veilRef.current;
      if (!veil) { cb(); return; }
      veil.classList.add("cover");
      setTimeout(() => {
        fromRef.current = window.location.pathname;
        waitRef.current = true;
        cb();
        failsafeRef.current = setTimeout(lift, 2500);   // le rideau ne reste jamais coincé
      }, 580);
    };
    return () => {
      delete window.__doVeil;
      clearTimeout(failsafeRef.current);
    };
  }, []);

  /* La page visée est montée : usePathname ne change qu'à ce moment-là. */
  useEffect(() => {
    if (waitRef.current && pathname !== fromRef.current) lift();
  }, [pathname]);

  /* Préchargement des trois routes, une fois le navigateur au repos. */
  useEffect(() => {
    const go = () => ["/", "/work", "/about"].forEach((r) => router.prefetch(r));
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(go, { timeout: 3000 })
      : setTimeout(go, 1600);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [router]);

  return (
    <div className="veil" ref={veilRef} aria-hidden="true">
      <div className="veil-logo">
        <svg viewBox="0 0 1140 1140" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip_veil)">
            {LOGO_PATHS.map((d, i) => <path key={i} d={d} />)}
          </g>
          <defs>
            <clipPath id="clip_veil"><rect width="1140" height="1140" rx="570" /></clipPath>
          </defs>
        </svg>
      </div>
      <span className="veil-mark">Jimmy Feron — Portfolio 2026</span>
    </div>
  );
}
