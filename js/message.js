// «Solo música con mensaje»: sin voces. Un muñequito hace algo con significado (subir una montaña, caerse y
// levantarse, caminar bajo la lluvia, sembrar una semilla) mientras aparecen pocas frases, grandes y cortas.
// Siempre termina con una frase de reflexión fuerte.
import { fillCta, combineCtas, ctaTypesFor } from './content.js';
import { DURATIONS } from './script.js';

const R = (es, en) => ({ es, en });
// Paso de la historia: frase + qué hace el muñequito + recorrido (x inicial → x final) + efectos
const P = (es, en, act, from, to = from, o = {}) => ({ t: R(es, en), act, from, to, ...o });

export const MESSAGE_STORIES = [
  {
    id: 'montana', env: 'montana', music: 'superacion', emoji: '🏔️',
    title: R('Subir la montaña', 'Climbing the mountain'),
    desc: R('Un muñequito sube una montaña enorme, se cansa, casi se rinde… y llega a la cima.', 'A stick figure climbs a huge mountain, gets tired, almost quits… and reaches the top.'),
    steps: [
      P('Todos quieren la cima.', 'Everyone wants the top.', 'walk', 60, 200, { core: true, sfx: [['steps', 0.2]] }),
      P('Casi nadie quiere subir.', 'Almost nobody wants the climb.', 'climb', 200, 330, { sfx: [['steps', 0.2]] }),
      P('Cada paso pesa más…', 'Every step feels heavier…', 'climb', 330, 440, { core: true, sfx: [['effort', 0.6], ['steps', 0.3]] }),
      P('Pensé en rendirme.', 'I thought about quitting.', 'kneel', 440, 440, { core: true, sfx: [['thud', 0.3]] }),
      P('Miré atrás… ¡mira todo lo que subí!', 'I looked back… look how far I came!', 'think', 440, 440),
      P('Y di un paso más.', 'So I took one more step.', 'climb', 440, 600, { core: true, sfx: [['effort', 0.3], ['steps', 0.5]] }),
      P('Y otro. Y otro más.', 'And another. And another.', 'climb', 600, 780, { sfx: [['steps', 0.2]] }),
      P('¡Lo logré!', 'I made it!', 'cheer', 960, 960, { core: true, summit: true, sfx: [['levelup', 0.15]] }),
    ],
    reflect: [R('La cima no es para los más fuertes.', 'The top isn\'t for the strongest.'), R('Es para los que no se rinden.', 'It\'s for those who don\'t quit.')],
  },
  {
    id: 'caer', env: 'camino', music: 'emotiva', emoji: '🩹',
    title: R('Caer y levantarse', 'Falling and getting up'),
    desc: R('Se cae una y otra vez… y cada vez se levanta más fuerte.', 'Falls again and again… and gets up stronger every time.'),
    steps: [
      P('Empecé con muchas ganas.', 'I started full of hope.', 'walk', 120, 330, { core: true, sfx: [['steps', 0.2]] }),
      P('Y me caí.', 'And I fell.', 'fall', 330, 380, { core: true, fallen: true, sfx: [['fall', 0.15]] }),
      P('Dolió… pero me levanté.', 'It hurt… but I got up.', 'rise', 380, 380, { core: true, sfx: [['effort', 0.4]] }),
      P('Me volví a caer.', 'I fell again.', 'slip', 380, 450, { fallen: true, sfx: [['fall', 0.1]] }),
      P('Esta vez, más fuerte.', 'Harder this time.', 'downSad', 450, 450, { fallen: true }),
      P('Casi me quedo en el suelo…', 'I almost stayed down…', 'downSad', 450, 450, { core: true, fallen: true }),
      P('Pero me levanté otra vez.', 'But I got up again.', 'rise', 450, 450, { core: true, sfx: [['effort', 0.4]] }),
      P('Ahora camino distinto.', 'Now I walk differently.', 'walk', 450, 700, { sfx: [['steps', 0.2]] }),
      P('¡Ahora corro!', 'Now I run!', 'cheer', 760, 760, { core: true, sfx: [['levelup', 0.1]] }),
    ],
    reflect: [R('Caerse no es fracasar.', 'Falling isn\'t failing.'), R('Fracasar es quedarse en el suelo.', 'Failing is staying down.')],
  },
  {
    id: 'lluvia', env: 'ciudad', music: 'emotiva', emoji: '🌧️', ambience: 'rain',
    title: R('Caminar bajo la lluvia', 'Walking in the rain'),
    desc: R('Llueve, no hay paraguas… y sigue caminando hasta que sale el sol.', 'It rains, no umbrella… and keeps walking until the sun comes out.'),
    steps: [
      P('Llovía sobre mi vida.', 'It was raining on my life.', 'tired', 300, 300, { core: true, rain: 1 }),
      P('Sin paraguas. Sin plan.', 'No umbrella. No plan.', 'walk', 150, 330, { rain: 1, sfx: [['steps', 0.2]] }),
      P('Todos corrían a esconderse.', 'Everyone ran for cover.', 'sad', 330, 330, { rain: 1 }),
      P('Yo seguí caminando.', 'I kept walking.', 'walk', 330, 560, { core: true, rain: 1, sfx: [['steps', 0.2]] }),
      P('Paso a paso… sin mirar atrás.', 'Step by step… never looking back.', 'walk', 560, 760, { rain: 1, sfx: [['steps', 0.2]] }),
      P('Hasta que salió el sol.', 'Until the sun came out.', 'cheer', 760, 760, { core: true, rain: 0, sun: true, sfx: [['sparkle', 0.3]] }),
    ],
    reflect: [R('Ninguna tormenta dura para siempre.', 'No storm lasts forever.'), R('Tú eres más fuerte que la lluvia.', 'You are stronger than the rain.')],
  },
  {
    id: 'semilla', env: 'parque', music: 'emotiva', emoji: '🌱',
    title: R('La semilla', 'The seed'),
    desc: R('Siembra una semilla, la riega cada día sin ver nada… hasta que un día brota.', 'Plants a seed, waters it every day seeing nothing… until one day it sprouts.'),
    steps: [
      P('Planté una semilla.', 'I planted a seed.', 'kneel', 380, 380, { core: true, plant: [0, 0] }),
      P('La regué todos los días.', 'I watered it every day.', 'water', 380, 380, { core: true, plant: [0, 0], card: R('DÍA 1', 'DAY 1') }),
      P('Nada.', 'Nothing.', 'shrug', 380, 380, { plant: [0, 0], card: R('DÍA 7', 'DAY 7') }),
      P('Un mes… y nada.', 'A month… still nothing.', 'sad', 380, 380, { core: true, plant: [0, 0], card: R('DÍA 30', 'DAY 30') }),
      P('Me decían: «¿Para qué sigues?»', 'They said: "Why bother?"', 'think', 380, 380, { plant: [0, 0] }),
      P('Seguí regando.', 'I kept watering.', 'water', 380, 380, { core: true, plant: [0, 0.05], card: R('DÍA 60', 'DAY 60') }),
      P('Y un día…', 'And one day…', 'shock', 380, 380, { plant: [0.05, 0.3] }),
      P('¡Brotó!', 'It grew!', 'cheer', 380, 380, { core: true, plant: [0.3, 1], sfx: [['sparkle', 0.2]] }),
    ],
    reflect: [R('Lo que hoy no ves, está creciendo por dentro.', 'What you can\'t see yet is growing inside.'), R('No dejes de regar.', 'Don\'t stop watering.')],
  },
];

const words = s => s.split(/\s+/).filter(Boolean).length;
// tiempo que se queda cada frase en pantalla (aparece palabra por palabra)
const stepDur = (text, pace) => Math.max(2.3, (1.1 + words(text) * 0.42) / pace);

export function buildMessage({ story, lang, dur, ctas, settings }) {
  const D = DURATIONS[dur];
  const T = o => o[lang] || o.es;
  const steps = story.steps.slice();
  const want = dur === 's' ? steps.filter(s => s.core).length : dur === 'm' ? Math.min(steps.length, steps.filter(s => s.core).length + 2) : steps.length;
  let chosen = steps.filter(s => s.core);
  for (const s of steps) if (chosen.length < want && !chosen.includes(s)) chosen.push(s);
  chosen = steps.filter(s => chosen.includes(s));
  const pace = dur === 's' ? 1.15 : dur === 'l' ? 0.92 : 1;
  const beats = chosen.map((s, i) => ({
    kind: 'msg', text: T(s.t), a: 'A:' + s.act, act: s.act, path: [s.from, s.to], env: story.env, fx: '', msgSfx: s.sfx || [], rain: s.rain, sun: s.sun,
    fallen: s.fallen, summit: s.summit, plant: s.plant, card: s.card ? T(s.card) : '', level: (i + 1) / chosen.length, dur: stepDur(T(s.t), pace), shots: 1,
  }));
  // reflexión final fuerte (una o dos frases)
  const refl = story.reflect.map(T);
  const lastX = chosen[chosen.length - 1].to;
  const rb = dur === 's' ? [refl.join(' ')] : refl;
  rb.forEach((r, i) => beats.push({ kind: 'reflect', text: r, a: i ? 'A:pray' : 'A:idle', act: i ? 'pray' : 'idle', path: [lastX, lastX], env: story.env, fx: '', msgSfx: [], sun: chosen[chosen.length - 1].sun, summit: chosen[chosen.length - 1].summit, plant: chosen[chosen.length - 1].plant ? [1, 1] : null, dur: Math.max(3.4, (1.6 + words(r) * 0.45) / pace), shots: 1, strong: true }));
  beats.push({ kind: 'cta', text: fillCta(combineCtas(ctas, lang), lang, settings), a: 'A:wave', act: 'wave', path: [lastX, lastX], env: story.env, fx: '', p: 'cta', ctaType: ctas[0].type, ctaTypes: ctaTypesFor(ctas), dur: ctas.length > 1 ? 3.8 : 3.2, shots: 1, sun: chosen[chosen.length - 1].sun, summit: chosen[chosen.length - 1].summit, plant: chosen[chosen.length - 1].plant ? [1, 1] : null });
  // ajusta al rango de duración elegido
  let total = beats.reduce((s, b) => s + b.dur, 0);
  if (total < D.min) { const k = (D.min + 0.5) / total; beats.forEach(b => { b.dur *= k; }); }
  else if (total > D.max) { const k = (D.max - 0.3) / total; beats.forEach(b => { b.dur = Math.max(1.8, b.dur * k); }); }
  total = 0; for (const b of beats) { b.start = total; b.voiceLead = 0; b.voiceDur = 0; b.shotPlan = [{ t0: 0, t1: b.dur, type: 'msg', role: 'A' }]; total += b.dur; }
  const rainEnd = beats.findIndex(b => b.kind === 'msg' && story.ambience && !b.rain);
  return { beats, total, ambience: story.ambience || null, ambienceUntil: rainEnd >= 0 ? beats[rainEnd].start + 0.8 : total };
}
