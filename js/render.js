// Motor de dibujo: cada fotograma es una función pura del tiempo t (sirve para vista previa y exportación).
export const W = 1080, H = 1920, GY = 1390;
const TAU = Math.PI * 2;
const ROLES = ['A', 'B', 'C', 'D'];
export const LOOKS = {
  quincena: {}, turno: { B: 'hair', C: 'kid' }, aumento: { B: 'tie' }, muerto: { B: 'hair', C: 'kid' },
  cenar: { B: 'hair' }, orar: {}, lista: {}, detalles: { B: 'hair' }, celular: { B: 'hair' }, sueter: { B: 'hair', C: 'kid' },
  abuela: { B: 'granny' }, mama: { B: 'hair' }, jugar: { C: 'kid' }, opinan: { C: 'hair' }, grupo: {}, foto: { B: 'hair' },
};
export const FONT = "'Fredoka', 'Baloo 2', 'Arial Rounded MT Bold', 'Arial Black', system-ui, sans-serif";

const hash = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOut = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const backOut = t => { t = clamp(t, 0, 1); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

// ---------- Paleta (color / blanco y negro) ----------
let BW = false;
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const cache = new Map();
function C(hex) {
  const k = hex; if (cache.has(k)) return cache.get(k);
  if (!BW) {
    // color suave (pastel) para que los muñequitos negros resalten
    const [r, g, b] = hexToRgb(hex); const m = 0.06, W2 = [255, 250, 240];
    const out = `rgb(${Math.round(r + (W2[0] - r) * m)},${Math.round(g + (W2[1] - g) * m)},${Math.round(b + (W2[2] - b) * m)})`;
    cache.set(k, out); return out;
  }
  const [r, g, b] = hexToRgb(hex); let l = 0.299 * r + 0.587 * g + 0.114 * b;
  l = 150 + (l / 255) * 105; // papel claro
  const v = Math.round(clamp(l, 0, 255)); const out = `rgb(${v},${v},${v})`; cache.set(k, out); return out;
}
const INK = () => (BW ? '#111' : '#2b2d42');

// ---------- utilidades de dibujo ----------
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function line(ctx, pts, color, width) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
}
function circle(ctx, x, y, r, fill, stroke, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 4; ctx.stroke(); } }
function heartPath(ctx, x, y, s) {
  ctx.beginPath(); ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 0.1, y + s * 0.2, x - s * 0.55, y, x - s * 0.5, y - s * 0.3);
  ctx.bezierCurveTo(x - s * 0.45, y - s * 0.62, x - s * 0.05, y - s * 0.6, x, y - s * 0.28);
  ctx.bezierCurveTo(x + s * 0.05, y - s * 0.6, x + s * 0.45, y - s * 0.62, x + s * 0.5, y - s * 0.3);
  ctx.bezierCurveTo(x + s * 0.55, y, x + s * 0.1, y + s * 0.2, x, y + s * 0.35); ctx.closePath();
}
function star(ctx, x, y, r, rot = 0) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5; const rad = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } ctx.closePath(); }
function setFont(ctx, size, weight = 700) { ctx.font = `${weight} ${size}px ${FONT}`; }
function wrap(ctx, text, maxW) {
  const words = text.split(/\s+/).filter(Boolean); const lines = []; let cur = [];
  for (const w of words) { const test = [...cur, w].join(' '); if (ctx.measureText(test).width > maxW && cur.length) { lines.push(cur); cur = [w]; } else cur.push(w); }
  if (cur.length) lines.push(cur); return lines;
}
function fitText(ctx, text, maxW, maxLines, size, minSize = 40, weight = 700) {
  let s = size, lines;
  for (; s >= minSize; s -= 4) { setFont(ctx, s, weight); lines = wrap(ctx, text, maxW); if (lines.length <= maxLines) break; }
  return { size: s, lines };
}

// ---------- ENTORNOS ----------
function sky(ctx, top, bottom) { const g = ctx.createLinearGradient(0, -200, 0, GY); g.addColorStop(0, C(top)); g.addColorStop(1, C(bottom)); ctx.fillStyle = g; ctx.fillRect(-600, -400, W + 1200, GY + 400); }
function floor(ctx, color, line2) { ctx.fillStyle = C(color); ctx.fillRect(-600, GY, W + 1200, H - GY + 600); if (line2) { ctx.fillStyle = C(line2); ctx.fillRect(-600, GY, W + 1200, 10); } }
function cloud(ctx, x, y, s) { ctx.fillStyle = BW ? '#fff' : '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 40 * s, 0, TAU); ctx.arc(x + 45 * s, y - 20 * s, 50 * s, 0, TAU); ctx.arc(x + 95 * s, y, 40 * s, 0, TAU); ctx.fill(); if (BW) { ctx.strokeStyle = '#999'; ctx.lineWidth = 3; ctx.stroke(); } }
function tree(ctx, x, y, s, g) {
  ctx.fillStyle = C('#8d5a3b'); ctx.fillRect(x - 14 * s, y - 160 * s, 28 * s, 160 * s);
  const sw = Math.sin(g * 1.5 + x) * 6 * s;
  ctx.fillStyle = C('#3fa34d'); ctx.beginPath(); ctx.arc(x + sw, y - 210 * s, 90 * s, 0, TAU); ctx.arc(x - 60 * s + sw, y - 160 * s, 60 * s, 0, TAU); ctx.arc(x + 60 * s + sw, y - 165 * s, 65 * s, 0, TAU); ctx.fill();
  if (BW) { ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.stroke(); }
}
function wallClock(ctx, x, y, r, g) {
  circle(ctx, x, y, r, C('#ffffff'), INK(), 6);
  const a1 = g * 0.6, a2 = g * 0.05;
  line(ctx, [[x, y], [x + Math.sin(a1) * r * 0.75, y - Math.cos(a1) * r * 0.75]], INK(), 4);
  line(ctx, [[x, y], [x + Math.sin(a2) * r * 0.5, y - Math.cos(a2) * r * 0.5]], INK(), 6);
}
function windowCity(ctx, x, y, w, h, g) {
  ctx.fillStyle = C('#bfe3ff'); rr(ctx, x, y, w, h, 10); ctx.fill();
  ctx.save(); rr(ctx, x, y, w, h, 10); ctx.clip();
  for (let i = 0; i < 6; i++) { const bx = x + i * (w / 5) - 20, bh = 80 + hash(i + 3) * 160; ctx.fillStyle = C(i % 2 ? '#8aa1b9' : '#6c86a3'); ctx.fillRect(bx, y + h - bh, w / 6, bh); }
  cloud(ctx, x + ((g * 20) % (w + 200)) - 150, y + 60, 0.5);
  ctx.restore();
  ctx.strokeStyle = C('#ffffff'); ctx.lineWidth = 12; rr(ctx, x, y, w, h, 10); ctx.stroke();
  line(ctx, [[x + w / 2, y], [x + w / 2, y + h]], C('#ffffff'), 10);
}
function plant(ctx, x, y, s, g) {
  ctx.fillStyle = C('#c96f4a'); ctx.beginPath(); ctx.moveTo(x - 40 * s, y - 80 * s); ctx.lineTo(x + 40 * s, y - 80 * s); ctx.lineTo(x + 30 * s, y); ctx.lineTo(x - 30 * s, y); ctx.fill();
  for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45 + Math.sin(g * 2 + i) * 0.05; ctx.strokeStyle = C('#2f9e44'); ctx.lineWidth = 14 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - 80 * s); ctx.quadraticCurveTo(x + Math.sin(a) * 60 * s, y - 150 * s, x + Math.sin(a) * 90 * s, y - (170 + 30 * Math.cos(i)) * s); ctx.stroke(); }
}

const ENV_DRAW = {
  oficina(ctx, g) {
    sky(ctx, '#eaf2fb', '#dbe7f3');
    ctx.fillStyle = C('#cfdceb'); ctx.fillRect(-600, GY - 360, W + 1200, 18);
    windowCity(ctx, 90, 380, 380, 420, g); windowCity(ctx, 620, 380, 380, 420, g + 3);
    wallClock(ctx, 540, 260, 70, g);
    floor(ctx, '#b8c7d6', '#9fb0c2');
    plant(ctx, 40, GY, 1, g); plant(ctx, 1040, GY, 0.9, g + 1);
    ctx.fillStyle = C('#ffd166'); rr(ctx, 860, 860, 140, 90, 8); ctx.fill(); // nota adhesiva
    ctx.fillStyle = C('#a0c4ff'); rr(ctx, 700, 880, 130, 80, 8); ctx.fill();
  },
  casa(ctx, g) {
    sky(ctx, '#fff1df', '#fde2c2');
    ctx.globalAlpha = 0.25; for (let i = -6; i < 16; i++) { ctx.fillStyle = C('#f4b183'); ctx.fillRect(i * 90, -400, 30, GY + 400); } ctx.globalAlpha = 1;
    ctx.fillStyle = C('#ffffff'); rr(ctx, 360, 360, 360, 260, 10); ctx.fill(); ctx.strokeStyle = C('#a0522d'); ctx.lineWidth = 16; ctx.stroke();
    ctx.fillStyle = C('#ffd166'); circle(ctx, 470, 470, 40, C('#ffd166')); ctx.fillStyle = C('#74c69d'); ctx.beginPath(); ctx.moveTo(380, 600); ctx.lineTo(500, 480); ctx.lineTo(600, 560); ctx.lineTo(700, 470); ctx.lineTo(700, 600); ctx.fill();
    // sofá
    ctx.fillStyle = C('#8e7dbe'); rr(ctx, 120, GY - 260, 840, 170, 40); ctx.fill(); rr(ctx, 80, GY - 170, 920, 150, 40); ctx.fill();
    ctx.fillStyle = C('#6c5ba7'); ctx.fillRect(130, GY - 30, 40, 30); ctx.fillRect(910, GY - 30, 40, 30);
    // lámpara
    line(ctx, [[1000, GY], [1000, GY - 560]], C('#555555'), 8); ctx.fillStyle = C('#ffe066'); ctx.beginPath(); ctx.moveTo(940, GY - 560); ctx.lineTo(1060, GY - 560); ctx.lineTo(1030, GY - 660); ctx.lineTo(970, GY - 660); ctx.fill();
    floor(ctx, '#c08552', '#a26b3c');
    for (let i = 0; i < 12; i++) line(ctx, [[i * 120 - 200, GY + 10], [i * 120 - 260, H + 200]], C('#a26b3c'), 4);
  },
  parque(ctx, g) {
    sky(ctx, '#7cc8ff', '#dff4ff');
    circle(ctx, 880, 230, 90, C('#ffd43b')); ctx.globalAlpha = 0.25; circle(ctx, 880, 230, 130 + Math.sin(g * 2) * 8, C('#ffd43b')); ctx.globalAlpha = 1;
    cloud(ctx, ((g * 25) % 1500) - 300, 260, 1); cloud(ctx, ((g * 15 + 700) % 1500) - 300, 480, 0.8);
    ctx.fillStyle = C('#94d82d'); ctx.beginPath(); ctx.ellipse(250, GY - 40, 600, 220, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = C('#69db7c'); ctx.beginPath(); ctx.ellipse(900, GY - 30, 550, 180, 0, Math.PI, TAU); ctx.fill();
    tree(ctx, 110, GY, 1.2, g); tree(ctx, 980, GY, 1.0, g + 2);
    floor(ctx, '#51cf66', '#40c057');
    ctx.fillStyle = C('#f8f0e3'); ctx.beginPath(); ctx.moveTo(300, H + 300); ctx.lineTo(480, GY); ctx.lineTo(600, GY); ctx.lineTo(780, H + 300); ctx.fill();
    for (let i = 0; i < 14; i++) { const fx = hash(i) * 1080, fy = GY + 40 + hash(i + 9) * 400; circle(ctx, fx, fy, 9, C(['#ff6b6b', '#fcc419', '#ffffff'][i % 3])); }
  },
  cafe(ctx, g) {
    sky(ctx, '#f7e7d0', '#efd5b3');
    ctx.fillStyle = C('#3d405b'); rr(ctx, 130, 250, 420, 300, 16); ctx.fill();
    ctx.fillStyle = '#ffffff'; setFont(ctx, 46, 700); ctx.textAlign = 'center'; ctx.fillText('MENU', 340, 320);
    ctx.fillStyle = BW ? '#ddd' : '#ffe8a3'; for (let i = 0; i < 4; i++) ctx.fillRect(180, 360 + i * 45, 220 + hash(i) * 80, 12);
    for (let i = 0; i < 3; i++) { const lx = 650 + i * 150, sw = Math.sin(g * 1.4 + i) * 10; line(ctx, [[lx, -100], [lx + sw, 300]], C('#555555'), 5); ctx.fillStyle = C('#f08c00'); ctx.beginPath(); ctx.arc(lx + sw, 340, 50, Math.PI, TAU); ctx.fill(); ctx.globalAlpha = 0.2; circle(ctx, lx + sw, 360, 70, C('#fff3bf')); ctx.globalAlpha = 1; }
    ctx.fillStyle = C('#9c6644'); ctx.fillRect(-600, GY - 330, W + 1200, 30);
    ctx.fillStyle = C('#b08968'); ctx.fillRect(-600, GY - 300, W + 1200, 300);
    for (let i = 0; i < 6; i++) { const cx = 120 + i * 170; ctx.fillStyle = C('#ffffff'); rr(ctx, cx, GY - 400, 60, 70, 10); ctx.fill(); ctx.strokeStyle = C('#ffffff'); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx + 66, GY - 365, 18, -1.2, 1.2); ctx.stroke(); ctx.globalAlpha = 0.5; line(ctx, [[cx + 30, GY - 410], [cx + 30 + Math.sin(g * 3 + i) * 10, GY - 470]], C('#aaaaaa'), 5); ctx.globalAlpha = 1; }
    floor(ctx, '#7f5539', '#6f4518');
  },
  ciudad(ctx, g) {
    sky(ctx, '#89c2ff', '#ffe5ec');
    cloud(ctx, ((g * 20) % 1500) - 300, 220, 0.9);
    for (let i = 0; i < 9; i++) {
      const bx = -120 + i * 150, bh = 420 + hash(i * 3) * 420, col = ['#5c7cfa', '#748ffc', '#4dabf7', '#9775fa'][i % 4];
      ctx.fillStyle = C(col); ctx.fillRect(bx, GY - 120 - bh, 140, bh);
      ctx.fillStyle = C('#fff3bf');
      for (let r = 0; r < bh / 70 - 1; r++) for (let c = 0; c < 3; c++) if (hash(i * 50 + r * 7 + c) > 0.35) ctx.fillRect(bx + 18 + c * 40, GY - 120 - bh + 30 + r * 70, 24, 36);
    }
    ctx.fillStyle = C('#495057'); ctx.fillRect(-600, GY - 120, W + 1200, 120);
    for (let i = 0; i < 2; i++) { const cx = ((g * (220 + i * 120) + i * 600) % 1700) - 300, col = i ? '#ffd43b' : '#ff6b6b'; ctx.fillStyle = C(col); rr(ctx, cx, GY - 110, 200, 60, 20); ctx.fill(); rr(ctx, cx + 40, GY - 150, 110, 50, 16); ctx.fill(); circle(ctx, cx + 45, GY - 45, 20, C('#222222')); circle(ctx, cx + 155, GY - 45, 20, C('#222222')); }
    floor(ctx, '#ced4da', '#adb5bd');
    line(ctx, [[960, GY], [960, GY - 520]], C('#343a40'), 14); circle(ctx, 960, GY - 530, 30, C('#ffe066'));
  },
  playa(ctx, g) {
    sky(ctx, '#4dc9ff', '#fff0c9');
    circle(ctx, 800, 300, 100, C('#ffa94d'));
    cloud(ctx, ((g * 18) % 1500) - 300, 250, 0.8);
    ctx.fillStyle = C('#1c7ed6'); ctx.fillRect(-600, GY - 330, W + 1200, 250);
    for (let k = 0; k < 3; k++) { ctx.strokeStyle = C('#a5d8ff'); ctx.lineWidth = 8; ctx.beginPath(); for (let x = -600; x < W + 600; x += 20) ctx.lineTo(x, GY - 290 + k * 70 + Math.sin(x / 60 + g * 2 + k) * 10); ctx.stroke(); }
    ctx.fillStyle = C('#ffe8a1'); ctx.fillRect(-600, GY - 90, W + 1200, 200);
    floor(ctx, '#ffd98e');
    line(ctx, [[120, GY], [160, GY - 520]], C('#8d5a3b'), 26);
    for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.6 + Math.sin(g * 1.3) * 0.05; ctx.strokeStyle = C('#2f9e44'); ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(160, GY - 520); ctx.quadraticCurveTo(160 + Math.cos(a) * 120, GY - 600 + Math.sin(a) * 60, 160 + Math.cos(a) * 220, GY - 480 + Math.sin(a) * 120); ctx.stroke(); }
  },
  cocina(ctx, g) {
    sky(ctx, '#e7f5ff', '#e7f5ff');
    for (let y = 520; y < GY - 300; y += 60) for (let x = -600; x < W + 600; x += 60) { ctx.strokeStyle = C('#c5d8e6'); ctx.lineWidth = 3; ctx.strokeRect(x, y, 60, 60); }
    ctx.fillStyle = C('#ffffff'); for (let i = 0; i < 3; i++) { rr(ctx, 90 + i * 220, 160, 200, 300, 10); ctx.fill(); ctx.strokeStyle = C('#adb5bd'); ctx.lineWidth = 5; ctx.stroke(); circle(ctx, 270 + i * 220, 310, 10, C('#868e96')); }
    ctx.fillStyle = C('#dee2e6'); rr(ctx, 790, 300, 230, GY - 300, 20); ctx.fill(); ctx.strokeStyle = C('#adb5bd'); ctx.lineWidth = 6; ctx.stroke(); line(ctx, [[790, 680], [1020, 680]], C('#adb5bd'), 6); line(ctx, [[820, 400], [820, 520]], C('#868e96'), 10);
    ctx.fillStyle = C('#f1f3f5'); ctx.fillRect(-600, GY - 330, 1390 + 600, 330); ctx.fillStyle = C('#495057'); ctx.fillRect(-600, GY - 350, 1390 + 600, 26);
    ctx.fillStyle = C('#343a40'); rr(ctx, 300, GY - 380, 240, 30, 6); ctx.fill();
    ctx.globalAlpha = 0.4; for (let i = 0; i < 3; i++) line(ctx, [[360 + i * 60, GY - 400], [360 + i * 60 + Math.sin(g * 3 + i) * 15, GY - 480]], C('#adb5bd'), 6); ctx.globalAlpha = 1;
    floor(ctx, '#ced4da', '#adb5bd');
  },
  vacio(ctx, g) {
    sky(ctx, '#fff8e7', '#ffe3e3');
    ctx.globalAlpha = 0.18; for (let i = 0; i < 40; i++) { const x = (hash(i) * 1400 + g * 20) % 1400 - 160, y = hash(i + 50) * 1500; circle(ctx, x, y, 8 + hash(i + 2) * 14, C('#ff8787')); } ctx.globalAlpha = 1;
    floor(ctx, '#ffe3e3', '#ffc9c9');
  },
  iglesia(ctx, g) {
    sky(ctx, '#f6ead8', '#efdcc2');
    // ventanales en arco con vitrales
    const vit = (x, y, w, h) => {
      ctx.save(); ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath();
      ctx.fillStyle = C('#cfe3ff'); ctx.fill(); ctx.clip();
      const cols = ['#ffd6a5', '#bde0fe', '#caffbf', '#ffc6ff', '#fdffb6'];
      for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = C(cols[(r + c * 2) % 5]); ctx.fillRect(x + c * w / 4, y + r * h / 8, w / 4, h / 8); }
      ctx.globalAlpha = 0.25 + Math.sin(g * 1.5) * 0.08; ctx.fillStyle = '#fffbe6'; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
      ctx.restore(); ctx.strokeStyle = C('#a47148'); ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.stroke();
      line(ctx, [[x + w / 2, y], [x + w / 2, y + h]], C('#a47148'), 6); line(ctx, [[x, y + h * 0.55], [x + w, y + h * 0.55]], C('#a47148'), 6);
    };
    vit(70, 260, 230, 520); vit(780, 260, 230, 520);
    // cruz y luz central
    ctx.globalAlpha = 0.35; const gr = ctx.createRadialGradient(540, 420, 10, 540, 420, 320); gr.addColorStop(0, '#fff3c4'); gr.addColorStop(1, 'rgba(255,243,196,0)'); ctx.fillStyle = gr; ctx.fillRect(200, 100, 680, 640); ctx.globalAlpha = 1;
    ctx.fillStyle = C('#a47148'); rr(ctx, 525, 250, 30, 300, 6); ctx.fill(); rr(ctx, 460, 320, 160, 30, 6); ctx.fill();
    // velas
    for (const vx of [420, 660]) { ctx.fillStyle = '#fffaf0'; rr(ctx, vx - 12, 640, 24, 90, 5); ctx.fill(); ctx.strokeStyle = C('#d6c3a5'); ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = C('#ffb703'); ctx.beginPath(); ctx.ellipse(vx + Math.sin(g * 7 + vx) * 2, 625, 8, 16, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = C('#e9d8c4'); ctx.fillRect(-600, GY - 360, W + 1200, 20);
    // bancas
    for (const [bx, bw] of [[-80, 400], [760, 420]]) { ctx.fillStyle = C('#b5835a'); rr(ctx, bx, GY - 250, bw, 40, 10); ctx.fill(); ctx.fillStyle = C('#9c6b45'); rr(ctx, bx - 10, GY - 140, bw + 20, 36, 10); ctx.fill(); ctx.fillRect(bx + 10, GY - 110, 22, 110); ctx.fillRect(bx + bw - 32, GY - 110, 22, 110); }
    floor(ctx, '#d9c2a3', '#c4a882');
    ctx.fillStyle = C('#c9454a'); ctx.beginPath(); ctx.moveTo(420, GY); ctx.lineTo(660, GY); ctx.lineTo(820, H + 300); ctx.lineTo(260, H + 300); ctx.fill();
  },
  caminos(ctx, g, beat) {
    sky(ctx, '#9bd4ff', '#fff4d6');
    // lado izquierdo: nublado; lado derecho: soleado
    ctx.globalAlpha = 0.85; ctx.fillStyle = C('#868e96'); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-40 + i * 110 + Math.sin(g + i) * 10, 360 + (i % 2) * 40, 90, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
    for (let i = 0; i < 8; i++) { const ry = ((g * 500 + i * 120) % 500) + 430; line(ctx, [[20 + i * 45, ry], [10 + i * 45, ry + 40]], C('#4dabf7'), 4); }
    circle(ctx, 880, 330, 95, C('#ffd43b')); ctx.globalAlpha = 0.3; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + g * 0.3; line(ctx, [[880 + Math.cos(a) * 120, 330 + Math.sin(a) * 120], [880 + Math.cos(a) * 170, 330 + Math.sin(a) * 170]], C('#fab005'), 10); } ctx.globalAlpha = 1;
    ctx.fillStyle = C('#8ce99a'); ctx.fillRect(-600, 800, W + 1200, 600);
    ctx.fillStyle = C('#ced4da'); ctx.beginPath(); ctx.moveTo(-600, 820); ctx.lineTo(W + 600, 820); ctx.lineTo(W + 600, 860); ctx.lineTo(-600, 860); ctx.fill();
    floor(ctx, '#69db7c');
    // dos caminos desde abajo al horizonte
    const road = (dir, col) => { ctx.fillStyle = C(col); ctx.beginPath(); ctx.moveTo(540 - 170, H + 300); ctx.lineTo(540 + 170, H + 300); ctx.lineTo(540 + dir * 120 + 30, GY - 40); ctx.lineTo(540 + dir * 470 + 35, 830); ctx.lineTo(540 + dir * 470 - 35, 830); ctx.lineTo(540 + dir * 120 - 30, GY - 40); ctx.fill(); };
    road(-1, '#adb5bd'); road(1, '#ffe8a1');
    tree(ctx, 960, 880, 0.6, g); ctx.fillStyle = C('#495057'); ctx.fillRect(30, 760, 30, 70);
    // poste con letreros
    const signs = (beat && beat.sign ? beat.sign.replace('sign:', '').split('|') : []);
    if (signs.length) drawSigns(ctx, signs, beat._lang, g, beat.side || 0);
  },
};

function drawSigns(ctx, s, lang, g, side) {
  const l = lang === 'en' && s.length >= 4 ? [s[2], s[3]] : [s[0], s[1]];
  const px = 540, top = 520;
  line(ctx, [[px, GY - 30], [px, top]], C('#8d5a3b'), 22);
  const sign = (dir, text, y, col, active) => {
    const sw = Math.sin(g * 2 + dir) * 0.03 + (active ? Math.sin(g * 8) * 0.04 : 0);
    ctx.save(); ctx.translate(px, y); ctx.rotate(sw);
    const sc = active ? 1.12 : 1; ctx.scale(sc, sc);
    setFont(ctx, 46, 700); const tw = Math.max(240, ctx.measureText(text).width + 90);
    ctx.fillStyle = C(col); ctx.beginPath();
    if (dir < 0) { ctx.moveTo(10, -50); ctx.lineTo(-tw + 40, -50); ctx.lineTo(-tw, 0); ctx.lineTo(-tw + 40, 50); ctx.lineTo(10, 50); }
    else { ctx.moveTo(-10, -50); ctx.lineTo(tw - 40, -50); ctx.lineTo(tw, 0); ctx.lineTo(tw - 40, 50); ctx.lineTo(-10, 50); }
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK(); ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = BW ? '#111' : '#ffffff'; if (!BW && col === '#ffd43b') ctx.fillStyle = '#2b2d42';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, dir * (tw / 2 - 10), 3);
    ctx.restore();
  };
  sign(-1, l[0], top + 70, '#868e96', side < 0);
  sign(1, l[1], top + 190, '#ffd43b', side > 0);
}

// ---------- MUÑECO ----------
// Proporciones tipo caricatura: cabeza grande, cuerpo negro sólido y grueso.
const SK = { thigh: 98, shin: 96, torso: 150, neck: 8, head: 64, upper: 78, fore: 74 };
const FIG = '#111111';

function pose(action, t, g, seed) {
  const P = { lean: 0, tilt: 0, y: 0, rot: 0, bend: 0, sitAmt: 0, arms: [{ a: 0.3, e: 0.25 }, { a: 0.3, e: 0.25 }], legs: [{ a: -0.12, k: 0.08 }, { a: 0.12, k: 0.08 }], emo: 'neutral', talk: false, fx: null, hand: null, shake: 0 };
  // respiración y balanceo suave del peso
  const br = Math.sin(g * 2.2 + seed);
  P.y = br * 3; P.arms[0].a += br * 0.03; P.arms[1].a -= br * 0.03; P.tilt = Math.sin(g * 1.1 + seed) * 0.04;
  const s = (f, a = 1, ph = 0) => Math.sin(t * f + ph + seed) * a;
  switch (action) {
    case 'talk': P.arms[1] = { a: 0.95 + s(4, 0.3), e: 1.0 + s(5, 0.45) }; P.arms[0] = { a: 0.45 + s(3, 0.15, 1), e: 0.5 + s(3.5, 0.2) }; P.emo = 'happy'; P.talk = true; P.tilt = s(2.5, 0.07); P.lean = s(2, 0.04); break;
    case 'walk': case 'run': {
      const sp = action === 'run' ? 13 : 8.5, amp = action === 'run' ? 0.7 : 0.48;
      const ph = t * sp + seed;
      // piernas: la rodilla se dobla cuando la pierna va hacia atrás (paso natural)
      P.legs = [0, Math.PI].map(o => { const sw = Math.sin(ph + o); return { a: sw * amp, k: Math.max(0, -Math.cos(ph + o)) * (action === 'run' ? 1.3 : 0.75) + 0.08 }; });
      P.arms = [0, Math.PI].map(o => ({ a: 0.32 - Math.sin(ph + o) * 0.45, e: 0.45 + Math.max(0, Math.sin(ph + o)) * (action === 'run' ? 1.2 : 0.5) }));
      P.y = -Math.abs(Math.cos(ph)) * (action === 'run' ? 22 : 9); P.lean = action === 'run' ? 0.26 : 0.07; P.bend = action === 'run' ? 0.15 : 0.05; P.emo = 'happy';
      if (action === 'run') { P.fx = 'dust'; P.emo = 'shock'; }
      break;
    }
    case 'wave': P.arms[1] = { a: 2.5, e: 0.45 + s(9, 0.55) }; P.arms[0] = { a: 0.35, e: 0.3 }; P.emo = 'happy'; P.tilt = s(4.5, 0.06); P.bend = s(4.5, 0.05); break;
    case 'hug': P.arms = [{ a: 1.4, e: 1.05 }, { a: 1.4, e: 1.05 }]; P.emo = 'love'; P.fx = 'hearts'; P.y += s(3, 3); P.lean = 0.06; break;
    case 'cheer': { const j = Math.abs(Math.sin(t * 6 + seed)); P.arms = [{ a: 2.55 + s(7, 0.18), e: 0.25 + s(7, 0.2) }, { a: 2.55 - s(7, 0.18), e: 0.25 - s(7, 0.2) }]; P.y = -j * 42; P.legs = [{ a: -0.15, k: 0.5 * (1 - j) + 0.1 }, { a: 0.15, k: 0.5 * (1 - j) + 0.1 }]; P.emo = 'laugh'; P.fx = 'sparkle'; break; }
    case 'jump': { const j = Math.abs(Math.sin(t * 5.5 + seed)); P.y = -j * 75; P.legs = [{ a: 0.35, k: 0.3 + j * 0.9 }, { a: -0.1, k: 0.3 + j * 1.1 }]; P.arms = [{ a: 2.3, e: 0.4 }, { a: 2.3, e: 0.4 }]; P.emo = 'laugh'; break; }
    case 'facepalm': P.arms[1] = { a: 0.5, e: 2.5 }; P.tilt = 0.22 + s(1.8, 0.05); P.lean = 0.1; P.bend = 0.1; P.emo = 'tired'; break;
    case 'shrug': { const u = (Math.sin(t * 3.5 + seed) + 1) / 2; P.arms = [{ a: 0.8, e: 1.3 + u * 0.35 }, { a: 0.8, e: 1.3 + u * 0.35 }]; P.tilt = 0.16 * Math.sin(t * 1.8); P.emo = 'meh'; P.y -= u * 7; break; }
    case 'sad': P.lean = 0.14; P.bend = 0.18; P.tilt = 0.32; P.arms = [{ a: 0.1, e: 0.15 }, { a: 0.1, e: 0.15 }]; P.emo = 'sad'; P.fx = 'cloud'; break;
    case 'cry': P.arms = [{ a: 0.55, e: 2.3 + s(8, 0.08) }, { a: 0.55, e: 2.3 - s(8, 0.08) }]; P.tilt = 0.12; P.bend = 0.12; P.emo = 'cry'; P.fx = 'tears'; P.y += s(8, 2.5); break;
    case 'angry': P.arms = [{ a: 0.5, e: -0.4 + s(6, 0.1) }, { a: 0.5, e: -0.4 - s(6, 0.1) }]; P.emo = 'angry'; P.fx = 'steam'; P.shake = 3; P.lean = 0.08; P.legs = [{ a: -0.25, k: 0.15 }, { a: 0.25, k: 0.15 }]; break;
    case 'laugh': P.lean = -0.1 + s(8, 0.06); P.bend = -0.12; P.arms = [{ a: 0.55, e: -1.2 + s(8, 0.1) }, { a: 0.55, e: -1.2 - s(8, 0.1) }]; P.emo = 'laugh'; P.fx = 'haha'; P.y += s(9, 4); break;
    case 'think': P.arms[1] = { a: 0.42, e: 2.4 }; P.arms[0] = { a: 0.6, e: -1.15 }; P.tilt = -0.14 + s(1.3, 0.05); P.emo = 'think'; P.fx = 'question'; break;
    case 'type': P.sit = true; P.arms = [{ a: 0.75, e: 0.6 + s(14, 0.1) }, { a: 0.75, e: 0.6 + s(14, 0.1, 2) }]; P.tilt = 0.15; P.bend = 0.12; P.emo = 'neutral'; P.desk = true; break;
    case 'phone': P.arms[1] = { a: 0.35, e: 2.0 }; P.arms[0] = { a: 0.25, e: 0.35 }; P.tilt = 0.24; P.bend = 0.08; P.hand = 'phone'; P.emo = 'neutral'; P.fx = 'notif'; break;
    case 'sleep': P.sit = true; P.tilt = 0.5 + s(1.4, 0.05); P.bend = 0.2; P.arms = [{ a: 0.25, e: 0.5 }, { a: 0.25, e: 0.5 }]; P.emo = 'sleep'; P.fx = 'zzz'; break;
    case 'fall': { const k = easeOut(t / 0.6); P.rot = k * 1.4; P.emo = t < 0.6 ? 'shock' : 'dizzy'; P.arms = [{ a: 2.1, e: 0.7 }, { a: 1.9, e: 0.5 }]; P.legs = [{ a: 0.3, k: 0.4 }, { a: -0.1, k: 0.2 }]; P.fx = t > 0.6 ? 'stars' : null; break; }
    case 'point': P.front = { a: 1.45, e: 0.1 }; P.emo = 'happy'; P.talk = true; P.lean = 0.05; break;
    case 'sit': P.sit = true; P.arms = [{ a: 0.35, e: 0.7 }, { a: 0.35, e: 0.7 }]; P.emo = 'neutral'; P.bend = 0.08; break;
    case 'give': P.front = { a: 1.3, e: 0.3 }; P.emo = 'happy'; P.hand = 'gift'; P.lean = 0.08; break;
    case 'dance': { const d = Math.sin(t * 6.5 + seed); P.arms = [{ a: 1.6 + d * 0.8, e: 0.8 + d * 0.3 }, { a: 1.6 - d * 0.8, e: 0.8 - d * 0.3 }]; P.lean = d * 0.12; P.bend = d * 0.12; P.legs = [{ a: -0.2 + d * 0.15, k: Math.max(0, d) * 0.6 + 0.1 }, { a: 0.2 + d * 0.15, k: Math.max(0, -d) * 0.6 + 0.1 }]; P.y = -Math.abs(d) * 16; P.emo = 'laugh'; P.fx = 'notes'; break; }
    case 'wait': P.arms[0] = { a: 0.95, e: 1.75 }; P.legs[1] = { a: 0.25, k: 0.3 + Math.max(0, s(7, 0.3)) }; P.emo = 'meh'; P.tilt = 0.1; P.fx = 'tap'; break;
    case 'shock': { const p0 = easeOut(t / 0.25); P.arms = [{ a: 2.2 + s(6, 0.06), e: 0.5 }, { a: 2.2 - s(6, 0.06), e: 0.5 }]; P.y = -Math.sin(Math.min(1, t / 0.4) * Math.PI) * 45 * p0; P.emo = 'shock'; P.fx = 'bang'; P.lean = -0.08; P.bend = -0.1; P.legs = [{ a: -0.2, k: 0.2 }, { a: 0.2, k: 0.2 }]; break; }
    case 'love': P.arms = [{ a: 0.5, e: -1.85 }, { a: 0.5, e: -1.85 }]; P.emo = 'love'; P.fx = 'hearts'; P.tilt = s(1.8, 0.12); P.bend = s(1.8, 0.06); break;
    case 'tired': P.lean = 0.22; P.bend = 0.2; P.tilt = 0.3; P.arms = [{ a: 0.08 + s(2.5, 0.06), e: 0.2 }, { a: 0.08 - s(2.5, 0.06), e: 0.2 }]; P.legs = [{ a: -0.15, k: 0.3 }, { a: 0.15, k: 0.3 }]; P.emo = 'tired'; P.fx = 'sweat'; break;
    case 'strong': P.arms = [{ a: 1.55, e: 1.9 + s(5, 0.15) }, { a: 1.55, e: 1.9 - s(5, 0.15) }]; P.emo = 'happy'; P.fx = 'sparkle'; P.legs = [{ a: -0.25, k: 0.05 }, { a: 0.25, k: 0.05 }]; P.bend = -0.06; break;
    case 'lift': P.arms = [{ a: 2.8, e: 0.25 }, { a: 2.8, e: 0.25 }]; P.legs = [{ a: -0.25, k: 0.4 + s(4, 0.1) }, { a: 0.25, k: 0.4 + s(4, 0.1) }]; P.emo = 'tired'; P.hand = 'boxup'; P.fx = 'sweat'; break;
    case 'slip': { const k = easeOut(t / 0.45); P.rot = k * 1.35; P.legs = [{ a: 0.4 + k * 1.1, k: 0.2 }, { a: 0.2 + k * 1.3, k: 0.3 }]; P.arms = [{ a: 2.5 - k * 0.6, e: 0.4 }, { a: 2.3 - k * 0.5, e: 0.6 }]; P.y = -Math.sin(Math.min(1, t / 0.45) * Math.PI) * 45; P.emo = t < 0.5 ? 'shock' : 'dizzy'; P.fx = t > 0.55 ? 'stars' : null; break; }
    case 'faint': { const k = Math.pow(clamp(t / 0.6, 0, 1), 2); P.rot = k * 1.5; P.arms = [{ a: 0.15, e: 0 }, { a: 0.15, e: 0 }]; P.legs = [{ a: -0.05, k: 0 }, { a: 0.05, k: 0 }]; P.emo = t < 0.15 ? 'shock' : 'dizzy'; P.fx = t > 0.65 ? 'stars' : null; break; }
    case 'trip': { const k = easeOut((t - 0.15) / 0.45); P.rot = -k * 1.3; P.arms = [{ a: 1.7, e: 0.2 }, { a: 1.5, e: 0.3 }]; P.legs = [{ a: -0.6, k: 0.4 }, { a: 0.3, k: 0.1 }]; P.emo = t < 0.6 ? 'shock' : 'dizzy'; P.fx = t > 0.65 ? 'stars' : null; break; }
    case 'kneel': P.kneel = 1; P.legs = [{ a: -0.15, k: 1.42 }, { a: 1.5, k: 1.5 }]; P.arms = [{ a: 1.0, e: 0.5 + s(3, 0.1) }, { a: 1.1, e: 0.4 - s(3, 0.1) }]; P.lean = 0.22; P.tilt = 0.18; P.emo = 'happy'; break;
    case 'sneak': { const st = Math.sin(t * 4 + seed); P.lean = 0.3; P.bend = 0.15; P.legs = [{ a: st * 0.35, k: 0.6 + Math.max(0, st) * 0.4 }, { a: -st * 0.35, k: 0.6 + Math.max(0, -st) * 0.4 }]; P.arms = [{ a: 0.9, e: -1.7 }, { a: 0.9, e: -1.6 }]; P.emo = 'think'; P.y = -Math.abs(st) * 6; break; }
    case 'chase': case 'flee': { const sp = 15, ph = t * sp + seed; P.legs = [0, Math.PI].map(o => ({ a: Math.sin(ph + o) * 0.8, k: Math.max(0, -Math.cos(ph + o)) * 1.4 + 0.1 })); P.lean = 0.32; P.bend = 0.18; P.y = -Math.abs(Math.cos(ph)) * 24; P.fx = 'dust';
      if (action === 'chase') { P.arms = [{ a: 1.5 + Math.sin(ph) * 0.2, e: 0.2 }, { a: 1.4 - Math.sin(ph) * 0.2, e: 0.3 }]; P.emo = 'angry'; } else { P.arms = [{ a: 2.6 + Math.sin(ph * 1.3) * 0.3, e: 0.4 }, { a: 2.5 - Math.sin(ph * 1.3) * 0.3, e: 0.5 }]; P.emo = 'shock'; } break; }
    case 'nod': P.tilt = 0.1 + Math.max(0, Math.sin(t * 5 + seed)) * 0.16; P.arms = [{ a: 0.45, e: -1.1 + s(2, 0.1) }, { a: 0.45, e: -1.1 - s(2, 0.1) }]; P.emo = 'happy'; P.y += Math.max(0, Math.sin(t * 5 + seed)) * 3; break;
    case 'pray': P.arms = [{ a: 0.85, e: -3.0 }, { a: 0.85, e: -3.0 }]; P.tilt = 0.14 + s(1.2, 0.03); P.bend = 0.06; P.emo = 'peace'; P.fx = 'glow'; break;
    default: P.emo = 'happy';
  }
  if (P.sit) { P.legs = [{ a: 1.5, k: 1.5 }, { a: 1.35, k: 1.45 }]; P.sitAmt = 1; }
  // movimiento secundario: codos y rodillas nunca quedan rígidos
  P.arms.forEach((A, i) => { A.e += 0.06 * Math.sin(g * 2.3 + seed + i * 1.7); A.a += 0.025 * Math.sin(g * 1.7 + seed + i); });
  if (!P.sit) P.legs.forEach((Lg, i) => { Lg.k += 0.04 + 0.03 * Math.sin(g * 1.6 + seed + i * 2); });
  return P;
}

// Mezcla dos poses (transiciones suaves entre escenas)
function blendPose(A, B, k) {
  if (k >= 1) return B;
  const m = (x, y) => lerp(x || 0, y || 0, k);
  const out = { ...B };
  for (const key of ['lean', 'tilt', 'y', 'rot', 'bend', 'sitAmt', 'shake']) out[key] = m(A[key], B[key]);
  out.arms = B.arms.map((b, i) => ({ a: m(A.arms[i].a, b.a), e: m(A.arms[i].e, b.e) }));
  out.legs = B.legs.map((b, i) => ({ a: m(A.legs[i].a, b.a), k: m(A.legs[i].k, b.k) }));
  out.sit = out.sitAmt > 0.5; out.desk = k > 0.5 ? B.desk : A.desk; out.kneel = k > 0.5 ? B.kneel : A.kneel;
  if (k < 0.5) { out.hand = A.hand; }
  return out;
}

function applyFront(P, f) {
  if (P.front) { P.arms = P.arms.slice(); P.arms[f > 0 ? 1 : 0] = { ...P.front }; P.front = null; }
  return P;
}

// Extremidad flexible: curva suave que pasa por la articulación (codo/rodilla)
function limb(ctx, a, b, c, lw) {
  ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = FIG;
  const cx = 2 * b[0] - (a[0] + c[0]) / 2, cy = 2 * b[1] - (a[1] + c[1]) / 2;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(cx, cy, c[0], c[1]); ctx.stroke();
}

// Colores de camiseta por personaje (estilo caricatura). En blanco y negro: gris claro.
const SHIRT = { A: '#1ec94c', B: '#1f7bff', C: '#ffd400', D: '#ff3d6e' };
const MOUTH_IN = '#7a1414', TONGUE = '#ff7d93';

// Boca según la forma (visema) y la emoción. Contorno negro grueso, interior rojo oscuro y lengua rosada.
function drawMouth(ctx, mx, my, shape, open, emo) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const blk = FIG;
  const inside = (pathFn, tongue, teeth = false) => {
    ctx.save(); pathFn(); ctx.fillStyle = MOUTH_IN; ctx.fill(); ctx.clip();
    if (teeth !== false && teeth != null) { ctx.fillStyle = '#fff'; ctx.fillRect(mx - 45, teeth - 4, 90, 13); }
    if (tongue) { ctx.fillStyle = TONGUE; ctx.beginPath(); ctx.ellipse(mx + 2, tongue.y, tongue.rx, tongue.ry, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e8577a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx + 2, tongue.y - tongue.ry * 0.7); ctx.lineTo(mx + 2, tongue.y + tongue.ry * 0.2); ctx.stroke(); }
    ctx.restore(); pathFn(); ctx.strokeStyle = blk; ctx.lineWidth = 6; ctx.stroke();
  };
  const D = (w, h, top = -6) => ({ path: () => { ctx.beginPath(); ctx.moveTo(mx - w, my + top); ctx.quadraticCurveTo(mx, my + top + 6, mx + w, my + top); ctx.quadraticCurveTo(mx + w * 0.92, my + top + h, mx, my + top + h); ctx.quadraticCurveTo(mx - w * 0.92, my + top + h, mx - w, my + top); ctx.closePath(); }, tongue: { y: my + top + h * 0.74, rx: w * 0.5, ry: Math.max(8, h * 0.42) } });
  switch (shape) {
    case 'closed': {
      ctx.strokeStyle = blk; ctx.lineWidth = 6.5; ctx.beginPath();
      const c = emo === 'sad' || emo === 'tired' ? -12 : emo === 'angry' ? -5 : emo === 'meh' || emo === 'think' ? 0 : 15;
      ctx.moveTo(mx - 21, my); ctx.quadraticCurveTo(mx, my + c, mx + 21, my); ctx.stroke(); break;
    }
    case 'small': inside(() => { ctx.beginPath(); ctx.ellipse(mx, my + 4, 14, 8 + open * 7, 0, 0, TAU); }, null); break;
    case 'O': { const ry = 16 + open * 10; inside(() => { ctx.beginPath(); ctx.ellipse(mx, my + 6, 13 + open * 4, ry, 0, 0, TAU); }, { y: my + 6 + ry * 0.6, rx: 9, ry: 7 }); break; }
    case 'ee': { const d = D(27, 18 + open * 10, -4); inside(d.path, { y: my + 14 + open * 8, rx: 12, ry: 6 }, my - 4); break; }
    case 'wide': { const d = D(32, 34 + open * 18); inside(d.path, d.tongue, my - 6); break; }
    default: { const d = D(26, 20 + open * 22); inside(d.path, d.tongue); } // 'open'
  }
}

// Cara viva: ojos que parpadean y miran, cejas según emoción, boca sincronizada con la voz.
function drawFace(ctx, hx, hy, f, emo, speech, g, seed, gaze) {
  const ink = FIG, ex = f * 9;
  const L = hx + ex - 23, Rr = hx + ex + 23, ey = hy - 8, mx = hx + ex, my = hy + 30;
  const blink = ((g + seed * 1.7) % 3.4) < 0.12;
  // mirada: pequeños saltos de los ojos cada ~1 s
  const gi = Math.floor(g * 0.9 + seed * 3);
  // mira al otro personaje (o a la cámara), con pequeños movimientos naturales
  const gz = gaze || { dx: f * 6, dy: 3 };
  const lookX = gz.dx + (hash(gi * 7 + seed) - 0.5) * 2.5, lookY = gz.dy + (hash(gi * 13 + seed) - 0.5) * 1.5;
  const amp = speech ? speech.amp : 0;
  const lift = amp * 7; // las cejas suben al enfatizar
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const eyes = ({ rx = 17, ry = 21, pr = 9, lid = 0, pdx = lookX, pdy = lookY } = {}) => {
    if (blink) { for (const x of [L, Rr]) { ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, ey, rx * 0.9, 0.3, Math.PI - 0.3); ctx.stroke(); } return; }
    for (const x of [L, Rr]) {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, ey, rx, ry, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, ey, rx - 2, ry - 2, 0, 0, TAU); ctx.clip();
      ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(x + pdx, ey + pdy, pr, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + pdx + 3, ey + pdy - 3, pr * 0.33, 0, TAU); ctx.fill();
      if (lid > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(x - rx - 2, ey - ry - 2, rx * 2 + 4, (ry * 2 + 4) * lid); }
      ctx.restore();
      if (lid > 0) line(ctx, [[x - rx + 1, ey - ry + ry * 2 * lid], [x + rx - 1, ey - ry + ry * 2 * lid]], ink, 5.5);
    }
  };
  // cejas: (inclinación interior, exterior, altura extra)
  const brows = (inner, outer, up = 0) => { const y = ey - 31 - Math.min(10, up + lift); line(ctx, [[L - 13, y + outer], [L + 10, y + inner]], ink, 7.5); line(ctx, [[Rr + 13, y + outer], [Rr - 10, y + inner]], ink, 7.5); };
  // forma de boca: si habla, sale de la voz real; si no, de la emoción
  let shape = 'closed', open = 0;
  if (speech && speech.talking) { shape = speech.shape; open = amp; }
  switch (emo) {
    case 'happy': eyes(); brows(-2, 2, 2); if (shape === 'closed') drawMouth(ctx, mx, my, 'open', 0.35, emo); else drawMouth(ctx, mx, my, shape, open, emo); break;
    case 'laugh': for (const x of [L, Rr]) line(ctx, [[x - 13, ey + 5], [x, ey - 9], [x + 13, ey + 5]], ink, 7); brows(-4, 2, 6); drawMouth(ctx, mx, my, 'wide', 0.8 + Math.sin(g * 14) * 0.2, emo); break;
    case 'sad': eyes({ pdy: 5, pdx: 0, ry: 17 }); brows(-12, 8); if (shape === 'closed') drawMouth(ctx, mx, my + 8, 'closed', 0, 'sad'); else drawMouth(ctx, mx, my, shape, open * 0.7, emo); break;
    case 'cry': for (const x of [L, Rr]) { const s2 = x === L ? 1 : -1; line(ctx, [[x - 12 * s2, ey - 8], [x + 10 * s2, ey], [x - 12 * s2, ey + 8]], ink, 7); } brows(-14, 8);
      drawMouth(ctx, mx, my + 4, 'wide', 0.6 + Math.sin(g * 9) * 0.25, emo); break;
    case 'angry': eyes({ ry: 15, pr: 7, lid: 0.32 }); brows(12, -8, -4); drawMouth(ctx, mx, my, shape === 'closed' ? 'ee' : shape, Math.max(0.15, open), emo); break;
    case 'shock': eyes({ rx: 20, ry: 25, pr: 6, pdx: 0, pdy: 0 }); brows(-6, -2, 10); drawMouth(ctx, mx, my + 4, 'O', 0.9, emo); break;
    case 'love': ctx.fillStyle = BW ? '#111' : '#e03131'; const hs = 34 + Math.sin(g * 9) * 4; heartPath(ctx, L, ey, hs); ctx.fill(); heartPath(ctx, Rr, ey, hs); ctx.fill(); brows(-4, 2, 6); drawMouth(ctx, mx, my, shape === 'closed' ? 'open' : shape, Math.max(0.3, open), emo); break;
    case 'tired': eyes({ lid: 0.52, pdy: 5, pdx: 0 }); brows(-8, 6); if (shape === 'closed') { ctx.strokeStyle = ink; ctx.lineWidth = 5.5; ctx.beginPath(); ctx.moveTo(mx - 17, my + 4); for (let i = 1; i <= 6; i++) ctx.lineTo(mx - 17 + i * 5.7, my + 4 + (i % 2 ? -5 : 3)); ctx.stroke(); } else drawMouth(ctx, mx, my, shape, open * 0.6, emo); break;
    case 'sleep': for (const x of [L, Rr]) { ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, ey - 2, 12, 0.3, Math.PI - 0.3); ctx.stroke(); } drawMouth(ctx, mx, my + 4, 'small', 0.2 + Math.sin(g * 2) * 0.15, emo); break;
    case 'think': eyes({ pdx: f * 5 + 3, pdy: -8 }); line(ctx, [[L - 13, ey - 33], [L + 10, ey - 39]], ink, 7.5); line(ctx, [[Rr - 10, ey - 30], [Rr + 13, ey - 30]], ink, 7.5); if (shape === 'closed') line(ctx, [[mx - 12, my + 5], [mx + 14, my - 1]], ink, 5.5); else drawMouth(ctx, mx, my, shape, open, emo); break;
    case 'meh': eyes({ lid: 0.4 }); brows(2, 2); if (shape === 'closed') line(ctx, [[mx - 15, my + 4], [mx + 15, my + 4]], ink, 5.5); else drawMouth(ctx, mx, my, shape, open, emo); break;
    case 'peace': for (const x of [L, Rr]) { ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, ey - 4, 12, 0.35, Math.PI - 0.35); ctx.stroke(); } brows(-3, 3, 3); if (shape === 'closed') drawMouth(ctx, mx, my, 'closed', 0, 'happy'); else drawMouth(ctx, mx, my, shape, open * 0.7, emo); break;
    case 'dizzy': ctx.fillStyle = ink; ctx.font = `700 38px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('@', L, ey); ctx.fillText('@', Rr, ey); ctx.textBaseline = 'alphabetic'; drawMouth(ctx, mx, my, 'small', 0.4, emo); break;
    default: eyes(); brows(0, 2); drawMouth(ctx, mx, my, shape, open, emo);
  }
}

function drawHandProp(ctx, type, x, y) {
  if (type === 'phone') { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.2); ctx.fillStyle = '#212529'; rr(ctx, -21, -38, 42, 72, 9); ctx.fill(); ctx.fillStyle = BW ? '#ddd' : '#a5d8ff'; rr(ctx, -16, -32, 32, 58, 5); ctx.fill(); ctx.restore(); }
  if (type === 'gift') { ctx.fillStyle = C('#e64980'); rr(ctx, x - 40, y - 66, 80, 66, 6); ctx.fill(); ctx.strokeStyle = FIG; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = C('#ffd43b'); ctx.fillRect(x - 8, y - 66, 16, 66); ctx.fillRect(x - 40, y - 42, 80, 13); }
  if (type === 'boxup') { ctx.fillStyle = C('#d4a373'); rr(ctx, x - 95, y - 125, 190, 125, 8); ctx.fill(); ctx.strokeStyle = FIG; ctx.lineWidth = 6; ctx.stroke(); line(ctx, [[x - 95, y - 62], [x + 95, y - 62]], FIG, 4); }
  if (type === 'coffee') { ctx.fillStyle = '#ffffff'; rr(ctx, x - 22, y - 48, 44, 52, 9); ctx.fill(); ctx.strokeStyle = FIG; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = C('#9c6644'); ctx.fillRect(x - 20, y - 32, 40, 11); }
}

// Marioneta a tamaño de persona: cabeza pegada a la camiseta, camiseta de manga corta, brazos de palito saliendo de la manga.
const RS = 1.45; // escala del personaje respecto al escenario (tamaño de persona real)
function drawFigure(ctx, ch, P, g, speech, gaze) {
  const f = ch.f, lw = 15;
  ctx.save();
  const sc = (ch.kid ? 0.7 : 1) * RS;
  ctx.translate(ch.x + (P.shake ? Math.sin(g * 9) * P.shake * 0.6 : 0), GY);
  if (P.rot) ctx.rotate(-f * P.rot);
  ctx.scale(sc, sc);
  ctx.globalAlpha = 0.2; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 4, 78, 13, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  const legs = P.legs.map(Lg => { const kx = f * Math.sin(Lg.a) * SK.thigh, ky = Math.cos(Lg.a) * SK.thigh, sa = Lg.a - Lg.k; return [[0, 0], [kx, ky], [kx + f * Math.sin(sa) * SK.shin, ky + Math.cos(sa) * SK.shin]]; });
  const standY = Math.max(...legs.map(l => l[2][1])) + 8;
  const maxY = lerp(standY, 118, P.sitAmt || 0);
  const hipY = -maxY + (P.y || 0);
  ctx.translate(0, hipY);
  if ((P.sitAmt || 0) > 0.5 && !P.kneel) { ctx.fillStyle = C('#8d99ae'); ctx.strokeStyle = FIG; ctx.lineWidth = 5; rr(ctx, -f * 70 - 12, 10, 124, 18, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = C('#6c757d'); ctx.fillRect(-f * 70 - 4 + (f > 0 ? 0 : 96), 26, 12, maxY - 26); ctx.fillRect(-f * 70 + 86 - (f > 0 ? 0 : 96), 26, 12, maxY - 26); ctx.fillRect(-f * 70 - 12 + (f < 0 ? 110 : 0), -120, 14, 132); }
  for (const l of legs) { limb(ctx, l[0], l[1], l[2], lw); ctx.fillStyle = FIG; ctx.beginPath(); ctx.ellipse(l[2][0] + f * 10, l[2][1] + 2, 20, 11, 0, 0, TAU); ctx.fill(); }
  const lean = P.lean || 0, bend = P.bend || 0;
  const up = [f * Math.sin(lean), -Math.cos(lean)];   // dirección del torso
  const px = Math.cos(lean), py = Math.sin(lean) * f;  // perpendicular
  const TOR = 132;                                      // altura de la camiseta (cadera → hombros)
  const sh = [up[0] * TOR, up[1] * TOR];
  const shirt = BW ? '#d9d9d9' : (SHIRT[ch.role] || SHIRT.A);
  const wS = 50, wH = 44;
  const shoulders = [[sh[0] - px * (wS - 8), sh[1] - py * (wS - 8) + 8], [sh[0] + px * (wS - 8), sh[1] + py * (wS - 8) + 8]];
  const arms = P.arms.map((A, i) => {
    const side = i === 0 ? -1 : 1; const s0 = shoulders[i]; const a = A.a, e = A.e;
    const el = [s0[0] + side * Math.sin(a) * SK.upper, s0[1] + Math.cos(a) * SK.upper];
    const hd = [el[0] + side * Math.sin(a + e) * SK.fore, el[1] + Math.cos(a + e) * SK.fore];
    return [s0, el, hd];
  });
  // mangas cortas (trapecio a lo largo del brazo, sin bolitas)
  ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
  const cuffs = arms.map(a => {
    const dx = a[1][0] - a[0][0], dy = a[1][1] - a[0][1], L0 = Math.hypot(dx, dy) || 1; const u = [dx / L0, dy / L0], n = [-u[1], u[0]];
    const len = 50, w0 = 22, w1 = 18;
    const p0 = [a[0][0] - u[0] * 6, a[0][1] - u[1] * 6], p1 = [a[0][0] + u[0] * len, a[0][1] + u[1] * len];
    ctx.beginPath(); ctx.moveTo(p0[0] + n[0] * w0, p0[1] + n[1] * w0); ctx.lineTo(p1[0] + n[0] * w1, p1[1] + n[1] * w1); ctx.lineTo(p1[0] - n[0] * w1, p1[1] - n[1] * w1); ctx.lineTo(p0[0] - n[0] * w0, p0[1] - n[1] * w0); ctx.closePath();
    ctx.fillStyle = shirt; ctx.fill(); ctx.strokeStyle = FIG; ctx.lineWidth = 5.5; ctx.stroke();
    return p1;
  });
  // cuerpo de la camiseta
  const mid = [sh[0] / 2 + f * bend * 50, sh[1] / 2];
  ctx.beginPath();
  ctx.moveTo(sh[0] - px * wS, sh[1] - py * wS + 10);
  ctx.quadraticCurveTo(mid[0] - px * (wS + 2), mid[1] - py * (wS + 2), -px * wH, 18 - py * wH);
  ctx.lineTo(px * wH, 18 + py * wH);
  ctx.quadraticCurveTo(mid[0] + px * (wS + 2), mid[1] + py * (wS + 2), sh[0] + px * wS, sh[1] + py * wS + 10);
  ctx.quadraticCurveTo(sh[0] + up[0] * 12, sh[1] + up[1] * 12 - 4, sh[0] - px * wS, sh[1] - py * wS + 10);
  ctx.closePath(); ctx.fillStyle = shirt; ctx.fill(); ctx.strokeStyle = FIG; ctx.lineWidth = 6; ctx.stroke();
  if (ch.tie) { const tx = sh[0], ty = sh[1] + 16; ctx.beginPath(); ctx.moveTo(tx - 9, ty); ctx.lineTo(tx + 9, ty); ctx.lineTo(tx + 13, ty + 58); ctx.lineTo(tx, ty + 76); ctx.lineTo(tx - 13, ty + 58); ctx.closePath(); ctx.fillStyle = BW ? '#555' : '#e8262d'; ctx.fill(); ctx.strokeStyle = FIG; ctx.lineWidth = 4.5; ctx.stroke(); }
  // cabeza pegada sobre la camiseta (sin cuello)
  const ha = lean + (P.tilt || 0) + (speech && speech.talking ? speech.amp * 0.07 * Math.sin(g * 5) : 0);
  const HD = SK.head - 10;
  const hx = sh[0] + f * Math.sin(ha) * HD, hy = sh[1] - Math.cos(ha) * HD;
  if (ch.look === 'hair') { ctx.fillStyle = FIG; ctx.beginPath(); ctx.ellipse(hx - f * 30, hy + 6, SK.head * 0.75, SK.head * 1.05, -f * 0.15, 0, TAU); ctx.fill(); }
  const stretch = P.emo === 'shock' ? 1.06 : 1;
  ctx.save(); ctx.translate(hx, hy); ctx.scale(1 / Math.sqrt(stretch), stretch); circle(ctx, 0, 0, SK.head, '#ffffff', FIG, 8); ctx.restore();
  if (ch.look === 'hair') { ctx.fillStyle = FIG; ctx.beginPath(); ctx.arc(hx, hy - 4, SK.head + 4, Math.PI * 1.08, Math.PI * 1.92); ctx.quadraticCurveTo(hx, hy - SK.head + 18, hx - (SK.head + 2), hy - 12); ctx.fill(); }
  if (ch.look === 'granny') { circle(ctx, hx - f * 4, hy - SK.head - 12, 24, '#8a8a8a', FIG, 5); for (const dx of [-22, 22]) circle(ctx, hx + f * 9 + dx, hy - 12, 20, null, FIG, 4); }
  if (ch.look === 'kid') { line(ctx, [[hx - 10, hy - SK.head + 2], [hx - 2, hy - SK.head - 24], [hx + 8, hy - SK.head - 2], [hx + 18, hy - SK.head - 20], [hx + 24, hy - SK.head + 6]], FIG, 7); }
  if (ch.cap) { // gorra roja del protagonista de la serie
    const capC = BW ? '#444' : '#e8262d';
    ctx.beginPath(); ctx.ellipse(hx + f * (SK.head * 0.62), hy - SK.head * 0.42, 46, 12, f * 0.12, 0, TAU); ctx.fillStyle = capC; ctx.fill(); ctx.strokeStyle = FIG; ctx.lineWidth = 5.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy - 6, SK.head + 3, Math.PI * 1.06, Math.PI * 1.94); ctx.quadraticCurveTo(hx, hy - SK.head * 0.5, hx - (SK.head + 1), hy - 16); ctx.closePath(); ctx.fillStyle = capC; ctx.fill(); ctx.strokeStyle = FIG; ctx.lineWidth = 6; ctx.stroke();
    circle(ctx, hx, hy - SK.head - 1, 7, capC, FIG, 4);
  }
  drawFace(ctx, hx, hy, f, P.emo, speech, g, ch.seed, gaze);
  // brazos de palito saliendo de la manga, con codo flexible
  arms.forEach((a, i) => { limb(ctx, cuffs[i], [lerp(a[0][0], a[1][0], 0.95), lerp(a[0][1], a[1][1], 0.95)], a[2], lw); circle(ctx, a[2][0], a[2][1], 12, FIG); });
  const fh = arms[f > 0 ? 1 : 0][2];
  if (P.hand === 'phone') drawHandProp(ctx, 'phone', arms[1][2][0], arms[1][2][1] - 12);
  if (P.hand === 'gift' && ch.giveProp) drawHandProp(ctx, ch.giveProp, fh[0] + f * 20, fh[1] + 10);
  if (P.hand === 'boxup') drawHandProp(ctx, 'boxup', (arms[0][2][0] + arms[1][2][0]) / 2, Math.min(arms[0][2][1], arms[1][2][1]) + 10);
  if (P.desk) { ctx.fillStyle = C('#8d6e63'); ctx.fillRect(f * 60, 0, f * 200, 16); ctx.fillRect(f * 230 - 8, 16, 16, maxY - 16); ctx.fillStyle = '#343a40'; ctx.save(); ctx.translate(f * 150, 0); ctx.fillRect(-60, -8, 120, 8); ctx.beginPath(); ctx.moveTo(-50 * f, -8); ctx.lineTo(-62 * f, -90); ctx.lineTo(-8 * f, -90); ctx.lineTo(4 * f, -8); ctx.fill(); ctx.restore(); }
  ctx.restore();
  return { hx: ch.x + hx * sc, hy: GY + (hipY + hy) * sc, r: SK.head * sc };
}
// altura de la cabeza (en el mundo) para encuadrar planos
const headY = ch => GY - (202 + 132 + SK.head - 10) * RS * (ch && ch.kid ? 0.7 : 1);

// ---------- PARTÍCULAS / EFECTOS ----------
function drawFx(ctx, type, x, y, t, g, seed) {
  if (!type) return;
  const ink = INK();
  for (let k = 0; k < 4; k++) {
    const ph = ((t * 0.7 + k / 4 + hash(seed + k) * 0.1) % 1);
    const r = hash(seed * 10 + k);
    ctx.globalAlpha = Math.sin(ph * Math.PI);
    switch (type) {
      case 'hearts': ctx.fillStyle = BW ? '#222' : '#ff4d6d'; heartPath(ctx, x + (r - 0.5) * 140 + Math.sin(ph * 8) * 15, y - 40 - ph * 200, 34 + r * 16); ctx.fill(); break;
      case 'sparkle': ctx.fillStyle = BW ? '#222' : '#fcc419'; star(ctx, x + (r - 0.5) * 220, y - 20 - ph * 140 + r * 60, 14 + 10 * Math.sin(ph * Math.PI), g * 3); ctx.fill(); break;
      case 'tears': if (k < 2) { ctx.fillStyle = BW ? '#555' : '#4dabf7'; const side = k ? 1 : -1; ctx.beginPath(); ctx.ellipse(x + side * (28 + ph * 30), y - 5 + ph * 120, 9, 14, 0, 0, TAU); ctx.fill(); } break;
      case 'sweat': if (k < 2) { ctx.fillStyle = BW ? '#777' : '#74c0fc'; ctx.beginPath(); ctx.ellipse(x + 55 + k * 12, y - 30 + ph * 50, 8, 13, 0, 0, TAU); ctx.fill(); } break;
      case 'zzz': ctx.fillStyle = ink; setFont(ctx, 36 + k * 8, 700); ctx.textAlign = 'center'; ctx.fillText('z', x + 50 + ph * 70, y - 60 - ph * 120); break;
      case 'question': if (k < 2) { ctx.fillStyle = ink; setFont(ctx, 70, 700); ctx.textAlign = 'center'; ctx.fillText('?', x + 60 + k * 45, y - 70 - Math.sin(ph * Math.PI) * 30); } break;
      case 'bang': if (k === 0) { ctx.globalAlpha = 1; ctx.fillStyle = BW ? '#111' : '#f03e3e'; setFont(ctx, 90, 700); ctx.textAlign = 'center'; ctx.fillText('!', x + 70, y - 70 + Math.sin(g * 20) * 4); } break;
      case 'steam': ctx.fillStyle = BW ? '#888' : '#adb5bd'; circle(ctx, x + (k % 2 ? 50 : -50) + Math.sin(ph * 6) * 10, y - 50 - ph * 90, 14 + ph * 16, ctx.fillStyle); if (k === 0) { ctx.globalAlpha = 1; ctx.strokeStyle = BW ? '#111' : '#e03131'; ctx.lineWidth = 6; const ax = x + 40, ay = y - 50; ctx.beginPath(); ctx.moveTo(ax - 12, ay - 4); ctx.lineTo(ax - 4, ay - 4); ctx.lineTo(ax - 4, ay - 12); ctx.moveTo(ax + 12, ay - 4); ctx.lineTo(ax + 4, ay - 4); ctx.lineTo(ax + 4, ay - 12); ctx.moveTo(ax - 12, ay + 4); ctx.lineTo(ax - 4, ay + 4); ctx.lineTo(ax - 4, ay + 12); ctx.moveTo(ax + 12, ay + 4); ctx.lineTo(ax + 4, ay + 4); ctx.lineTo(ax + 4, ay + 12); ctx.stroke(); } break;
      case 'haha': if (k < 3) { ctx.fillStyle = ink; setFont(ctx, 40, 700); ctx.textAlign = 'center'; ctx.fillText(k % 2 ? 'JA' : 'JA!', x + (k - 1) * 90, y - 90 - ph * 100); } break;
      case 'notes': ctx.fillStyle = BW ? '#222' : '#7048e8'; setFont(ctx, 54, 700); ctx.textAlign = 'center'; ctx.fillText(k % 2 ? '♪' : '♫', x + (r - 0.5) * 200, y - 60 - ph * 150); break;
      case 'notif': if (k < 3) { const nx = x + 80 + k * 20, ny = y - 60 - ph * 150; ctx.fillStyle = BW ? '#222' : '#f03e3e'; circle(ctx, nx, ny, 20, ctx.fillStyle); ctx.fillStyle = '#fff'; setFont(ctx, 24, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(1 + ((seed + k) % 9)), nx, ny + 1); ctx.textBaseline = 'alphabetic'; } break;
      case 'dust': ctx.fillStyle = BW ? '#bbb' : '#ced4da'; circle(ctx, x - 80 - ph * 120, GY - 20 - ph * 30, 14 + ph * 20, ctx.fillStyle); break;
      case 'stars': ctx.fillStyle = BW ? '#222' : '#fcc419'; star(ctx, x + Math.cos(g * 5 + k * 1.6) * 60, y - 30 + Math.sin(g * 5 + k * 1.6) * 18, 14, g); ctx.fill(); break;
      case 'cloud': if (k === 0) { ctx.globalAlpha = 0.9; ctx.fillStyle = BW ? '#999' : '#868e96'; ctx.beginPath(); ctx.arc(x - 40, y - 150, 34, 0, TAU); ctx.arc(x, y - 165, 42, 0, TAU); ctx.arc(x + 42, y - 150, 32, 0, TAU); ctx.fill(); } line(ctx, [[x - 40 + k * 26, y - 110 + ph * 60], [x - 44 + k * 26, y - 90 + ph * 60]], BW ? '#555' : '#4dabf7', 4); break;
      case 'tap': break;
      case 'glow':
        ctx.globalAlpha = 0.6 * Math.sin(ph * Math.PI); ctx.fillStyle = BW ? '#888' : '#ffd43b'; star(ctx, x + (r - 0.5) * 220, y - 90 - ph * 120, 9, g); ctx.fill(); break;
    }
  }
  ctx.globalAlpha = 1;
}

// ---------- PROPS DE ESCENA (grandes, animados) ----------
function drawProp(ctx, prop, t, g, lang, beat) {
  if (!prop || prop === 'left' || prop === 'right' || prop === 'cta' || prop.startsWith('sign:')) return;
  const [name, ...rest] = prop.split(':'); const arg = rest.join(':');
  const pin = backOut(t / 0.45), x = 540, y = 600 + Math.sin(g * 2.4) * 14;
  ctx.save(); ctx.translate(x, y); ctx.scale(pin, pin); ctx.rotate(Math.sin(g * 1.8) * 0.05);
  const ink = INK();
  const badge = (r, col) => { ctx.globalAlpha = 0.9; circle(ctx, 0, 0, r, BW ? '#fff' : col, ink, 8); ctx.globalAlpha = 1; };
  switch (name) {
    case 'clock': {
      badge(150, '#ffffff');
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(ctx, [[Math.sin(a) * 120, -Math.cos(a) * 120], [Math.sin(a) * 135, -Math.cos(a) * 135]], ink, 6); }
      let hh = 0, mm = 0; if (arg) { const m = arg.match(/(\d+):(\d+)/); if (m) { hh = +m[1]; mm = +m[2]; } }
      const spin = arg ? 0 : g * 4;
      const am = (mm / 60) * TAU + spin * 3 + (1 - easeOut(t / 0.6)) * -TAU, ah = ((hh % 12) / 12 + mm / 720) * TAU + spin;
      line(ctx, [[0, 0], [Math.sin(am) * 105, -Math.cos(am) * 105]], ink, 9);
      line(ctx, [[0, 0], [Math.sin(ah) * 70, -Math.cos(ah) * 70]], BW ? '#111' : '#e63946', 13);
      circle(ctx, 0, 0, 12, ink);
      if (arg) { setFont(ctx, 64, 700); ctx.textAlign = 'center'; ctx.fillStyle = BW ? '#111' : '#e63946'; rr(ctx, -110, 165, 220, 84, 20); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(arg, 0, 230); }
      break;
    }
    case 'money': ctx.restore(); ctx.save();
      for (let i = 0; i < 9; i++) { const ph = (t * 0.6 + i / 9) % 1, bx = 100 + hash(i) * 880, by = 150 + ph * 1100; ctx.save(); ctx.translate(bx + Math.sin(ph * 10 + i) * 40, by); ctx.rotate(Math.sin(ph * 8 + i) * 0.8); ctx.fillStyle = C('#69db7c'); rr(ctx, -55, -28, 110, 56, 6); ctx.fill(); ctx.strokeStyle = C('#2b8a3e'); ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = C('#2b8a3e'); setFont(ctx, 40, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 2); ctx.restore(); }
      ctx.textBaseline = 'alphabetic'; break;
    case 'pizza': badge(140, '#ffe8cc'); ctx.fillStyle = C('#ffa94d'); ctx.beginPath(); ctx.moveTo(0, 110); ctx.lineTo(-95, -70); ctx.quadraticCurveTo(0, -120, 95, -70); ctx.closePath(); ctx.fill(); ctx.fillStyle = C('#ffd43b'); ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(-75, -50); ctx.quadraticCurveTo(0, -90, 75, -50); ctx.closePath(); ctx.fill(); for (const [px, py] of [[-25, -30], [25, -20], [0, 30]]) circle(ctx, px, py, 16, C('#e03131')); break;
    case 'heart': ctx.fillStyle = BW ? '#222' : '#ff4d6d'; const hs = 1 + Math.sin(g * 8) * 0.06; ctx.scale(hs, hs); heartPath(ctx, 0, 0, 260); ctx.fill(); break;
    case 'gift': ctx.fillStyle = C('#e64980'); rr(ctx, -110, -70, 220, 170, 14); ctx.fill(); ctx.fillStyle = C('#f783ac'); rr(ctx, -125, -110, 250, 50, 12); ctx.fill(); ctx.fillStyle = C('#ffd43b'); ctx.fillRect(-18, -110, 36, 210); ctx.beginPath(); ctx.ellipse(-40, -130, 40, 22, -0.4, 0, TAU); ctx.ellipse(40, -130, 40, 22, 0.4, 0, TAU); ctx.fill(); break;
    case 'box': ctx.fillStyle = C('#d4a373'); rr(ctx, -130, -100, 260, 200, 10); ctx.fill(); ctx.strokeStyle = C('#9c6644'); ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = C('#ffffff'); rr(ctx, -80, -30, 160, 60, 8); ctx.fill(); ctx.fillStyle = C('#9c6644'); setFont(ctx, 40, 700); ctx.textAlign = 'center'; ctx.fillText(lang === 'es' ? 'ABIERTO' : 'OPEN', 0, 14); break;
    case 'chart_up': case 'chart_down': {
      const up = name === 'chart_up'; ctx.fillStyle = C('#ffffff'); rr(ctx, -170, -140, 340, 260, 20); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.stroke();
      const prog = easeOut(t / 1.2); const pts = []; for (let i = 0; i <= 5; i++) { const px = -130 + i * 52; const v = up ? i / 5 : 1 - i / 5; pts.push([px, 80 - v * 170 + Math.sin(i * 2.1) * 18]); }
      const n = Math.max(2, Math.ceil(prog * pts.length)); line(ctx, pts.slice(0, n), BW ? '#111' : (up ? '#2f9e44' : '#e03131'), 14);
      const lp = pts[n - 1]; ctx.fillStyle = BW ? '#111' : (up ? '#2f9e44' : '#e03131'); ctx.beginPath(); ctx.arc(lp[0], lp[1], 14, 0, TAU); ctx.fill(); break;
    }
    case 'trophy': ctx.fillStyle = C('#fcc419'); ctx.beginPath(); ctx.moveTo(-100, -120); ctx.lineTo(100, -120); ctx.quadraticCurveTo(100, 40, 0, 50); ctx.quadraticCurveTo(-100, 40, -100, -120); ctx.fill(); ctx.strokeStyle = C('#fcc419'); ctx.lineWidth = 18; ctx.beginPath(); ctx.arc(-100, -60, 40, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(100, -60, 40, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke(); ctx.fillStyle = C('#e67700'); ctx.fillRect(-20, 50, 40, 60); rr(ctx, -80, 105, 160, 40, 8); ctx.fill(); ctx.fillStyle = '#fff'; star(ctx, 0, -50, 40, 0); ctx.fill(); break;
    case 'calendar': { ctx.fillStyle = C('#ffffff'); rr(ctx, -140, -130, 280, 270, 20); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = BW ? '#111' : '#e03131'; rr(ctx, -140, -130, 280, 70, [20, 20, 0, 0]); ctx.fill(); const day = 1 + Math.floor(t * 6) % 30; ctx.fillStyle = ink; setFont(ctx, 120, 700); ctx.textAlign = 'center'; ctx.fillText(String(day), 0, 100); break; }
    case 'coffee': ctx.fillStyle = C('#ffffff'); rr(ctx, -90, -80, 180, 190, 26); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 7; ctx.stroke(); ctx.beginPath(); ctx.arc(100, 10, 40, -1.3, 1.3); ctx.stroke(); ctx.fillStyle = C('#9c6644'); ctx.fillRect(-84, -60, 168, 30); for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.6; line(ctx, [[-40 + i * 40, -100], [-40 + i * 40 + Math.sin(g * 3 + i) * 15, -170]], C('#adb5bd'), 8); } ctx.globalAlpha = 1; break;
    case 'bulb': { const on = Math.sin(g * 6) > -0.3; if (on && !BW) { ctx.globalAlpha = 0.3; circle(ctx, 0, -20, 170, '#fff3bf'); ctx.globalAlpha = 1; } circle(ctx, 0, -30, 100, BW ? (on ? '#fff' : '#ddd') : (on ? '#ffd43b' : '#ffe066'), ink, 7); ctx.fillStyle = C('#868e96'); rr(ctx, -45, 60, 90, 60, 10); ctx.fill(); line(ctx, [[-30, -10], [0, -50], [30, -10]], ink, 6); break; }
    case 'rocket': { const fl = Math.sin(g * 30) * 10; ctx.translate(0, -easeOut(t / 2) * 120); ctx.fillStyle = C('#ffffff'); ctx.beginPath(); ctx.moveTo(0, -170); ctx.quadraticCurveTo(80, -60, 55, 90); ctx.lineTo(-55, 90); ctx.quadraticCurveTo(-80, -60, 0, -170); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.stroke(); circle(ctx, 0, -50, 30, C('#4dabf7'), ink, 6); ctx.fillStyle = C('#e03131'); ctx.beginPath(); ctx.moveTo(-55, 40); ctx.lineTo(-100, 110); ctx.lineTo(-50, 90); ctx.fill(); ctx.beginPath(); ctx.moveTo(55, 40); ctx.lineTo(100, 110); ctx.lineTo(50, 90); ctx.fill(); ctx.fillStyle = C('#ff922b'); ctx.beginPath(); ctx.moveTo(-35, 95); ctx.lineTo(0, 190 + fl); ctx.lineTo(35, 95); ctx.fill(); break; }
    case 'plant': { const gr = easeOut(t / 1.5); ctx.fillStyle = C('#c96f4a'); ctx.beginPath(); ctx.moveTo(-90, 40); ctx.lineTo(90, 40); ctx.lineTo(70, 170); ctx.lineTo(-70, 170); ctx.fill(); line(ctx, [[0, 40], [0, 40 - gr * 220]], C('#2f9e44'), 14); for (let i = 0; i < 3; i++) { const ly = 20 - i * 70 * gr; if (gr > i * 0.3) { ctx.fillStyle = C('#51cf66'); ctx.beginPath(); ctx.ellipse((i % 2 ? 1 : -1) * 50, ly - 20, 50 * gr, 22 * gr, (i % 2 ? -0.5 : 0.5), 0, TAU); ctx.fill(); } } break; }
    case 'laptop': ctx.fillStyle = C('#343a40'); rr(ctx, -170, -130, 340, 220, 14); ctx.fill(); ctx.fillStyle = C('#74c0fc'); rr(ctx, -150, -112, 300, 184, 6); ctx.fill(); ctx.fillStyle = C('#495057'); rr(ctx, -200, 90, 400, 26, 8); ctx.fill(); for (let i = 0; i < 4; i++) { ctx.fillStyle = C(i % 2 ? '#ffffff' : '#d0ebff'); rr(ctx, -130 + (i % 2) * 140, -95 + Math.floor(i / 2) * 85, 120, 70, 8); ctx.fill(); circle(ctx, -70 + (i % 2) * 140, -60 + Math.floor(i / 2) * 85, 18, C('#ffd8a8')); } break;
    case 'phone': ctx.fillStyle = '#212529'; rr(ctx, -95, -170, 190, 330, 30); ctx.fill(); ctx.fillStyle = BW ? '#eee' : '#e7f5ff'; rr(ctx, -80, -150, 160, 290, 18); ctx.fill(); for (let i = 0; i < 3; i++) { const ap = easeOut((t - i * 0.25) / 0.3); if (ap > 0) { ctx.fillStyle = C(i % 2 ? '#ffffff' : '#d3f9d8'); rr(ctx, -66 + (i % 2) * 30, -130 + i * 80, 105 * ap, 60, 14); ctx.fill(); } } ctx.fillStyle = BW ? '#111' : '#f03e3e'; circle(ctx, 85, -160, 34, ctx.fillStyle); ctx.fillStyle = '#fff'; setFont(ctx, 34, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(1 + Math.floor(t * 5) % 99), 85, -158); ctx.textBaseline = 'alphabetic'; break;
    case 'light': { ctx.restore(); ctx.save(); const cx0 = 540, cy0 = -120; ctx.globalAlpha = 0.5; for (let i = 0; i < 9; i++) { const a = Math.PI / 2 + (i - 4) * 0.13 + Math.sin(g * 0.6 + i) * 0.02; const gr = ctx.createLinearGradient(cx0, cy0, cx0 + Math.cos(a) * 1500, cy0 + Math.sin(a) * 1500); gr.addColorStop(0, BW ? 'rgba(255,255,255,0.9)' : 'rgba(255,240,180,0.9)'); gr.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(cx0 + Math.cos(a - 0.04) * 1600, cy0 + Math.sin(a - 0.04) * 1600); ctx.lineTo(cx0 + Math.cos(a + 0.04) * 1600, cy0 + Math.sin(a + 0.04) * 1600); ctx.fill(); } ctx.globalAlpha = 1; break; }
    case 'confetti': if (beat.kind !== 'after') break; ctx.restore(); ctx.save(); for (let i = 0; i < 40; i++) { const ph = (t * 0.5 + hash(i)) % 1; ctx.fillStyle = C(['#ff6b6b', '#fcc419', '#51cf66', '#4dabf7', '#cc5de8'][i % 5]); ctx.save(); ctx.translate(hash(i + 3) * 1080 + Math.sin(ph * 9 + i) * 40, ph * 1500 - 100); ctx.rotate(ph * 12 + i); ctx.fillRect(-10, -6, 20, 12); ctx.restore(); } break;
  }
  ctx.restore();
}

// ---------- CÁMARA ----------
function cameraFor(beat, bi, t, chars, bgBox) {
  const plan = beat.shotPlan && beat.shotPlan.length ? beat.shotPlan : [{ t0: 0, t1: beat.dur, type: 'two', role: 'A' }];
  let si = plan.findIndex(sh => t < sh.t1); if (si < 0) si = plan.length - 1;
  const shot = plan[si]; const st = t - shot.t0; const sp = clamp(st / Math.max(0.1, shot.t1 - shot.t0), 0, 1);
  const who = chars.find(c => c.role === shot.role) || chars[0] || { x: 540 };
  const other = chars.find(c => c.role !== who.role);
  const group = chars.length ? chars.reduce((s2, c) => s2 + c.x, 0) / chars.length : 540;
  const feet = z => 1390 - 490 / z; // pies justo encima de los subtítulos
  let z, fx, fy, rot = 0, capTop = false;
  switch (shot.type) {
    case 'wide': z = lerp(1.0, 1.08, sp); fx = group; fy = feet(z); break;
    case 'push': z = lerp(1.0, 1.4, easeInOut(sp)); fx = lerp(group, who.x, sp * 0.5); fy = feet(z); break;
    case 'two': z = lerp(1.3, 1.42, sp); fx = other ? (who.x + other.x) / 2 : who.x; fy = feet(z); break;
    case 'single': z = lerp(1.95, 2.1, sp); fx = who.x + (other ? Math.sign(other.x - who.x) * 60 : 0); fy = headY(who) + 190 / z; capTop = true; break;
    case 'close': z = lerp(2.85, 3.1, easeOut(sp)); fx = who.x; fy = headY(who) + 30 / z; capTop = true; break;
    case 'crash': z = lerp(3.3, 2.6, easeOut(sp * 1.4)); fx = who.x; fy = headY(who) + 60 / z; capTop = true; break;
    case 'side': z = lerp(1.18, 1.3, sp); fx = 540 + (beat.side || 0) * 180; fy = feet(z); break;
    case 'slow': z = lerp(1.22, 1.36, t / beat.dur); fx = group; fy = feet(z); break;
    case 'cta': z = lerp(1.12, 1.18, t / beat.dur); fx = group; fy = feet(z); break;
    default: z = 1.3; fx = group; fy = feet(z);
  }
  // golpe de zoom al cortar de plano (más marcado en los primeros planos)
  const punch = Math.pow(Math.max(0, 1 - st / 0.28), 2) * (shot.type === 'close' ? 0.1 : 0.05);
  z *= 1 + punch;
  const lvl = beat.kind === 'rep' ? (beat.level || 0) : beat.kind === 'twist' ? 1 : 0;
  fx += Math.sin(t * 0.9 + bi) * 8 + Math.sin(t * 1.6 + bi * 2) * 3 * lvl;
  fy += Math.cos(t * 0.7 + bi) * 5;
  rot += Math.sin(t * 0.6 + bi) * 0.008;
  if (bgBox) { fx = clamp(fx, bgBox.l + 540 / z + 10, bgBox.r - 540 / z - 10); fy = Math.min(fy, bgBox.b - 960 / z - 10); }
  return { z, fx, fy, rot, si, st, type: shot.type, role: shot.role, capTop };
}

// ---------- TEXTOS ----------
function wordWeights(words) { const w = words.map(x => x.length + 2); const tot = w.reduce((a, b) => a + b, 0); let acc = 0; return w.map(v => { acc += v; return acc / tot; }); }
function activeWord(beat, t, nWords) {
  const vt = t - (beat.voiceLead || 0); const vd = beat.voiceDur || Math.max(1, beat.dur - 0.5);
  return { p: clamp(vt / vd, 0, 1), started: vt >= 0 };
}

// Cartel de tiempo estilo sello: "6:00 AM", "DÍA 15"
function drawCard(ctx, beat, t) {
  if (!beat.card) return;
  const k = backOut(t / 0.22);
  ctx.save(); setFont(ctx, 56, 700); const tw = ctx.measureText(beat.card).width + 56;
  ctx.translate(40 + tw / 2, 108); ctx.rotate(-0.04); ctx.scale(k, k);
  ctx.fillStyle = '#111'; rr(ctx, -tw / 2, -44, tw, 88, 18); ctx.fill(); ctx.strokeStyle = BW ? '#fff' : '#ffd60a'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(beat.card, 0, 3); ctx.textBaseline = 'alphabetic';
  ctx.restore();
}
function drawQuestion(ctx, beat, t) {
  const k = backOut(t / 0.3);
  ctx.save(); const { size, lines } = fitText(ctx, beat.text, 860, 3, 70, 44, 700); setFont(ctx, size, 700);
  const lh = size * 1.15, total = lines.length * lh, bw = Math.min(980, Math.max(...lines.map(l => ctx.measureText(l.join(' ')).width)) + 90);
  ctx.translate(540, 240); ctx.rotate(Math.sin(t * 3) * 0.015); ctx.scale(k, k);
  ctx.fillStyle = '#ffffff'; rr(ctx, -bw / 2, -total / 2 - 34, bw, total + 68, 30); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = '#111'; ctx.textAlign = 'center';
  lines.forEach((ln, i) => ctx.fillText(ln.join(' '), 0, -total / 2 + (i + 0.8) * lh));
  // flecha hacia los comentarios
  const ay = total / 2 + 70 + Math.sin(t * 7) * 10; ctx.fillStyle = BW ? '#111' : '#ffd60a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-26, ay); ctx.lineTo(26, ay); ctx.lineTo(26, ay + 34); ctx.lineTo(52, ay + 34); ctx.lineTo(0, ay + 80); ctx.lineTo(-52, ay + 34); ctx.lineTo(-26, ay + 34); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawOnoma(ctx, beat, t) {
  const t0 = beat.onomaT || 0.3; if (!beat.onoma || t < t0) return;
  const k = backOut((t - t0) / 0.25); const fade = clamp((beat.dur - t) / 0.2, 0, 1);
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(540, 335); ctx.rotate(-0.09 + Math.sin(t * 6) * 0.02); ctx.scale(k * 0.9, k * 0.9);
  ctx.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; const r2 = i % 2 ? 150 : 215; ctx.lineTo(Math.cos(a) * r2 * 1.55, Math.sin(a) * r2 * 0.78); } ctx.closePath();
  ctx.fillStyle = BW ? '#ffffff' : '#ffd60a'; ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.stroke();
  const { size } = fitText(ctx, beat.onoma, 520, 1, 108, 50, 700); setFont(ctx, size, 700);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 16; ctx.strokeStyle = '#111'; ctx.strokeText(beat.onoma, 0, 6);
  ctx.fillStyle = BW ? '#ffffff' : '#ff2d55'; ctx.fillText(beat.onoma, 0, 6); ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

function drawCaption(ctx, beat, t, opts, capTop = false) {
  drawCard(ctx, beat, t);
  if (beat.kind === 'question') { drawQuestion(ctx, beat, t); return; }
  if (beat.kind === 'rep' && beat.onoma && !capTop) drawOnoma(ctx, beat, t);
  if (beat.kind === 'act') { drawOnoma(ctx, beat, t); if (!(beat.react && t >= beat.reactStart && beat.react.vocal)) return; }
  let text = beat.text; if (!text && !(beat.react && beat.react.vocal)) return;
  const kind = beat.kind;
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (kind === 'hook') {
    const { size, lines } = fitText(ctx, text.toUpperCase(), 860, 3, 62, 40, 700);
    const lh = size * 1.12; const total = lines.length * lh; const y0 = 70 + 26;
    const words = lines.flat(); const cum = wordWeights(words); const { p } = activeWord(beat, t, words.length);
    const boxW = Math.min(960, Math.max(...lines.map(l => ctx.measureText(l.join(' ')).width)) + 64);
    const pin = 0.85 + 0.15 * backOut(t / 0.3);
    ctx.save(); ctx.translate(540, y0 + total / 2); ctx.scale(pin, pin); ctx.rotate(-0.02 + Math.sin(t * 3) * 0.01); ctx.translate(-540, -(y0 + total / 2));
    ctx.fillStyle = BW ? '#ffffff' : '#ffd60a'; rr(ctx, 540 - boxW / 2, y0 - 22, boxW, total + 38, 24); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 7; ctx.stroke();
    let wi = 0;
    lines.forEach((ln, li) => {
      const lw = ctx.measureText(ln.join(' ')).width; let x = 540 - lw / 2; const y = y0 + (li + 0.82) * lh;
      for (const w of ln) { const st = wi === 0 ? 0 : cum[wi - 1]; const active = p > 0 && p < 1 && st <= p && cum[wi] > p; const ww = ctx.measureText(w + ' ').width; ctx.fillStyle = active ? (BW ? '#666' : '#e63946') : '#111'; ctx.fillText(w, x, y); x += ww; wi++; }
    });
    ctx.restore(); ctx.restore(); return;
  }
  if (kind === 'reflect') {
    const fade = clamp(t / 0.5, 0, 1) * clamp((beat.dur - t) / 0.3, 0, 1);
    const { size, lines } = fitText(ctx, text, 940, 4, 66, 42, 700);
    const lh = size * 1.2; const total = lines.length * lh; const y0 = 250 - total / 2;
    const words = lines.flat(); const cum = wordWeights(words); const { p } = activeWord(beat, t, words.length);
    let wi = 0; ctx.globalAlpha = fade; ctx.lineJoin = 'round';
    lines.forEach((ln, li) => {
      const lw = ctx.measureText(ln.join(' ')).width; let x = 540 - lw / 2; const y = y0 + (li + 0.85) * lh + (1 - easeOut(t / 0.8)) * 30;
      for (const w of ln) { const lit = (wi === 0 ? 0 : cum[wi - 1]) <= p; ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 12; ctx.strokeText(w, x, y); ctx.fillStyle = lit ? (BW ? '#ffffff' : '#ffe8a3') : 'rgba(255,255,255,0.55)'; ctx.fillText(w, x, y); x += ctx.measureText(w + ' ').width; wi++; }
    });
    ctx.restore(); return;
  }
  // subtítulo normal (grande, palabra activa resaltada). En primeros planos va arriba para no tapar a nadie.
  let reacting = false, p, started;
  if (beat.react && beat.react.vocal && t >= beat.reactStart) { reacting = true; text = beat.react.vocal; const rd = beat.reactDur || 0.7; p = clamp((t - beat.reactStart) / rd, 0, 1); started = true; }
  const yC = capTop ? (beat.card ? 290 : 250) : 1615;
  const { size, lines } = fitText(ctx, text, 940, 3, reacting ? 86 : kind === 'twist' ? 72 : 66, 42, 700);
  const lh = size * 1.18; const total = lines.length * lh; const y0 = yC - total / 2;
  const words = lines.flat(); const cum = wordWeights(words);
  if (!reacting) ({ p, started } = activeWord(beat, t, words.length));
  let cur = cum.findIndex(c => c >= p); if (!started) cur = -1;
  const pin = reacting ? backOut((t - beat.reactStart) / 0.22) : kind === 'twist' ? backOut((t - (beat.voiceLead || 0)) / 0.3) : backOut(t / 0.25);
  ctx.save(); ctx.translate(540, yC); ctx.scale(pin, pin);  ctx.translate(-540, -yC);
  let wi = 0; ctx.lineJoin = 'round';
  lines.forEach((ln, li) => {
    const spc = ctx.measureText(' ').width * 1.35 + 4; const lw = ln.reduce((a, w) => a + ctx.measureText(w).width, 0) + spc * (ln.length - 1); let x = 540 - lw / 2; const y = y0 + (li + 0.82) * lh;
    for (const w of ln) {
      const ww = ctx.measureText(w).width, sw = ctx.measureText(' ').width * 1.35 + 4; const active = wi === cur;
      if (active && BW) { ctx.fillStyle = '#111'; rr(ctx, x - 10, y - size * 0.86, ww + 20, size * 1.08, 14); ctx.fill(); }
      ctx.save(); if (active) { ctx.translate(x + ww / 2, y - size / 3); ctx.scale(1.06, 1.06); ctx.translate(-(x + ww / 2), -(y - size / 3)); }
      ctx.strokeStyle = '#111'; ctx.lineWidth = 16; ctx.strokeText(w, x, y);
      ctx.fillStyle = reacting ? (BW ? '#ffffff' : '#ffd60a') : active ? (BW ? '#ffffff' : '#ffd60a') : '#ffffff'; ctx.fillText(w, x, y); ctx.restore();
      x += ww + sw; wi++;
    }
  });
  ctx.restore(); ctx.restore();
}

// ---------- LLAMADO A LA ACCIÓN ----------
function cursor(ctx, x, y, press) {
  ctx.save(); ctx.translate(x, y); ctx.scale(press ? 0.88 : 1, press ? 0.88 : 1);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 95); ctx.lineTo(24, 72); ctx.lineTo(42, 112); ctx.lineTo(60, 104); ctx.lineTo(42, 66); ctx.lineTo(74, 64); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (press) { ctx.strokeStyle = BW ? '#111' : '#ffd60a'; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 - 0.9 + i * 0.36; line(ctx, [[Math.cos(a) * 30, Math.sin(a) * 30], [Math.cos(a) * 60, Math.sin(a) * 60]], ctx.strokeStyle, 6); } }
  ctx.restore();
}
function outlinedText(ctx, text, x, y, size) { setFont(ctx, size, 700); ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 12; ctx.strokeText(text, x, y); ctx.fillText(text, x, y); }

// Cada widget se dibuja centrado en (0,0). Devuelve dónde toca el cursor.
function ctaWidget(ctx, type, t, clickT, g, opts) {
  const es = opts.lang === 'es'; const clicked = t > clickT; const red = BW ? '#111' : '#ff0033';
  const dt = t - clickT;
  if (type === 'like') {
    const pulse = clicked ? 1 + Math.sin(dt * 10) * 0.08 * Math.exp(-dt * 1.5) : 1;
    ctx.save(); ctx.scale(pulse, pulse);
    circle(ctx, 0, 0, 140, clicked ? (BW ? '#111' : '#ff4d6d') : '#ffffff', '#111', 10);
    ctx.fillStyle = clicked ? '#ffffff' : (BW ? '#111' : '#ff4d6d'); heartPath(ctx, 0, 10, 160); ctx.fill();
    ctx.restore();
    if (clicked && dt < 1) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, d = 160 + dt * 220; ctx.globalAlpha = Math.max(0, 1 - dt); ctx.fillStyle = BW ? '#111' : '#ff4d6d'; heartPath(ctx, Math.cos(a) * d, Math.sin(a) * d, 46); ctx.fill(); ctx.globalAlpha = 1; }
    outlinedText(ctx, es ? 'ME GUSTA' : 'LIKE', 0, 215, 54);
    return { x: 10, y: 10 };
  }
  if (type === 'follow') {
    const page = (opts.page || '').trim();
    circle(ctx, 0, -95, 105, BW ? '#fff' : '#ffe8a3', '#111', 10);
    line(ctx, [[0, -100], [0, -45]], '#111', 12); circle(ctx, 0, -128, 30, '#fff', '#111', 8); line(ctx, [[-34, -78], [0, -88], [34, -78]], '#111', 9);
    if (page) outlinedText(ctx, page, 0, 70, 50);
    ctx.fillStyle = clicked ? (BW ? '#555' : '#495057') : red; rr(ctx, -220, 100, 440, 130, 65); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.stroke();
    setFont(ctx, 58, 700); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(clicked ? (es ? 'SIGUIENDO ✓' : 'FOLLOWING ✓') : (es ? 'SEGUIR' : 'FOLLOW'), 0, 186);
    if (clicked) { ctx.save(); ctx.translate(250, 40); ctx.rotate(Math.sin(dt * 18) * 0.3 * Math.exp(-dt * 1.5)); ctx.fillStyle = BW ? '#111' : '#fcc419'; ctx.beginPath(); ctx.moveTo(-36, 28); ctx.quadraticCurveTo(-36, -46, 0, -46); ctx.quadraticCurveTo(36, -46, 36, 28); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.stroke(); circle(ctx, 0, 38, 11, BW ? '#111' : '#fcc419', '#111', 4); ctx.restore(); }
    return { x: 0, y: 165 };
  }
  if (type === 'stars') {
    if (!BW) { ctx.globalAlpha = 0.25 + Math.sin(g * 3) * 0.08; circle(ctx, 0, 0, 330, '#fff3bf'); ctx.globalAlpha = 1; }
    for (let i = 0; i < 5; i++) {
      const fillT = easeOut((t - (clickT - 0.75) - i * 0.15) / 0.25), x = -300 + i * 150, y = Math.sin(g * 2.5 + i) * 8;
      ctx.save(); ctx.translate(x, y); ctx.scale(0.82 + fillT * 0.2, 0.82 + fillT * 0.2);
      star(ctx, 0, 0, 66, 0); ctx.fillStyle = fillT > 0.5 ? (BW ? '#111' : '#fcc419') : '#ffffff'; ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
    }
    outlinedText(ctx, es ? '★ APÓYANOS ★' : '★ SUPPORT US ★', 0, 160, 56);
    return { x: 300, y: 10 };
  }
  if (type === 'link') {
    const label = (opts.linkLabel || opts.linkUrl || (es ? 'Enlace' : 'Link')).trim();
    setFont(ctx, 52, 700); const tw = Math.min(900, ctx.measureText(label).width + 170);
    const press = Math.abs(dt) < 0.12; const sc = press ? 0.94 : 1; ctx.save(); ctx.scale(sc, sc);
    ctx.fillStyle = BW ? '#111' : '#1c7ed6'; rr(ctx, -tw / 2, -72, tw, 144, 72); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.save(); ctx.translate(-tw / 2 + 75, 0); ctx.rotate(-0.78); rr(ctx, -34, -14, 40, 28, 14); ctx.stroke(); rr(ctx, -6, -14, 40, 28, 14); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; let lbl = label; while (ctx.measureText(lbl).width > tw - 170 && lbl.length > 4) lbl = lbl.slice(0, -2); if (lbl !== label) lbl += '…'; ctx.fillText(lbl, 30, 4); ctx.textBaseline = 'alphabetic'; ctx.restore();
    const ay = -150 + Math.sin(g * 5) * 12; ctx.fillStyle = BW ? '#111' : '#ffd60a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-40, ay - 70); ctx.lineTo(40, ay - 70); ctx.lineTo(40, ay - 20); ctx.lineTo(75, ay - 20); ctx.lineTo(0, ay + 40); ctx.lineTo(-75, ay - 20); ctx.lineTo(-40, ay - 20); ctx.closePath(); ctx.fill(); ctx.stroke();
    return { x: 20, y: 10 };
  }
  // combo: me gusta + compartir + seguir
  const items = [['heart', es ? 'ME GUSTA' : 'LIKE'], ['share', es ? 'COMPARTIR' : 'SHARE'], ['plus', es ? 'SEGUIR' : 'FOLLOW']];
  items.forEach(([ic, lb], i) => {
    const x = -290 + i * 290, on = t > clickT + i * 0.35;
    circle(ctx, x, 0, 100, on ? (BW ? '#111' : ['#ff4d6d', '#1c7ed6', '#ff0033'][i]) : '#fff', '#111', 9);
    const col = on ? '#fff' : '#111'; ctx.fillStyle = col; ctx.strokeStyle = col;
    if (ic === 'heart') { heartPath(ctx, x, 8, 110); ctx.fill(); }
    if (ic === 'share') { ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 40, 35); ctx.quadraticCurveTo(x - 30, -25, x + 25, -25); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 10, -55); ctx.lineTo(x + 45, -25); ctx.lineTo(x + 10, 5); ctx.stroke(); }
    if (ic === 'plus') { line(ctx, [[x - 40, 0], [x + 40, 0]], col, 16); line(ctx, [[x, -40], [x, 40]], col, 16); }
    outlinedText(ctx, lb, x, 165, 40);
  });
  return { x: -290, y: 10 };
}

function drawCTA(ctx, beat, t, g, opts) {
  const types = beat.ctaTypes && beat.ctaTypes.length ? beat.ctaTypes : [beat.ctaType || 'like'];
  const two = types.length > 1;
  const slots = two ? [{ x: 290, y: 250, s: 0.56, click: 1.0 }, { x: 790, y: 250, s: 0.56, click: 1.9 }] : [{ x: 540, y: 245, s: 0.68, click: 1.1 }];
  const hits = [];
  types.forEach((type, i) => {
    const sl = slots[i]; const ap = backOut((t - i * 0.18) / 0.4);
    ctx.save(); ctx.translate(sl.x, sl.y + Math.sin(g * 2 + i) * 6); ctx.scale(sl.s * ap, sl.s * ap);
    const hit = ctaWidget(ctx, type, t, sl.click, g, opts);
    ctx.restore();
    hits.push({ x: sl.x + hit.x * sl.s, y: sl.y + hit.y * sl.s, click: sl.click });
  });
  // el cursor viaja de un botón al otro y los toca
  let cx = 860, cy = 1500, press = false;
  let prev = { x: 860, y: 1500, click: 0.25 };
  for (const h of hits) {
    if (t < h.click) { const k = easeInOut((t - prev.click - 0.05) / Math.max(0.2, h.click - prev.click - 0.2)); cx = lerp(prev.x, h.x, k); cy = lerp(prev.y, h.y, k); break; }
    cx = h.x; cy = h.y; press = press || Math.abs(t - h.click) < 0.12; prev = h;
  }
  if (hits.some(h => Math.abs(t - h.click) < 0.12)) press = true;
  cursor(ctx, cx, cy, press);
}

// ---------- ESCENA ----------
function parseActs(a) {
  const m = {}; (a || '').split(/\s+/).filter(Boolean).forEach(tok => { const [r, act] = tok.split(':'); if (r === 'all') { for (const k of ROLES) if (!m[k]) m[k] = act; m._all = act; } else m[r] = act; });
  return m;
}
const BASEX = { 1: [540], 2: [330, 750], 3: [200, 540, 880], 4: [130, 400, 680, 950] };

function sceneChars(beat, t, opts) {
  const n = opts.nChars; const acts = parseActs(beat.a); const looks = LOOKS[opts.sitId] || {};
  const xs = BASEX[n].slice();
  const chars = [];
  const listenKinds = ['setup', 'rep', 'twist', 'after'];
  for (let i = 0; i < n; i++) {
    const role = ROLES[i];
    let act = acts[role] || acts._all || (beat.kind === 'twist' ? 'shock' : beat.kind === 'cta' ? 'wave' : 'idle');
    if (!acts[role] && !acts._all && i >= 2 && beat.kind === 'rep') act = beat.level > 0.6 ? 'laugh' : 'idle';
    // el que escucha nunca se queda quieto: asiente y gesticula
    if (act === 'idle' && role !== beat.speaker && listenKinds.includes(beat.kind)) act = 'nod';
    chars.push({ role, act, scripted: act, x: xs[i], baseX: xs[i], seed: i * 1.37 + 0.5, look: looks[role], kid: looks[role] === 'kid', tie: looks[role] === 'tie', cap: role === 'A' && !!opts.series, f: 1 });
  }
  // caminos: el protagonista camina hacia el lado del camino
  if (beat.env === 'caminos' && beat.side && chars[0]) { const c = chars[0]; const target = 540 + beat.side * 260; c.x = lerp(n > 1 ? c.baseX : 540, target, easeInOut(t / Math.min(1.2, beat.dur))); if (c.act === 'idle' || c.act === 'nod') { c.act = 'walk'; c.settleK = clamp((t - Math.min(1.2, beat.dur)) / 0.4, 0, 1); c.after = 'idle'; } c.walkDir = beat.side; }
  else if (beat.env === 'caminos' && n === 1) chars[0].x = 540;
  for (const c of chars) {
    if (c.act === 'walk' && !c.walkDir) { const from = c.x < 540 ? -1 : 1; c.x = lerp(c.baseX + from * 420, c.baseX, easeOut(t / Math.min(1.2, beat.dur * 0.6))); c.walkDir = -from; c.settleK = clamp((t - Math.min(1.2, beat.dur * 0.6)) / 0.35, 0, 1); c.after = 'idle'; }
    if (c.act === 'run') { const from = c.x < 540 ? -1 : 1; c.x = lerp(c.baseX + from * 900, c.baseX, easeOut(t / Math.min(0.8, beat.dur * 0.5))); c.walkDir = -from; c.settleK = clamp((t - Math.min(0.8, beat.dur * 0.5)) / 0.3, 0, 1); c.after = 'idle'; }
  }
  // entrada (corriendo o caminando desde fuera de cuadro)
  const en = beat.enter && chars.find(c => c.role === beat.enter.role);
  if (en) { const T = en && beat.enter.run ? 0.7 : 1.0; en.x = lerp(en.baseX + beat.enter.from * 900, en.baseX, easeOut(t / T)); en.walkDir = -beat.enter.from; if (t < T + 0.3) { en.act = beat.enter.run ? 'run' : 'walk'; en.settleK = clamp((t - T) / 0.3, 0, 1); en.after = en.scripted === 'run' || en.scripted === 'walk' ? 'idle' : en.scripted; } else en.walkDir = 0; }
  // salida corriendo al final de la escena
  const ex = beat.exit && chars.find(c => c.role === beat.exit.role);
  if (ex) { const t0 = beat.dur - 0.75; if (t > t0) { const k = clamp((t - t0) / 0.75, 0, 1); ex.x = ex.baseX + beat.exit.dir * 900 * k * k; ex.act = 'run'; ex.walkDir = beat.exit.dir; ex.settleK = 0; } }
  const huggers = chars.filter(c => c.act === 'hug');
  if (huggers.length >= 2) { const hm = (huggers[0].baseX + huggers[1].baseX) / 2; const k = easeOut(t / 0.6); huggers[0].x = lerp(huggers[0].baseX, hm - 105, k); huggers[1].x = lerp(huggers[1].baseX, hm + 105, k); }
  else if (huggers.length === 1) huggers[0].act = 'love';
  for (const c of chars) if (c.act === 'give') { const other = chars.filter(o => o !== c).sort((a, b) => Math.abs(a.x - c.x) - Math.abs(b.x - c.x))[0]; if (other) c.x = lerp(c.baseX, lerp(c.baseX, other.x, 0.45), easeOut(t / 0.7)); c.giveProp = beat.p === 'coffee' ? 'coffee' : 'gift'; }
  // persecuciones, huidas y pasos de puntillas (escenas de acción)
  const movers = chars.filter(c => c.act === 'chase' || c.act === 'flee');
  if (movers.some(c => c.act === 'chase')) {
    const order = [...movers.filter(c => c.act === 'flee'), ...movers.filter(c => c.act === 'chase')];
    order.forEach((c, k) => { c.x = lerp(-350, 1450, clamp(t / (beat.dur * 0.95), 0, 1)) - k * 330; c.walkDir = 1; });
  } else movers.forEach(c => { const dir = c.x < 540 ? -1 : 1; c.x = c.baseX + dir * 1100 * Math.pow(clamp((t - 0.25) / (beat.dur * 0.7), 0, 1), 2); c.walkDir = dir; });
  for (const c of chars) if (c.act === 'sneak') { c.x = c.baseX - 160 + 320 * clamp(t / beat.dur, 0, 1); c.walkDir = 1; }
  // reacción exagerada del que escucha
  if (beat.react && t >= beat.reactStart) { const r = chars.find(c => c.role === beat.react.role); if (r) { r.from = r.act; r.act = beat.react.act; r.reactK = clamp((t - beat.reactStart) / 0.14, 0, 1); r.settleK = 0; } }
  for (const c of chars) {
    if (c.walkDir) c.f = c.walkDir;
    else if (chars.length > 1) { const others = chars.filter(o => o !== c); const nearest = others.sort((a, b) => Math.abs(a.x - c.x) - Math.abs(b.x - c.x))[0]; c.f = nearest.x >= c.x ? 1 : -1; }
    else c.f = Math.sin(t * 0.8 + 1) > -0.2 ? 1 : -1;
  }
  return chars;
}

function charPose(c, t, g) {
  let P = applyFront(pose(c.act, t, g, c.seed), c.f);
  if (c.settleK > 0) P = blendPose(P, applyFront(pose(c.after || 'idle', t, g, c.seed), c.f), easeInOut(c.settleK));
  if (c.reactK != null && c.reactK < 1 && c.from) P = blendPose(applyFront(pose(c.from, t, g, c.seed), c.f), P, easeOut(c.reactK));
  return P;
}

export function prepareProject(project) {
  for (const b of project.beats) b._lang = project.lang;
  return project;
}

export function beatAt(project, time) {
  const bs = project.beats; let i = 0;
  while (i < bs.length - 1 && time >= bs[i].start + bs[i].dur) i++;
  return i;
}

// Voz → forma de la boca (visemas) a partir del volumen y el "brillo" del audio real
function speechFor(beat, t, g, seed) {
  const vt = t - (beat.voiceLead || 0); const vd = beat.voiceDur || 0;
  if (vt < 0 || vt > (vd || beat.dur - 0.4)) return { talking: false, amp: 0 };
  let amp, z;
  if (beat.lip) { const i = Math.min(beat.lip.amp.length - 1, Math.max(0, Math.floor(vt * 60))); amp = beat.lip.amp[i]; z = beat.lip.zcr[i]; }
  else { amp = Math.max(0, Math.sin(g * 17 + seed) * 0.5 + Math.sin(g * 7.3) * 0.4); z = (Math.sin(g * 3.1 + seed) + 1) / 4; }
  let shape = 'closed';
  if (amp > 0.1) shape = amp < 0.28 ? 'small' : z > 0.5 ? 'ee' : amp > 0.75 ? 'wide' : z < 0.14 ? 'O' : 'open';
  return { talking: true, amp: clamp(amp, 0, 1), shape };
}

function bgImageFor(project, beat) { return project.aiBg && beat.bgKey ? project.aiBg.get(beat.bgKey) : null; }
function bgRect(img) { const Hi = 2600, Wi = img.width / img.height * Hi; const top = (GY - 60) - 0.72 * Hi; return { l: 540 - Wi / 2, r: 540 + Wi / 2, t: top, b: top + Hi, w: Wi, h: Hi }; }

export function drawFrame(ctx, project, time, scale = 1) {
  BW = !project.color; cache.clear();
  const opts = project;
  const bi = beatAt(project, time); const beat = project.beats[bi]; const t = Math.max(0, time - beat.start); const g = time;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = BW ? '#ffffff' : '#000'; ctx.fillRect(0, 0, W, H);
  const img = bgImageFor(project, beat); const box = img ? bgRect(img) : null;
  const chars = sceneChars(beat, t, opts);
  const cam = cameraFor(beat, bi, t, chars, box);
  const whip = bi > 0 ? Math.max(0, 1 - t / 0.16) : 0; const dir = bi % 2 ? 1 : -1;
  ctx.save();
  ctx.translate(W / 2 + dir * whip * whip * 700, H / 2);
  ctx.rotate(cam.rot); ctx.scale(cam.z, cam.z); ctx.translate(-cam.fx, -cam.fy);
  if (img) {
    ctx.save(); if (BW && 'filter' in ctx) ctx.filter = 'grayscale(1)'; ctx.drawImage(img, box.l, box.t, box.w, box.h); ctx.restore();
    if (beat.env === 'caminos' && beat.sign) drawSigns(ctx, beat.sign.replace('sign:', '').split('|'), project.lang, g, beat.side || 0);
  } else (ENV_DRAW[beat.env] || ENV_DRAW.vacio)(ctx, g, beat);
  const intensity = beat.kind === 'rep' ? beat.level : beat.kind === 'twist' ? 1 : 0;
  if (intensity > 0.55) { ctx.save(); ctx.globalAlpha = 0.1 * intensity; ctx.strokeStyle = BW ? '#000' : '#ffffff'; ctx.lineWidth = 8; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU + g * 0.12; const r0 = 600 + hash(i) * 220; ctx.beginPath(); ctx.moveTo(cam.fx + Math.cos(a) * r0, cam.fy + Math.sin(a) * r0); ctx.lineTo(cam.fx + Math.cos(a) * 1500, cam.fy + Math.sin(a) * 1500); ctx.stroke(); } ctx.restore(); }
  // reflexión: oscurece SOLO el fondo (las cabezas siguen blancas)
  if (beat.kind === 'reflect') {
    const k = clamp(t / 0.6, 0, 1);
    ctx.save(); ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, `rgba(15,8,35,${0.82 * k})`); gr.addColorStop(0.55, `rgba(40,15,50,${0.5 * k})`); gr.addColorStop(1, `rgba(0,0,0,${0.35 * k})`);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { const ph = (g * 0.05 + hash(i)) % 1; ctx.globalAlpha = 0.5 * Math.sin(ph * Math.PI) * k; circle(ctx, hash(i + 7) * W, H - ph * H, 3 + hash(i + 3) * 6, BW ? '#fff' : '#ffe8a3'); }
    ctx.restore();
  }
  if (beat.kind === 'cta') { ctx.save(); ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  // quién habla: el que está hablando/señalando; si no, el protagonista narra
  const reactOn = beat.react && t >= beat.reactStart;
  const talker = reactOn ? (beat.react.vocal ? beat.react.role : null) : beat.kind === 'act' ? null : (beat.speaker || 'A');
  const BL = 0.45; let prevMap = null, pb = null;
  if (bi > 0 && t < BL) { pb = project.beats[bi - 1]; prevMap = new Map(sceneChars(pb, pb.dur, opts).map(pc => [pc.role, pc])); }
  for (const c of chars) {
    let P = charPose(c, t, g);
    const pc = prevMap && prevMap.get(c.role);
    if (pc) { const k = easeInOut(t / BL); P = blendPose(charPose(pc, pb.dur, g), P, k); c.x = lerp(pc.x, c.x, k); }
    const speech = c.role !== talker ? null : reactOn ? speechFor({ voiceLead: 0, voiceDur: beat.reactDur || 0.6, lip: beat.reactLip, dur: beat.reactDur || 0.6 }, t - beat.reactStart, g, c.seed) : speechFor(beat, t, g, c.seed);
    // mirada: a la cámara en el gancho, la reflexión, el final y en su primer plano; si no, al otro personaje
    const target = chars.find(o => o.role === (c.role === talker ? (beat.listener || beat.speaker) : talker) && o !== c);
    const toCam = ['hook', 'cta', 'reflect', 'question'].includes(beat.kind) || (cam.capTop && cam.role === c.role);
    const gaze = toCam || !target ? { dx: 0, dy: 3 } : { dx: Math.sign(target.x - c.x) * 7, dy: 3 };
    if (speech && speech.talking && P.emo === 'neutral') P.emo = 'happy';
    if (P.fx === 'glow') { const hx = c.x, hy = headY(c); ctx.save(); ctx.globalAlpha = 0.6 + Math.sin(g * 2) * 0.15; const gr = ctx.createRadialGradient(hx, hy, 30, hx, hy, 260); gr.addColorStop(0, BW ? 'rgba(255,255,255,0.95)' : 'rgba(255,232,150,0.9)'); gr.addColorStop(1, 'rgba(255,232,150,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(hx, hy, 260, 0, TAU); ctx.fill(); ctx.restore(); }
    const head = drawFigure(ctx, c, P, g, speech, gaze);
    if (beat.kind === 'hook' && c.cap && project.seriesName && t > 0.3) { const k = backOut((t - 0.3) / 0.3); ctx.save(); setFont(ctx, 46, 700); const nm = project.seriesName.toUpperCase(); const tw = ctx.measureText(nm).width + 40; ctx.translate(head.hx, head.hy - head.r - 70); ctx.scale(k, k); ctx.fillStyle = BW ? '#111' : '#e8262d'; rr(ctx, -tw / 2, -32, tw, 64, 32); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-14, 30); ctx.lineTo(14, 30); ctx.lineTo(0, 52); ctx.closePath(); ctx.fillStyle = BW ? '#111' : '#e8262d'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(nm, 0, 2); ctx.textBaseline = 'alphabetic'; ctx.restore(); }
    drawFx(ctx, P.fx, head.hx, head.hy, t, g, Math.floor(c.seed * 10) + bi);
  }
  ctx.restore();
  // objetos de escena: franja superior
  if (beat.kind !== 'reflect' && beat.kind !== 'hook' && beat.kind !== 'cta' && !cam.capTop) { ctx.save(); ctx.translate(540, 245); ctx.scale(0.5, 0.5); ctx.translate(-540, -600); drawProp(ctx, beat.p, t, g, project.lang, beat); ctx.restore(); }
  if (beat.kind === 'after' && (!beat.p || beat.p === 'confetti')) drawProp(ctx, 'confetti', t, g, project.lang, beat);
  if (beat.kind === 'cta') drawCTA(ctx, beat, t, g, opts);
  if (beat.kind === 'twist' && t < 0.14) { ctx.fillStyle = `rgba(255,255,255,${1 - t / 0.14})`; ctx.fillRect(0, 0, W, H); }
  if (beat.kind === 'twist' && t > 0.05 && t < (beat.voiceLead || 0.5)) { ctx.save(); setFont(ctx, 180, 700); ctx.textAlign = 'center'; ctx.lineWidth = 16; ctx.strokeStyle = '#111'; ctx.fillStyle = BW ? '#fff' : '#ffd60a'; const s2 = backOut((t - 0.05) / 0.2); ctx.translate(540, 300); ctx.scale(s2, s2); ctx.rotate(-0.08); ctx.strokeText('¿¡!?', 0, 0); ctx.fillText('¿¡!?', 0, 0); ctx.restore(); }
  drawCaption(ctx, beat, t, opts, cam.capTop);
  if (opts.page && opts.page.trim()) { ctx.save(); setFont(ctx, 34, 700); ctx.textAlign = 'left'; ctx.globalAlpha = 0.85; ctx.lineWidth = 8; ctx.strokeStyle = '#111'; ctx.strokeText(opts.page.trim(), 40, 70); ctx.fillStyle = '#fff'; ctx.fillText(opts.page.trim(), 40, 70); ctx.restore(); }
  ctx.fillStyle = BW ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)'; ctx.fillRect(0, 0, W, 10);
  ctx.fillStyle = BW ? '#111' : '#ffd60a'; ctx.fillRect(0, 0, W * clamp(time / project.total, 0, 1), 10);
}
