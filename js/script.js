// Construye el guion (beats) a partir de las elecciones del usuario y le asigna tiempos.
import { fillCta, combineCtas, ctaTypesFor } from './content.js?v=15';

export const DURATIONS = {
  s: { min: 12, max: 25, reps: 3, after: false, reflect: 1, pace: 1.12, label: { es: '12–25 s', en: '12–25 s' } },
  m: { min: 25, max: 45, reps: 5, after: true, reflect: 2, pace: 1.0, label: { es: '25–45 s', en: '25–45 s' } },
  l: { min: 45, max: 60, reps: 6, after: true, reflect: 2, pace: 0.94, label: { es: '45–60 s', en: '45–60 s' } },
};

function pickReps(reps, n) {
  const core = reps.filter(r => r.core);
  if (core.length) {
    const extra = reps.filter(r => !r.core).slice(0, Math.max(0, n - core.length));
    // intercalar los extras manteniendo el orden original
    return reps.filter(r => r.core || extra.includes(r));
  }
  if (n >= reps.length) return reps.slice();
  // siempre conservar el primero y el último (el más exagerado)
  const idx = new Set([0, reps.length - 1]);
  const step = (reps.length - 1) / (n - 1);
  for (let i = 0; idx.size < n && i < n; i++) idx.add(Math.round(i * step));
  for (let i = 1; idx.size < n; i++) idx.add(i);
  return [...idx].sort((a, b) => a - b).map(i => reps[i]);
}

export function buildBeats({ situation, lang, dur, hook, ctas, settings, question }) {
  const D = DURATIONS[dur];
  const T = o => (typeof o === 'string' ? o : o[lang]);
  const beats = [];
  const env = situation.env;
  const signProp = ((situation.setup || []).find(s => s.p.startsWith('sign:')) || {}).p || '';
  const baseEnv = settings.env && settings.env !== 'auto' ? settings.env : (env === 'caminos' ? 'parque' : env);
  const mk = (kind, line, extra = {}) => ({
    kind, text: T(line.t || line), a: line.a || '', p: line.p || '', fx: line.fx || '', who: line.w || null, r: line.r || null,
    env: extra.env || baseEnv, ...extra,
  });

  const NAME = (settings.seriesName || '').trim();
  const nm = t => (NAME ? String(t).replace(/\{name\}/g, NAME) : String(t).replace(/\{name\}/g, lang === 'es' ? 'tú' : 'you'));
  if (situation.mode === 'mudo') return buildSilent({ situation, lang, dur, hook: { es: nm(hook.es), en: nm(hook.en) }, ctas, settings, question, T, baseEnv, D, mk });
  // primer segundo: algo raro o gracioso para que la gente se detenga
  beats.push(mk('hook', { t: hook, a: situation.hookAct || (situation.mode === 'caminos' ? 'all:think' : 'all:shock'), fx: 'boing' }));
  situation.setup.forEach(s => beats.push(mk('setup', s, situation.mode === 'caminos' ? { env: 'caminos', sign: signProp } : {})));
  const nSpoken = settings.action ? Math.max(2, D.reps - (dur === 's' ? 1 : 2)) : D.reps;
  const reps = situation.ai ? situation.reps.slice() : pickReps(situation.reps, nSpoken);
  reps.forEach((r, i) => r.silent ? beats.push({ kind: 'act', text: '', a: r.a, p: r.p && r.p !== 'left' && r.p !== 'right' ? r.p : '', fx: '', gag: { a: r.a, sfx: [[r.fx || 'boing', 0.05]], react: r.r || 'laugh' }, onoma: (typeof r.o === 'string' ? r.o : (r.o && r.o[lang])) || '¡ZAS!', onomaT: 0.35, actDur: 2.0, env: situation.mode === 'caminos' ? 'caminos' : baseEnv, sign: situation.mode === 'caminos' ? signProp : undefined, side: r.p === 'left' ? -1 : r.p === 'right' ? 1 : 0, level: (i + 1) / reps.length }) : beats.push(mk('rep', r, {
    level: (i + 1) / reps.length,
    ...(situation.mode === 'caminos' ? { env: 'caminos', sign: signProp, side: r.p === 'left' ? -1 : r.p === 'right' ? 1 : 0, p: '' } : {}),
  })));
  beats.push(mk('twist', situation.twist));
  if (D.after && situation.after) beats.push(mk('after', situation.after));
  const refl = situation.reflect.map(T).filter(x => x && x.trim());
  if (D.reflect === 1) beats.push(mk('reflect', { t: refl.join(' '), a: 'A:hug B:hug all:idle', p: '' }));
  else refl.forEach((r, i) => beats.push(mk('reflect', { t: r, a: i ? 'A:hug B:hug all:idle' : 'all:idle', p: '' })));
  if (question) beats.push(mk('question', { t: T(question), a: 'all:shrug', p: '', fx: 'ding' }));
  beats.push(mk('cta', { t: fillCta(combineCtas(ctas, lang), lang, settings), a: 'all:wave A:point', p: 'cta', fx: 'pop' }, { ctaType: ctas[0].type, ctaTypes: ctaTypesFor(ctas) }));
  return beats;
}

// Historias mudas (serie): cartel de tiempo + acción + efectos; solo frases cortas de vez en cuando
const REACT_OF = a => (/faint|shock|flee|sneak/.test(a) ? 'shock' : /laugh|cheer|dance|jump/.test(a) ? 'laugh' : /sad|cry|tired|sleep/.test(a) ? 'facepalm' : /love|hug|kneel/.test(a) ? 'love' : 'laugh');
function buildSilent({ situation, lang, dur, hook, ctas, settings, question, T, baseEnv, D, mk }) {
  const beats = [];
  const n = dur === 's' ? 4 : 6;
  const sc = situation.ai ? situation.scenes.slice() : pickReps(situation.scenes, Math.min(n, situation.scenes.length));
  const scene = (m, kind, i, total) => {
    const card = m.card ? T(m.card) : '';
    if (m.q) return mk(kind === 'twist' ? 'twist' : 'rep', { t: m.q, a: m.a, p: m.p, fx: m.fx }, { card, who: m.w || 'A', r: m.r || null, level: (i + 1) / total, onoma: m.o ? T(m.o) : '', onomaT: 0.25 });
    const g = { a: m.a, sfx: [[m.fx || 'pop', 0.05]].concat(kind === 'twist' ? [['scratch', 0]] : []), react: m.r || REACT_OF(m.a) };
    return { kind: 'act', text: '', a: m.a, p: m.p || '', fx: '', gag: g, onoma: m.o ? T(m.o) : '', onomaT: 0.3, actDur: kind === 'twist' ? 2.3 : 1.8, card, env: baseEnv, level: (i + 1) / total, twistLike: kind === 'twist' };
  };
  beats.push(Object.assign(mk('hook', { t: hook, a: 'A:tired B:idle', fx: 'whoosh' }), { mute: true }));
  sc.forEach((m, i) => beats.push(scene(m, 'rep', i, sc.length)));
  beats.push(scene(situation.twist, 'twist', sc.length, sc.length));
  const refl = situation.reflect.map(T).filter(x => x && x.trim());
  if (D.reflect === 1) beats.push(mk('reflect', { t: refl[0], a: 'all:idle', p: '' }));
  else refl.forEach((r, i) => beats.push(mk('reflect', { t: r, a: i ? 'A:hug B:hug all:idle' : 'all:idle', p: '' })));
  if (question) beats.push(mk('question', { t: T(question), a: 'all:shrug', p: '', fx: 'ding' }));
  beats.push(mk('cta', { t: fillCta(combineCtas(ctas, lang), lang, settings), a: 'all:wave A:point', p: 'cta', fx: 'pop' }, { ctaType: ctas[0].type, ctaTypes: ctaTypesFor(ctas) }));
  return beats;
}

// Texto apto para la voz (sin comillas ni símbolos)
export function speakable(text) {
  // se conservan comas, puntos, «…», ¿? y ¡! para que la voz respire, pregunte y se emocione
  return text.replace(/["“”«»]/g, '').replace(/\.\.\./g, '…').replace(/\s+/g, ' ').trim();
}

// Asigna tiempos: beat.start, beat.dur, voiceLead y, si hay reacción, reactStart (relativo al beat).
export function timeBeats(beats, dur, allowDrop = true) {
  const D = DURATIONS[dur];
  const base = { hook: 0.2, setup: 0.12, rep: 0.08, twist: 0.3, after: 0.15, reflect: 0.45, cta: 0.5, question: 0.5 };
  const lead = { hook: 0.05, setup: 0.05, rep: 0.04, twist: 0.35, after: 0.05, reflect: 0.2, cta: 0.15, question: 0.15 };
  const minD = { hook: 1.8, setup: 1.4, rep: 1.2, twist: 2.1, after: 1.4, reflect: 2.6, cta: 3.0, question: 2.2 };
  const minFor = b => (b.kind === 'cta' && b.ctaTypes && b.ctaTypes.length > 1 ? 3.8 : minD[b.kind]);
  let total = 0;
  const calc = (padMul) => {
    total = 0;
    for (const b of beats) {
      if (b.kind === 'act') { b.voiceLead = 0; b.voiceDur = 0; b.dur = b.actDur || 1.7; if (b.react) b.reactStart = b.dur - 0.6; b.start = total; total += b.dur; continue; }
      const vd = b.mute ? Math.max(2.2, estimateDur(b.text, 1.25)) : (b.voiceDur || estimateDur(b.text, D.pace));
      b.voiceLead = lead[b.kind];
      const speechEnd = b.voiceLead + vd;
      if (b.react) {
        b.reactStart = speechEnd + 0.08;
        b.dur = Math.max(minFor(b), b.reactStart + (b.react.vocal ? Math.max(0.85, (b.reactDur || 0.7) + 0.3) : 0.62) + base[b.kind] * (padMul - 1) * 0.5);
      } else b.dur = Math.max(minFor(b), speechEnd + base[b.kind] * padMul + (b.exit ? 0.5 : 0));
      b.start = total;
      total += b.dur;
    }
    return total;
  };
  calc(1);
  // si se pasa del máximo, quita reacciones alternas (las más largas primero) hasta que quepa
  let guard = 0;
  while (allowDrop && total > D.max + 0.5 && guard++ < 20) {
    const withR = beats.filter(b => b.react && b.kind !== 'twist');
    if (!withR.length) break;
    withR.sort((x, y) => (y.reactDur || 0) - (x.reactDur || 0))[0].react = null;
    calc(1);
  }
  if (total < D.min) { const extra = (D.min + 0.5 - total); calc(1 + extra / beats.reduce((s, b) => s + (base[b.kind] || 0), 0)); }
  else if (total > D.max + 0.5) calc(0.2);
  return total;
}

export function estimateDur(text, pace = 1) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(0.8, (words / 2.7 + 0.25) / pace);
}

// Subtítulos .srt
export function toSRT(beats) {
  const ts = s => {
    const ms = Math.round(s * 1000);
    const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
    const m = String(Math.floor(ms / 60000) % 60).padStart(2, '0');
    const sec = String(Math.floor(ms / 1000) % 60).padStart(2, '0');
    return `${h}:${m}:${sec},${String(ms % 1000).padStart(3, '0')}`;
  };
  return beats.filter(b => b.text).map((b, i) => `${i + 1}\n${ts(b.start)} --> ${ts(b.start + b.dur)}\n${b.text}\n`).join('\n');
}
