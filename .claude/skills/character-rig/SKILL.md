---
name: character-rig
description: Use when adding acting characters (e.g. the sign-holding mouse) to code-rendered explainer videos (HTML/SVG + window.seek, Remotion, Puppeteer capture), when reusing or swapping a character across videos, or when building a new character that must share the same pose/action interface.
---

# Character Rig

Reusable characters live in `assets/characters/`. Reference implementation: `mouse-rig.js` (global `MouseRig`), demo `mouse-rig-demo.html` (one looping cell per action, `window.seek(t)`). Source of the acting: `samples/01-insertion-sort/v2/index.html`.

Principle: a character is a **pure pose evaluator**. `pose(t) = base + Σ action deltas(u)`, applied once per frame. No state between frames, no `Date.now`, no `Math.random`.

## Mount

```html
<script src="../../assets/characters/mouse-rig.js"></script>
<div id="floorAnchor" style="position:absolute;left:0;top:820px"></div>
<script>
anchor.innerHTML = MouseRig.svg('m5', {body:'#c7bfd6', scale:1});
const el = document.getElementById('m5');
function render(t){ MouseRig.pose(el, MouseRig.compose(base, ...deltas)); }
window.seek = t => { stopped = true; render(t); };
</script>
```

- Origin = between the feet on the floor; parent container sits at floor y. `x` is px along the floor, `y` negative = up.
- `svg(id, opts)`: `body, ear, belly, feet, tail, stick, ink, scale, sign(false = no sign)`.
- Named groups (`data-part`): `body, tail, chest, arm, sign, signRect, signText, head, ears, face, eyes, mouth, hand`.
- Shadow: `MouseRig.shadow(pose)` → `{x, scaleX, scaleY, opacity}` for a separate ellipse div.
- Several characters: z-order via `el.style.zIndex` (the jumper behind, the ducker in front, as in v2).

## Pose parameters

| key | range | meaning |
|---|---|---|
| x, y | px | feet position (y<0 airborne) |
| squash | −1..1 | +compress / −stretch, pivot at feet, sx = sy^−½ (volume) |
| lean | deg | whole-body rotation around feet |
| headTilt | deg | head rotation |
| headTurn | −1..1 | look left/right (face + head shift) |
| eyes | open/closed/happy/wide | eye shape |
| blink | 0..1 | lid closure on open/wide eyes |
| mouth | smile/o/flat | mouth shape |
| chestPuff | 0..1 | chest scale + head lift |
| signText | string | sign content |
| signState | idle/active/sorted | cream / orange / green |
| signTilt | deg | sign rotation (lag, wobble) |
| signLagX, signLagY | px | sign offset (lag, tuck, dodge) |
| signRaise | 0..1 (×) | sign lowered→raised (entrance) |
| signFlip | −1..1 (×) | scaleX for a card-flip reveal; swap text when \|flip\| crosses 0 |
| tailPhase | deg (±50) | tail rotation around its root |

`compose(base, ...deltas)`: numbers add, `signRaise/signFlip` multiply, strings: last non-empty wins, `null` deltas are skipped.

## Action vocabulary

All are pure functions of local progress `u∈[0,1]`. Get `u` via `MouseRig.local(t, t0, d)` (null outside the window).

| action | duration | notes |
|---|---|---|
| `jumpOver(u,{from,to,height})` | 0.9–1.1 s; chained repeats shrink 0.95→0.78→0.64→0.54 | phases: anticipation 0–22% crouch+lean back → launch/arc 22–72% (stretch on takeoff, hang at apex, stretch into contact) → land squash 72–86% → overshoot/settle 86–100%. Returns absolute `x` (owns x: override, don't add base x). Sign lags 9%, tail lags 20%, sign tucks mid-air. |
| `duck(u,{from,to})` | same u as the jumper | neighbour being jumped over: crouches, slides the other way, sign dodges |
| `flinch(u,{dir})` | 0.4–0.6 s | 18% fast recoil, 82% slow recovery, wide eyes |
| `shakeHead(u,times)` | 0.9–1.2 s, times 3 | enveloped oscillation, eyes closed, sign counter-wobble |
| `puffChest(u)` | 1.5–3 s | 20% ease in, hold, 20% ease out; happy eyes |
| `cheer(u,hops)` | 0.55 s per hop | crouch→hop→land per hop; stagger mice by 0.09 s |
| `lookAt(u,dir)` | ≥0.6 s window | ease in/out over 20% each end |
| `idleBreath(t,seed)` | always on | tiny breath, head drift, sign/tail sway; seed per character so they never sync |
| `blinkAt(t,seed)` | always on | period 2.8–4.2 s per seed, 0.12 s blink |

## Composing on a timeline

```js
const u1 = R.local(t, JUMP.t0, JUMP.d);
const p = R.compose(
  {x: slotX(idx), signText: '2', signState: active ? 'active' : 'idle'},
  R.idleBreath(t, id), R.blinkAt(t, id),
  lookU != null ? R.lookAt(lookU, -1) : null,
  u1 != null ? R.jumpOver(u1, {from: slotX(i), to: slotX(i-1)}) : null);
if (u1 != null) p.x = R.jumpOver(u1, {...}).x;   // jump owns x
R.pose(el, p);
```

- Event times come from `timeline.json` (voice-over windows), never hard-coded seconds.
- Business state (`order`) decides base `x`; actions only animate the transition. Expose `window.__state(t)`.
- One primary action per character at a time; secondary (look, blink, breath) may overlap.
- Cue reactions to the narration: look at the neighbour before the compare, then the jump, then the verdict (shake/puff).

## Disney rules that apply

- Anticipation: crouch and lean against the travel direction before every jump/hop.
- Squash & stretch only near acceleration and contact; never continuous. Pivot at the feet.
- Arcs: living things travel in arcs; x uses inOut, y a sine hump.
- Follow-through / overlap: sign and tail are sampled from the body at an earlier u, so they start later and settle later.
- Timing asymmetry: fast recoil, slow recovery; shrink durations in chained jumps to read as momentum.
- Staging: the character being talked about acts; others only breathe and look at it.
- Appeal: seeded idle variation so a row of identical rigs never moves in sync.

## New character, same interface

1. New file `assets/characters/<name>-rig.js` exposing global `<Name>Rig` with the same API: `svg, pose, compose, local, shadow` + the action names above.
2. Keep the coordinate contract: origin between feet, y up negative, 1 unit = 1 px at scale 1, sign group at the same relative height if it holds a sign.
3. Keep pose key names and ranges; map unsupported keys to the nearest visual (e.g. a robot maps `chestPuff` to a light glow). Ignore unknown keys rather than throwing.
4. Reuse action delta functions where the anatomy matches; rewrite only the parts that differ.
5. Add a demo page with the same cells and verify with `node scripts/keyframes.js <demo> out/<name> 0.3 0.8 1.4`（需 `npm i puppeteer-core`）.
6. Swapping characters in a video = change the script tag and the global name; timeline code must not change.

## Anti-patterns

- One linear progress for every channel; secondary parts moving in sync with the body.
- Squash held for the whole airborne phase, or scaled around the centre instead of the feet.
- Adding `jumpOver().x` on top of base x (double travel).
- Storing velocity/last frame on the element to drive lag (breaks `seek` and out-of-order render). Sample the pure function at `u − Δ` instead.
- `Math.random()` for blinks; all mice blinking together.
- Editing the SVG per video instead of passing `opts`.
- Acting with no narrative cue (random head shakes while nothing happens).

## Checklist

- [ ] `seek(t)` twice with the same t gives identical pixels; no console errors.
- [ ] Jump frames at anticipation / mid-air / landing show crouch, arc, squash.
- [ ] Sign and tail visibly settle after the body.
- [ ] Every action window comes from `timeline.json`.
- [ ] Each character has its own seed.
- [ ] Sign text is not covered by another mouse; jumper's sign tucks mid-air.
- [ ] Looked at ≥2 rendered PNGs.
