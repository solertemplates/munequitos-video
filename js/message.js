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

// emoción de cada paso (para que la música cambie con la historia)
const SOLO_MOODS = {
  montana: ['emotiva', 'emotiva', 'emotiva', 'triste', 'triste', 'inspiracional', 'inspiracional', 'inspiracional'],
  caer: ['emotiva', 'triste', 'triste', 'triste', 'triste', 'triste', 'inspiracional', 'inspiracional', 'inspiracional'],
  lluvia: ['triste', 'triste', 'triste', 'inspiracional', 'inspiracional', 'inspiracional'],
  semilla: ['emotiva', 'emotiva', 'emotiva', 'triste', 'triste', 'inspiracional', 'inspiracional', 'alegre'],
};
for (const st of MESSAGE_STORIES) { st.steps.forEach((x, i) => { x.mood = (SOLO_MOODS[st.id] || [])[i] || 'emotiva'; }); st.reflectMood = 'inspiracional'; st.kind = 'solo'; }

// ---------- PANTOMIMA: varios personajes cuentan la historia solo con gestos y mímica ----------
// paso: X(emoción, segundos, { A: [acción, x inicial, x final, mirada], B: [...] }, opciones)
// mirada: 1 = derecha, -1 = izquierda, 'to' = hacia el otro, 'away' = le da la espalda. «acción@sit» = sentado.
const X = (mood, d, cast, o = {}) => ({ mood, d, cast, ...o });
export const MIME_STORIES = [
  {
    id: 'banco', kind: 'mime', env: 'parque', bench: true, emoji: '☔', genders: { A: 'm', B: 'f' }, reflectMood: 'romantica',
    title: R('La sombrilla', 'The umbrella'),
    desc: R('Pantomima: una pareja peleada en un banco del parque… hasta que empieza a llover.', 'Pantomime: a couple fighting on a park bench… until it starts to rain.'),
    steps: [
      X('tension', 3.4, { A: ['walkArgue', -260, 300], B: ['walkArgue', -40, 650] }, { core: true, sfx: [['steps', 0.1]] }),
      X('tension', 3.0, { A: ['argue', 300, 300, 'to'], B: ['argue', 650, 650, 'to'] }, { core: true }),
      X('tension', 3.0, { A: ['cross@sit', 380, 380, 'away'], B: ['cross@sit', 720, 720, 'away'] }, { core: true, sfx: [['thud', 0.4, 0.5]] }),
      X('tension', 2.8, { A: ['love@sit', 380, 380, 'to'], B: ['cross@sit', 720, 720, 'away'] }),
      X('tension', 2.8, { A: ['cross@sit', 380, 380, 'away'], B: ['love@sit', 720, 720, 'to'] }),
      X('triste', 3.4, { A: ['cross@sit', 380, 340, 'away'], B: ['sad@sit', 720, 560, 'to'] }, { core: true }),
      X('triste', 3.0, { A: ['shock@sit', 340, 340, 1], B: ['sad@sit', 560, 560, 'away'] }, { core: true, rain: true }),
      X('romantica', 3.8, { A: ['umbrella', 450, 450, 'to'], B: ['shock@sit', 560, 560, 'to'] }, { core: true, rain: true, sfx: [['pop', 0.5]] }),
      X('romantica', 3.8, { A: ['hugU', 470, 470, 'to'], B: ['hug', 640, 640, 'to'] }, { core: true, rain: true, sfx: [['aww', 0.4]] }),
    ],
    reflect: [R('El amor no es tener la razón.', 'Love isn\'t about being right.'), R('Es cubrirse cuando llueve.', 'It\'s covering each other when it rains.')],
    endCast: { A: ['hugU', 470, 470, 'to'], B: ['hug', 640, 640, 'to'] }, endRain: true,
  },
  {
    id: 'pizza', kind: 'mime', env: 'parque', emoji: '🍕', genders: { A: 'm', B: 'm' }, reflectMood: 'emotiva',
    title: R('El último pedazo de pizza', 'The last slice of pizza'),
    desc: R('Pantomima: dos amigos se pelean por el último pedazo… y el giro los une más.', 'Pantomime: two friends fight over the last slice… and the twist brings them closer.'),
    steps: [
      X('humor', 3.0, { A: ['eat', 640, 640, 1], B: ['walk', -240, 330] }, { core: true, sfx: [['steps', 0.1]] }),
      X('humor', 2.6, { A: ['eat', 640, 640, 'away'], B: ['shock', 330, 330, 'to'] }, { core: true, sfx: [['boing', 0.2]] }),
      X('humor', 2.8, { A: ['laugh', 640, 640, 'to'], B: ['argue', 330, 330, 'to'] }),
      X('tension', 3.0, { A: ['flee', 640, 1050], B: ['chase', 330, 860] }, { core: true, sfx: [['run', 0.1]] }),
      X('triste', 3.0, { A: ['fall', 1050, 1080, 1], B: ['shock', 860, 860, 'to'] }, { core: true, sfx: [['fall', 0.15]] }),
      X('triste', 2.8, { A: ['downSad', 1080, 1080, 1], B: ['think', 860, 860, 'to'] }),
      X('emotiva', 3.4, { A: ['rise', 1080, 1080, 1], B: ['give', 860, 900, 'to'] }, { core: true, sfx: [['effort', 0.4]] }),
      X('alegre', 3.4, { A: ['eat', 1080, 1060, 'to'], B: ['eat', 900, 880, 'to'] }, { core: true, sfx: [['laughs', 0.6]] }),
    ],
    reflect: [R('Ningún pedazo de pizza vale más que un amigo.', 'No slice of pizza is worth more than a friend.'), R('Compartido, sabe mejor.', 'Shared, it tastes better.')],
    endCast: { A: ['hug', 1050, 1050, 'to'], B: ['hug', 840, 840, 'to'] },
  },
  {
    id: 'abuela', kind: 'mime', env: 'parque', bench: true, emoji: '👵', genders: { A: 'm', B: 'f' }, looks: { B: 'granny' }, reflectMood: 'emotiva',
    title: R('La abuela y el teléfono', 'Grandma and the phone'),
    desc: R('Pantomima: el nieto no suelta el teléfono mientras la abuela lo saluda… hasta que la ve sola.', 'Pantomime: the grandson can\'t put the phone down while grandma waves… until he sees her alone.'),
    steps: [
      X('emotiva', 3.0, { A: ['scroll', 860, 860, 1], B: ['walk', -260, 300] }, { core: true, sfx: [['steps', 0.1]] }),
      X('triste', 2.8, { A: ['scroll', 860, 860, 'away'], B: ['wave', 300, 300, 'to'] }, { core: true }),
      X('triste', 2.8, { A: ['scroll', 860, 860, 'away'], B: ['wave', 300, 330, 'to'] }),
      X('triste', 3.2, { A: ['scroll', 860, 860, 'away'], B: ['sad@sit', 400, 400, 'to'] }, { core: true }),
      X('emotiva', 3.0, { A: ['shock', 860, 860, 'to'], B: ['sad@sit', 400, 400, 1] }, { core: true, sfx: [['ding', 0.3]] }),
      X('emotiva', 3.2, { A: ['love@sit', 640, 640, 'to'], B: ['shock@sit', 400, 400, 'to'] }, { core: true }),
      X('alegre', 3.2, { A: ['laugh@sit', 640, 640, 'to'], B: ['talk@sit', 400, 400, 'to'] }, { sfx: [['laughs', 0.4]] }),
      X('emotiva', 3.4, { A: ['hug@sit', 560, 560, 'to'], B: ['hug@sit', 420, 420, 'to'] }, { core: true, sfx: [['aww', 0.3]] }),
    ],
    reflect: [R('El teléfono puede esperar.', 'Your phone can wait.'), R('Los abuelos, no.', 'Your grandparents can\'t.')],
    endCast: { A: ['hug@sit', 560, 560, 'to'], B: ['hug@sit', 420, 420, 'to'] },
  },
];
export const ALL_MESSAGE_STORIES = () => [...MESSAGE_STORIES, ...MIME_STORIES];

const words = s => s.split(/\s+/).filter(Boolean).length;
// tiempo que se queda cada frase en pantalla (aparece palabra por palabra)
const stepDur = (text, pace) => Math.max(2.3, (1.1 + words(text) * 0.42) / pace);

// convierte una historia en escenas: cada escena dice qué hace cada personaje
const castOf = (story, s) => s.cast ? s.cast : { A: [s.act, s.from, s.to] };
export function buildMessage({ story, lang, dur, ctas, settings }) {
  const D = DURATIONS[dur];
  const T = o => (o == null ? '' : typeof o === 'string' ? o : (o[lang] || o.es || ''));
  const steps = story.steps.slice();
  const nCore = steps.filter(s => s.core).length;
  const want = dur === 's' ? nCore : dur === 'm' ? Math.min(steps.length, nCore + 2) : steps.length;
  let chosen = steps.filter(s => s.core);
  for (const s of steps) if (chosen.length < want && !chosen.includes(s)) chosen.push(s);
  chosen = steps.filter(s => chosen.includes(s));
  const pace = dur === 's' ? 1.15 : dur === 'l' ? 0.92 : 1;
  const common = { env: story.env, bench: !!story.bench, genders: story.genders || null, looks: story.looks || null };
  const beats = chosen.map((s, i) => {
    const text = s.t ? T(s.t) : '';
    return { kind: 'msg', text, cast: castOf(story, s), act: (castOf(story, s).A || [])[0], fx: '', msgSfx: s.sfx || [], rain: s.rain, sun: s.sun, summit: s.summit, plant: s.plant, card: s.card ? T(s.card) : '', mood: s.mood || 'emotiva',
      level: (i + 1) / chosen.length, dur: text ? stepDur(text, pace) : (s.d || 3) / pace, shots: 1, ...common };
  });
  const last = chosen[chosen.length - 1];
  const endCast = story.endCast || Object.fromEntries(Object.entries(castOf(story, last)).map(([r, c]) => [r, [r === 'A' && story.kind !== 'mime' ? 'idle' : c[0], c[2], c[2], c[3]]]));
  const keep = { sun: last.sun, summit: last.summit, plant: last.plant ? [1, 1] : null, rain: story.endRain ? true : undefined };
  // reflexión final fuerte (una o dos frases, cortas)
  const refl = story.reflect.map(T);
  const rb = dur === 's' ? [refl.join(' ')] : refl;
  rb.forEach((r, i) => beats.push({ kind: 'reflect', text: r, cast: i && story.kind !== 'mime' ? { A: ['pray', endCast.A[1], endCast.A[1]] } : endCast, fx: '', msgSfx: [], ...keep, dur: Math.max(3.4, (1.6 + words(r) * 0.45) / pace), shots: 1, strong: true, mood: story.reflectMood || 'emotiva', ...common }));
  const ctaCast = Object.fromEntries(Object.entries(endCast).map(([r, c]) => [r, [c[0].includes('@sit') ? 'wave@sit' : 'wave', c[1], c[1], c[3]]]));
  beats.push({ kind: 'cta', text: fillCta(combineCtas(ctas, lang), lang, settings), cast: ctaCast, fx: '', p: 'cta', ctaType: ctas[0].type, ctaTypes: ctaTypesFor(ctas), dur: ctas.length > 1 ? 3.8 : 3.2, shots: 1, ...keep, mood: story.reflectMood || 'emotiva', ...common });
  beats.forEach(b => { b.a = Object.entries(b.cast).map(([r, c]) => r + ':' + String(c[0]).replace('@sit', '')).join(' '); });
  // ajusta al rango de duración elegido
  let total = beats.reduce((s, b) => s + b.dur, 0);
  if (total < D.min) { const k = (D.min + 0.5) / total; beats.forEach(b => { b.dur *= k; }); }
  else if (total > D.max) { const k = (D.max - 0.3) / total; beats.forEach(b => { b.dur = Math.max(1.8, b.dur * k); }); }
  total = 0; for (const b of beats) { b.start = total; b.voiceLead = 0; b.voiceDur = 0; b.shotPlan = [{ t0: 0, t1: b.dur, type: 'msg', role: 'A' }]; total += b.dur; }
  const rainB = beats.filter(b => b.rain);
  const amb = story.ambience || (rainB.length ? 'rain' : null);
  return { beats, total, ambience: amb, ambienceFrom: rainB.length ? rainB[0].start : 0, ambienceUntil: rainB.length ? rainB[rainB.length - 1].start + rainB[rainB.length - 1].dur + 0.3 : total };
}
