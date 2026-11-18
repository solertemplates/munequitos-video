// Imágenes generadas con IA (OpenAI) para cada escena del video.
// Usa la misma clave de OpenAI que la voz. La primera imagen sirve de referencia
// para que los personajes y el estilo se mantengan iguales en todas las escenas.

export const IMAGE_MODELS = [
  { id: 'gpt-image-1-mini', label: { es: 'Económico (gpt-image-1-mini)', en: 'Budget (gpt-image-1-mini)' }, price: { low: 0.006, medium: 0.015, high: 0.052 } },
  { id: 'gpt-image-1', label: { es: 'Mejor calidad (gpt-image-1)', en: 'Best quality (gpt-image-1)' }, price: { low: 0.016, medium: 0.063, high: 0.25 } },
];

const STYLE = 'Flat 2D cartoon illustration for a vertical short video, in the style of popular "stick figure" animated stories: ' +
  'characters have very big, perfectly round WHITE heads with thick black outlines, huge expressive cartoon eyes and big expressive mouths, ' +
  'thin solid black stick arms and legs with small black hands and feet, and simple flat-colored t-shirts. ' +
  'Background: detailed, colorful but soft cartoon scenery with clean outlines and gentle shading. ' +
  'Funny, warm and very expressive acting, clear readable poses, characters centered and fully visible in the middle of the frame, ' +
  'leave the top 15% and bottom 25% of the image calm (no important details there, subtitles will go there). ' +
  'Absolutely NO text, letters, words, captions, logos or watermarks in the image.';

const SHIRTS = { A: 'green t-shirt', B: 'orange t-shirt', C: 'yellow t-shirt', D: 'light-blue t-shirt' };
const LOOK_DESC = { hair: 'a woman with short black hair', granny: 'an elderly grandma with a gray hair bun and round glasses', kid: 'a small child' };

const ENV_DESC = {
  oficina: 'a modern office with desks, computers, big windows and plants',
  casa: 'a cozy living room with a sofa, a lamp and framed pictures',
  parque: 'a sunny park with trees, green grass, a path and blue sky with clouds',
  cafe: 'a cozy coffee shop with a counter, menu board and hanging lamps',
  ciudad: 'a colorful city street with buildings, sidewalk and cars',
  playa: 'a sunny beach with sea, sand and a palm tree',
  cocina: 'a bright home kitchen with cabinets, fridge and stove',
  vacio: 'a simple soft pastel background with subtle shapes',
  iglesia: 'the inside of a peaceful church with stained glass windows, a cross, candles and wooden pews, soft warm light',
};

const ACT_DESC = {
  idle: 'standing relaxed, smiling', talk: 'talking and gesturing with one hand', walk: 'walking', run: 'running fast, sweating',
  wave: 'waving happily', hug: 'hugging warmly', cheer: 'jumping and cheering with both arms up', jump: 'jumping with joy',
  facepalm: 'doing a facepalm, exasperated', shrug: 'shrugging, confused', sad: 'sad, head down', cry: 'crying with big streams of tears',
  angry: 'angry, fists clenched, red face', laugh: 'laughing out loud, eyes closed, mouth wide open', think: 'thinking, hand on chin',
  type: 'sitting at a desk typing on a laptop', phone: 'looking at a smartphone', sleep: 'asleep sitting on a chair', fall: 'falling down',
  point: 'pointing and laughing', sit: 'sitting on a chair', give: 'giving a present', dance: 'dancing happily', wait: 'waiting impatiently, checking a watch',
  shock: 'shocked, eyes wide, mouth open, arms up', love: 'with heart eyes, in love', tired: 'exhausted, slouching', strong: 'proudly flexing muscles',
  lift: 'carrying a heavy box', pray: 'praying with hands together, eyes closed, peaceful',
};

const PROP_DESC = {
  clock: 'a big wall clock', money: 'banknotes flying', pizza: 'a pizza', heart: 'a big red heart', gift: 'a wrapped gift box', box: 'cardboard boxes',
  chart_up: 'a chart going up', chart_down: 'a chart going down', trophy: 'a golden trophy', calendar: 'a calendar', coffee: 'a cup of coffee',
  bulb: 'a glowing light bulb idea', rocket: 'a small rocket', plant: 'a small plant growing', laptop: 'a laptop', phone: 'a smartphone with notifications',
  confetti: 'confetti in the air', light: 'warm rays of heavenly light from above',
};

function parseActs(a) { const m = {}; (a || '').split(/\s+/).filter(Boolean).forEach(tok => { const [r, act] = tok.split(':'); if (r === 'all') m._all = act; else m[r] = act; }); return m; }

export function scenePrompt(beat, project, situation) {
  const n = project.nChars; const looks = project.looks || {}; const acts = parseActs(beat.a);
  const roles = ['A', 'B', 'C', 'D'].slice(0, n);
  const people = roles.map((r, i) => {
    const act = acts[r] || acts._all || (beat.kind === 'twist' ? 'shock' : beat.kind === 'cta' ? 'wave' : 'idle');
    const who = LOOK_DESC[looks[r]] ? `${LOOK_DESC[looks[r]]} wearing a ${SHIRTS[r]}` : `a character wearing a ${SHIRTS[r]}`;
    return `${i === 0 ? 'Main character' : 'Character ' + (i + 1)}: ${who}, ${ACT_DESC[act] || ACT_DESC.idle}.`;
  }).join(' ');
  let place = ENV_DESC[beat.env] || ENV_DESC.parque;
  if (beat.env === 'caminos') {
    const sg = (beat.sign || '').replace('sign:', '').split('|'); const lb = project.lang === 'en' && sg.length >= 4 ? [sg[2], sg[3]] : [sg[0], sg[1]];
    place = `a fork in the road in the countryside: the LEFT path is gray, gloomy and rainy, the RIGHT path is sunny and bright; a wooden signpost with two arrow signs reading "${lb[0]}" (left) and "${lb[1]}" (right) — these two signs are the ONLY text allowed`;
    if (beat.side) place += `; the main character is walking on the ${beat.side < 0 ? 'left gloomy' : 'right sunny'} path`;
  }
  const propName = (beat.p || '').split(':')[0];
  const prop = PROP_DESC[propName] ? ` Include ${PROP_DESC[propName]}.` : '';
  const mood = { hook: 'Intriguing, eye-catching opening shot.', twist: 'Surprising plot-twist moment, dramatic and funny.', reflect: 'Emotional, warm and touching moment, golden-hour light.', after: 'Happy celebration.', cta: 'Friendly, happy closing shot, characters waving at the viewer.' }[beat.kind] || '';
  return `${STYLE}\nStory: "${situation.title[project.lang]}". This scene: "${beat.text}".\nSetting: ${place}.\n${people}${prop}\n${mood}`;
}

async function apiError(res) {
  let msg = ''; try { const j = await res.json(); msg = (j.error && j.error.message) || ''; } catch { /* sin json */ }
  const e = new Error(msg || `HTTP ${res.status}`); e.status = res.status;
  if (res.status === 401) e.message = 'OpenAI: la clave no es válida (401).';
  else if (/verif/i.test(msg)) { e.message = 'OpenAI pide verificar tu organización para generar imágenes. Entra a platform.openai.com → Settings → Organization → General → «Verify Organization» y vuelve a intentar (tarda unos minutos).'; e.verify = true; }
  else if (res.status === 429 || /quota|billing|credit/i.test(msg)) { e.message = 'OpenAI: sin saldo o demasiadas peticiones. Revisa tu saldo en platform.openai.com → Billing. ' + msg; e.retry = res.status === 429 && !/quota|billing/i.test(msg); }
  else if (/safety|moderation/i.test(msg)) e.message = 'OpenAI rechazó esta escena por su filtro de contenido.';
  return e;
}

function b64ToBlob(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: 'image/png' }); }

async function generateOne({ apiKey, model, quality, prompt, reference }) {
  let res;
  if (reference) {
    const fd = new FormData();
    fd.append('model', model); fd.append('prompt', 'Use the attached image ONLY as the reference for the characters (same faces, same t-shirt colors) and the art style. Create a NEW scene: ' + prompt);
    fd.append('image[]', reference, 'reference.png'); fd.append('size', '1024x1536'); fd.append('quality', quality); fd.append('n', '1');
    res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: fd });
  } else {
    res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, size: '1024x1536', quality, n: 1 }),
    });
  }
  if (!res.ok) throw await apiError(res);
  const j = await res.json(); const b64 = j.data && j.data[0] && j.data[0].b64_json;
  if (!b64) throw new Error('OpenAI no devolvió la imagen.');
  return b64ToBlob(b64);
}

const memo = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Genera una imagen por escena. Devuelve { images: Map(beatIndex → ImageBitmap), errors: [] }
export async function generateSceneImages(project, situation, { apiKey, model, quality, consistent = true, onProgress, signal }) {
  if (!apiKey) throw new Error('Pega tu clave de OpenAI en la sección «Imágenes con IA».');
  // escenas que necesitan imagen: la reflexión comparte una sola, el CTA reutiliza la última
  const jobs = []; let reflectJob = null;
  project.beats.forEach((b, i) => {
    if (b.kind === 'cta') return;
    if (b.kind === 'reflect') { if (!reflectJob) { reflectJob = { idx: [i], prompt: scenePrompt({ ...b, text: project.beats.filter(x => x.kind === 'reflect').map(x => x.text).join(' ') }, project, situation) }; jobs.push(reflectJob); } else reflectJob.idx.push(i); return; }
    jobs.push({ idx: [i], prompt: scenePrompt(b, project, situation) });
  });
  const images = new Map(); const errors = []; let done = 0;
  const report = () => onProgress && onProgress(done, jobs.length);
  report();
  let reference = null;
  const run = async job => {
    const key = [model, quality, consistent ? 'c' : '', job.prompt].join('|');
    let blob = memo.get(key);
    for (let attempt = 0; !blob && attempt < 3; attempt++) {
      if (signal && signal.aborted) return;
      try { blob = await generateOne({ apiKey, model, quality, prompt: job.prompt, reference: consistent && job !== jobs[0] ? reference : null }); memo.set(key, blob); }
      catch (e) {
        if (e.retry && attempt < 2) { await sleep(8000 * (attempt + 1)); continue; }
        if (e.status === 401 || e.verify || (e.status === 429 && !e.retry)) throw e; // error de cuenta: detener todo
        errors.push(e.message); break;
      }
    }
    if (blob) { const bmp = await createImageBitmap(blob); for (const i of job.idx) images.set(i, bmp); if (job === jobs[0]) reference = blob; }
    done++; report();
  };
  // la primera imagen define personajes y estilo; el resto en paralelo (3 a la vez)
  await run(jobs[0]);
  const rest = jobs.slice(1); let next = 0;
  await Promise.all(Array.from({ length: Math.min(3, rest.length) }, async () => { while (next < rest.length) { const j = rest[next++]; await run(j); } }));
  return { images, errors, count: jobs.length };
}

export function estimateCost(nImages, model, quality) {
  const m = IMAGE_MODELS.find(x => x.id === model) || IMAGE_MODELS[0];
  return nImages * (m.price[quality] || m.price.medium) * 1.15; // + texto/imagen de referencia
}
