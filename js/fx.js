/* ==========================================================================
   fx.js: the motion layer of the Bookings template (built for smoothness).
   - The hero video or photos drawn with three.js: water drift, ripples under
     the finger or mouse, photos that melt into each other.
   - Smooth scrolling on computers (Lenis) and scroll scenes (GSAP ScrollTrigger).
   - A cursor that says "View" over photos, buttons that lean toward it.
   Rules that keep it fast:
   - one animation loop (GSAP's ticker) drives the scroll, the scenes and the 3D;
   - the video is copied to the graphics card only when it has a new frame;
   - the 3D draws at most 60 times a second on computers and 30 on phones,
     at screen resolution 1 to 1.25, and only while the hero is on screen;
   - scroll scenes only move and fade things (no masks, no colours, no blur);
   - very few elements are promoted to their own graphics layer;
   - a watchdog keeps checking, and hands back to the plain video if frames drop.
   Turn parts off with "effects" in config.js.
   ========================================================================== */
const LIB = {
  three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js',
  gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js',
  st: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js',
  lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.mjs',
};
let THREE, gsap, ScrollTrigger, Lenis, X, lenis;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const desktop = () => matchMedia('(pointer: fine)').matches && innerWidth >= 960;
const phone = () => innerWidth < 760;

export async function start(ctx) {
  X = ctx;
  const fxc = X.C.effects || {};
  const wantGL = fxc.webgl !== false;
  [{ gsap }, { ScrollTrigger }, { default: Lenis }, THREE] = await Promise.all([import(LIB.gsap), import(LIB.st), import(LIB.lenis), wantGL ? import(LIB.three) : Promise.resolve(null)]);
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  root.classList.add('fx');
  await afterIntro();
  if (fxc.smoothScroll !== false && desktop() && !root.classList.contains('snap')) smooth();
  if (fxc.cursor !== false && desktop()) cursor();
  watchdog();
  refresh(X.page);
  return { refresh };
}

function refresh(page) {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  const fxc = X.C.effects || {};
  if (THREE && fxc.webgl !== false) heroGL();
  if (fxc.scrollScenes !== false) scenes(page);
  if (desktop()) magnetic();
  ScrollTrigger.refresh();
}

function afterIntro() {
  return new Promise((done) => {
    if (!root.classList.contains('intro-on')) return done();
    const mo = new MutationObserver(() => { if (!root.classList.contains('intro-on')) { mo.disconnect(); done(); } });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  });
}

/* ---------------- smooth scrolling (computers only), on GSAP's single loop ---------------- */
function smooth() {
  lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, prevent: (node) => !!node.closest('dialog, .menu, .lc-track, .rc-track, .lp-track') });
  lenis.on('scroll', ScrollTrigger.update);
  window.__lenis = lenis;
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // pause only when the menu actually opens or closes (calling start() at other times throws away the scroll in progress)
  let menuOpen = false;
  new MutationObserver(() => { const m = root.classList.contains('menu-open'); if (m === menuOpen || !lenis) return; menuOpen = m; m ? lenis.stop() : lenis.start(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
}

/* ---------------- the hero in WebGL ---------------- */
const G = { renderer: null, mat: null, media: null, ro: null, io: null, seen: true, last: 0, timer: 0, at: 0, tex: [], video: null, vtex: null, dead: false, tick: null };
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
// kept light: a few sines for the water, one ring for the pointer, noise only while two photos are mixing
const FRAG = `
precision mediump float;
uniform sampler2D uA, uB; uniform vec2 uRes, uSizeA, uSizeB, uMouse;
uniform float uTime, uProg, uScroll, uHover, uSea;
varying vec2 vUv;
vec2 cover(vec2 uv, vec2 res, vec2 size) {
  float rs = res.x / res.y, ri = size.x / max(size.y, 1.0);
  vec2 s = rs < ri ? vec2(ri / rs, 1.0) : vec2(1.0, rs / ri);
  return (uv - 0.5) / s + 0.5;
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
void main() {
  vec2 uv = (vUv - 0.5) * (1.0 - 0.06 * uScroll) + 0.5;
  float sea = clamp((uSea + 0.2 - uv.y) / 0.4, 0.0, 1.0);
  uv += vec2(sin(uv.y * 38.0 + uTime * 1.4), cos(uv.x * 22.0 + uTime * 1.1)) * 0.0015 * (0.3 + sea);
  if (uHover > 0.01) {
    vec2 d = (uv - uMouse) * vec2(uRes.x / uRes.y, 1.0); float r = length(d);
    uv += (d / max(r, 1e-4)) * sin(r * 70.0 - uTime * 7.0) * exp(-r * 6.5) * 0.009 * uHover;
  }
  vec3 col = texture2D(uA, cover(uv, uRes, uSizeA)).rgb;
  if (uProg > 0.001) {
    float n = noise(uv * 2.6);
    float t = smoothstep(0.0, 1.0, clamp(uProg * 1.6 - 0.3 - (n - 0.5) * 0.9, 0.0, 1.0));
    vec3 b = texture2D(uB, cover(uv - vec2(0.0, (1.0 - t) * 0.05 * n), uRes, uSizeB)).rgb;
    col = mix(texture2D(uA, cover(uv + vec2(0.0, t * 0.05 * n), uRes, uSizeA)).rgb, b, t);
  }
  gl_FragColor = vec4(col * (1.0 - 0.36 * uScroll), 1.0);
}`;

function heroGL() {
  const media = $('.hero-media');
  if (!media || G.dead) return;
  const hero = media.closest('.hero');
  if (!G.renderer) {
    try {
      G.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    } catch { G.dead = true; return; }
    G.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    G.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone() ? 1 : 1.25));
    G.scene = new THREE.Scene();
    G.cam = new THREE.Camera();
    G.mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false,
      uniforms: { uA: { value: null }, uB: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uSizeA: { value: new THREE.Vector2(16, 9) }, uSizeB: { value: new THREE.Vector2(16, 9) },
        uMouse: { value: new THREE.Vector2(0.5, 0.4) }, uTime: { value: 0 }, uProg: { value: 0 }, uScroll: { value: 0 }, uHover: { value: 0 }, uSea: { value: (X.C.effects || {}).seaLine ?? 0.45 } },
    });
    G.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), G.mat));
    G.renderer.domElement.className = 'hero-gl';
    G.renderer.domElement.setAttribute('aria-hidden', 'true');
  }
  const u = G.mat.uniforms;
  G.media = media;
  media.append(G.renderer.domElement);
  const size = () => { const w = media.clientWidth, h = media.clientHeight; G.renderer.setSize(w, h, false); u.uRes.value.set(w, h); G.dirty = true; };
  G.ro && G.ro.disconnect(); G.ro = new ResizeObserver(size); G.ro.observe(media); size();
  G.io && G.io.disconnect(); G.io = new IntersectionObserver(([e]) => { G.seen = e.isIntersecting; }); G.io.observe(hero);

  clearInterval(G.timer); clearInterval(window.__heroT);
  const ready = () => media.classList.add('gl-on');
  const video = $('video.hero-video', media);
  if (video) {
    // three's video texture already re-uploads only when the video shows a new frame (requestVideoFrameCallback)
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.NoColorSpace; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    G.video = video; G.vtex = tex;
    const setSize = () => { u.uSizeA.value.set(video.videoWidth || 16, video.videoHeight || 9); u.uSizeB.value.copy(u.uSizeA.value); };
    const go = () => { if (!video.videoWidth) return; setSize(); u.uA.value = tex; u.uB.value = tex; ready(); };
    video.muted = true; video.play().catch(() => {});
    if (video.readyState >= 2 && video.videoWidth) go(); else video.addEventListener('loadeddata', go, { once: true });
  } else {
    G.video = null;
    const imgs = $$('[data-hero-slide] img', media).map((im) => im.dataset.src || im.currentSrc || im.src);
    const src = (s) => s.replace(/([?&])w=\d+/, `$1w=${phone() ? 1080 : 1600}`);
    const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
    G.tex = []; G.at = 0;
    const load = (i) => G.tex[i] || (G.tex[i] = new Promise((ok) => loader.load(src(imgs[i]), (t) => { t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; ok(t); }, undefined, () => ok(null))));
    if (!imgs.length) return;
    load(0).then((t) => {
      if (!t) return;
      u.uA.value = t; u.uB.value = t; u.uSizeA.value.set(t.image.width, t.image.height); u.uSizeB.value.copy(u.uSizeA.value);
      ready();
      if (imgs.length < 2) return;
      load(1);
      G.timer = setInterval(async () => {
        if (!G.seen || document.hidden) return;
        const next = (G.at + 1) % imgs.length, tn = await load(next);
        if (!tn) return;
        u.uB.value = tn; u.uSizeB.value.set(tn.image.width, tn.image.height);
        gsap.fromTo(u.uProg, { value: 0 }, { value: 1, duration: 2, ease: 'power2.inOut', onComplete: () => { u.uA.value = tn; u.uSizeA.value.copy(u.uSizeB.value); u.uProg.value = 0; G.at = next; load((next + 1) % imgs.length); $$('.hero-dots span').forEach((s, k) => s.classList.toggle('on', k === next)); } });
      }, 6500);
    });
  }

  // ripples follow the finger or the mouse
  const mx = gsap.quickTo(u.uMouse.value, 'x', { duration: 0.8, ease: 'power3' }), my = gsap.quickTo(u.uMouse.value, 'y', { duration: 0.8, ease: 'power3' });
  hero.onpointermove = (e) => { const r = hero.getBoundingClientRect(); mx((e.clientX - r.left) / r.width); my(1 - (e.clientY - r.top) / r.height); if (u.uHover.value < 0.99) gsap.to(u.uHover, { value: 1, duration: 0.6, overwrite: true }); };
  hero.onpointerleave = () => gsap.to(u.uHover, { value: 0, duration: 1.2, overwrite: true });

  // scrolling away: the picture darkens and comes closer, the words leave first
  gsap.to(u.uScroll, { value: 1, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to($('.hero-in', hero), { yPercent: -16, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '65% top', scrub: true } });

  // drawn from GSAP's loop, at most 60 (computers) or 30 (phones) times a second, only while visible
  const gap = phone() ? 1000 / 30 : 1000 / 60;
  if (G.tick) gsap.ticker.remove(G.tick);
  G.tick = (time) => {
    if (G.dead || !G.seen || document.hidden || !u.uA.value) return;
    const now = time * 1000;
    if (now - G.last < gap - 2) return;
    G.last = now;
    u.uTime.value = time;
    G.renderer.render(G.scene, G.cam);
  };
  gsap.ticker.add(G.tick);
}
function giveUp(why) {
  if (G.dead) return;
  G.dead = true;
  if (G.tick) gsap.ticker.remove(G.tick);
  clearInterval(G.timer);
  G.media && G.media.classList.remove('gl-on');
  const v = G.media && $('video.hero-video', G.media); v && v.play().catch(() => {});
  G.renderer && G.renderer.domElement.remove();
  try { G.renderer.dispose(); } catch { /* fine */ }
  console.info('WebLuxe effects: 3D hero off (' + why + '), plain video or photos instead.');
}
/** Keeps an eye on the frame rate the whole time. Sustained drops turn off the 3D hero first, then the smooth scroll. */
function watchdog() {
  let n = 0, t0 = performance.now(), bad = 0;
  gsap.ticker.add(() => {
    n++;
    const now = performance.now(), dt = now - t0;
    if (dt < 1000) return;
    const fps = n / (dt / 1000); n = 0; t0 = now;
    if (document.hidden) return;
    bad = fps < (phone() ? 26 : 40) ? bad + 1 : Math.max(0, bad - 1);
    if (bad >= 2 && !G.dead && G.renderer) { giveUp(Math.round(fps) + ' fps'); bad = 0; }
    else if (bad >= 3 && lenis) { lenis.destroy(); lenis = null; console.info('WebLuxe effects: smooth scroll off (' + Math.round(fps) + ' fps).'); bad = 0; }
  });
}

/* ---------------- scroll scenes (transform and opacity only) ---------------- */
function splitWords(el) {
  if (!el || el.dataset.split) return [];
  el.dataset.split = '1';
  const walk = (node) => {
    [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.append(document.createTextNode(' ')); return; }
          const o = document.createElement('span'); o.className = 'sw';
          const i = document.createElement('span'); i.className = 'swi'; i.textContent = w;
          o.append(i); frag.append(o);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1) walk(c);
    });
  };
  walk(el);
  return $$('.swi', el);
}
const rise = (targets, trigger, extra = {}) => gsap.from(targets, { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.05, clearProps: 'transform', ...(trigger ? { scrollTrigger: { trigger, start: 'top 88%', once: true } } : {}), ...extra });

function scenes() {
  const ease = 'expo.out';
  const hw = splitWords($('.hero .h1'));
  if (hw.length) rise(hw, null, { duration: 1.3, stagger: 0.07, delay: 0.1 });
  $$('.sec-head .h2, .row-name, .plx-q, .fcta .h1').forEach((h) => { const w = splitWords(h); if (w.length) rise(w, h); });

  // rooms: the photo rises into place and its picture settles from a slight zoom (played once)
  $$('.row').forEach((row) => {
    const pics = $('.row-pics', row), img = $('.lc-track li:first-child img', row);
    const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 82%', once: true } });
    tl.from(pics, { yPercent: 10, autoAlpha: 0, duration: 1.2, ease, clearProps: 'transform,opacity,visibility' }, 0);
    if (img) tl.from(img, { scale: 1.18, duration: 1.6, ease, clearProps: 'transform' }, 0);
    tl.from($$('.row-n, .row-short, .row-facts, .row-foot', row), { y: 26, autoAlpha: 0, duration: 0.9, ease, stagger: 0.07, clearProps: 'transform,opacity,visibility' }, 0.15);
    if (desktop()) tilt(pics);
  });

  // "A day at …": pinned, the row slides sideways, the hour's colour fades in on its own layer
  const day = $('[data-day]');
  if (day) {
    const track = $('.day-track', day), cards = $$('.day-card', day);
    ScrollTrigger.create({ trigger: day, start: 'top 250%', once: true, onEnter: () => $$('img', day).forEach((im) => { im.loading = 'eager'; im.decode && im.decode().catch(() => {}); }) });
    let tones = $('.day-tones', day);
    if (!tones) { tones = document.createElement('div'); tones.className = 'day-tones'; tones.setAttribute('aria-hidden', 'true'); tones.innerHTML = cards.map((c, i) => `<span style="background:${c.dataset.bg};opacity:${i ? 0 : 1}"></span>`).join(''); day.prepend(tones); }
    const layers = $$('span', tones);
    const dist = () => Math.max(0, track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft || 0));
    let shown = 0;
    const tl = gsap.timeline({ scrollTrigger: { trigger: day, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.5, invalidateOnRefresh: true,
      onToggle: (s) => root.classList.toggle('in-day', s.isActive) } });
    tl.to(track, { x: () => -dist(), ease: 'none', duration: cards.length - 1 }, 0);
    cards.forEach((c, i) => { if (i) tl.to(layers[i], { opacity: 1, duration: 0.7, ease: 'none' }, i - 0.85); });
    tl.eventCallback('onUpdate', () => { const k = Math.min(cards.length - 1, Math.round(tl.time())); if (k !== shown) { shown = k; day.style.color = cards[k].dataset.fg; } });
    // one swipe, one moment of the day: a snap point where each card is fully in view
    if (root.classList.contains('snap')) {
      const st = tl.scrollTrigger;
      $$('.snap-mark').forEach((m) => m.remove());
      // measured with a separate probe: a snap point must never pass through the top of the page, or the browser follows it
      const base = () => { const p = document.createElement('i'); p.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;visibility:hidden'; document.body.append(p); const y = p.getBoundingClientRect().top + scrollY; p.remove(); return y; };
      const at = (k, b0) => Math.round(st.start + k * (st.end - st.start) / Math.max(1, cards.length - 1) - b0) + 'px';
      // created only once ScrollTrigger knows where the scene starts (before that every point would sit at the top of the page)
      let marks = [];
      const place = () => {
        if (!(st.start > 0 && st.end > st.start)) return;
        const b1 = base();
        if (!marks.length) marks = cards.map((_, k) => { const m = document.createElement('i'); m.className = 'snap-mark'; m.setAttribute('aria-hidden', 'true'); m.style.top = at(k, b1); document.body.append(m); return m; });
        else marks.forEach((m, k) => { m.style.top = at(k, b1); });
        // tell the browser which section is really on screen, so it never "follows" a point that just moved
        const y0 = scrollY;
        requestAnimationFrame(() => { if (Math.abs(scrollY - y0) < 2) scrollTo({ top: y0, behavior: 'instant' }); });
      };
      ScrollTrigger.addEventListener('refresh', place);
      place();
    }
  }

  // the receipt: the booking-site price is struck through, then the saving counts up
  const rc = $('.receipt');
  if (rc) {
    const keep = $('.rc-keep b', rc), target = +keep.dataset.amount || 0;
    ScrollTrigger.create({ trigger: rc, start: 'top 75%', once: true, onEnter: () => {
      rc.classList.add('in');
      const o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.6, delay: 0.5, ease: 'power3.out', onUpdate: () => { keep.textContent = X.money(o.v); } });
    } });
  }

  // the ticker moves with the scroll
  $$('.ticker-row').forEach((r, i) => gsap.fromTo(r, { xPercent: i % 2 ? -25 : 0 }, { xPercent: i % 2 ? 0 : -25, ease: 'none', scrollTrigger: { trigger: r, start: 'top bottom', end: 'bottom top', scrub: true } }));

  // postcards fan in, polaroids drop onto the table (once)
  const cardsIn = $$('.rc-track > li').slice(0, phone() ? 2 : 4);
  if (cardsIn.length) gsap.from(cardsIn, { x: phone() ? 80 : 200, rotate: phone() ? 0 : 8, autoAlpha: 0, duration: 1.1, ease, stagger: 0.1, clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.rcar', start: 'top 82%', once: true } });
  const polas = $$('.polas li');
  if (polas.length) gsap.from(polas, { y: -110, autoAlpha: 0, duration: 1, ease: 'back.out(1.3)', stagger: 0.08, clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.polas', start: 'top 82%', once: true } });
  $$('.ip').forEach((p, i) => gsap.from(p, { y: 70 + i * 30, autoAlpha: 0, duration: 1.2, ease, clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: p, start: 'top 90%', once: true } }));

  // photo bands drift a little slower than the page
  $$('.plx > img, .fcta-bg img').forEach((im) => gsap.fromTo(im, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
}

/* ---------------- computer niceties ---------------- */
function tilt(el) {
  if (!el || el.dataset.tilt) return; el.dataset.tilt = '1';
  const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
  gsap.set(el, { transformPerspective: 900 });
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 5); rx(-((e.clientY - r.top) / r.height - 0.5) * 5); });
  el.addEventListener('pointerleave', () => { rx(0); ry(0); });
}
function magnetic() {
  $$('.btn-accent, .hd-cta, .round').forEach((b) => {
    if (b.dataset.mag) return; b.dataset.mag = '1';
    const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.22); y((e.clientY - r.top - r.height / 2) * 0.3); });
    b.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}
function cursor() {
  const dot = document.createElement('div'), ring = document.createElement('div');
  dot.className = 'cur-dot'; ring.className = 'cur-ring'; ring.innerHTML = '<span></span>';
  dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
  document.body.append(dot, ring); root.classList.add('has-cursor');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  const label = $('span', ring);
  let lastTarget = null, mode = '';
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    if (!root.classList.contains('cursor-in')) root.classList.add('cursor-in');
    if (e.target === lastTarget) return; // only look again when the pointer is over something new
    lastTarget = e.target;
    const t = e.target;
    const m = t.closest('.row-pics, .polas a, .masonry button, .lp-track button, [data-gi], .day-card figure') ? 'view' : t.closest('.rc-track') ? 'drag' : t.closest('a, button, select, label, input, textarea, summary') ? 'link' : '';
    if (m === mode) return;
    mode = m;
    ring.className = 'cur-ring' + (m ? ' is-' + m : '');
    label.textContent = m === 'view' ? X.ui('cursorView') : m === 'drag' ? X.ui('cursorDrag') : '';
  }, { passive: true });
  document.addEventListener('pointerleave', () => root.classList.remove('cursor-in'));
  addEventListener('pointerdown', () => ring.classList.add('is-down')); addEventListener('pointerup', () => ring.classList.remove('is-down'));
}
