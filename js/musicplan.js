// Director musical: lee el guion, detecta la emoción de cada escena y escoge la música del banco
// (o la incluida) que pega con la historia. Si la emoción cambia (pelea → reconciliación), la música cambia
// con una transición suave. Evita repetir siempre las mismas canciones.
import { MUSIC_CATS, CAT_FALLBACK, normCat } from './audio.js';

const W = src => new RegExp('(?<![\\p{L}\\p{N}])(?:' + src + ')', 'iu');
const WORDS = {
  tension: W('pele|discut|grit|enoj|rabia|furios|bronca|odi|celos|mentir|mentira|traici|fight|argu|yell|angry|mad\\b|furious|hate|jealous|lie\\b|cheat'),
  triste: W('triste|sol[oa]\\b|llor|perd[ií]|extra[ñn]|despedi|muri|enferm|dolor|vac[ií]o|sad\\b|alone|cry|lost|miss|goodbye|died|sick|hurt|empty'),
  romantica: W('amor|te quiero|te amo|beso|novi|enamor|abraz|coraz[oó]n|cita\\b|love|kiss|hug|darling|crush|date\\b|heart'),
  inspiracional: W('logr|sueñ|meta\\b|lucha|levant|super|nunca te rindas|empez|cima|[eé]xito|achiev|dream|goal|rise|never give up|start|success|made it'),
  alegre: W('fiesta|celebr|feliz|alegr|baila|ganamos|party|celebrat|happy|dance|we won'),
};
const ACT_MOOD = [
  [/\b(angry|chase|argue|walkArgue|cross)\b/, 'tension'],
  [/\b(cry|sad|downSad)\b/, 'triste'],
  [/\b(love|hug|hugU|kneel|umbrella)\b/, 'romantica'],
  [/\b(cheer|dance|jump)\b/, 'alegre'],
  [/\b(slip|faint|trip|flee|sneak|facepalm|laugh|fall)\b/, 'humor'],
];
const THEME_END = { superacion: 'inspiracional', emprendimiento: 'inspiracional', habitos: 'inspiracional', dinero: 'inspiracional', trabajo: 'inspiracional', trabajador: 'emotiva', amistad: 'emotiva', familia: 'emotiva', matrimonio: 'romantica', fe: 'emotiva', redes: 'emotiva' };

// emoción de cada escena del guion (modo con voces)
export function moodOfBeat(b, theme, base) {
  if (b.mood) return b.mood;
  if (b.kind === 'reflect' || b.kind === 'question' || b.kind === 'cta') return THEME_END[theme] || 'emotiva';
  const t = b.text || '', a = (b.a || '') + ' ' + (b.react ? b.react.act : '');
  for (const [m, re] of Object.entries(WORDS)) if (re.test(t)) return m;
  for (const [re, m] of ACT_MOOD) if (re.test(a)) return m === 'humor' && base !== 'humor' ? base : m;
  return base;
}

// agrupa escenas seguidas con la misma emoción; los tramos muy cortos se unen al vecino
export function moodSections(beats, theme, minLen = 5.5) {
  const base = theme === 'superacion' ? 'emotiva' : theme === 'fe' ? 'emotiva' : 'humor';
  let secs = [];
  for (const b of beats) {
    const m = b.kind === 'act' && secs.length ? secs[secs.length - 1].cat : moodOfBeat(b, theme, base);
    const last = secs[secs.length - 1];
    if (last && last.cat === m) last.t1 = b.start + b.dur; else secs.push({ t0: b.start, t1: b.start + b.dur, cat: m });
  }
  for (let guard = 0; guard < 30 && secs.length > 1; guard++) {
    const i = secs.findIndex(s => s.t1 - s.t0 < minLen); if (i < 0) break;
    const into = i === 0 ? 1 : i === secs.length - 1 ? i - 1 : (secs[i - 1].t1 - secs[i - 1].t0 >= secs[i + 1].t1 - secs[i + 1].t0 ? i - 1 : i + 1);
    const a = Math.min(i, into), b = Math.max(i, into); const keep = i === secs.length - 1 && secs.length > 1 && /emotiva|inspiracional|romantica/.test(secs[i].cat) ? secs[i].cat : secs[into].cat;
    secs.splice(a, 2, { t0: secs[a].t0, t1: secs[b].t1, cat: keep });
    for (let k = secs.length - 1; k > 0; k--) if (secs[k].cat === secs[k - 1].cat) secs.splice(k - 1, 2, { t0: secs[k - 1].t0, t1: secs[k].t1, cat: secs[k].cat });
  }
  return secs;
}

// Escoge canción para cada tramo: primero el banco (sin repetir las últimas usadas), si no, la música incluida
export function planMusic(sections, { choice = 'auto', tracks = [], history = [], seed = Date.now() } = {}) {
  if (choice === 'none') return [{ t0: sections[0].t0, t1: sections[sections.length - 1].t1, kind: 'builtin', style: 'none', cat: 'none' }];
  if (choice !== 'auto') { // elegida a mano: una sola para todo el video
    const t0 = sections[0].t0, t1 = sections[sections.length - 1].t1;
    if (choice.startsWith('mine:')) { const tr = tracks.find(x => 'mine:' + x.id === choice); return [{ t0, t1, kind: 'bank', id: choice.slice(5), cat: tr ? tr.cat : 'emotiva', offset: tr ? tr.start : 0, name: tr && tr.name }]; }
    return [{ t0, t1, kind: 'builtin', style: normCat(choice), cat: normCat(choice) }];
  }
  const used = new Set(); let rnd = seed % 9973;
  const rand = () => { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647; };
  return sections.map(sec => {
    const cats = [sec.cat, ...(CAT_FALLBACK[sec.cat] || [])];
    for (const c of cats) {
      const pool = tracks.filter(t => t.cat === c && !used.has(t.id));
      if (!pool.length) continue;
      // menos usada recientemente primero; entre las igual de «frescas», al azar
      const age = t => { const i = history.indexOf(t.id); return i < 0 ? 999 : i; };
      pool.sort((x, y) => (age(y) - age(x)) || (rand() - 0.5));
      const fresh = pool.filter(t => age(t) === age(pool[0]));
      const tr = fresh[Math.floor(rand() * fresh.length)];
      used.add(tr.id);
      return { ...sec, kind: 'bank', id: tr.id, name: tr.name, offset: tr.start || 0, cat: sec.cat, trackCat: tr.cat };
    }
    return { ...sec, kind: 'builtin', style: sec.cat };
  });
}

export const catName = (id, lang) => { const c = MUSIC_CATS.find(x => x.id === id); return c ? `${c.emoji} ${c.name[lang] || c.name.es}` : id; };
