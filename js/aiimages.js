// Fondos generados con IA (OpenAI). Los personajes NO van en la imagen: la app los anima encima
// como marionetas (boca sincronizada, ojos, cejas, brazos y piernas), con el mismo estilo de caricatura.

export const IMAGE_MODELS = [
  { id: 'gpt-image-1-mini', label: { es: 'Económico (gpt-image-1-mini)', en: 'Budget (gpt-image-1-mini)' }, price: { low: 0.006, medium: 0.015, high: 0.052 } },
  { id: 'gpt-image-1', label: { es: 'Mejor calidad (gpt-image-1)', en: 'Best quality (gpt-image-1)' }, price: { low: 0.016, medium: 0.063, high: 0.25 } },
];

const STYLE = 'Flat 2D cartoon BACKGROUND illustration for a vertical animated short (stick-figure story style): detailed scenery with VIVID, bright, saturated, happy colors ' +
  '(clear blue sky, fresh greens, warm sunny tones; never dull, muddy or brownish), clean dark outlines, simple flat shading, real-world proportions for furniture and objects. Straight-on eye-level view. The floor or ground fills the bottom 30% of the image and is flat, ' +
  'empty and uncluttered in the center (animated characters will stand there). Keep the top 25% simple (sky, wall or ceiling). ' +
  'ABSOLUTELY NO people, NO characters, NO stick figures, NO animals, NO text, NO letters, NO signs with words, NO logos.';

const ENV_DESC = {
  oficina: 'a modern office: desks with computers, big windows with a city view, plants, a wall clock',
  casa: 'a cozy Latino family living room: sofa, lamp, framed photos, a window with palm trees outside (Miami)',
  parque: 'a sunny Miami park: palm trees and green trees, grass, a walking path, blue sky with clouds',
  cafe: 'a cozy Cuban café (ventanita style): counter, menu board without readable text, hanging lamps, coffee cups',
  ciudad: 'a colorful Miami street: pastel buildings, sidewalk, palm trees, a few parked cars',
  playa: 'a sunny Miami beach: turquoise sea, sand, a palm tree, lifeguard tower',
  cocina: 'a bright home kitchen: cabinets, fridge, stove with a Cuban coffee maker',
  vacio: 'a simple soft pastel background with subtle shapes and a plain floor',
  iglesia: 'the inside of a peaceful church: stained glass windows, a simple cross, candles, wooden pews on the sides, central aisle',
  caminos: 'a countryside fork in the road seen from the middle: the LEFT road goes into a gray, gloomy, rainy area; the RIGHT road goes into a sunny, bright, flowery area; NO signpost',
};

async function apiError(res) {
  let msg = ''; try { const j = await res.json(); msg = (j.error && j.error.message) || ''; } catch { /* sin json */ }
  const e = new Error(msg || `HTTP ${res.status}`); e.status = res.status;
  if (res.status === 401) e.message = 'OpenAI: la clave no es válida (401).';
  else if (/verif/i.test(msg)) { e.message = 'OpenAI pide verificar tu organización para crear imágenes: platform.openai.com → Settings → Organization → General → «Verify Organization».'; e.verify = true; }
  else if (res.status === 429 || /quota|billing|credit/i.test(msg)) { e.message = 'OpenAI: sin saldo o demasiadas peticiones. Revisa platform.openai.com → Billing. ' + msg; e.retry = res.status === 429 && !/quota|billing/i.test(msg); }
  return e;
}
function b64ToBlob(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: 'image/png' }); }

async function generateOne({ apiKey, model, quality, prompt, reference }) {
  let res;
  if (reference) {
    const fd = new FormData();
    fd.append('model', model); fd.append('prompt', 'Same art style and same color palette as the attached image. ' + prompt);
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

// Asigna a cada escena una "clave de fondo": entorno + variante (A/B alternadas para que cambie el escenario, y una cálida para la reflexión)
export function planBackgrounds(project) {
  const keys = new Set(); const alt = {};
  project.beats.forEach((b, i) => {
    const env = b.env || 'casa';
    if (b.kind === 'cta') { const prev = project.beats[i - 1]; b.bgKey = prev ? prev.bgKey : `${env}|a`; }
    else { alt[env] = (alt[env] || 0) + 1; b.bgKey = `${env}|${alt[env] % 3 === 0 ? 'b' : 'a'}`; }
    keys.add(b.bgKey);
  });
  return [...keys];
}

function bgPrompt(key, story) {
  const [env, v] = key.split('|');
  const place = ENV_DESC[env] || ENV_DESC.parque;
  const variant = v === 'b' ? ' Show a DIFFERENT part/angle of the same place (other furniture or objects), same style and colors.'
    : v === 'warm' ? ' Same place at golden hour / sunset, warm emotional light, a bit dreamy and touching.' : '';
  return `${STYLE}\nPlace: ${place}.${variant}\nMood: funny silent slapstick comedy about "${story}".`;
}

const memo = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function generateBackgrounds(project, situation, { apiKey, model, quality, onProgress }) {
  if (!apiKey) throw new Error('Falta tu clave de OpenAI.');
  const keys = planBackgrounds(project);
  const story = (situation.title && (situation.title.es || situation.title)) || '';
  const out = new Map(); const errors = []; let done = 0; const refs = new Map();
  onProgress && onProgress(0, keys.length);
  const run = async key => {
    const env = key.split('|')[0];
    const reference = key.endsWith('|a') ? null : refs.get(env) || null;
    const prompt = bgPrompt(key, story); const mk = [model, quality, prompt, !!reference].join('|');
    let blob = memo.get(mk);
    for (let attempt = 0; !blob && attempt < 3; attempt++) {
      try { blob = await generateOne({ apiKey, model, quality, prompt, reference }); memo.set(mk, blob); }
      catch (e) {
        if (e.retry && attempt < 2) { await sleep(8000 * (attempt + 1)); continue; }
        if (e.status === 401 || e.verify || e.status === 429) throw e;
        errors.push(e.message); break;
      }
    }
    if (blob) { out.set(key, await createImageBitmap(blob)); if (key.endsWith('|a')) refs.set(env, blob); }
    done++; onProgress && onProgress(done, keys.length);
  };
  // primero los fondos base (A), luego sus variantes usando el base como referencia de estilo
  const base = keys.filter(k => k.endsWith('|a')), rest = keys.filter(k => !k.endsWith('|a'));
  await Promise.all(base.map(run));
  await Promise.all(rest.map(run));
  return { images: out, errors, count: keys.length };
}

export function imagePrice(model, quality) { const m = IMAGE_MODELS.find(x => x.id === model) || IMAGE_MODELS[0]; return (m.price[quality] || m.price.medium) * 1.1; }
