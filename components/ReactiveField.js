"use client";

import { useEffect } from "react";

// Curseur reactive-field WebGL2 porté de index.html (khasiyev.com, adapté).
// Lueur dorée/blanche sur fond sombre (screen), bleue sur fond clair (multiply).
// Supprimé sur : header, .cta, .btnf, .btn-dark, .btn-ghost, .site-footer.
export default function ReactiveField() {
  useEffect(() => {
    if (matchMedia("(pointer:coarse)").matches) return;
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const s = document.createElement("canvas");
    s.id = "reactive-field";
    s.setAttribute("aria-hidden", "true");
    document.body.appendChild(s);
    const c = s.getContext("webgl2", { premultipliedAlpha: false, alpha: true });
    if (!c) { s.remove(); return; }

    const VERT = "#version 300 es\nprecision highp float;\nlayout(location=0) in vec2 aPos;\nout vec2 vUv;\nvoid main(){ vUv=aPos*0.5+0.5; gl_Position=vec4(aPos,0.0,1.0); }";

    const SIM = "#version 300 es\nprecision highp float;\n" +
      "uniform sampler2D uPrev; uniform vec2 uRes; uniform float uAspect;\n" +
      "uniform vec2 uPoint; uniform float uInject; uniform float uRadius;\n" +
      "in vec2 vUv; out vec4 frag;\n" +
      "void main(){\n" +
      "  vec2 px=1.0/uRes;\n" +
      "  float cc=texture(uPrev,vUv).r;\n" +
      "  float blur=texture(uPrev,vUv+vec2(px.x,0.0)).r+texture(uPrev,vUv-vec2(px.x,0.0)).r+texture(uPrev,vUv+vec2(0.0,px.y)).r+texture(uPrev,vUv-vec2(0.0,px.y)).r;\n" +
      "  float v=mix(cc,blur*0.25,0.5);\n" +
      "  v=max(v*0.980-0.0005,0.0);\n" +
      "  vec2 a=vec2(uAspect,1.0);\n" +
      "  float d=distance(vUv*a,uPoint*a);\n" +
      "  v+=uInject*exp(-(d*d)/(uRadius*uRadius));\n" +
      "  frag=vec4(v,0.0,0.0,1.0);\n" +
      "}";

    const DISP = "#version 300 es\nprecision highp float;\n" +
      "uniform sampler2D uTrail; uniform vec2 uRes; uniform float uAspect;\n" +
      "uniform float uTime; uniform float uFrame; uniform float uTrailAmt; uniform float uLightMode;\n" +
      "in vec2 vUv; out vec4 frag;\n" +
      "float hash(vec2 p){ p=fract(p*vec2(234.34,435.345)); p+=dot(p,p+34.23); return fract(p.x*p.y); }\n" +
      "void main(){\n" +
      "  float trail=texture(uTrail,vUv).r;\n" +
      "  float n=0.55+0.45*hash(vUv*3.0+uTime*0.05);\n" +
      "  float lum=trail*uTrailAmt*0.10*n;\n" +
      "  vec3 tint=vec3(0.961,0.961,0.961);\n" +
      "  lum=lum*(1.5-0.5*lum);\n" +
      "  vec3 col = (uLightMode>0.5) ? mix(vec3(1.0),vec3(0.05,0.10,1.0),clamp(lum*1.5,0.0,1.0)) : lum*tint;\n" +
      "  float g=hash(vUv*uRes+fract(uFrame*0.618)*71.0)-0.5;\n" +
      "  col+=g*(0.014*0.5+0.004);\n" +
      "  frag=vec4(col,1.0);\n" +
      "}";

    function sh(type, src) { const o = c.createShader(type); c.shaderSource(o, src); c.compileShader(o); if (!c.getShaderParameter(o, c.COMPILE_STATUS)) { console.warn(c.getShaderInfoLog(o)); } return o; }
    function prog(vs, fs) { const p = c.createProgram(); c.attachShader(p, sh(c.VERTEX_SHADER, vs)); c.attachShader(p, sh(c.FRAGMENT_SHADER, fs)); c.bindAttribLocation(p, 0, "aPos"); c.linkProgram(p); return p; }
    const e = prog(VERT, SIM), l = prog(VERT, DISP);

    const vao = c.createVertexArray(); c.bindVertexArray(vao);
    const vbo = c.createBuffer(); c.bindBuffer(c.ARRAY_BUFFER, vbo);
    c.bufferData(c.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), c.STATIC_DRAW);
    c.enableVertexAttribArray(0); c.vertexAttribPointer(0, 2, c.FLOAT, false, 0, 0);

    const L = {}, F = {};
    for (const n of ["uPrev", "uRes", "uAspect", "uPoint", "uInject", "uRadius"]) L[n] = c.getUniformLocation(e, n);
    for (const n of ["uTrail", "uRes", "uAspect", "uTime", "uFrame", "uTrailAmt", "uLightMode"]) F[n] = c.getUniformLocation(l, n);

    let h = 0, f = 0, v = 0, p = 0, g = 0; const _ = [], x = [];
    function w() {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      h = Math.round(innerWidth * dpr); f = Math.round(innerHeight * dpr);
      s.width = h; s.height = f;
      v = Math.max(2, h >> 2); p = Math.max(2, f >> 2);
      _.forEach((t) => c.deleteTexture(t)); x.forEach((fb) => c.deleteFramebuffer(fb)); _.length = 0; x.length = 0;
      for (let i = 0; i < 2; i++) {
        const tex = c.createTexture(); c.bindTexture(c.TEXTURE_2D, tex);
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA8, v, p, 0, c.RGBA, c.UNSIGNED_BYTE, null);
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR);
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR);
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE);
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE);
        const fbo = c.createFramebuffer(); c.bindFramebuffer(c.FRAMEBUFFER, fbo);
        c.framebufferTexture2D(c.FRAMEBUFFER, c.COLOR_ATTACHMENT0, c.TEXTURE_2D, tex, 0);
        _.push(tex); x.push(fbo);
      }
      c.bindFramebuffer(c.FRAMEBUFFER, null);
    }
    w(); addEventListener("resize", w);

    const b = { x: .5, y: .5, tx: .5, ty: .5, speed: 0, vsm: 0, dist: 0, has: false };
    let k = 0, U = null, V = null, C = 0, I = 0, N = performance.now(), P = 0;

    let lightMode = 1, overCTA = false;
    function sampleBg(cx, cy) {
      const el = document.elementFromPoint(cx, cy); if (!el) return;
      let n = el, bg = "";
      while (n && n !== document.documentElement) { const s2 = getComputedStyle(n).backgroundColor; if (s2 && s2 !== "rgba(0, 0, 0, 0)" && s2 !== "transparent") { bg = s2; break; } n = n.parentElement; }
      if (el.closest && el.closest("#darkwrap")) { lightMode = 0; return; }
      const m = bg.match(/\d+/g); if (m) { const Lu = (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]); lightMode = Lu > 128 ? 1 : 0; }
    }

    const onMove = (ev) => {
      b.tx = ev.clientX / innerWidth; b.ty = 1 - ev.clientY / innerHeight;
      if (U !== null) { b.dist += Math.hypot(ev.clientX - U, ev.clientY - V); }
      U = ev.clientX; V = ev.clientY; b.has = true; k = Math.min(1.2, k + 0.12);
      overCTA = !!(ev.target.closest && ev.target.closest("header,.cta,.btnf,.btn-dark,.btn-ghost,.site-footer"));
      if (!overCTA && ev.target.closest && ev.target.closest(".hero")) {
        const cell = document.querySelector(".page.active .hb-cell");
        overCTA = !cell || ev.clientY < cell.getBoundingClientRect().top;
      }
      sampleBg(ev.clientX, ev.clientY);
      if (!P) { N = performance.now(); P = requestAnimationFrame(D); }
    };
    const onDown = () => { k = 1.2; };
    const onLeave = () => { b.has = false; U = null; };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerleave", onLeave);

    function D(t) {
      const a = Math.min(.05, (t - N) / 1e3); N = t; C += a; I++;
      b.x += (b.tx - b.x) * .085; b.y += (b.ty - b.y) * .085;
      const inst = Math.min(1, b.dist / 26); b.dist = 0;
      b.vsm += (inst - b.vsm) * 0.14;
      k *= .8;
      const r = overCTA ? 0 : (b.has ? Math.max(0, (b.vsm - 0.04)) * 1.3 : 0);

      c.bindVertexArray(vao);
      c.bindFramebuffer(c.FRAMEBUFFER, x[1 - g]); c.viewport(0, 0, v, p); c.useProgram(e);
      c.activeTexture(c.TEXTURE0); c.bindTexture(c.TEXTURE_2D, _[g]);
      c.uniform1i(L.uPrev, 0); c.uniform2f(L.uRes, v, p); c.uniform1f(L.uAspect, h / f);
      c.uniform2f(L.uPoint, b.x, b.y); c.uniform1f(L.uInject, r); c.uniform1f(L.uRadius, .036 + .023 * k);
      c.drawArrays(c.TRIANGLES, 0, 3); g = 1 - g;
      c.bindFramebuffer(c.FRAMEBUFFER, null); c.viewport(0, 0, h, f); c.useProgram(l);
      c.activeTexture(c.TEXTURE0); c.bindTexture(c.TEXTURE_2D, _[g]);
      c.uniform1i(F.uTrail, 0); c.uniform2f(F.uRes, h, f); c.uniform1f(F.uAspect, h / f);
      c.uniform1f(F.uTime, C); c.uniform1f(F.uFrame, I); c.uniform1f(F.uTrailAmt, .55);
      c.uniform1f(F.uLightMode, lightMode);
      s.style.mixBlendMode = lightMode > 0.5 ? "multiply" : "screen";
      s.style.opacity = "1";
      c.drawArrays(c.TRIANGLES, 0, 3);

      if (b.vsm > 0.001 || b.dist > 0 || k > 0.001 || b.has) P = requestAnimationFrame(D);
      else { P = 0; s.style.opacity = "0"; }
    }

    return () => {
      removeEventListener("resize", w);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerleave", onLeave);
      if (P) cancelAnimationFrame(P);
      s.remove();
    };
  }, []);

  return null;
}
