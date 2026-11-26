/* MouseRig — reusable, parameterized mouse character for code-rendered explainer videos.
 * Extracted from samples/01-insertion-sort/v2. Plain browser JS, no deps, global `MouseRig`.
 * Everything is a pure function of its inputs: no Date.now, no Math.random, no state between calls.
 *
 * Usage:
 *   host.innerHTML = MouseRig.svg('m1', {body:'#c7bfd6', scale:1});
 *   const el = document.getElementById('m1');
 *   MouseRig.pose(el, MouseRig.compose(base, MouseRig.jumpOver(u,{from:0,to:-190}), MouseRig.idleBreath(t,7)));
 * Coordinates: origin = point between the feet on the floor; y negative = up. Units = px at scale 1.
 */
(function (G) {
  'use strict';
  const INK = '#3b2a5e';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const c01 = (x) => clamp(x, 0, 1);
  const lerp = (a, b, k) => a + (b - a) * k;
  const eio = (x) => { x = c01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const eo = (x) => { x = c01(x); return 1 - Math.pow(1 - x, 3); };
  const ei = (x) => { x = c01(x); return x * x * x; };
  const bump = (x) => (x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x)); // 0→1→0
  const seg = (u, a, b) => c01((u - a) / (b - a));
  // seeded hash → [0,1)
  function hash(n) { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  const SIGN_STYLE = {
    idle: { fill: '#fffaf0', stroke: INK },
    active: { fill: '#ffe2cc', stroke: '#ff7a2f' },
    sorted: { fill: '#d7f0d9', stroke: '#3f9a5f' },
  };

  const DEFAULT = {
    x: 0, y: 0, squash: 0, lean: 0, headTilt: 0, headTurn: 0,
    eyes: 'open', blink: 0, mouth: 'smile', chestPuff: 0,
    signText: '', signState: 'idle', signTilt: 0, signLagX: 0, signLagY: 0, signRaise: 1, signFlip: 1,
    tailPhase: 0,
  };
  const STRING_KEYS = { eyes: 1, mouth: 1, signText: 1, signState: 1 };
  // channels combined by multiplication rather than addition
  const MUL_KEYS = { signRaise: 1, signFlip: 1 };

  /* ---------------- markup ---------------- */
  function svg(id, opts) {
    const o = Object.assign({ body: '#c7bfd6', ear: '#f5b3c3', belly: '#fff4e4', feet: '#e9a5b8', tail: '#e69aae',
      stick: '#9a6a3a', ink: INK, scale: 1, sign: true }, opts || {});
    const s = o.scale, k = o.ink, c = o.body;
    return '<svg id="' + id + '" class="mouse-rig" data-rig="mouse" width="' + 320 * s + '" height="' + 480 * s +
      '" viewBox="-160 -440 320 480" style="overflow:visible;position:absolute;left:0;top:0" data-scale="' + s + '">' +
      '<g data-part="body">' +
      '<g data-part="tail"><path d="M-52 -36 C-110 -26 -120 -96 -152 -84" stroke="' + o.tail + '" stroke-width="9" fill="none" stroke-linecap="round"/></g>' +
      '<ellipse cx="-28" cy="-6" rx="20" ry="9" fill="' + o.feet + '" stroke="' + k + '" stroke-width="4"/>' +
      '<ellipse cx="28" cy="-6" rx="20" ry="9" fill="' + o.feet + '" stroke="' + k + '" stroke-width="4"/>' +
      '<g data-part="chest"><ellipse cx="0" cy="-62" rx="66" ry="56" fill="' + c + '" stroke="' + k + '" stroke-width="5"/>' +
      '<ellipse cx="0" cy="-52" rx="40" ry="32" fill="' + o.belly + '" opacity=".65"/></g>' +
      (o.sign ? '<g data-part="arm"><rect x="-5" y="-176" width="10" height="176" rx="5" fill="' + o.stick + '"/>' +
        '<g data-part="sign" transform="translate(0,-222)"><rect data-part="signRect" x="-64" y="-54" width="128" height="108" rx="18" fill="#fffaf0" stroke="' + k + '" stroke-width="6"/>' +
        '<text data-part="signText" x="0" y="25" text-anchor="middle" font-size="74" font-weight="900" fill="' + k + '" style="font-variant-numeric:tabular-nums;font-family:inherit"></text></g></g>' : '') +
      '<g data-part="head">' +
      '<g data-part="ears"><circle cx="-46" cy="-40" r="30" fill="' + c + '" stroke="' + k + '" stroke-width="5"/><circle cx="-46" cy="-40" r="15" fill="' + o.ear + '"/>' +
      '<circle cx="46" cy="-40" r="30" fill="' + c + '" stroke="' + k + '" stroke-width="5"/><circle cx="46" cy="-40" r="15" fill="' + o.ear + '"/></g>' +
      '<ellipse cx="0" cy="0" rx="56" ry="47" fill="' + c + '" stroke="' + k + '" stroke-width="5"/>' +
      '<g data-part="face">' +
      '<g data-part="eyes">' +
      '<g data-eye="open"><circle cx="-20" cy="-6" r="8" fill="' + k + '"/><circle cx="20" cy="-6" r="8" fill="' + k + '"/><circle cx="-17" cy="-9" r="2.6" fill="#fffaf0"/><circle cx="23" cy="-9" r="2.6" fill="#fffaf0"/></g>' +
      '<g data-eye="wide"><circle cx="-20" cy="-7" r="11" fill="#fffaf0" stroke="' + k + '" stroke-width="3"/><circle cx="20" cy="-7" r="11" fill="#fffaf0" stroke="' + k + '" stroke-width="3"/><circle cx="-20" cy="-7" r="5" fill="' + k + '"/><circle cx="20" cy="-7" r="5" fill="' + k + '"/></g>' +
      '<g data-eye="happy"><path d="M-30 -4 q10 -12 20 0 M10 -4 q10 -12 20 0" stroke="' + k + '" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
      '<g data-eye="closed"><path d="M-29 -5 h18 M11 -5 h18" stroke="' + k + '" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
      '</g>' +
      '<circle cx="-34" cy="14" r="9" fill="#f08aa6" opacity=".45"/><circle cx="34" cy="14" r="9" fill="#f08aa6" opacity=".45"/>' +
      '<circle cx="0" cy="12" r="8" fill="#e5708f"/>' +
      '<g data-part="mouth">' +
      '<path data-mouth="smile" d="M-9 24 q9 8 18 0" stroke="' + k + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse data-mouth="o" cx="0" cy="27" rx="6" ry="7" fill="' + k + '"/>' +
      '<path data-mouth="flat" d="M-8 26 h16" stroke="' + k + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '</g>' +
      '<path d="M-24 14 l-34 -5 M-24 20 l-34 6 M24 14 l34 -5 M24 20 l34 6" stroke="' + k + '" stroke-width="3" stroke-linecap="round"/>' +
      '</g></g>' +
      '<circle data-part="hand" cx="0" cy="-78" r="11" fill="' + c + '" stroke="' + k + '" stroke-width="4"/>' +
      '</g></svg>';
  }

  /* ---------------- pose application ---------------- */
  function parts(el) {
    if (el.__rigParts) return el.__rigParts; // DOM cache only; no animation state
    const q = (n) => el.querySelector('[data-part="' + n + '"]');
    const p = { body: q('body'), tail: q('tail'), chest: q('chest'), arm: q('arm'), sign: q('sign'), signRect: q('signRect'),
      signText: q('signText'), head: q('head'), face: q('face'), eyes: q('eyes'), mouth: q('mouth'), hand: q('hand'),
      eye: {}, mouthV: {} };
    el.querySelectorAll('[data-eye]').forEach((g) => (p.eye[g.getAttribute('data-eye')] = g));
    el.querySelectorAll('[data-mouth]').forEach((g) => (p.mouthV[g.getAttribute('data-mouth')] = g));
    el.__rigParts = p;
    return p;
  }
  const f = (n, d) => Number(n).toFixed(d == null ? 2 : d);

  function pose(el, pIn) {
    const p = Object.assign({}, DEFAULT, pIn || {});
    const P = parts(el), s = Number(el.getAttribute('data-scale')) || 1;
    // root placement: feet at (x,y) in parent pixels
    el.style.transform = 'translate(' + f(p.x - 160 * s, 1) + 'px,' + f(-440 * s, 1) + 'px)';
    // squash: + compress, − stretch; area-preserving-ish (sx = sy^-0.5), pivot at feet
    const sq = clamp(p.squash, -1, 1), sy = 1 - 0.3 * sq, sx = Math.pow(sy, -0.5);
    P.body.setAttribute('transform', 'translate(0,' + f(p.y, 1) + ') rotate(' + f(p.lean) + ') scale(' + f(sx, 3) + ',' + f(sy, 3) + ')');
    // head: turn shifts face, tilt rotates, chest puff lifts it
    const puff = c01(p.chestPuff), turn = clamp(p.headTurn, -1, 1);
    P.head.setAttribute('transform', 'translate(' + f(turn * 7, 1) + ',' + f(-128 - puff * 10, 1) + ') rotate(' + f(p.headTilt - puff * 6) + ')');
    P.face.setAttribute('transform', 'translate(' + f(turn * 7, 1) + ',0)');
    P.chest.setAttribute('transform', 'translate(0,-62) scale(' + f(1 + 0.16 * puff, 3) + ',' + f(1 + 0.1 * puff, 3) + ') translate(0,62)');
    // eyes + blink (blink squashes the active eye shape vertically)
    const eyes = p.eyes in P.eye ? p.eyes : 'open';
    for (const k in P.eye) P.eye[k].setAttribute('opacity', k === eyes ? 1 : 0);
    const b = c01(p.blink), ey = eyes === 'closed' || eyes === 'happy' ? 1 : Math.max(0.08, 1 - b);
    P.eyes.setAttribute('transform', 'translate(0,-6) scale(1,' + f(ey, 3) + ') translate(0,6)');
    const mouth = p.mouth in P.mouthV ? p.mouth : 'smile';
    for (const k in P.mouthV) P.mouthV[k].setAttribute('opacity', k === mouth ? 1 : 0);
    // sign: lag offsets + tilt, raise (0 lowered … 1 up), flip (scaleX for card-flip reveals)
    if (P.arm) {
      const r = c01(p.signRaise);
      P.arm.setAttribute('transform', 'translate(' + f(38 + p.signLagX, 1) + ',' + f(-80 + (1 - r) * 70 + p.signLagY, 1) + ') rotate(' + f(p.signTilt + (1 - r) * 40) + ')');
      P.sign.setAttribute('transform', 'translate(0,-222) scale(' + f(Math.max(0.02, Math.abs(p.signFlip)), 3) + ',1)');
      const st = SIGN_STYLE[p.signState] || SIGN_STYLE.idle;
      P.signRect.setAttribute('fill', st.fill); P.signRect.setAttribute('stroke', st.stroke);
      if (P.signText.textContent !== String(p.signText)) P.signText.textContent = String(p.signText);
    }
    // tail: tailPhase is a rotation in degrees around the tail root
    P.tail.setAttribute('transform', 'rotate(' + f(clamp(p.tailPhase, -50, 50)) + ' -52 -36)');
    return p;
  }

  /* ---------------- composition ---------------- */
  // pose = base + Σ deltas. Numbers add (signRaise/signFlip multiply); strings: last non-empty wins.
  function compose(base) {
    const out = Object.assign({}, DEFAULT, base || {});
    for (let i = 1; i < arguments.length; i++) {
      const d = arguments[i]; if (!d) continue;
      for (const k in d) {
        if (STRING_KEYS[k]) { if (d[k]) out[k] = d[k]; }
        else if (MUL_KEYS[k]) out[k] = out[k] * d[k];
        else out[k] = (out[k] || 0) + d[k];
      }
    }
    return out;
  }

  /* ---------------- actions: pure fns of local progress u∈[0,1] → pose delta ---------------- */
  // Phase table (fractions of duration). Recommended duration 0.9–1.1 s; chained repeats may shrink to 0.55 s.
  const JUMP_PH = { antic: 0.22, land: 0.72, settle: 0.86 };
  function jumpBody(u, o) {
    const from = o.from || 0, to = o.to == null ? -190 : o.to, H = o.height == null ? 70 : o.height, dir = Math.sign(to - from) || 1;
    let x = from, y = 0, sq = 0, lean = 0;
    if (u <= 0) return { x, y, sq, lean };
    if (u >= 1) return { x: to, y, sq, lean };
    if (u < JUMP_PH.antic) { // anticipation: crouch, lean back against travel
      const a = eo(u / JUMP_PH.antic); sq = 0.8 * a; lean = -6 * a * dir;
    } else if (u < JUMP_PH.land) { // launch + arc: stretch on takeoff, hang near apex, stretch into contact
      const q = (u - JUMP_PH.antic) / (JUMP_PH.land - JUMP_PH.antic);
      x = lerp(from, to, eio(q)); y = -H * Math.sin(Math.PI * q);
      sq = -(0.67 * Math.max(0, 1 - q * 2.5) + 0.33 * Math.max(0, (q - 0.7) / 0.3));
      lean = lerp(-10, 8, q) * dir;
    } else if (u < JUMP_PH.settle) { // land squash, recovering
      const a = (u - JUMP_PH.land) / (JUMP_PH.settle - JUMP_PH.land); x = to; sq = 0.87 * (1 - eo(a)); lean = 8 * (1 - a) * dir;
    } else { // overshoot (small stretch) → settle
      const a = (u - JUMP_PH.settle) / (1 - JUMP_PH.settle); x = to; sq = -0.17 * bump(a);
    }
    return { x, y, sq, lean };
  }
  // Secondary channels are derived from the body itself sampled slightly earlier (lag), so they start later and settle later.
  function jumpOver(u, opts) {
    const o = opts || {}, B = jumpBody(u, o), Bs = jumpBody(u - 0.09, o), Bt = jumpBody(u - 0.2, o);
    const tuck = 60 * bump(seg(u, 0.15, 0.8)); // sign pulled down to clear neighbours mid-air
    return {
      x: B.x, y: B.y, squash: B.sq, lean: B.lean,
      headTurn: u > 0 && u < 0.8 ? Math.sign((o.to == null ? -190 : o.to) - (o.from || 0)) : 0,
      eyes: B.y < -20 ? 'wide' : '', mouth: B.y < -20 ? 'o' : '',
      signTilt: clamp((Bs.x - B.x) * 0.16 + (B.y - Bs.y) * 0.05, -28, 28),
      signLagY: clamp((B.y - Bs.y) * 0.5, -10, 40) + tuck,
      tailPhase: clamp((Bt.x - B.x) * 0.22 + (B.y - Bt.y) * 0.15, -45, 45),
    };
  }
  // Neighbour being jumped over: ducks and slides the other way (use with the same u and swapped from/to).
  function duck(u, opts) {
    const o = opts || {}, from = o.from || 0, to = o.to == null ? 190 : o.to;
    const q = seg(u, JUMP_PH.antic, JUMP_PH.land), w = bump(q);
    return { x: u < JUMP_PH.antic ? from : lerp(from, to, eio(q)), squash: 0.5 * w + 0.13 * eo(u / JUMP_PH.antic) * (u < JUMP_PH.antic ? 1 : 0),
      lean: 9 * w * Math.sign(to - from), signLagX: 40 * w, signTilt: 30 * w, headTurn: -Math.sign(to - from) * (u < 0.85 ? 1 : 0) };
  }
  // Flinch (0.4–0.6 s): fast recoil back + wide eyes, slower recovery.
  function flinch(u, opts) {
    const dir = (opts && opts.dir) || 1, hit = u < 0.18 ? eo(u / 0.18) : 1 - eio((u - 0.18) / 0.82);
    return { x: -14 * hit * dir, squash: 0.35 * hit, lean: -12 * hit * dir, headTilt: -8 * hit * dir,
      eyes: hit > 0.3 ? 'wide' : '', mouth: hit > 0.3 ? 'o' : '', signLagX: -10 * hit * dir, signTilt: -10 * hit * dir,
      tailPhase: 20 * Math.sin(Math.PI * 3 * u) * (1 - u) };
  }
  // Head shake "no" (0.9–1.2 s): sin oscillation under an envelope.
  function shakeHead(u, times) {
    const n = times || 3, env = bump(u);
    return { headTilt: Math.sin(u * Math.PI * 2 * n) * 14 * env, headTurn: Math.sin(u * Math.PI * 2 * n) * 0.4 * env,
      eyes: env > 0.2 ? 'closed' : '', mouth: env > 0.2 ? 'flat' : '', signTilt: -Math.sin((u - 0.08) * Math.PI * 2 * n) * 4 * env };
  }
  // Chest puff / proud (hold 1.5–3 s): eased in, held, eased out.
  function puffChest(u) {
    const w = eio(u / 0.2) * (1 - eio((u - 0.8) / 0.2));
    return { chestPuff: w, lean: -3 * w, eyes: w > 0.5 ? 'happy' : '', squash: -0.1 * w };
  }
  // Cheer (0.55 s per hop; pass u over N hops via u = k/N): crouch → hop → land.
  function cheer(u, hops) {
    const n = hops || 1, k = c01(u) * n, fr = k - Math.floor(k);
    if (u <= 0 || u >= 1) return {};
    let sq = -0.27;
    if (fr < 0.12) sq = 0.6 * (1 - fr / 0.12); else if (fr > 0.9) sq = 0.67 * ((fr - 0.9) / 0.1);
    return { y: -75 * Math.sin(Math.PI * fr), squash: sq, eyes: 'happy', mouth: 'o', signLagY: -12 * Math.sin(Math.PI * (fr - 0.1)),
      tailPhase: 18 * Math.sin(Math.PI * 2 * fr) };
  }
  // Look at a side (dir −1 left / +1 right) for the window u∈[0,1]; ease in/out over ~0.22 of the window.
  function lookAt(u, dir) {
    const w = eio(u / 0.2) * (1 - eio((u - 0.8) / 0.2));
    return { headTurn: w * (dir || 1), headTilt: 3 * w * (dir || 1) };
  }
  // Idle breathing: always on, tiny, seeded so neighbours never sync.
  function idleBreath(t, seed) {
    const s = seed || 0, ph = hash(s) * 6.283, sp = 2.1 + hash(s + 1) * 0.5;
    return { squash: -0.05 * Math.sin(t * sp + ph), headTurn: 0.12 * Math.sin(t * 0.9 + s * 1.7), signTilt: 2 * Math.sin(t * 1.7 + ph),
      tailPhase: 6 * Math.sin(t * 2.1 + ph * 2) };
  }
  // Blink: deterministic schedule (period 2.8–4.2 s per seed), 0.12 s close/open.
  function blinkAt(t, seed) {
    const s = seed || 0, per = 2.8 + hash(s + 3) * 1.4, off = hash(s + 5) * per, ph = ((t + off) % per + per) % per;
    return { blink: ph < 0.12 ? bump(ph / 0.12) : 0 };
  }
  // Local progress of an action window: returns u, or null outside [t0, t0+d] (pass to compose → skipped).
  function local(t, t0, d) { return t < t0 || t > t0 + d ? null : (t - t0) / d; }
  function shadow(p) { const h = 1 - Math.min(0.5, -p.y / 300); return { x: p.x, scaleX: h * Math.pow(1 - 0.3 * clamp(p.squash, -1, 1), -0.5), scaleY: h, opacity: 0.4 + 0.6 * h }; }

  G.MouseRig = { svg, pose, compose, DEFAULT, jumpOver, duck, flinch, shakeHead, puffChest, cheer, lookAt, idleBreath, blinkAt,
    local, shadow, hash, ease: { eio, eo, ei, bump, lerp, clamp, c01 }, JUMP_PHASES: JUMP_PH };
})(typeof window !== 'undefined' ? window : this);
