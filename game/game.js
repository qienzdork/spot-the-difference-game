/* Twin Harbours — game logic: levels, timer, clicks, hints, scoring, screens.
 * The two canvases always show the same scene: the left panel draws the scene
 * as it is, the right panel draws it with every difference switched on.
 * Clicking either panel at a difference's spot finds it on both panels. */

import { SCENES, SCENE_W, SCENE_H } from './scenes.js';
import { SHOT_STAGES } from './shots.js';
import * as sfx from './audio.js';

const $ = (id) => document.getElementById(id);

const state = {
  screen: 'title', // title | play | level-clear | time-up | complete
  levelIndex: 0,
  found: new Set(), // difference ids found in this level
  foundAt: new Map(), // difference id -> timestamp of the find (ring animation)
  score: 0,
  combo: 0,
  hintsLeft: 3,
  timeLeft: 0,
  timeLimit: 0,
  hintRing: null, // { x, y, until }
  wrongFlash: null, // { x, y, panel, until }
  frozenTime: null, // set in ?shot= mode: animation clock stops here
  shotMode: false,
  best: 0,
  lastTickSecond: -1,
};
try { state.best = Number(localStorage.getItem('twin-harbours-best') || 0); } catch (e) { /* private mode */ }

const leftCtx = $('canvas-left').getContext('2d');
const rightCtx = $('canvas-right').getContext('2d');

export function currentScene() { return SCENES[state.levelIndex]; }
export function animTime() { return state.frozenTime !== null ? state.frozenTime : performance.now() / 1000; }
export function isPlaying() { return state.screen === 'play'; }

function fmtTime(s) {
  const m = Math.floor(s / 60), r = Math.max(0, Math.ceil(s % 60));
  return `${m}:${String(r).padStart(2, '0')}`;
}

function setMessage(html) { $('message').innerHTML = html; }

/* ------------------------------------------------------------------ */
/* HUD                                                                 */
/* ------------------------------------------------------------------ */
function renderHud() {
  const scene = currentScene();
  $('level-name').textContent = `Level ${state.levelIndex + 1} · ${scene.name}`;
  $('found-text').textContent = `${state.found.size} / ${scene.differences.length} found`;
  const dots = $('found-dots');
  dots.innerHTML = '';
  for (let i = 0; i < scene.differences.length; i++) {
    const d = document.createElement('span');
    d.className = 'dot' + (i < state.found.size ? ' on' : '');
    dots.appendChild(d);
  }
  const frac = state.timeLimit ? state.timeLeft / state.timeLimit : 1;
  $('timer-bar').style.width = `${Math.max(0, frac * 100)}%`;
  $('timer-text').textContent = fmtTime(state.timeLeft);
  $('timer-wrap').classList.toggle('low', state.timeLeft <= 20 && state.screen === 'play');
  $('score-text').textContent = state.score;
  $('hint-count').textContent = state.hintsLeft;
  $('hint-btn').disabled = state.hintsLeft <= 0 || state.screen !== 'play';
  const ld = $('level-dots');
  ld.innerHTML = '';
  SCENES.forEach((s, i) => {
    const d = document.createElement('span');
    d.className = 'ldot' + (i < state.levelIndex ? ' done' : i === state.levelIndex ? ' now' : '');
    d.title = s.name;
    ld.appendChild(d);
  });
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */
function drawMarkers(ctx, now) {
  const scene = currentScene();
  for (const diff of scene.differences) {
    if (!state.found.has(diff.id)) continue;
    const age = now - (state.foundAt.get(diff.id) || now);
    const grow = Math.min(1, age / 0.25);
    const r = (diff.r + 6) * (0.6 + 0.4 * grow);
    ctx.save();
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ffd23f';
    ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,210,63,0.55)';
    ctx.beginPath(); ctx.arc(diff.x, diff.y, r + 5, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (state.hintRing && now < state.hintRing.until) {
    const pulse = 0.5 + 0.5 * Math.sin(now * 8);
    const r = state.hintRing.r + 8 + pulse * 6;
    ctx.save();
    ctx.strokeStyle = `rgba(123,224,163,${0.65 + 0.35 * pulse})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.arc(state.hintRing.x, state.hintRing.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (state.wrongFlash && now < state.wrongFlash.until && state.wrongFlash.panel === ctx.canvas.id) {
    const a = 1 - (now - (state.wrongFlash.until - 0.5)) / 0.5;
    const { x, y } = state.wrongFlash;
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    ctx.strokeStyle = '#ff6b5e';
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10); ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
    ctx.restore();
  }
}

function drawFrame() {
  const now = animTime();
  const scene = currentScene();
  const active = new Set(scene.differences.map((d) => d.id));
  scene.draw(leftCtx, now, new Set());
  scene.draw(rightCtx, now, active);
  drawMarkers(leftCtx, now);
  drawMarkers(rightCtx, now);
}

/* ------------------------------------------------------------------ */
/* Clicks                                                              */
/* ------------------------------------------------------------------ */
function sceneCoords(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (SCENE_W / rect.width),
    y: (event.clientY - rect.top) * (SCENE_H / rect.height),
  };
}

export function handleClickAt(panelId, x, y) {
  if (state.screen !== 'play') return false;
  const scene = currentScene();
  let best = null, bestDist = Infinity;
  for (const diff of scene.differences) {
    if (state.found.has(diff.id)) continue;
    const d = Math.hypot(diff.x - x, diff.y - y);
    if (d < diff.r + 8 && d < bestDist) { best = diff; bestDist = d; }
  }
  const now = animTime();
  if (best) {
    state.found.add(best.id);
    state.foundAt.set(best.id, now);
    const bonus = 100 + Math.min(state.combo, 6) * 25;
    state.score += bonus;
    state.combo += 1;
    sfx.playFound(state.combo);
    setMessage(`<b>Found it!</b> ${best.label} — +${bonus} points${state.combo > 1 ? ` · combo ×${state.combo}` : ''}.`);
    renderHud();
    if (state.found.size === scene.differences.length) levelClear();
    return true;
  }
  state.combo = 0;
  state.timeLeft = Math.max(0, state.timeLeft - 5);
  state.wrongFlash = { x, y, panel: panelId, until: now + 0.5 };
  sfx.playWrong();
  setMessage(`<b>Not there!</b> −5 seconds. Look closer — the change is small and fair.`);
  renderHud();
  if (state.timeLeft <= 0) timeUp();
  return false;
}

function onCanvasClick(event) {
  const canvas = event.currentTarget;
  const { x, y } = sceneCoords(canvas, event);
  handleClickAt(canvas.id, x, y);
}

/* ------------------------------------------------------------------ */
/* Timer + main loop                                                   */
/* ------------------------------------------------------------------ */
let lastFrame = performance.now();
function loop(nowMs) {
  const dt = Math.min(0.1, (nowMs - lastFrame) / 1000);
  lastFrame = nowMs;
  if (state.screen === 'play' && !state.shotMode) {
    state.timeLeft -= dt;
    const sec = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10 && sec !== state.lastTickSecond && state.timeLeft > 0) {
      state.lastTickSecond = sec;
      sfx.playTick();
    }
    if (state.timeLeft <= 0) { state.timeLeft = 0; renderHud(); timeUp(); }
    else {
      // The clock is the only HUD part that moves every frame.
      const frac = state.timeLimit ? state.timeLeft / state.timeLimit : 1;
      $('timer-bar').style.width = `${Math.max(0, frac * 100)}%`;
      $('timer-text').textContent = fmtTime(state.timeLeft);
      $('timer-wrap').classList.toggle('low', state.timeLeft <= 20);
    }
  }
  drawFrame();
  requestAnimationFrame(loop);
}

/* ------------------------------------------------------------------ */
/* Levels + overlays                                                   */
/* ------------------------------------------------------------------ */
function showOverlay({ title, sub, stars, stats, btn, hint }) {
  $('overlay-title').textContent = title;
  $('overlay-sub').innerHTML = sub;
  $('overlay-stars').textContent = stars || '';
  $('overlay-stats').innerHTML = stats || '';
  $('overlay-btn').textContent = btn;
  $('overlay-hint').textContent = hint || '';
  $('overlay').classList.remove('hidden');
}
function hideOverlay() { $('overlay').classList.add('hidden'); }

function startLevel(index) {
  state.levelIndex = index;
  const scene = currentScene();
  state.found = new Set();
  state.foundAt = new Map();
  state.combo = 0;
  state.hintsLeft = 3;
  state.timeLimit = scene.timeLimit;
  state.timeLeft = scene.timeLimit;
  state.hintRing = null;
  state.wrongFlash = null;
  state.screen = 'play';
  hideOverlay();
  setMessage(`<b>${scene.name}</b> — ${scene.differences.length} differences hiding between the two pictures. ${scene.sub}.`);
  renderHud();
}

function levelClear() {
  const scene = currentScene();
  const bonus = Math.ceil(state.timeLeft) * 5;
  state.score += bonus;
  const frac = state.timeLeft / state.timeLimit;
  const stars = frac >= 0.4 ? '★★★' : frac >= 0.2 ? '★★☆' : '★☆☆';
  const last = state.levelIndex === SCENES.length - 1;
  state.screen = last ? 'complete' : 'level-clear';
  if (last) {
    if (state.score > state.best) {
      state.best = state.score;
      try { localStorage.setItem('twin-harbours-best', String(state.best)); } catch (e) { /* private mode */ }
    }
    sfx.playWin();
    showOverlay({
      title: 'Voyage Complete!',
      sub: `You cleared every harbour — all ${SCENES.reduce((n, s) => n + s.differences.length, 0)} differences found, from the lighthouse pier to the snow station.`,
      stars,
      stats: `<b>Final score: ${state.score}</b><br>Best voyage: ${state.best}<br>Time bonus on the last harbour: +${bonus}`,
      btn: '↻ Sail Again',
      hint: 'Press Enter to play again · H for a hint · M to mute',
    });
  } else {
    sfx.playLevelClear();
    showOverlay({
      title: `${scene.name} — Clear!`,
      sub: `All ${scene.differences.length} differences found. The next harbour is waiting.`,
      stars,
      stats: `Time bonus: <b>+${bonus}</b> (${Math.ceil(state.timeLeft)}s left × 5)<br>Score: <b>${state.score}</b>`,
      btn: 'Next Harbour →',
      hint: 'Press Enter to continue · H for a hint · M to mute',
    });
  }
  renderHud();
}

function timeUp() {
  if (state.screen !== 'play') return;
  state.screen = 'time-up';
  sfx.playWrong();
  showOverlay({
    title: 'Out of Time!',
    sub: `The fog rolled in over ${currentScene().name} with ${currentScene().differences.length - state.found.size} differences still hiding.`,
    stars: '☆☆☆',
    stats: `Found: <b>${state.found.size} / ${currentScene().differences.length}</b><br>Score kept: <b>${state.score}</b>`,
    btn: '↻ Try This Harbour Again',
    hint: 'Tip: scan the picture in rows, and spend a hint when you are stuck.',
  });
  renderHud();
}

function startGame() {
  state.score = 0;
  startLevel(0);
}

/* ------------------------------------------------------------------ */
/* Hints                                                               */
/* ------------------------------------------------------------------ */
export function useHint() {
  if (state.screen !== 'play' || state.hintsLeft <= 0) return false;
  const scene = currentScene();
  const remaining = scene.differences.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return false;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - 50);
  state.hintRing = { x: pick.x, y: pick.y, r: pick.r, until: animTime() + 3 };
  sfx.playHint();
  setMessage(`<b>Hint:</b> something is different near the green ring — look closely. −50 points.`);
  renderHud();
  return true;
}

/* ------------------------------------------------------------------ */
/* Overlay button + keyboard                                           */
/* ------------------------------------------------------------------ */
function onOverlayButton() {
  if (state.screen === 'level-clear') startLevel(state.levelIndex + 1);
  else if (state.screen === 'time-up') startLevel(state.levelIndex);
  else if (state.screen === 'complete') startGame();
  else if (state.screen === 'title') startGame();
}

function onKey(event) {
  if (event.key === 'h' || event.key === 'H') { useHint(); return; }
  if (event.key === 'm' || event.key === 'M') {
    const muted = sfx.toggleMute();
    $('mute-btn').textContent = muted ? '🔇' : '🔊';
    return;
  }
  if (event.key === 'Enter' || event.key === ' ') {
    if (state.screen !== 'play') { event.preventDefault(); onOverlayButton(); }
  }
}

/* ------------------------------------------------------------------ */
/* Screenshot staging (?shot=...) — deterministic mid-play frames     */
/* rendered through the real click path, for the maker's screenshots.  */
/* ------------------------------------------------------------------ */
export function stageShot(name) {
  const stage = SHOT_STAGES[name] ?? SHOT_STAGES.play;
  state.shotMode = true;
  state.frozenTime = 2.0;
  startLevel(stage.level);
  // Stage the clock first, so a level-clear card staged here shows the
  // same time the HUD behind it shows.
  state.timeLeft = stage.timeLeft;
  const scene = currentScene();
  for (let i = 0; i < Math.min(stage.found, scene.differences.length); i++) {
    const diff = scene.differences[i];
    handleClickAt('canvas-left', diff.x, diff.y);
  }
  state.foundAt = new Map([...state.foundAt].map(([k]) => [k, 1.2]));
  renderHud();
  drawFrame();
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
export function initGame() {
  $('canvas-left').addEventListener('click', onCanvasClick);
  $('canvas-right').addEventListener('click', onCanvasClick);
  $('hint-btn').addEventListener('click', useHint);
  $('mute-btn').addEventListener('click', () => {
    const muted = sfx.toggleMute();
    $('mute-btn').textContent = muted ? '🔇' : '🔊';
  });
  $('overlay-btn').addEventListener('click', onOverlayButton);
  document.addEventListener('keydown', onKey);
  if (sfx.isMuted()) $('mute-btn').textContent = '🔇';
  renderHud();
  drawFrame();
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) { stageShot(shot); return; }
  state.screen = 'title';
  showOverlay({
    title: '⚓ Twin Harbours',
    sub: 'Two pictures of the same harbour — almost. <b>Find every difference</b> between them before the fog rolls in. Five harbours, 39 differences, one sharp eye.',
    stars: '',
    stats: `Best voyage: <b>${state.best}</b><br>Click a difference on either picture · wrong click −5s · hint −50 pts`,
    btn: '▶ Set Sail',
    hint: 'Keyboard: H hint · M mute · Enter start / continue',
  });
  requestAnimationFrame(loop);
}

/* Small test handle: lets an automated check play the real game. */
window.__twinHarbours = {
  state,
  clickAt: (panelId, x, y) => handleClickAt(panelId, x, y),
  useHint,
  startGame,
  startLevel,
  stageShot,
};
