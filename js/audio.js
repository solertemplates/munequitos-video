// Audio del video: música (instrumentos reales grabados o tu propia canción) + efectos de sonido reales + voces,
// mezclados en un único AudioBuffer con OfflineAudioContext. La música baja sola cuando alguien habla.
//
// Sonidos incluidos (grabaciones reales, uso comercial permitido):
//  · Efectos: «Oculus Audio Pack 1» de Meta (CC BY 4.0, requiere crédito) y «Impact Sounds» de Kenney (CC0).
//  · Música incluida: piano y guitarra de cuerdas de nailon grabados por Meta (CC0), tocados por la app.
//  · Tu música: la que subas desde el iPhone (por ejemplo, de Pixabay Music), guardada solo en tu teléfono.
export const SR = 48000;
const BASE = new URL('../audio/', import.meta.url).href;

// Categorías de música (para el banco y para la música incluida)
export const MUSIC_CATS = [
  { id: 'romantica', emoji: '💞', name: { es: 'Romántica', en: 'Romantic' }, bpm: 76 },
  { id: 'tension', emoji: '😠', name: { es: 'Tensión o enojo', en: 'Tension / anger' }, bpm: 116 },
  { id: 'triste', emoji: '😢', name: { es: 'Triste', en: 'Sad' }, bpm: 62 },
  { id: 'emotiva', emoji: '🥹', name: { es: 'Emotiva', en: 'Emotional' }, bpm: 72 },
  { id: 'inspiracional', emoji: '🏔️', name: { es: 'Inspiracional', en: 'Inspirational' }, bpm: 84 },
  { id: 'alegre', emoji: '😄', name: { es: 'Alegre', en: 'Happy' }, bpm: 104 },
  { id: 'humor', emoji: '🤪', name: { es: 'Humor', en: 'Funny' }, bpm: 132 },
];
export const MUSIC_STYLES = MUSIC_CATS.map(c => ({ id: c.id, name: { es: `${c.emoji} ${c.name.es} (incluida)`, en: `${c.emoji} ${c.name.en} (built-in)` }, bpm: c.bpm }))
  .concat([{ id: 'none', name: { es: 'Sin música', en: 'No music' }, bpm: 90 }]);
export const MUSIC_TAGS = MUSIC_CATS;
// si el banco no tiene esa categoría, prueba con las más parecidas
export const CAT_FALLBACK = { romantica: ['emotiva', 'triste'], tension: ['triste'], triste: ['emotiva', 'romantica'], emotiva: ['inspiracional', 'romantica', 'triste'], inspiracional: ['emotiva', 'alegre'], alegre: ['humor', 'inspiracional'], humor: ['alegre'] };
const OLD_CAT = { superacion: 'inspiracional' };
export const normCat = c => OLD_CAT[c] || (MUSIC_CATS.some(x => x.id === c) ? c : 'emotiva');

// ---------- carga y caché de sonidos ----------
let decodeCtx = null;
const getDecoder = () => (decodeCtx ||= new OfflineAudioContext(1, 1, 44100));
const bufCache = new Map();
function decode(ab) {
  const c = getDecoder();
  return new Promise((res, rej) => { const p = c.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); });
}
export function loadSound(path) {
  if (!bufCache.has(path)) bufCache.set(path, fetch(BASE + path).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + path); return r.arrayBuffer(); }).then(decode).catch(e => { console.warn('sonido', path, e); bufCache.delete(path); return null; }));
  return bufCache.get(path);
}
export const decodeFile = ab => decode(ab);

// ---------- efectos reales ----------
// nombre → [archivo, volumen] (o una secuencia de [archivo, retraso, volumen])
const SFX = {
  whoosh: [['sfx/whoosh.mp3', 0, 0.55]], swoosh: [['sfx/swoosh.mp3', 0, 0.7]], zip: [['sfx/zip.mp3', 0, 0.8]],
  pop: [['sfx/pop.mp3', 0, 0.8]], click: [['sfx/click.mp3', 0, 0.9]], boing: [['sfx/boing.mp3', 0, 0.85]],
  ding: [['sfx/ding.mp3', 0, 0.75]], sparkle: [['sfx/sparkle.mp3', 0, 0.55]], aww: [['sfx/aww.mp3', 0, 0.55]],
  scratch: [['sfx/scratch.mp3', 0, 0.75]], applause: [['sfx/victory.mp3', 0, 0.7]], victory: [['sfx/victory.mp3', 0, 0.7]],
  levelup: [['sfx/levelup.mp3', 0, 0.7]], cash: [['sfx/cash.mp3', 0, 0.9]], sad: [['sfx/sad.mp3', 0, 0.6]],
  drum: [['sfx/drum.mp3', 0, 0.6]], type: [['sfx/type.mp3', 0, 0.8]], heart: [['sfx/heart.mp3', 0, 0.5]],
  alarm: [['sfx/alarm.mp3', 0, 0.8]], laugh: [['sfx/laugh.mp3', 0, 0.55]], laughs: [['sfx/laughs.mp3', 0, 0.6], ['sfx/laughf.mp3', 0.25, 0.5]],
  notif: [['sfx/notif.mp3', 0, 0.9], ['sfx/notif.mp3', 0.18, 0.7]], punch: [['sfx/punch.mp3', 0, 0.9]], thud: [['sfx/thud.mp3', 0, 1], ['sfx/thud2.mp3', 0.02, 0.5]],
  fall: [['sfx/swoosh.mp3', 0, 0.7], ['sfx/thud.mp3', 0.55, 1], ['sfx/thud2.mp3', 0.57, 0.5]], gasp: [['sfx/gasp.mp3', 0, 0.7]],
  uf: [['sfx/uf.mp3', 0, 0.8]], effort: [['sfx/effort.mp3', 0, 0.8]], tick: [['sfx/tick.mp3', 0, 0.6]],
  sneak: [0, 0.28, 0.56, 0.84, 1.12].map(d => ['sfx/step.mp3', d, 0.8]), step: [['sfx/step.mp3', 0, 0.8]],
  steps: [0, 0.42, 0.84, 1.26].map(d => ['sfx/step.mp3', d, 0.55]), run: [0, 0.2, 0.4, 0.6].map(d => ['sfx/run.mp3', d, 0.6]),
  door: [['sfx/door.mp3', 0, 0.8]], paper: [['sfx/paper.mp3', 0, 0.7]], powerup: [['sfx/powerup.mp3', 0, 0.6]],
  shutter: [['sfx/shutter.mp3', 0, 0.9]], weights: [['sfx/weights.mp3', 0, 0.9], ['sfx/clank.mp3', 0.05, 0.6]], book: [['sfx/book.mp3', 0, 0.8]],
};
const AMBIENCE = { rain: 'sfx/rain.mp3', wind: 'sfx/wind.mp3' };
export const SFX_NAMES = Object.keys(SFX);

// ---------- instrumentos reales (sampler) ----------
const PC = { C: 0, Cs: 1, D: 2, Ds: 3, E: 4, F: 5, Fs: 6, G: 7, Gs: 8, A: 9, As: 10, B: 11 };
const nameToMidi = n => { const m = n.match(/^([A-G]s?)(\d)$/); return 12 * (+m[2] + 1) + PC[m[1]]; };
const PIANO = []; for (const o of [2, 3, 4, 5]) for (const n of ['C', 'Ds', 'Fs', 'A']) PIANO.push(n + o); PIANO.push('C6');
const GUITAR = ['Fs2', 'A2', 'C3', 'Ds3', 'Fs3', 'A3', 'C4', 'Ds4', 'Fs4', 'A4', 'C5'];
function nearest(list, midi) { let best = list[0], d = 99; for (const n of list) { const dd = Math.abs(nameToMidi(n) - midi); if (dd < d) { d = dd; best = n; } } return best; }

// acordes (MIDI)
const AM = [57, 60, 64], F = [53, 57, 60], CC = [60, 64, 67], G = [55, 59, 62], DM = [50, 53, 57], E7 = [52, 56, 59];
const PROG = { emotiva: [AM, F, CC, G], inspiracional: [AM, F, CC, G], alegre: [CC, G, AM, F], triste: [AM, DM, AM, E7], romantica: [CC, AM, DM, G], tension: [AM, F, DM, E7], humor: [CC, G, CC, F] };

function makeSampler(ctx, bank, dest) {
  return (inst, midi, t, vol, dur = 2.2) => {
    if (t < 0) return;
    const list = inst === 'g' ? GUITAR : PIANO;
    const n = nearest(list, midi); const key = inst === 'g' ? 'guitar/' + n + '.mp3' : 'piano/' + n + (vol > 0.5 ? '_v3' : '_v2') + '.mp3';
    const buf = bank.get(key); if (!buf) return;
    const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = Math.pow(2, (midi - nameToMidi(n)) / 12);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.setTargetAtTime(0.0001, t + dur, dur < 0.4 ? 0.05 : 0.25);
    s.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 1.5);
  };
}
function musicKeys() {
  const keys = new Set(); GUITAR.forEach(n => keys.add('guitar/' + n + '.mp3'));
  PIANO.forEach(n => { keys.add('piano/' + n + '_v2.mp3'); keys.add('piano/' + n + '_v3.mp3'); });
  return [...keys];
}

// Música incluida (piano y guitarra reales) para un tramo [t0, t1] del video, en el estilo de su emoción
function scheduleBuiltin(play, style, t0, t1, beats) {
  const S = MUSIC_CATS.find(s => s.id === style) || MUSIC_CATS[3];
  const spb = 60 / S.bpm, bar = spb * 4; const prog = PROG[style] || PROG.emotiva;
  const twist = beats.find(s => s.kind === 'twist');
  for (let b0 = t0, bi = 0; b0 < t1; b0 += bar, bi++) {
    const chord = prog[bi % 4]; const k01 = (b0 - t0) / Math.max(1, t1 - t0);
    for (let s8 = 0; s8 < 8; s8++) {
      const t = b0 + s8 * spb / 2; if (t > t1) break;
      if (twist && t >= twist.start && t < twist.start + 0.45) continue; // silencio dramático en el giro
      const tt = t + Math.sin(bi * 7 + s8 * 3) * 0.008;
      switch (style) {
        case 'emotiva': case 'inspiracional': {
          if (s8 === 0) { play('p', chord[0] - 24, tt, 0.55, bar * 0.95); play('p', chord[0] - 12, tt, 0.35, bar * 0.95); }
          const dense = style === 'emotiva' || k01 > 0.25;
          if (dense || s8 % 2 === 0) { const arp = [chord[0], chord[1], chord[2], chord[1] + 12, chord[2], chord[1], chord[0] + 12, chord[2]]; play('p', arp[s8] + 12, tt, 0.22 + (style === 'inspiracional' ? k01 * 0.12 : 0), spb * 2.2); }
          if (s8 === 0 && (style === 'emotiva' || k01 > 0.5)) play('p', chord[bi % 3] + 24, tt + 0.01, 0.18, bar);
          if (style === 'inspiracional' && k01 > 0.45) { if (s8 % 2 === 0) chord.forEach((n, k) => play('g', n, tt + k * 0.018, 0.2, spb * 1.6)); if (s8 === 0 || s8 === 4) play('p', chord[0] - 24, tt, 0.6, spb * 1.5); }
          break;
        }
        case 'alegre': {
          const pat = [1, 0, 1, 1, 0, 1, 1, 0];
          if (pat[s8]) { const down = s8 % 2 === 0; const notes = down ? chord : chord.slice().reverse(); notes.forEach((n, k) => play('g', n + (k === 2 ? 12 : 0), tt + k * 0.016, down ? 0.32 : 0.22, spb * 0.9)); }
          if (s8 === 0 || s8 === 4) play('g', chord[0] - 12, tt, 0.45, spb * 1.6);
          if (s8 === 3 || s8 === 7) play('p', chord[2] + 12, tt, 0.13, spb);
          break;
        }
        case 'triste': {
          if (s8 === 0) { play('p', chord[0] - 24, tt, 0.4, bar); play('p', chord[0] - 12, tt + 0.02, 0.25, bar); }
          if (s8 === 2 || s8 === 4 || s8 === 6) play('p', chord[(s8 / 2) % 3] + 12, tt, 0.17, spb * 2.5);
          if (s8 === 5 && bi % 2) play('p', chord[2] + 24, tt, 0.12, spb * 3);
          break;
        }
        case 'romantica': {
          const pick = [0, 2, 1, 2, 0 + 12, 2, 1, 2]; const n = chord[pick[s8] % 3] + (pick[s8] >= 12 ? 12 : 0);
          play('g', n + (s8 === 0 ? -12 : 0), tt, s8 === 0 ? 0.42 : 0.24, spb * 1.8);
          if (s8 === 0 || s8 === 5) play('p', chord[s8 ? 1 : 2] + 24, tt + 0.03, 0.14, spb * 3);
          break;
        }
        case 'tension': {
          play('p', chord[0] - 24, tt, s8 % 4 === 0 ? 0.62 : 0.38, 0.22);              // ostinato grave y cortado
          if (s8 % 2 === 1) play('p', chord[0] - 12, tt, 0.3, 0.16);
          if (s8 === 0) play('p', chord[2] + 12, tt, 0.22, bar * 0.9);
          if (s8 === 6 && bi % 2) { play('p', 76, tt, 0.18, 0.5); play('p', 77, tt, 0.16, 0.5); } // golpe disonante
          break;
        }
        case 'humor': {
          if (s8 % 2 === 0) play('g', (s8 % 4 === 0 ? chord[0] : chord[2]) - 12, tt, 0.48, 0.14);   // «oom»
          else chord.forEach((n, k) => play('g', n, tt + k * 0.01, 0.2, 0.1));                   // «pah»
          const mel = [0, 2, 4, 5, 7, 5, 4, 2]; if ((s8 === 1 || s8 === 3 || s8 === 6) && bi % 2 === 0) play('p', 72 + mel[(s8 + bi) % 8], tt, 0.2, 0.18);
          if (s8 === 7 && bi % 4 === 3) { play('p', 79, tt, 0.18, 0.1); play('p', 78, tt + 0.08, 0.18, 0.1); play('p', 77, tt + 0.16, 0.2, 0.3); } // bajadita graciosa
          break;
        }
      }
    }
  }
}

// Plan de música: tramos con su emoción; entre tramos, transición suave (fundido cruzado)
const XF = 1.6;
function scheduleSection(ctx, sec, i, n, total, bank, beats, own) {
  const g = ctx.createGain(); g.connect(ctx._musicDest);
  const a = i === 0 ? 0 : Math.max(0, sec.t0 - XF / 2), b = i === n - 1 ? total + 0.25 : Math.min(total + 0.25, sec.t1 + XF / 2);
  g.gain.setValueAtTime(0.0001, a); g.gain.linearRampToValueAtTime(1, i === 0 ? 0.35 : a + XF);
  g.gain.setValueAtTime(1, Math.max(a + XF, b - (i === n - 1 ? 1.4 : XF))); g.gain.linearRampToValueAtTime(0.0001, b);
  if (sec.kind === 'bank' && own.get(sec.id)) {
    const buf = own.get(sec.id); const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
    const off = Math.min(Math.max(0, sec.offset || 0), Math.max(0, buf.duration - 5)); s.loopStart = 0; s.loopEnd = buf.duration;
    s.connect(g); s.start(a, off); s.stop(b + 0.05);
  } else if (sec.style && sec.style !== 'none') scheduleBuiltin(makeSampler(ctx, bank, g), sec.style, a, b, beats);
}

// ---------- mezcla completa ----------
export async function renderMix(project, { voiceVol = 1, musicVol = 0.6, sfxOn = true, own = new Map() } = {}) {
  const total = project.total;
  const ctx = new OfflineAudioContext(2, Math.ceil((total + 0.3) * SR), SR);
  const master = ctx.createDynamicsCompressor(); master.threshold.value = -10; master.ratio.value = 4; master.attack.value = 0.003; master.release.value = 0.2;
  const out = ctx.createGain(); out.gain.value = 0.85; master.connect(out); out.connect(ctx.destination);
  const silent = project.mode === 'musica';
  const base = musicVol * (silent ? 0.9 : 0.55);
  const musicBus = ctx.createGain(); musicBus.gain.value = base; musicBus.connect(master); ctx._musicDest = musicBus;
  const sfxBus = ctx.createGain(); sfxBus.gain.value = sfxOn ? 1 : 0; sfxBus.connect(master);
  const voiceBus = ctx.createGain(); voiceBus.gain.value = voiceVol * 1.25;
  const vEq = ctx.createBiquadFilter(); vEq.type = 'peaking'; vEq.frequency.value = 3000; vEq.gain.value = 2.5; vEq.Q.value = 0.8;
  voiceBus.connect(vEq); vEq.connect(master);

  // ducking: baja la música mientras hablan y vuelve a subir suave al terminar
  const g = musicBus.gain; g.setValueAtTime(base, 0);
  for (const b of project.beats) {
    if (!b.voiceBuffer) continue;
    const vs = b.start + b.voiceLead, ve = vs + b.voiceDur;
    g.setTargetAtTime(base * 0.28, Math.max(0, vs - 0.12), 0.05);
    g.setTargetAtTime(base, ve + 0.1, 0.18);
    if (b.react && b.reactBuffer) { const rs = b.start + b.reactStart; g.setTargetAtTime(base * 0.28, Math.max(0, rs - 0.06), 0.04); g.setTargetAtTime(base, rs + b.reactDur + 0.08, 0.15); }
  }

  // lista de efectos del video
  const ev = []; const fx = (name, t, vol = 1) => { if (name && SFX[name]) ev.push([name, Math.max(0, t), vol]); };
  project.beats.forEach((b, i) => {
    if (i > 0 && !silent) fx('whoosh', b.start - 0.1, 0.55);
    if (b.fx) fx(b.fx, b.start + (b.kind === 'twist' ? 0.02 : 0.08), silent ? 0.6 : 1);
    if (b.vis && b.vis.sfx) fx(b.vis.sfx, b.start + 0.4, 0.9);
    if (b.vis && b.vis.flash) fx('shutter', b.start + 0.35 + 0.75, 0.9);
    if (b.vis2) { const mid = b.start + (b.voiceLead || 0) + (b.voiceDur || b.dur) * b.visSplit; if (b.vis2.sfx) fx(b.vis2.sfx, mid + 0.05, 0.9); if (b.vis2.flash) fx('shutter', mid + 0.75, 0.9); }
    if (b.react) { fx(b.react.fx || 'gasp', b.start + b.reactStart - 0.04, 0.9); if (b.react.act === 'shock') fx('punch', b.start + b.reactStart, 0.7); }
    if (b.card) fx('tick', b.start + 0.02, 0.6);
    if (b.kind === 'act' && b.gag && b.gag.sfx) b.gag.sfx.forEach(([n, d]) => fx(n, b.start + d));
    if (b.enter) fx(b.enter.run ? 'run' : 'steps', b.start + 0.02, 0.8);
    if (b.exit) fx('run', b.start + b.dur - 0.75, 0.8);
    if (/\bfall\b/.test(b.a || '')) fx('fall', b.start + 0.1);
    if (/facepalm/.test(b.a || '')) fx('punch', b.start + 0.25, 0.5);
    if (/selfie/.test(b.a || '')) fx('shutter', b.start + 0.9, 0.8);
    if (b.msgSfx) b.msgSfx.forEach(([n, d, v]) => fx(n, b.start + d, v));
    if (b.kind === 'cta') {
      const types = b.ctaTypes && b.ctaTypes.length ? b.ctaTypes : [b.ctaType];
      const clicks = types.length > 1 ? [1.0, 1.9] : [1.1];
      types.forEach((ty, k) => { fx('click', b.start + clicks[k]); fx(ty === 'stars' ? 'sparkle' : 'pop', b.start + clicks[k] + 0.05, 0.8); });
    }
    if (b.kind === 'reflect' && i > 0 && project.beats[i - 1].kind !== 'reflect') fx('sparkle', b.start + 0.1, 0.5);
  });

  // plan de música: si no viene, una sola sección con la elección del usuario
  const plan = project.musicPlan && project.musicPlan.length ? project.musicPlan
    : [{ t0: 0, t1: total, ...(String(project.music).startsWith('mine:') ? { kind: 'bank', id: project.music.slice(5) } : { kind: 'builtin', style: project.music === 'none' ? 'none' : normCat(project.music || 'emotiva') }) }];
  const keys = new Set(); ev.forEach(([n]) => SFX[n].forEach(([f]) => keys.add(f)));
  if (project.ambience && AMBIENCE[project.ambience]) keys.add(AMBIENCE[project.ambience]);
  if (plan.some(sec => (sec.kind !== 'bank' || !own.get(sec.id)) && sec.style !== 'none')) musicKeys().forEach(k => keys.add(k));
  const bank = new Map(); await Promise.all([...keys].map(async k => { const b = await loadSound(k); if (b) bank.set(k, b); }));
  // canción del banco que no se pudo leer → música incluida de la misma emoción
  plan.forEach(sec => { if (sec.kind === 'bank' && !own.get(sec.id)) { sec.kind = 'builtin'; sec.style = sec.cat || 'emotiva'; } });
  plan.forEach((sec, i) => scheduleSection(ctx, sec, i, plan.length, total, bank, project.beats, own));

  // ambiente (lluvia, viento) para las historias con mensaje
  if (project.ambience && bank.get(AMBIENCE[project.ambience])) {
    const s = ctx.createBufferSource(); s.buffer = bank.get(AMBIENCE[project.ambience]); s.loop = true; const ag = ctx.createGain();
    const from = project.ambienceFrom || 0, until = project.ambienceUntil || total; ag.gain.setValueAtTime(0.0001, from); ag.gain.linearRampToValueAtTime(0.5, from + 0.8); ag.gain.setValueAtTime(0.5, Math.max(from + 0.9, until - 1.2)); ag.gain.linearRampToValueAtTime(0.0001, until);
    s.connect(ag); ag.connect(sfxBus); s.start(from); s.stop(until + 0.1);
  }
  // efectos
  for (const [name, t, vol] of ev) for (const [f, d, v] of SFX[name]) {
    const b = bank.get(f); if (!b) continue;
    const s = ctx.createBufferSource(); s.buffer = b; const gg = ctx.createGain(); gg.gain.value = v * vol; s.connect(gg); gg.connect(sfxBus); s.start(t + d);
  }
  // voces
  project.beats.forEach(b => {
    if (b.react && b.reactBuffer) { const s2 = ctx.createBufferSource(); s2.buffer = b.reactBuffer; s2.connect(voiceBus); s2.start(b.start + b.reactStart); }
    if (b.voiceBuffer) { const s = ctx.createBufferSource(); s.buffer = b.voiceBuffer; s.connect(voiceBus); s.start(b.start + b.voiceLead); }
  });
  return ctx.startRendering();
}

// ---------- BANCO DE MÚSICA (guardado solo en este teléfono, IndexedDB; nunca se sube a internet) ----------
const DB = 'munequitos-musica', STORE = 'tracks';
let dbP = null;
function db() {
  return dbP ||= new Promise((res, rej) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => { dbP = null; rej(r.error); }; });
}
const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
async function getRec(id) { const d = await db(); return req(d.transaction(STORE).objectStore(STORE).get(id)); }
async function putRec(rec) { const d = await db(); const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(rec); return new Promise((res, rej) => { t.oncomplete = res; t.onerror = () => rej(t.error); }); }
const meta = ({ id, name, cat, autoCat, userCat, dur, bpm, energy, start, tag }) => ({ id, name, cat: normCat(cat || tag), autoCat: autoCat ? normCat(autoCat) : null, userCat: !!userCat, dur, bpm, energy, start: start || 0 });
export async function listTracks() {
  try { const d = await db(); const all = await req(d.transaction(STORE).objectStore(STORE).getAll()); return (all || []).map(meta).sort((a, b) => b.id.localeCompare(a.id)); } catch { return []; }
}
export async function getTrackBlob(id) { const r = await getRec(id); return r ? r.data : null; }
export async function deleteTrack(id) { ownCache.delete(id); const d = await db(); const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).delete(id); await new Promise(r => { t.oncomplete = r; t.onerror = r; }); }
export async function updateTrack(id, patch) { const r = await getRec(id); if (!r) return; await putRec({ ...r, ...patch }); }
export const renameTrack = (id, name) => updateTrack(id, { name: String(name).trim().slice(0, 60) || 'canción' });
export const setTrackCat = (id, cat) => updateTrack(id, { cat: normCat(cat), userCat: true });

// La app «escucha» la canción: ritmo (BPM), energía, brillo, pulso y cómo crece; y lee el nombre del archivo.
const KW = {
  romantica: /roman|love|amor|wedding|boda|kiss|beso|heart ?beat|valentin|tender|cari[ñn]o|enamor/i,
  tension: /tens|suspens|dark|angry|anger|enoj|rabia|battle|fight|pelea|thriller|horror|terror|danger|chase|aggress|intense|villain|mystery|misterio|drama/i,
  triste: /sad|triste|melanchol|lonely|soledad|tears|l[aá]grima|grief|sorrow|cry|llor|rain|lluvia|broken|goodbye|adi[oó]s|nostalg/i,
  emotiva: /emotion|emotiv|touching|heartfelt|ambient|calm|peace|memor|recuerdo|reflec|soft|gentle/i,
  inspiracional: /inspir|motivat|uplift|hope|esperanz|success|[eé]xito|epic|corporate|victory|rise|dream|sue[ñn]o|superaci|achiev|journey|future/i,
  alegre: /happy|feliz|alegr|summer|verano|sunny|fun\b|upbeat|ukulele|joy|party|fiesta|dance|baile|pop\b|positive|bright|good ?vibes/i,
  humor: /funny|comed|humor|quirk|cartoon|silly|comic|kids|playful|clown|payaso|goofy|jaja|haha|sneaky|whistl|pizzicato|circus/i,
};
const gs = (x, mu, sg) => Math.exp(-Math.pow((x - mu) / sg, 2));
export function analyzeBuffer(buf, name = '') {
  const sr = buf.sampleRate, A = buf.getChannelData(0), B = buf.numberOfChannels > 1 ? buf.getChannelData(1) : null;
  const hop = Math.round(sr * 0.0232); const n = Math.floor(A.length / hop);
  const rms = new Float32Array(n), hf = new Float32Array(n);
  for (let f = 0; f < n; f++) {
    let e = 0, h = 0, prev = 0; const o = f * hop;
    for (let i = 0; i < hop; i += 2) { const x = B ? (A[o + i] + B[o + i]) * 0.5 : A[o + i]; e += x * x; const d = x - prev; h += d * d; prev = x; }
    rms[f] = Math.sqrt(e / (hop / 2)); hf[f] = Math.sqrt(h / (hop / 2));
  }
  const loud = [...rms].filter(v => v > 0.003); const sorted = loud.slice().sort((a, b) => a - b); const med = sorted[Math.floor(sorted.length / 2)] || 0.001;
  const db = v => 20 * Math.log10(Math.max(v, 1e-5));
  const meanDb = loud.length ? loud.reduce((a, v) => a + db(v), 0) / loud.length : -60;
  const energy = Math.max(0, Math.min(1, (meanDb + 32) / 22));
  let br = 0, bc = 0; for (let f = 0; f < n; f++) if (rms[f] > 0.003) { br += hf[f] / rms[f]; bc++; }
  const bright = Math.max(0, Math.min(1, ((bc ? br / bc : 0) - 0.08) / 0.45));
  // pulso: autocorrelación de los golpes (flujo de energía aguda)
  const on = new Float32Array(n); for (let f = 1; f < n; f++) on[f] = Math.max(0, hf[f] - hf[f - 1]);
  const a0 = Math.max(0, Math.floor(n * 0.15)), a1 = Math.min(n, a0 + Math.round(60 / 0.0232));
  let mean = 0; for (let f = a0; f < a1; f++) mean += on[f]; mean /= Math.max(1, a1 - a0);
  const ac = lag => { let s2 = 0; for (let f = a0; f < a1 - lag; f++) s2 += (on[f] - mean) * (on[f + lag] - mean); return s2; };
  const z0 = ac(0) || 1; let bestBpm = 90, best = -1e9, bestV = 0;
  for (let bpm = 60; bpm <= 180; bpm += 2) { const lag = Math.round(60 / bpm / 0.0232); const v = ac(lag) / z0; const w = v * (0.85 + 0.15 * gs(bpm, 110, 40)); if (w > best) { best = w; bestBpm = bpm; bestV = v; } }
  const pulse = Math.max(0, Math.min(1, bestV * 2.2));
  // ¿crece? (energía del último tercio frente al primero)
  const third = Math.floor(n / 3); const avg = (x0, x1) => { let s2 = 0, c = 0; for (let f = x0; f < x1; f++) if (rms[f] > 0.003) { s2 += db(rms[f]); c++; } return c ? s2 / c : -60; };
  const rise = avg(2 * third, n) - avg(0, third);
  let start = 0; for (let f = 0; f < n; f++) if (rms[f] > med * 0.5) { start = Math.min(8, f * 0.0232); break; }
  const sc = {
    triste: (1 - energy) * 1.3 + gs(bestBpm, 66, 16) + (1 - bright) * 0.5 + (1 - pulse) * 0.5,
    emotiva: gs(energy, 0.55, 0.25) + gs(bestBpm, 78, 18) + (1 - pulse) * 0.4 + Math.max(0, Math.min(1, rise / 6)) * 0.4,
    romantica: gs(energy, 0.45, 0.22) + gs(bestBpm, 80, 14) + (1 - bright) * 0.6 + gs(pulse, 0.35, 0.25) * 0.4,
    inspiracional: gs(energy, 0.75, 0.22) + gs(bestBpm, 104, 20) + Math.max(0, Math.min(1, rise / 6)) * 1.1 + pulse * 0.3,
    alegre: gs(energy, 0.85, 0.2) + gs(bestBpm, 120, 16) + bright * 0.7 + pulse * 0.6,
    humor: gs(energy, 0.62, 0.25) + gs(bestBpm, 128, 22) * 0.8 + pulse * 0.9 + bright * 0.3,
    tension: gs(energy, 0.82, 0.2) + (1 - bright) * 0.6 + gs(bestBpm, 128, 30) * 0.5 + (1 - gs(pulse, 0.5, 0.3)) * 0.3,
  };
  for (const [c, re] of Object.entries(KW)) if (re.test(name.replace(/[_\-.]+/g, ' '))) sc[c] += 3;
  const cat = Object.entries(sc).sort((a, b) => b[1] - a[1])[0][0];
  return { cat, bpm: bestBpm, energy: +energy.toFixed(2), bright: +bright.toFixed(2), pulse: +pulse.toFixed(2), start: +start.toFixed(2) };
}

// Sube una o varias canciones: las guarda, las escucha y les pone categoría sola
export async function addTracks(files, onProgress) {
  const out = [];
  for (let k = 0; k < files.length; k++) {
    const file = files[k]; onProgress && onProgress(k + 1, files.length, file.name);
    try {
      const ab = await file.arrayBuffer();
      const buf = await decode(ab.slice(0));
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 60);
      const an = analyzeBuffer(buf, name);
      const id = 't' + Date.now().toString(36) + k;
      await putRec({ id, name, cat: an.cat, autoCat: an.cat, userCat: false, dur: buf.duration, bpm: an.bpm, energy: an.energy, start: an.start, data: new Blob([ab], { type: file.type || 'audio/mpeg' }) });
      out.push({ id, name, cat: an.cat, ok: true });
    } catch (e) { console.warn('banco', file.name, e); out.push({ name: file.name, ok: false }); }
    await new Promise(r => setTimeout(r, 30)); // deja respirar la pantalla
  }
  return out;
}
export const addTrack = async (file, tag) => { const [r] = await addTracks([file]); if (!r.ok) throw new Error('audio'); if (tag) await setTrackCat(r.id, tag); return r.id; };
const ownCache = new Map();
export async function loadTrack(id) {
  if (ownCache.has(id)) return ownCache.get(id);
  const rec = await getRec(id); if (!rec) return null;
  const buf = await decode(await rec.data.arrayBuffer());
  if (ownCache.size > 3) ownCache.delete(ownCache.keys().next().value); // poca memoria en el iPhone
  ownCache.set(id, buf); return buf;
}
