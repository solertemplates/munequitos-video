// Audio del video: música (instrumentos reales grabados o tu propia canción) + efectos de sonido reales + voces,
// mezclados en un único AudioBuffer con OfflineAudioContext. La música baja sola cuando alguien habla.
//
// Sonidos incluidos (grabaciones reales, uso comercial permitido):
//  · Efectos: «Oculus Audio Pack 1» de Meta (CC BY 4.0, requiere crédito) y «Impact Sounds» de Kenney (CC0).
//  · Música incluida: piano y guitarra de cuerdas de nailon grabados por Meta (CC0), tocados por la app.
//  · Tu música: la que subas desde el iPhone (por ejemplo, de Pixabay Music), guardada solo en tu teléfono.
export const SR = 48000;
const BASE = new URL('../audio/', import.meta.url).href;

export const MUSIC_STYLES = [
  { id: 'emotiva', name: { es: '🎹 Emotiva (piano real, incluida)', en: '🎹 Emotional (real piano, built-in)' }, bpm: 72 },
  { id: 'alegre', name: { es: '🎸 Alegre (guitarra real, incluida)', en: '🎸 Happy (real guitar, built-in)' }, bpm: 104 },
  { id: 'superacion', name: { es: '🏔️ Superación (piano y guitarra, incluida)', en: '🏔️ Uplifting (piano + guitar, built-in)' }, bpm: 84 },
  { id: 'none', name: { es: 'Sin música', en: 'No music' }, bpm: 90 },
];
export const MUSIC_TAGS = [
  { id: 'emotiva', name: { es: 'Emotiva', en: 'Emotional' } },
  { id: 'alegre', name: { es: 'Alegre', en: 'Happy' } },
  { id: 'superacion', name: { es: 'Superación', en: 'Uplifting' } },
];

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

// progresiones (MIDI): vi–IV–I–V y I–V–vi–IV en Do mayor
const AM = [57, 60, 64], F = [53, 57, 60], CC = [60, 64, 67], G = [55, 59, 62];
const PROG = { emotiva: [AM, F, CC, G], superacion: [AM, F, CC, G], alegre: [CC, G, AM, F] };

function makeSampler(ctx, bank) {
  return (inst, midi, t, vol, dur = 2.2) => {
    const list = inst === 'g' ? GUITAR : PIANO;
    const n = nearest(list, midi); const key = inst === 'g' ? 'guitar/' + n + '.mp3' : 'piano/' + n + (vol > 0.5 ? '_v3' : '_v2') + '.mp3';
    const buf = bank.get(key); if (!buf) return;
    const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = Math.pow(2, (midi - nameToMidi(n)) / 12);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.setTargetAtTime(0.0001, t + dur, 0.25);
    s.connect(g); g.connect(ctx._musicDest); s.start(t); s.stop(t + dur + 1.5);
  };
}
function musicKeys(style) {
  const keys = new Set();
  if (style === 'alegre' || style === 'superacion') GUITAR.forEach(n => keys.add('guitar/' + n + '.mp3'));
  PIANO.forEach(n => { keys.add('piano/' + n + '_v2.mp3'); keys.add('piano/' + n + '_v3.mp3'); });
  return [...keys];
}

function scheduleMusic(ctx, play, style, total, sections) {
  const S = MUSIC_STYLES.find(s => s.id === style) || MUSIC_STYLES[0];
  const spb = 60 / S.bpm, bar = spb * 4;
  const twist = sections.find(s => s.kind === 'twist');
  const refl = sections.find(s => s.kind === 'reflect');
  const prog = PROG[style] || PROG.emotiva;
  for (let b0 = 0, bi = 0; b0 < total + 0.2; b0 += bar, bi++) {
    const chord = prog[bi % 4]; const prog01 = b0 / Math.max(1, total);
    const emotive = style !== 'alegre' || (refl && b0 >= refl.start - 0.1);
    for (let s8 = 0; s8 < 8; s8++) {
      const t = b0 + s8 * spb / 2; if (t > total + 0.2) break;
      if (twist && t >= twist.start && t < twist.start + 0.45) continue; // silencio dramático en el giro
      const human = Math.sin(bi * 7 + s8 * 3) * 0.008; const tt = t + human;
      if (emotive) {
        // piano: bajo + arpegio; en «superación» la intensidad crece con el video
        if (s8 === 0) { play('p', chord[0] - 24, tt, 0.55, bar * 0.95); play('p', chord[0] - 12, tt, 0.35, bar * 0.95); }
        const dense = style === 'superacion' ? prog01 > 0.3 : true;
        if (dense || s8 % 2 === 0) { const arp = [chord[0], chord[1], chord[2], chord[1] + 12, chord[2], chord[1], chord[0] + 12, chord[2]]; play('p', arp[s8] + 12, tt, 0.22 + (style === 'superacion' ? prog01 * 0.12 : 0), spb * 2.2); }
        if (s8 === 0 && (style === 'emotiva' || prog01 > 0.55)) play('p', chord[(bi % 3)] + 24, tt + spb * 0.02, 0.18, bar);
        if (style === 'superacion' && prog01 > 0.55) {
          // guitarra rasgueada y pulso grave: la música «sube la montaña»
          if (s8 % 2 === 0) chord.forEach((n, k) => play('g', n, tt + k * 0.018, 0.2, spb * 1.6));
          if (s8 === 0 || s8 === 4) play('p', chord[0] - 24, tt, 0.6, spb * 1.5);
        }
      } else {
        // alegre: rasgueo de guitarra de nailon + bajo + toques de piano a contratiempo
        const pat = [1, 0, 1, 1, 0, 1, 1, 0];
        if (pat[s8]) { const down = s8 % 2 === 0; const notes = down ? chord : chord.slice().reverse(); notes.forEach((n, k) => play('g', n + (k === 2 ? 12 : 0), tt + k * 0.016, down ? 0.32 : 0.22, spb * 0.9)); }
        if (s8 === 0 || s8 === 4) play('g', chord[0] - 12, tt, 0.45, spb * 1.6);
        if (s8 === 3 || s8 === 7) play('p', chord[2] + 12, tt, 0.13, spb);
      }
    }
  }
}

// Canción propia: se repite si es más corta que el video; entra y sale con fundido
function scheduleOwn(ctx, buf, total) {
  const g = ctx.createGain(); g.connect(ctx._musicDest);
  const s = ctx.createBufferSource(); s.buffer = buf; s.loop = buf.duration < total + 0.5; s.connect(g);
  g.gain.setValueAtTime(0.0001, 0); g.gain.exponentialRampToValueAtTime(1, 0.35);
  g.gain.setValueAtTime(1, Math.max(0.4, total - 1.4)); g.gain.linearRampToValueAtTime(0.0001, total + 0.25);
  s.start(0); s.stop(total + 0.3);
}

// ---------- mezcla completa ----------
export async function renderMix(project, { voiceVol = 1, musicVol = 0.6, sfxOn = true, ownMusic = null } = {}) {
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

  // carga en paralelo: efectos + instrumentos (si no hay canción propia)
  const style = project.music || 'emotiva';
  const useOwn = ownMusic && style.startsWith('mine:');
  const keys = new Set(); ev.forEach(([n]) => SFX[n].forEach(([f]) => keys.add(f)));
  if (project.ambience && AMBIENCE[project.ambience]) keys.add(AMBIENCE[project.ambience]);
  if (!useOwn && style !== 'none' && !style.startsWith('mine:')) musicKeys(style).forEach(k => keys.add(k));
  const bank = new Map(); await Promise.all([...keys].map(async k => { const b = await loadSound(k); if (b) bank.set(k, b); }));

  // música
  if (useOwn) scheduleOwn(ctx, ownMusic, total);
  else if (style !== 'none' && !style.startsWith('mine:')) scheduleMusic(ctx, makeSampler(ctx, bank), style, total, project.beats);

  // ambiente (lluvia, viento) para las historias con mensaje
  if (project.ambience && bank.get(AMBIENCE[project.ambience])) {
    const s = ctx.createBufferSource(); s.buffer = bank.get(AMBIENCE[project.ambience]); s.loop = true; const ag = ctx.createGain();
    const until = project.ambienceUntil || total; ag.gain.setValueAtTime(0.0001, 0); ag.gain.linearRampToValueAtTime(0.5, 0.6); ag.gain.setValueAtTime(0.5, Math.max(0.7, until - 1.2)); ag.gain.linearRampToValueAtTime(0.0001, until);
    s.connect(ag); ag.connect(sfxBus); s.start(0); s.stop(until + 0.1);
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

// ---------- tu música (guardada solo en este teléfono, IndexedDB) ----------
const DB = 'munequitos-musica', STORE = 'tracks';
function db() {
  return new Promise((res, rej) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}
async function tx(mode, fn) { const d = await db(); return new Promise((res, rej) => { const t = d.transaction(STORE, mode); const st = t.objectStore(STORE); const out = fn(st); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); }); }
export async function listTracks() { try { const d = await db(); return await new Promise((res, rej) => { const r = d.transaction(STORE).objectStore(STORE).getAll(); r.onsuccess = () => res((r.result || []).map(({ id, name, tag, dur }) => ({ id, name, tag, dur })).sort((a, b) => b.id.localeCompare(a.id))); r.onerror = () => rej(r.error); }); } catch { return []; } }
export async function addTrack(file, tag) {
  const ab = await file.arrayBuffer();
  const buf = await decode(ab.slice(0)); // comprueba que el iPhone puede leerla
  const id = 't' + Date.now().toString(36);
  await tx('readwrite', st => st.put({ id, name: file.name.replace(/\.[^.]+$/, '').slice(0, 60), tag, dur: buf.duration, data: new Blob([ab], { type: file.type || 'audio/mpeg' }) }));
  ownCache.set(id, buf);
  return id;
}
export async function deleteTrack(id) { ownCache.delete(id); await tx('readwrite', st => st.delete(id)); }
export async function setTrackTag(id, tag) { const d = await db(); await new Promise((res, rej) => { const t = d.transaction(STORE, 'readwrite'); const st = t.objectStore(STORE); const r = st.get(id); r.onsuccess = () => { if (r.result) st.put({ ...r.result, tag }); }; t.oncomplete = res; t.onerror = () => rej(t.error); }); }
const ownCache = new Map();
export async function loadTrack(id) {
  if (ownCache.has(id)) return ownCache.get(id);
  const d = await db();
  const rec = await new Promise((res, rej) => { const r = d.transaction(STORE).objectStore(STORE).get(id); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  if (!rec) return null;
  const buf = await decode(await rec.data.arrayBuffer()); ownCache.set(id, buf); return buf;
}
