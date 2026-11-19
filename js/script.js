// Arma el video de comedia muda: escenas de acción + final con íconos (me gusta / seguir), ajustado a la duración.
import { BONUS_GAGS } from './content.js';

export const DURATIONS = {
  s: { min: 12, max: 25, scale: 1.0, label: '12–25 s', sub: 'Rápido' },
  m: { min: 25, max: 45, scale: 1.15, label: '25–45 s', sub: 'Estándar' },
  l: { min: 45, max: 60, scale: 1.3, label: '45–60 s', sub: 'Completo' },
};

const parseActs = a => { const m = {}; (a || '').split(/\s+/).filter(Boolean).forEach(tok => { const [r, act] = tok.split(':'); m[r] = act; }); return m; };

function sceneBeat(sc, i, n, story, settings, scale) {
  const env = sc.env || (settings.env && settings.env !== 'auto' ? settings.env : story.env || 'casa');
  const looks = { ...(story.looks || {}), ...(sc.look || {}) };
  let react = null;
  if (sc.react) { const [role, act] = sc.react.split(':'); react = { role, act, vocal: null, fx: act === 'laugh' ? 'laughs' : act === 'shock' ? 'gasp' : act === 'love' ? 'aww' : 'uf' }; }
  // en cada escena solo salen los personajes que actúan en ella
  const m = parseActs(sc.a); let present = m.all ? null : Object.keys(m).filter(r => /^[ABCD]$/.test(r));
  if (present && react && !present.includes(react.role)) present.push(react.role);
  if (present && !present.length) present = ['A'];
  return {
    present, kind: 'act', text: '', a: sc.a, p: sc.p || '', fx: '', env, night: !!sc.night, looks, twistLike: !!sc.twist,
    gag: { sfx: sc.sfx || [] }, react, shotHint: sc.shot || 'two', actDur: (sc.dur || 1.9) * scale, level: (i + 1) / n,
  };
}

export function buildComedy({ story, dur, settings }) {
  const D = DURATIONS[dur];
  let scenes = story.scenes.slice();
  // videos cortos: se quedan las escenas clave
  const est = list => list.reduce((s, x) => s + (x.dur || 1.9) * D.scale, 0) + 3.2 + 3.6;
  if (est(scenes) > D.max) { scenes = scenes.filter(x => x.key); }
  while (est(scenes) > D.max && scenes.length > 4) { const i = scenes.findIndex((x, k) => k > 0 && k < scenes.length - 2 && !x.twist); scenes.splice(i < 0 ? 1 : i, 1); }
  // videos largos: se meten gags extra entre escenas (antes del giro)
  let bi = 0;
  while (est(scenes) < D.min + 1 && bi < 12) {
    const twistAt = Math.max(1, scenes.findIndex(x => x.twist)); const pos = Math.max(1, Math.min(twistAt, 2 + (bi * 2) % Math.max(1, twistAt - 1)));
    scenes.splice(pos, 0, { ...BONUS_GAGS[bi % BONUS_GAGS.length], env: scenes[Math.max(0, pos - 1)].env });
    bi++;
  }
  const beats = scenes.map((sc, i) => sceneBeat(sc, i, scenes.length, story, settings, D.scale));
  const last = beats[beats.length - 1];
  const refl = (settings.reflection != null ? settings.reflection : story.refl || '').trim();
  if (refl) beats.push({ kind: 'reflect', text: refl, a: settings.nChars > 1 ? 'A:hug B:hug' : 'A:think', present: settings.nChars > 1 ? ['A', 'B'] : ['A'], p: '', fx: 'sparkle', env: last.env, looks: last.looks, actDur: Math.max(3.4, 1.2 + refl.split(/\s+/).length * 0.32) });
  if (settings.cta !== false) beats.push({ kind: 'cta', text: '', a: 'all:wave A:point', p: 'cta', fx: 'pop', env: beats[beats.length - 1].env, looks: beats[beats.length - 1].looks, ctaTypes: ['combo'], ctaType: 'combo', actDur: 3.2 });
  return beats;
}

// Tiempos: cada escena dura lo suyo; las reacciones ocupan el final de la escena
export function timeBeats(beats) {
  let total = 0;
  for (const b of beats) {
    b.voiceLead = 0; b.voiceDur = 0;
    b.dur = b.actDur || 1.9;
    if (b.react) b.reactStart = Math.max(0.6, b.dur - 0.65);
    b.start = total; total += b.dur;
  }
  return total;
}

export { parseActs };
