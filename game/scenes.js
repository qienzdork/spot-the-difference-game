/* Twin Harbours — scene art.
 * Every scene draws into a 560 x 420 canvas. draw(ctx, t, diffs) paints the scene;
 * `diffs` is a Set of difference ids switched ON for the right-hand panel.
 * The left panel always draws with an empty set. A difference is a small, fair
 * visual change: something missing, a colour swapped, a count changed, a shape moved.
 * Nothing here is copied from any existing game: all art is drawn from code. */

export const SCENE_W = 560;
export const SCENE_H = 420;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function star4(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r);
}
function sky(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
}
function glow(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha; ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1;
}
function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y); ctx.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 9 * s, y);
  ctx.stroke();
}
function pine(ctx, x, y, h, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const w = 64 - i * 16, yy = y - i * (h / 3.4);
    ctx.beginPath();
    ctx.moveTo(x - w / 2, yy); ctx.lineTo(x, yy - h / 2.6); ctx.lineTo(x + w / 2, yy);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - 4, y - 4, 8, 14);
}
function fish(ctx, x, y, s, body, fin) {
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.ellipse(x, y, 16 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = fin;
  ctx.beginPath(); ctx.moveTo(x - 13 * s, y); ctx.lineTo(x - 24 * s, y - 9 * s); ctx.lineTo(x - 24 * s, y + 9 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#10202e'; circle(ctx, x + 8 * s, y - 2 * s, 1.8 * s); ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Level 1 — Dusk Harbour                                              */
/* ------------------------------------------------------------------ */
function drawHarbour(ctx, t, diffs) {
  sky(ctx, [[0, '#2b2350'], [0.55, '#7a4a6e'], [0.75, '#e08a4e'], [1, '#3a2b4d']]);
  // setting sun + glow
  glow(ctx, 420, 238, 90, '#ffb347', 0.85);
  ctx.fillStyle = '#ffd98a'; circle(ctx, 420, 238, 26); ctx.fill();
  // early stars
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const [x, y, r] of [[60, 40, 1.6], [150, 26, 1.3], [240, 52, 1.5], [330, 30, 1.2], [500, 44, 1.6], [90, 92, 1.2], [280, 84, 1.1]]) {
    star4(ctx, x, y, r * 3); ctx.fill();
  }
  // moon: crescent normally, full when the diff is on
  if (diffs.has('moon')) { ctx.fillStyle = '#f4ead2'; circle(ctx, 92, 66, 17); ctx.fill(); }
  else {
    ctx.fillStyle = '#f4ead2'; circle(ctx, 92, 66, 17); ctx.fill();
    ctx.fillStyle = '#2b2350'; circle(ctx, 99, 61, 15); ctx.fill();
  }
  // gulls (one vanishes on the right panel)
  gull(ctx, 150, 64, 1, '#1d1426');
  if (!diffs.has('gull')) gull(ctx, 210, 44, 0.85, '#1d1426');
  gull(ctx, 300, 78, 0.9, '#1d1426');
  // sea
  const sea = ctx.createLinearGradient(0, 250, 0, SCENE_H);
  sea.addColorStop(0, '#274b6d'); sea.addColorStop(1, '#12283f');
  ctx.fillStyle = sea; ctx.fillRect(0, 250, SCENE_W, 170);
  ctx.strokeStyle = 'rgba(255,190,110,0.35)'; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const y = 268 + i * 26, off = Math.sin(t * 0.8 + i * 1.7) * 8;
    ctx.beginPath();
    ctx.moveTo(30 + off, y); ctx.quadraticCurveTo(180 + off, y - 5, 330 + off, y);
    ctx.quadraticCurveTo(450 + off, y + 5, 530 + off, y); ctx.stroke();
  }
  // lighthouse
  ctx.fillStyle = '#e8e0cc';
  ctx.beginPath(); ctx.moveTo(52, 252); ctx.lineTo(64, 128); ctx.lineTo(96, 128); ctx.lineTo(108, 252); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(58, 196, 44, 16); ctx.fillRect(62, 158, 36, 14);
  ctx.fillStyle = '#2c2c34'; ctx.fillRect(60, 118, 40, 12);
  ctx.fillStyle = '#ffe9a3'; circle(ctx, 80, 112, 7); ctx.fill();
  glow(ctx, 80, 112, 46, '#ffe9a3', 0.5 + 0.2 * Math.sin(t * 2));
  // extra lit window when the diff is on
  if (diffs.has('window')) { ctx.fillStyle = '#ffe9a3'; ctx.fillRect(72, 168, 16, 12); }
  else { ctx.fillStyle = '#3a2f45'; ctx.fillRect(72, 168, 16, 12); }
  // boats
  function boat(x, y, s, hull, sail) {
    ctx.fillStyle = hull;
    ctx.beginPath(); ctx.moveTo(x - 34 * s, y); ctx.lineTo(x + 34 * s, y); ctx.lineTo(x + 24 * s, y + 14 * s); ctx.lineTo(x - 24 * s, y + 14 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 52 * s); ctx.stroke();
    ctx.fillStyle = sail;
    ctx.beginPath(); ctx.moveTo(x + 3, y - 4); ctx.lineTo(x + 3, y - 50 * s); ctx.lineTo(x + 30 * s, y - 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 3, y - 4); ctx.lineTo(x - 3, y - 44 * s); ctx.lineTo(x - 24 * s, y - 4); ctx.closePath(); ctx.fill();
  }
  boat(300, 300, 1, '#7a4a2b', '#f4ead2');
  boat(450, 330, 0.8, '#4a6e8a', '#dfe9f2');
  // the near boat's flag: red normally, teal on the right panel
  ctx.fillStyle = diffs.has('flag') ? '#2ec4b6' : '#e63946';
  ctx.beginPath(); ctx.moveTo(300, 248); ctx.lineTo(322, 253); ctx.lineTo(300, 259); ctx.closePath(); ctx.fill();
  // pier
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(0, 352, SCENE_W, 68);
  ctx.fillStyle = '#7d5a3a';
  for (let x = 0; x < SCENE_W; x += 46) ctx.fillRect(x, 352, 40, 68);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  for (let x = 46; x < SCENE_W; x += 46) { ctx.beginPath(); ctx.moveTo(x, 352); ctx.lineTo(x, 420); ctx.stroke(); }
  ctx.fillStyle = '#4a3220';
  for (const x of [70, 210, 350, 490]) ctx.fillRect(x - 5, 330, 10, 26);
  // crates: three normally, two on the right panel
  ctx.fillStyle = '#a8763e';
  ctx.fillRect(380, 322, 30, 30); ctx.fillRect(412, 322, 30, 30);
  if (!diffs.has('crate')) ctx.fillRect(396, 292, 30, 30);
  ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = 2;
  ctx.strokeRect(380, 322, 30, 30); ctx.strokeRect(412, 322, 30, 30);
  if (!diffs.has('crate')) ctx.strokeRect(396, 292, 30, 30);
  // lantern post: warm gold normally, green on the right panel
  ctx.fillStyle = '#2c2c34'; ctx.fillRect(516, 296, 5, 56);
  const lampColor = diffs.has('lantern') ? '#7be0a3' : '#ffca5f';
  glow(ctx, 518, 288, 34, lampColor, 0.8);
  ctx.fillStyle = lampColor; circle(ctx, 518, 288, 8); ctx.fill();
  ctx.fillStyle = '#2c2c34'; ctx.fillRect(510, 278, 16, 5);
  // cat on the pier: tail up normally, curled down on the right panel
  ctx.fillStyle = '#2e2a33';
  ctx.beginPath(); ctx.ellipse(150, 340, 16, 11, 0, 0, Math.PI * 2); ctx.fill();
  circle(ctx, 162, 326, 8); ctx.fill();
  ctx.beginPath(); ctx.moveTo(156, 320); ctx.lineTo(158, 312); ctx.lineTo(162, 319); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(164, 320); ctx.lineTo(167, 312); ctx.lineTo(169, 319); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2e2a33'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  if (diffs.has('cat-tail')) { ctx.moveTo(136, 342); ctx.quadraticCurveTo(126, 348, 132, 352); }
  else { ctx.moveTo(136, 338); ctx.quadraticCurveTo(128, 326, 136, 318); }
  ctx.stroke();
}

/* ------------------------------------------------------------------ */
/* Level 2 — Night Market                                              */
/* ------------------------------------------------------------------ */
function drawMarket(ctx, t, diffs) {
  sky(ctx, [[0, '#0d1530'], [0.6, '#1c2a52'], [1, '#3a2a55']]);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (const [x, y] of [[40, 36], [120, 60], [260, 30], [420, 52], [520, 28], [200, 90], [470, 96]]) {
    star4(ctx, x, y, 3.4); ctx.fill();
  }
  // string lights across the top
  ctx.strokeStyle = '#0a0a12'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 26); ctx.quadraticCurveTo(280, 66, 560, 26); ctx.stroke();
  const bulbs = [[60, 38], [140, 48], [220, 54], [300, 56], [380, 52], [460, 44], [520, 34]];
  bulbs.forEach(([x, y], i) => {
    const dark = diffs.has('bulb') && i === 3;
    const c = dark ? '#3a3a44' : ['#ffd23f', '#ff8fa3', '#7be0a3'][i % 3];
    if (!dark) glow(ctx, x, y + 8, 16, c, 0.7);
    ctx.fillStyle = c; circle(ctx, x, y + 8, 4.5); ctx.fill();
  });
  // ground
  ctx.fillStyle = '#2a2118'; ctx.fillRect(0, 330, SCENE_W, 90);
  ctx.fillStyle = '#3a2f22';
  for (let x = 0; x < SCENE_W; x += 52) { ctx.beginPath(); ctx.ellipse(x + 26, 372, 22, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  // stall 1 (left): fruit
  ctx.fillStyle = '#8a2f2f';
  ctx.beginPath(); ctx.moveTo(30, 150); ctx.lineTo(210, 150); ctx.lineTo(196, 196); ctx.lineTo(44, 196); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4ead2';
  for (let x = 34; x < 210; x += 22) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x + 11, 196); ctx.lineTo(x + 22, 150); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(44, 196, 152, 10);
  ctx.fillStyle = '#7d5a3a'; ctx.fillRect(40, 206, 160, 110);
  // fruit piles: oranges and apples; one apple turns orange on the right panel
  function fruitPile(x, y) {
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - r; i++) {
      const fx = x + i * 15 + r * 7, fy = y - r * 13;
      ctx.fillStyle = '#ff7b2f'; circle(ctx, fx, fy, 7); ctx.fill();
    }
  }
  fruitPile(70, 196); fruitPile(150, 196);
  ctx.fillStyle = diffs.has('apple') ? '#ff7b2f' : '#e63946';
  circle(ctx, 118, 182, 7); ctx.fill();
  ctx.fillStyle = '#e63946'; circle(ctx, 104, 190, 7); ctx.fill();
  // jar on the counter: blue normally, green on the right panel
  ctx.fillStyle = diffs.has('jar') ? '#2ec4b6' : '#4a7dd4';
  rr(ctx, 168, 168, 18, 28, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(171, 172, 4, 20);
  // stall 2 (right): lanterns; one lantern vanishes on the right panel
  ctx.fillStyle = '#1f5c46';
  ctx.beginPath(); ctx.moveTo(340, 150); ctx.lineTo(530, 150); ctx.lineTo(516, 196); ctx.lineTo(354, 196); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4ead2';
  for (let x = 344; x < 530; x += 22) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x + 11, 196); ctx.lineTo(x + 22, 150); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(354, 196, 162, 10);
  ctx.fillStyle = '#7d5a3a'; ctx.fillRect(350, 206, 170, 110);
  const lanternXs = [380, 420, 460, 500];
  lanternXs.forEach((x, i) => {
    if (diffs.has('lantern') && i === 2) return;
    const sway = Math.sin(t * 1.1 + i) * 2;
    ctx.strokeStyle = '#2c2c34'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 206); ctx.lineTo(x + sway, 222); ctx.stroke();
    glow(ctx, x + sway, 238, 22, '#ff5f6d', 0.75);
    ctx.fillStyle = '#ff5f6d';
    ctx.beginPath(); ctx.ellipse(x + sway, 238, 11, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + sway - 5, 224, 10, 3); ctx.fillRect(x + sway - 5, 250, 10, 3);
  });
  // signboard: MARKET normally, MARKFT on the right panel
  ctx.fillStyle = '#3a2a1a'; rr(ctx, 216, 96, 128, 44, 8); ctx.fill();
  ctx.strokeStyle = '#f5c542'; ctx.lineWidth = 2; rr(ctx, 216, 96, 128, 44, 8); ctx.stroke();
  ctx.fillStyle = '#ffe9a3'; ctx.font = 'bold 24px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(diffs.has('sign') ? 'MARKFT' : 'MARKET', 280, 119);
  // bicycle leaning on stall 2: front wheel missing on the right panel
  ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 3;
  circle(ctx, 356, 348, 20); ctx.stroke();
  if (!diffs.has('wheel')) { circle(ctx, 424, 348, 20); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(356, 348); ctx.lineTo(392, 316); ctx.lineTo(424, 348); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(392, 316); ctx.lineTo(384, 300); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(384, 300); ctx.lineTo(402, 300); ctx.stroke();
  // cat on stall 1: missing on the right panel
  if (!diffs.has('cat')) {
    ctx.fillStyle = '#e8e0cc';
    ctx.beginPath(); ctx.ellipse(96, 150, 15, 10, 0, 0, Math.PI * 2); ctx.fill();
    circle(ctx, 108, 138, 7.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(103, 133); ctx.lineTo(105, 126); ctx.lineTo(108, 132); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8e0cc'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(83, 146); ctx.quadraticCurveTo(74, 136, 82, 130); ctx.stroke();
  }
}

/* ------------------------------------------------------------------ */
/* Level 3 — Forest Camp                                               */
/* ------------------------------------------------------------------ */
function drawCamp(ctx, t, diffs) {
  sky(ctx, [[0, '#0a1a2e'], [0.6, '#14324a'], [1, '#1e4a3a']]);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (const [x, y] of [[50, 40], [130, 70], [230, 34], [330, 58], [470, 40], [520, 90], [90, 110], [400, 100]]) {
    star4(ctx, x, y, 3); ctx.fill();
  }
  // one star winks out on the right panel
  if (!diffs.has('star')) { ctx.fillStyle = '#ffe9a3'; star4(ctx, 300, 26, 5); ctx.fill(); }
  // moon
  ctx.fillStyle = '#f4ead2'; circle(ctx, 500, 56, 20); ctx.fill();
  ctx.fillStyle = '#d9cba6'; circle(ctx, 493, 50, 4); ctx.fill(); circle(ctx, 506, 62, 3); ctx.fill();
  // treeline
  pine(ctx, 40, 300, 190, '#0e2a1e'); pine(ctx, 120, 306, 160, '#123524');
  pine(ctx, 510, 300, 200, '#0e2a1e'); pine(ctx, 440, 310, 150, '#123524');
  // ground
  ctx.fillStyle = '#1d3a24'; ctx.fillRect(0, 300, SCENE_W, 120);
  ctx.fillStyle = '#24492c';
  for (let x = 20; x < SCENE_W; x += 44) { ctx.beginPath(); ctx.ellipse(x, 340, 26, 7, 0, 0, Math.PI * 2); ctx.fill(); }
  // tent: door closed normally, open (dark triangle) on the right panel
  ctx.fillStyle = '#e07b39';
  ctx.beginPath(); ctx.moveTo(200, 300); ctx.lineTo(280, 190); ctx.lineTo(360, 300); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c96a2e';
  ctx.beginPath(); ctx.moveTo(280, 190); ctx.lineTo(360, 300); ctx.lineTo(300, 300); ctx.closePath(); ctx.fill();
  if (diffs.has('tent')) {
    ctx.fillStyle = '#1a1210';
    ctx.beginPath(); ctx.moveTo(264, 300); ctx.lineTo(280, 252); ctx.lineTo(296, 300); ctx.closePath(); ctx.fill();
  } else {
    ctx.strokeStyle = '#8a4a1d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(264, 300); ctx.lineTo(280, 252); ctx.lineTo(296, 300); ctx.closePath(); ctx.stroke();
  }
  ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(280, 190); ctx.lineTo(280, 176); ctx.stroke();
  ctx.fillStyle = '#f5c542';
  ctx.beginPath(); ctx.moveTo(280, 176); ctx.lineTo(296, 181); ctx.lineTo(280, 186); ctx.closePath(); ctx.fill();
  // campfire
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(392, 318, 66, 10);
  ctx.fillStyle = '#7a5230';
  ctx.beginPath(); ctx.moveTo(398, 322); ctx.lineTo(420, 306); ctx.lineTo(428, 322); ctx.closePath(); ctx.fill();
  // one log missing on the right panel
  if (!diffs.has('log')) {
    ctx.beginPath(); ctx.moveTo(452, 322); ctx.lineTo(432, 306); ctx.lineTo(424, 322); ctx.closePath(); ctx.fill();
  }
  const flick = 1 + 0.12 * Math.sin(t * 7) + 0.06 * Math.sin(t * 13);
  glow(ctx, 425, 296, 54 * flick, '#ff9a3d', 0.8);
  ctx.fillStyle = '#ff7b2f';
  ctx.beginPath(); ctx.moveTo(408, 320); ctx.quadraticCurveTo(404, 292, 425, 276 * flick + 8); ctx.quadraticCurveTo(446, 292, 442, 320); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.moveTo(415, 320); ctx.quadraticCurveTo(413, 300, 425, 290); ctx.quadraticCurveTo(437, 300, 435, 320); ctx.closePath(); ctx.fill();
  // marshmallow stick: marshmallow present normally, bare stick on the right panel
  ctx.strokeStyle = '#8a6a45'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(452, 356); ctx.lineTo(478, 306); ctx.stroke();
  if (!diffs.has('mallow')) { ctx.fillStyle = '#fff6e0'; rr(ctx, 472, 292, 12, 14, 4); ctx.fill(); }
  // backpack: red normally, blue on the right panel
  ctx.fillStyle = diffs.has('pack') ? '#3d6ed4' : '#c0392b';
  rr(ctx, 96, 322, 44, 38, 10); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(ctx, 96, 322, 44, 12, 10); ctx.fill();
  ctx.strokeStyle = '#2c2c34'; ctx.lineWidth = 2; rr(ctx, 96, 322, 44, 38, 10); ctx.stroke();
  // mushrooms: one vanishes on the right panel
  function mushroom(x, y, s) {
    ctx.fillStyle = '#f4ead2'; ctx.fillRect(x - 2 * s, y, 4 * s, 8 * s);
    ctx.fillStyle = '#e63946';
    ctx.beginPath(); ctx.arc(x, y, 9 * s, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; circle(ctx, x - 3 * s, y - 4 * s, 1.6 * s); ctx.fill(); circle(ctx, x + 3 * s, y - 2 * s, 1.4 * s); ctx.fill();
  }
  mushroom(160, 372, 1); mushroom(178, 380, 0.8);
  if (!diffs.has('shroom')) mushroom(500, 376, 1);
  // owl on the branch: missing on the right panel
  ctx.strokeStyle = '#4a3220'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(452, 218); ctx.lineTo(528, 206); ctx.stroke();
  if (!diffs.has('owl')) {
    ctx.fillStyle = '#7a5a3a';
    ctx.beginPath(); ctx.ellipse(492, 196, 13, 17, 0, 0, Math.PI * 2); ctx.fill();
    circle(ctx, 492, 176, 9); ctx.fill();
    ctx.fillStyle = '#ffe9a3'; circle(ctx, 488, 175, 2.4); ctx.fill(); circle(ctx, 496, 175, 2.4); ctx.fill();
    ctx.fillStyle = '#1d1426'; circle(ctx, 488, 175, 1.2); ctx.fill(); circle(ctx, 496, 175, 1.2); ctx.fill();
  }
  // fireflies: three normally, two on the right panel
  const flies = [[240, 240], [330, 220], [150, 260]];
  flies.forEach(([x, y], i) => {
    if (diffs.has('firefly') && i === 2) return;
    const fx = x + Math.sin(t * 1.3 + i * 2.1) * 7, fy = y + Math.cos(t * 1.7 + i) * 5;
    glow(ctx, fx, fy, 12, '#d8f79a', 0.55 + 0.3 * Math.sin(t * 3 + i));
    ctx.fillStyle = '#eaffb0'; circle(ctx, fx, fy, 2.4); ctx.fill();
  });
}

/* ------------------------------------------------------------------ */
/* Level 4 — Coral Reef                                                */
/* ------------------------------------------------------------------ */
function drawReef(ctx, t, diffs) {
  sky(ctx, [[0, '#1a6a9a'], [0.55, '#14608f'], [1, '#0d3a5c']]);
  // light rays from the surface
  ctx.fillStyle = 'rgba(255,255,220,0.10)';
  for (const [x, w] of [[80, 44], [230, 30], [380, 52], [500, 26]]) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w, 0); ctx.lineTo(x + w + 60, 420); ctx.lineTo(x + 60, 420); ctx.closePath(); ctx.fill();
  }
  // sand
  ctx.fillStyle = '#d9c08a'; ctx.fillRect(0, 348, SCENE_W, 72);
  ctx.fillStyle = '#c4a76e';
  for (let x = 30; x < SCENE_W; x += 70) { ctx.beginPath(); ctx.ellipse(x, 372, 30, 6, 0, 0, Math.PI * 2); ctx.fill(); }
  // seaweed: three stalks normally, two on the right panel
  function weed(x, h, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, 352);
    ctx.quadraticCurveTo(x + Math.sin(t + x) * 10, 352 - h * 0.6, x + Math.sin(t * 1.3 + x) * 14, 352 - h);
    ctx.stroke();
  }
  weed(40, 90, '#2e8b57'); weed(64, 70, '#3aa76d');
  if (!diffs.has('weed')) weed(520, 84, '#2e8b57');
  weed(498, 62, '#3aa76d');
  // corals
  function coral(x, y, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (const [dx, h] of [[-14, 46], [0, 62], [14, 44]]) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + dx, y - h * 0.6, x + dx * 1.3, y - h); ctx.stroke();
    }
    ctx.fillStyle = color;
    for (const [dx, h] of [[-18, 46], [0, 62], [18, 44]]) { circle(ctx, x + dx * 1.3, y - h, 5); ctx.fill(); }
  }
  coral(140, 352, '#ff7b9c');
  coral(300, 352, diffs.has('coral') ? '#b678e0' : '#ff9a3d');
  coral(452, 352, '#ff7b9c');
  // treasure chest: gold coins present normally, gone on the right panel
  ctx.fillStyle = '#6b4a2f'; rr(ctx, 208, 318, 64, 34, 6); ctx.fill();
  ctx.fillStyle = '#8a5f3a'; ctx.beginPath(); ctx.ellipse(240, 318, 32, 14, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#f5c542'; ctx.fillRect(236, 314, 8, 10);
  if (!diffs.has('gold')) {
    ctx.fillStyle = '#ffd23f';
    for (const [x, y] of [[226, 312], [240, 308], [254, 312], [232, 306], [248, 305]]) { circle(ctx, x, y, 4); ctx.fill(); }
  }
  // anchor: missing on the right panel
  if (!diffs.has('anchor')) {
    ctx.strokeStyle = '#3a3a44'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(96, 330); ctx.lineTo(96, 388); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(78, 372); ctx.quadraticCurveTo(78, 392, 96, 392); ctx.quadraticCurveTo(114, 392, 114, 372); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(84, 332); ctx.lineTo(108, 332); ctx.stroke();
    circle(ctx, 96, 324, 5); ctx.stroke();
  }
  // starfish on the sand: missing on the right panel
  if (!diffs.has('starfish')) {
    ctx.fillStyle = '#ff9a3d';
    star4(ctx, 340, 388, 12); ctx.fill();
    ctx.fillStyle = '#e07b39'; circle(ctx, 340, 388, 3); ctx.fill();
  }
  // turtle
  ctx.fillStyle = '#3d8b5f';
  ctx.beginPath(); ctx.ellipse(440, 250, 34, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2e6b4a';
  ctx.beginPath(); ctx.ellipse(440, 244, 24, 12, 0, 0, Math.PI * 2); ctx.fill();
  circle(ctx, 476, 246, 9); ctx.fill();
  ctx.fillStyle = '#1d1426'; circle(ctx, 479, 243, 1.8); ctx.fill();
  ctx.fillStyle = '#3d8b5f';
  ctx.beginPath(); ctx.ellipse(412, 262, 12, 6, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(468, 262, 12, 6, -0.5, 0, Math.PI * 2); ctx.fill();
  // diver with tank: yellow normally, red on the right panel
  const dx = 330 + Math.sin(t * 0.5) * 8, dy = 150 + Math.sin(t * 0.9) * 5;
  ctx.fillStyle = '#22303e';
  ctx.beginPath(); ctx.ellipse(dx, dy, 26, 11, -0.2, 0, Math.PI * 2); ctx.fill();
  circle(ctx, dx + 26, dy - 6, 8); ctx.fill();
  ctx.fillStyle = diffs.has('tank') ? '#e63946' : '#ffd23f';
  rr(ctx, dx - 22, dy - 16, 12, 22, 5); ctx.fill();
  ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(dx - 16, dy - 14); ctx.lineTo(dx - 8, dy - 8); ctx.stroke();
  // bubbles: trail present normally, gone on the right panel
  if (!diffs.has('bubbles')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const by = dy - 26 - i * 16 - (t * 14 % 16);
      circle(ctx, dx + 30 + Math.sin(i * 2 + t) * 3, by, 3.5 + i * 0.8); ctx.stroke();
    }
  }
  // fish: five normally, four on the right panel
  fish(ctx, 90 + Math.sin(t * 0.7) * 10, 120, 1, '#ff8fa3', '#e05a7a');
  fish(ctx, 180 + Math.sin(t * 0.9 + 2) * 12, 90, 0.85, '#ffd23f', '#e0a92f');
  fish(ctx, 280 + Math.sin(t * 0.6 + 4) * 9, 200, 0.9, '#7be0a3', '#3aa76d');
  fish(ctx, 480 + Math.sin(t * 0.8 + 1) * 10, 110, 0.8, '#8fb8ff', '#5a7dd4');
  if (!diffs.has('fish')) fish(ctx, 150 + Math.sin(t * 0.75 + 3) * 11, 260, 0.95, '#ff9a3d', '#d47a1e');
}

/* ------------------------------------------------------------------ */
/* Level 5 — Snow Station                                              */
/* ------------------------------------------------------------------ */
function drawStation(ctx, t, diffs) {
  sky(ctx, [[0, '#8fa8c4'], [0.55, '#b9c9dd'], [1, '#dfe8f2']]);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (const [x, y] of [[60, 50], [180, 36], [300, 60], [440, 40], [520, 70]]) {
    circle(ctx, x, y, 2); ctx.fill();
  }
  // clock tower
  ctx.fillStyle = '#7a5a3a'; ctx.fillRect(238, 120, 84, 180);
  ctx.fillStyle = '#8a6a45'; ctx.fillRect(230, 112, 100, 12);
  ctx.fillStyle = '#5a3a22';
  ctx.beginPath(); ctx.moveTo(238, 112); ctx.lineTo(280, 66); ctx.lineTo(322, 112); ctx.closePath(); ctx.fill();
  // star on the tower top: missing on the right panel
  if (!diffs.has('star-top')) { ctx.fillStyle = '#ffd23f'; star4(ctx, 280, 56, 10); ctx.fill(); }
  // clock face: 6:00 normally, 7:30 on the right panel
  ctx.fillStyle = '#f4ead2'; circle(ctx, 280, 152, 26); ctx.fill();
  ctx.strokeStyle = '#2c2c34'; ctx.lineWidth = 3; circle(ctx, 280, 152, 26); ctx.stroke();
  ctx.strokeStyle = '#2c2c34'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(280, 152); ctx.lineTo(280, 134); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(280, 152);
  if (diffs.has('clock')) ctx.lineTo(264, 158); else ctx.lineTo(280, 170);
  ctx.stroke();
  // wreath on the tower: missing on the right panel
  if (!diffs.has('wreath')) {
    ctx.strokeStyle = '#2e8b57'; ctx.lineWidth = 7;
    circle(ctx, 280, 224, 13); ctx.stroke();
    ctx.fillStyle = '#e63946'; circle(ctx, 280, 212, 3); ctx.fill(); circle(ctx, 291, 228, 3); ctx.fill(); circle(ctx, 269, 228, 3); ctx.fill();
  }
  // train
  ctx.fillStyle = '#b03a2e';
  rr(ctx, 60, 262, 150, 56, 10); ctx.fill();
  rr(ctx, 218, 262, 130, 56, 10); ctx.fill();
  rr(ctx, 356, 262, 130, 56, 10); ctx.fill();
  ctx.fillStyle = '#f4ead2';
  for (const x of [84, 122, 160]) { rr(ctx, x, 276, 26, 20, 4); ctx.fill(); }
  for (const x of [240, 278, 316]) { rr(ctx, x, 276, 26, 20, 4); ctx.fill(); }
  // one carriage window dark on the right panel
  ctx.fillStyle = diffs.has('window') ? '#2c3a4a' : '#ffe9a3';
  rr(ctx, 380, 276, 26, 20, 4); ctx.fill();
  ctx.fillStyle = '#f4ead2'; rr(ctx, 418, 276, 26, 20, 4); ctx.fill();
  ctx.fillStyle = '#2c2c34';
  for (const x of [92, 140, 188, 248, 296, 344, 408, 456]) { circle(ctx, x, 324, 11); ctx.fill(); }
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(186, 228, 14, 34);
  // chimney smoke: present normally, gone on the right panel
  if (!diffs.has('smoke')) {
    ctx.fillStyle = 'rgba(230,230,230,0.85)';
    for (let i = 0; i < 3; i++) {
      const sy = 216 - i * 14 - (t * 6 % 14);
      circle(ctx, 193 + Math.sin(i * 2 + t) * 4, sy, 7 + i * 2); ctx.fill();
    }
  }
  // tracks + platform
  ctx.fillStyle = '#8a8f96'; ctx.fillRect(0, 330, SCENE_W, 8);
  ctx.fillStyle = '#5a5f66'; ctx.fillRect(0, 344, SCENE_W, 6);
  ctx.fillStyle = '#e8e2d4'; ctx.fillRect(0, 350, SCENE_W, 70);
  ctx.fillStyle = '#c9c2b2';
  for (let x = 0; x < SCENE_W; x += 56) ctx.fillRect(x, 350, 28, 70);
  // lamp posts: one unlit on the right panel
  function lamp(x) {
    ctx.fillStyle = '#2c2c34'; ctx.fillRect(x - 2, 268, 5, 82);
    const lit = !(diffs.has('lamp') && x === 508);
    if (lit) glow(ctx, x, 260, 30, '#ffca5f', 0.8);
    ctx.fillStyle = lit ? '#ffca5f' : '#4a4a52'; circle(ctx, x, 260, 7); ctx.fill();
    ctx.fillStyle = '#2c2c34'; ctx.fillRect(x - 8, 250, 16, 5);
  }
  lamp(52); lamp(508);
  // bench
  ctx.fillStyle = '#7a5a3a';
  ctx.fillRect(120, 330, 90, 8); ctx.fillRect(120, 312, 90, 7);
  ctx.fillRect(126, 338, 6, 14); ctx.fillRect(198, 338, 6, 14);
  // suitcase on the platform: missing on the right panel
  if (!diffs.has('case')) {
    ctx.fillStyle = '#7a4a8a'; rr(ctx, 250, 330, 34, 24, 4); ctx.fill();
    ctx.strokeStyle = '#5a2a6a'; ctx.lineWidth = 2; rr(ctx, 250, 330, 34, 24, 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(250, 342); ctx.lineTo(284, 342); ctx.stroke();
  }
  // snowman: carrot nose present normally, gone on the right panel
  ctx.fillStyle = '#f4f6f8';
  circle(ctx, 440, 386, 24); ctx.fill();
  circle(ctx, 440, 348, 17); ctx.fill();
  circle(ctx, 440, 320, 12); ctx.fill();
  ctx.fillStyle = '#1d1426'; circle(ctx, 435, 317, 2); ctx.fill(); circle(ctx, 445, 317, 2); ctx.fill();
  if (!diffs.has('nose')) {
    ctx.fillStyle = '#ff7b2f';
    ctx.beginPath(); ctx.moveTo(440, 321); ctx.lineTo(456, 324); ctx.lineTo(440, 327); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#2c2c34'; ctx.fillRect(430, 304, 20, 5); ctx.fillRect(434, 296, 12, 9);
  ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(424, 348); ctx.lineTo(404, 332); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(456, 348); ctx.lineTo(476, 332); ctx.stroke();
  // birds on the wire: three normally, two on the right panel
  ctx.strokeStyle = '#2c2c34'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(330, 84); ctx.quadraticCurveTo(440, 96, 548, 82); ctx.stroke();
  function bird(x, y) {
    ctx.fillStyle = '#2c2c34';
    ctx.beginPath(); ctx.ellipse(x, y, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    circle(ctx, x + 7, y - 3, 3.4); ctx.fill();
  }
  bird(380, 90); bird(430, 93);
  if (!diffs.has('bird')) bird(480, 91);
  // falling snow
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 26; i++) {
    const sx = (i * 67 + t * 12) % SCENE_W, sy = (i * 53 + t * 34) % SCENE_H;
    circle(ctx, sx, sy, 1.6 + (i % 3) * 0.5); ctx.fill();
  }
  // signboard
  ctx.fillStyle = '#3a2a1a'; rr(ctx, 330, 130, 110, 34, 6); ctx.fill();
  ctx.fillStyle = '#ffe9a3'; ctx.font = 'bold 17px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('NORTH POLE', 385, 148);
}

/* ------------------------------------------------------------------ */
/* Registry: every level's scene, its differences and its time limit.  */
/* A difference's x/y is the centre of its hit circle in 560x420 space.*/
/* ------------------------------------------------------------------ */
export const SCENES = [
  {
    id: 'harbour', name: 'Dusk Harbour', sub: 'Level 1 · the lighthouse pier', timeLimit: 120,
    draw: drawHarbour,
    differences: [
      { id: 'gull', x: 210, y: 44, r: 20, label: 'a gull in the sky' },
      { id: 'flag', x: 310, y: 253, r: 18, label: 'the boat flag colour' },
      { id: 'window', x: 80, y: 174, r: 18, label: 'a lit lighthouse window' },
      { id: 'crate', x: 411, y: 307, r: 20, label: 'a crate on the pier' },
      { id: 'lantern', x: 518, y: 288, r: 18, label: 'the lantern glow' },
      { id: 'cat-tail', x: 133, y: 330, r: 20, label: "the cat's tail" },
      { id: 'moon', x: 92, y: 66, r: 22, label: 'the shape of the moon' },
    ],
  },
  {
    id: 'market', name: 'Night Market', sub: 'Level 2 · lanterns and fruit stalls', timeLimit: 105,
    draw: drawMarket,
    differences: [
      { id: 'lantern', x: 460, y: 238, r: 20, label: 'a paper lantern' },
      { id: 'apple', x: 118, y: 182, r: 16, label: 'an apple turned orange' },
      { id: 'sign', x: 280, y: 119, r: 22, label: 'a letter on the sign' },
      { id: 'wheel', x: 424, y: 348, r: 22, label: 'the bicycle front wheel' },
      { id: 'cat', x: 96, y: 143, r: 20, label: 'the cat on the stall' },
      { id: 'jar', x: 177, y: 182, r: 18, label: 'the jar colour' },
      { id: 'bulb', x: 300, y: 64, r: 16, label: 'a dark bulb in the lights' },
    ],
  },
  {
    id: 'camp', name: 'Forest Camp', sub: 'Level 3 · tent, fire and fireflies', timeLimit: 100,
    draw: drawCamp,
    differences: [
      { id: 'owl', x: 492, y: 186, r: 22, label: 'the owl on the branch' },
      { id: 'log', x: 438, y: 314, r: 18, label: 'a log in the fire' },
      { id: 'star', x: 300, y: 26, r: 16, label: 'a bright star' },
      { id: 'shroom', x: 500, y: 376, r: 18, label: 'a mushroom' },
      { id: 'tent', x: 280, y: 276, r: 22, label: 'the tent door' },
      { id: 'pack', x: 118, y: 341, r: 22, label: 'the backpack colour' },
      { id: 'mallow', x: 478, y: 299, r: 16, label: 'the marshmallow' },
      { id: 'firefly', x: 150, y: 260, r: 18, label: 'a firefly' },
    ],
  },
  {
    id: 'reef', name: 'Coral Reef', sub: 'Level 4 · under the waves', timeLimit: 95,
    draw: drawReef,
    differences: [
      { id: 'fish', x: 150, y: 260, r: 22, label: 'a little orange fish' },
      { id: 'gold', x: 240, y: 309, r: 20, label: 'the gold in the chest' },
      { id: 'starfish', x: 340, y: 388, r: 18, label: 'the starfish' },
      { id: 'tank', x: 314, y: 143, r: 18, label: "the diver's tank colour" },
      { id: 'bubbles', x: 360, y: 116, r: 20, label: 'the bubble trail' },
      { id: 'coral', x: 300, y: 300, r: 22, label: 'the coral colour' },
      { id: 'anchor', x: 96, y: 360, r: 22, label: 'the anchor' },
      { id: 'weed', x: 520, y: 310, r: 20, label: 'a seaweed stalk' },
    ],
  },
  {
    id: 'station', name: 'Snow Station', sub: 'Level 5 · the northbound train', timeLimit: 90,
    draw: drawStation,
    differences: [
      { id: 'nose', x: 448, y: 324, r: 16, label: "the snowman's nose" },
      { id: 'clock', x: 272, y: 160, r: 20, label: 'the clock hands' },
      { id: 'bird', x: 480, y: 91, r: 16, label: 'a bird on the wire' },
      { id: 'lamp', x: 508, y: 260, r: 18, label: 'the unlit lamp' },
      { id: 'case', x: 267, y: 342, r: 20, label: 'the suitcase' },
      { id: 'wreath', x: 280, y: 224, r: 20, label: 'the wreath' },
      { id: 'window', x: 393, y: 286, r: 18, label: 'a dark train window' },
      { id: 'smoke', x: 193, y: 196, r: 18, label: 'the chimney smoke' },
      { id: 'star-top', x: 280, y: 56, r: 18, label: 'the star on the tower' },
    ],
  },
];
