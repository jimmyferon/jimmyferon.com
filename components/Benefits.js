"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/LangContext";
import { I18N } from "@/lib/i18n";
import mbJson from "@/data/mbdata.json";

// Section Benefits — portée à l'identique de index.html.
// L'ascension du Mont Blanc est pilotée par le défilement : le relief se
// dessine courbe après courbe, la caméra s'élève, les camps s'allument au
// passage et l'altitude défile. Les données de relief (SRTM) sont importées
// depuis ./mbdata.json, extraites telles quelles de index.html.
//
// Sur téléphone (<= 760px), le rendu 3D n'est pas monté du tout : la section
// devient une liste verticale des cinq étapes. Voir la note dans le CSS.
export default function Benefits() {
  const { lang } = useLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  const secRef = useRef(null);
  const [gl, setGl] = useState(false);

  useEffect(() => {
    const check = () => setGl(window.innerWidth >= 761);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sur téléphone la montagne 3D n'est pas montée : les cinq paliers
  // deviennent une ascension verticale. On pose la classe .in palier par
  // palier au scroll — le rail bleu monte d'un cran à chaque apparition.
  // Toute la mise en forme vit dans la media query <=760px, donc l'ascension
  // 3D du desktop n'est pas touchée.
  useEffect(() => {
    if (gl) return;
    const sec = secRef.current;
    if (!sec) return;
    const steps = Array.from(sec.querySelectorAll(".bn3-camp,.bn3-summit"));
    if (!steps.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.18 }
    );
    steps.forEach((el) => io.observe(el));

    // Le trait bleu suit le doigt. Pour chaque palier on calcule la part déjà
    // parcourue par une ligne de front placée à 80 % de la hauteur d'écran :
    // le trait se remplit donc pendant la descente vers le palier suivant, et
    // arrive sur son repère au moment où celui-ci entre dans l'écran. C'est ce
    // qui manquait : avant, le remplissage se jouait d'un coup à l'apparition
    // du texte, donc il était déjà terminé quand on le regardait.
    const rails = steps;
    const paint = () => {
      const front = (window.innerHeight || 800) * 0.9;
      rails.forEach((el) => {
        const r = el.getBoundingClientRect();
        const h = r.height || 1;
        const f = Math.max(0, Math.min(1, (front - r.top) / h));
        el.style.setProperty("--fill", f.toFixed(3));
        el.classList.toggle("lit", f > 0.02);
      });
    };
    const onScroll = () => requestAnimationFrame(paint);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", paint);
    paint();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", paint);
      rails.forEach((el) => { el.style.removeProperty("--fill"); el.classList.remove("lit"); });
    };
  }, [gl]);

  useEffect(() => {
    if (!gl) return;
    const sec = secRef.current;
    if (!sec) return;

    const world = sec.querySelector(".bn3-world"),
      head = sec.querySelector(".bn3-head"),
      halo = sec.querySelector(".bn3-halo"),
      altEl = sec.querySelector(".bn3-altnum"),
      cv = sec.querySelector(".bn3-gl"),
      camps = [...sec.querySelectorAll(".bn3-camp")],
      summit = sec.querySelector(".bn3-summit");
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const smooth = (x) => x * x * (3 - 2 * x);
    let P = 0, vis = false, stopped = false, rafId = 0;

    let renderer = null, scene = null, camera = null, cumThin = null, cumIdx = null,
      gThin = null, gIdx = null, NLEV = 0, gGpx = null, gpxYs = null, flagEl = null,
      SPT = null, HH = 3.05, autoYaw = 0, dragYaw = 0, dragTarget = 0, drag2 = false,
      dragX = 0, flagO = 0;
    let mbData = null;

      function buildGL(){
        if(!window.THREE||!cv) return;
        try{ renderer=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true}); }catch(e){ return; }
        renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
        scene=new THREE.Scene();
        camera=new THREE.PerspectiveCamera(40,1,0.1,100);
        scene.position.y=-0.52; /* position de depart ; animee au scroll dans draw() */
        /* heightmap réelle du Mont Blanc (SRTM_GL3, décodée depuis le bloc #mbdata) */
        const MB = mbData;
        const N=MB.n;
        const D36="0123456789abcdefghijklmnopqrstuvwxyz";
        const dec=c=>D36.indexOf(c);
        const hm=new Float32Array(N*N);
        { const s=MB.grid36; let hmax=0, hmin=1;
          for(let k=0;k<N*N;k++){ const v=(dec(s[k*2])*36+dec(s[k*2+1]))/1000; hm[k]=v; if(v>hmax)hmax=v; if(v<hmin)hmin=v; }
          /* normaliser la plage utile et accentuer légèrement le relief */
          for(let k=0;k<N*N;k++){ let v=(hm[k]-hmin)/(hmax-hmin+1e-6); hm[k]=Math.pow(v,1.05); }
        }
        /* marching squares par niveau */
        NLEV=72;
        const W=9.4,D=5.6,H=3.05;
        const ZOFF=-1.39, XOFF=0.0;   /* recentre le sommet réel (row149/col99) sous la caméra */
        const X=i=>(i/(N-1)-0.5)*W+XOFF, Z=j=>(j/(N-1)-0.5)*D+ZOFF;
        const thin=[], idx=[]; cumThin=[0]; cumIdx=[0];
        for(let li=0;li<NLEV;li++){
          const lv=0.12+ (li/(NLEV-1))*0.86;
          const y=lv*H;
          const out=(li%5===0)?idx:thin;
          for(let j=0;j<N-1;j++){
            for(let i=0;i<N-1;i++){
              const a=hm[j*N+i],b=hm[j*N+i+1],c=hm[(j+1)*N+i+1],d=hm[(j+1)*N+i];
              let m=(a>lv?8:0)|(b>lv?4:0)|(c>lv?2:0)|(d>lv?1:0);
              if(m===0||m===15) continue;
              const tt=(p1,q1)=>(lv-p1)/(q1-p1);
              const top=[X(i+tt(a,b)),y,Z(j)], right=[X(i+1),y,Z(j+tt(b,c))],
                    bot=[X(i+tt(d,c)),y,Z(j+1)], left=[X(i),y,Z(j+tt(a,d))];
              const push=(e1,e2)=>{out.push(e1[0],e1[1],e1[2],e2[0],e2[1],e2[2]);};
              if(m===1||m===14)push(left,bot);
              else if(m===2||m===13)push(bot,right);
              else if(m===3||m===12)push(left,right);
              else if(m===4||m===11)push(top,right);
              else if(m===6||m===9)push(top,bot);
              else if(m===7||m===8)push(top,left);
              else if(m===5){push(top,left);push(bot,right);}
              else if(m===10){push(top,right);push(bot,left);}
            }
          }
          cumThin.push(thin.length/3); cumIdx.push(idx.length/3);
        }
        const mk=(arr,op)=>{
          const g=new THREE.BufferGeometry();
          g.setAttribute("position",new THREE.BufferAttribute(Float32Array.from(arr),3));
          const mat=new THREE.LineBasicMaterial({color:0xF5F5F5,transparent:true,opacity:op,depthTest:false,depthWrite:false});
          const ls=new THREE.LineSegments(g,mat); scene.add(ls); return g;
        };
        gThin=mk(thin,0.28); gIdx=mk(idx,0.75);
        /* trace GPX (voie royale) posée sur le relief, dessinée progressivement au scroll */
        (function(){
          const W2=W,D2=D,H2=H;
          const sampleH=(u,v)=>{
            const fx=clamp(u,0,1)*(N-1), fy=clamp(v,0,1)*(N-1);
            const i=Math.min(N-2,Math.floor(fx)), j=Math.min(N-2,Math.floor(fy));
            const tx=fx-i, ty=fy-j;
            const a=hm[j*N+i],b=hm[j*N+i+1],c=hm[(j+1)*N+i+1],d2=hm[(j+1)*N+i];
            return (a*(1-tx)+b*tx)*(1-ty)+(d2*(1-tx)+c*tx)*ty;
          };
          const pos=[], ys=[];
          /* depart Chamonix (bord nord du terrain) -> rejoint le GPX au Nid d'Aigle */
          const cham={u:0.526,v:0.048}, g0={u:MB.gpx[0][0],v:MB.gpx[0][1]};
          for(let s2=0;s2<60;s2++){ const tt2=s2/60;
            const u=cham.u+(g0.u-cham.u)*tt2, v=cham.v+(g0.v-cham.v)*tt2;
            const sh=sampleH(u,v);
            if(sh<0.118) continue; /* demarre au ras de la premiere courbe */
            const x=(u-0.5)*W2+XOFF, z=(v-0.5)*D2+ZOFF, y=sh*H2+0.05;
            pos.push(x,y,z); ys.push(y);
          }
          MB.gpx.forEach(p=>{
            const u=p[0], v=p[1];
            const x=(u-0.5)*W2+XOFF, z=(v-0.5)*D2+ZOFF, y=sampleH(u,v)*H2+0.05;
            pos.push(x,y,z); ys.push(y);
          });
          if(pos.length>=6){
            gGpx=new THREE.BufferGeometry();
            gGpx.setAttribute("position",new THREE.BufferAttribute(Float32Array.from(pos),3));
            gGpx.setDrawRange(0,0);
            gpxYs=ys;
            const mat=new THREE.LineBasicMaterial({color:0x1E29FF,transparent:true,opacity:.95,depthTest:false,depthWrite:false});
            scene.add(new THREE.Line(gGpx,mat));
          }
          /* sommet réel -> point 3D pour épingler le fanion */
          let bi=0; for(let k=1;k<N*N;k++) if(hm[k]>hm[bi]) bi=k;
          SPT=new THREE.Vector3(X(bi%N), hm[bi]*H2, Z(Math.floor(bi/N)));
          HH=H2;
          flagEl=sec.querySelector(".bn3-flagpin");
        })();
        resize();
      }
    // Un canvas sans width/height mesure 300x150 par défaut. index.html lit
    // cv.clientWidth, ce qui marche là-bas parce que le canvas est dans le HTML
    // initial et déjà étiré par le CSS au moment du calcul. En React il est
    // monté après coup : la mesure retombait sur 300x150 et la montagne était
    // rendue dans un timbre-poste en haut à gauche. On mesure donc toujours le
    // conteneur (.bn3-stick), jamais le canvas.
    const box = () => {
      const p = (cv && cv.parentElement) || null;
      return {
        w: (p && p.clientWidth) || window.innerWidth,
        h: (p && p.clientHeight) || window.innerHeight,
      };
    };
    function resize(){
      if(!renderer) return;
      const { w, h: hgt } = box();
      renderer.setSize(w, hgt, false);
      camera.aspect = w / hgt; camera.updateProjectionMatrix();
    }
    function draw(t){
      if(!renderer) return;
      const e = smooth(P);
      const lv = Math.max(2, Math.min(NLEV, Math.ceil(NLEV * (P * 1.19 + 0.04))));
      gThin.setDrawRange(0, cumThin[lv]); gIdx.setDrawRange(0, cumIdx[lv]);
      if(gGpx && gpxYs){
        if(P < 0.02){ gGpx.setDrawRange(0, 0); }
        else { const lvFrac = 0.12 + ((lv - 1) / (NLEV - 1)) * 0.86; const cut = lvFrac * HH + 0.06;
          let k = 0; while(k < gpxYs.length && gpxYs[k] <= cut) k++; gGpx.setDrawRange(0, k >= 2 ? k : 0); }
      }
      const autoOn = clamp((P - 0.94) / 0.05, 0, 1);
      if(!drag2) autoYaw -= 0.0010 * autoOn;
      dragYaw += (dragTarget - dragYaw) * 0.14;
      const ang = 3.75 - 0.6 * e + Math.sin(t * 0.00019) * 0.03 + autoYaw + dragYaw;
      const rad = 6.8 - 0.5 * e;
      camera.position.set(Math.sin(ang) * rad, 2.6 + 3.6 * e, Math.cos(ang) * rad);
      camera.lookAt(0.1, 0.55 + 0.35 * e, 0);
      scene.position.y = -0.52 - 0.43 * e;
      if(flagEl && SPT){
        const v = SPT.clone(); v.y += scene.position.y; v.project(camera);
        const { w: wpx, h: hpx } = box();
        flagEl.style.transform = "translate(" + ((v.x * 0.5 + 0.5) * wpx).toFixed(1) + "px," + ((-v.y * 0.5 + 0.5) * hpx).toFixed(1) + "px) translate(-50%,-100%)";
        const ft = (v.z < 1) ? (P >= 0.94 ? 1 : clamp((P - 0.7) / 0.24, 0, 1) * 0.45) : 0;
        flagO += (ft - flagO) * 0.08;
        flagEl.style.opacity = flagO.toFixed(3);
      }
      cv.style.pointerEvents = "auto";
      cv.style.cursor = (drag2 ? "grabbing" : "grab");
      renderer.render(scene, camera);
    }
    function loop(t){ if(stopped) return; if(vis) draw(t); rafId = requestAnimationFrame(loop); }

    const upd = () => {
      const vh = innerHeight, r = sec.getBoundingClientRect();
      vis = !(r.bottom < 0 || r.top > vh);
      const hold = vh * 0.65;
      const sp = vh * 0.08;
      P = clamp(((-r.top) - sp) / (r.height - vh - hold - sp), 0, 1);
      const travel = world.offsetHeight - vh;
      world.style.transform = "translate3d(0," + (-(1 - P) * travel) + "px,0)";
      if(head){ const o = clamp(1 - P / 0.2, 0, 1); head.style.opacity = o; head.style.pointerEvents = o < .05 ? "none" : ""; }
      if(halo) halo.style.opacity = clamp((P - 0.78) / 0.22, 0, 1) * 0.5;
      if(altEl) altEl.textContent = Math.round(1035 + 3775 * P).toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ");
      if(r.top > vh * 0.15){ camps.forEach(c => c.classList.remove("on")); if(summit) summit.classList.remove("on"); }
      else {
        if(P < 0.012 || P > 0.82){ camps.forEach(c => c.classList.remove("on")); }
        else camps.forEach(c => { const cr = c.getBoundingClientRect(); if(cr.top < vh * 0.78 && cr.bottom > 0) c.classList.add("on"); });
        if(summit) summit.classList.toggle("on", P > 0.86);
      }
    };

    const onScroll = () => requestAnimationFrame(upd);
    const onResize = () => { upd(); resize(); };
    const onDown = (e2) => { drag2 = true; dragX = e2.clientX; if(cv.setPointerCapture) cv.setPointerCapture(e2.pointerId); };
    const onMove = (e2) => { if(!drag2) return; dragTarget += (e2.clientX - dragX) * 0.0040; dragX = e2.clientX; };
    const onUp = () => { drag2 = false; };

    // Three.js : on réutilise exactement le marqueur du lac (script[data-three]),
    // sinon la bibliothèque serait téléchargée deux fois sur la même page.
    function withThree(cb){
      if(window.THREE) return cb();
      const existing = document.querySelector('script[data-three]');
      if(existing){
        existing.addEventListener("load", cb, { once: true });
        return;
      }
      const sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      sc.async = true;
      sc.setAttribute("data-three", "1");
      sc.addEventListener("load", cb, { once: true });
      document.head.appendChild(sc);
    }

    // Les données du relief sont importées dans le bundle (comme index.html
    // les embarque dans la page) : aucun fetch, donc aucun risque qu'un dossier
    // public non réuploadé fasse disparaître la montagne en silence.
    mbData = mbJson;
    withThree(() => {
      if(stopped) return;
      buildGL(); upd(); resize();
      rafId = requestAnimationFrame(loop);
    });

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    if(cv){
      cv.addEventListener("pointerdown", onDown);
      addEventListener("pointermove", onMove);
      addEventListener("pointerup", onUp);
      addEventListener("pointercancel", onUp);
    }
    upd();

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      if(cv){
        cv.removeEventListener("pointerdown", onDown);
        removeEventListener("pointermove", onMove);
        removeEventListener("pointerup", onUp);
        removeEventListener("pointercancel", onUp);
      }
      if(renderer){ try{ renderer.dispose(); }catch(e){} }
    };
  }, [gl]);

  const CAMPS = [
    { alt: "+1 250 m", t: "bn3.c1t", d: "bn3.c1d", pos: { top: "82%", left: "8%" }, right: false },
    { alt: "+2 400 m", t: "bn3.c2t", d: "bn3.c2d", pos: { top: "63.5%", right: "8%" }, right: true },
    { alt: "+3 400 m", t: "bn3.c3t", d: "bn3.c3d", pos: { top: "45%", left: "8%" }, right: false },
    { alt: "+4 200 m", t: "bn3.c4t", d: "bn3.c4d", pos: { top: "27%", right: "8%" }, right: true },
  ];

  return (
    <section className="bn3" id="benefits" ref={secRef}>
      <div className="bn3-stick">
        <div className="bn3-halo" aria-hidden="true"></div>
        <canvas className="bn3-gl" aria-hidden="true"></canvas>
        <div className="bn3-world">
          {CAMPS.map((c) => (
            <div key={c.t} className={"bn3-camp" + (c.right ? " right" : "")} style={c.pos}>
              <span className="bn3-campalt">{c.alt}</span>
              <h3>{t(c.t)}</h3>
              <p>{t(c.d)}</p>
            </div>
          ))}
        </div>
        <div className="bn3-summit">
          <span className="bn3-campalt">+4 810 m</span>
          <h3>{t("bn3.c5t")}</h3>
          <p>{t("bn3.c5d")}</p>
        </div>
        <div className="bn3-flagpin" aria-hidden="true">
          <svg width="26" height="46" viewBox="0 0 26 46">
            <line x1="3" y1="0" x2="3" y2="46" stroke="rgba(245,245,245,.8)" strokeWidth="2" />
            <path d="M5 3 L24 9 L5 15 Z" fill="#1E29FF" />
          </svg>
        </div>
        <div className="bn3-head" data-rv-group="1">
          <p className="sv2-eyebrow" data-reveal><span className="sv2-flake" aria-hidden="true"></span><span>{t("bn3.eyebrow")}</span></p>
          <h2 className="bn3-title" data-reveal style={{ "--rd": ".08s" }}>{t("bn3.title")}</h2>
          <p className="bn3-sub" data-reveal style={{ "--rd": ".16s" }}>{t("bn3.sub")}</p>
        </div>
        <div className="bn3-alt"><span className="bn3-route">CHAMONIX → MONT BLANC</span><br />ALT. <span className="bn3-altnum">1 035</span> M</div>
      </div>
    </section>
  );
}
