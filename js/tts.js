// Voces: solo las voces más naturales de OpenAI (gpt-4o-mini-tts), con instrucciones de emoción y naturalidad.
// Hombres: Onyx y Ash. Mujeres: Coral y Nova. Cada personaje recibe una voz de su género, distinta a las demás.
export const OPENAI_VOICES = [
  { id: 'onyx', g: 'm', label: { es: 'Onyx · hombre, voz cálida y grave', en: 'Onyx · male, warm and deep' } },
  { id: 'ash', g: 'm', label: { es: 'Ash · hombre joven, expresivo', en: 'Ash · young male, expressive' } },
  { id: 'coral', g: 'f', label: { es: 'Coral · mujer, cálida y cercana', en: 'Coral · female, warm and friendly' } },
  { id: 'nova', g: 'f', label: { es: 'Nova · mujer joven, alegre', en: 'Nova · young female, upbeat' } },
];
const OA_M = ['onyx', 'ash'], OA_F = ['coral', 'nova'];

async function cloudError(res) {
  let msg = ''; try { const j = await res.json(); msg = (j.error && j.error.message) || ''; } catch { /* sin json */ }
  if (res.status === 401) return new Error('OpenAI: la clave no es válida (401). Revísala en la sección de voz.');
  if (res.status === 429 || /quota|credit|billing/i.test(String(msg))) return new Error(`OpenAI: sin saldo o demasiadas peticiones (${res.status}). ${msg}`);
  return new Error(`OpenAI: error ${res.status}. ${msg}`);
}

// Cómo debe sonar: una persona real hablando, con emoción según el momento del video
const MOOD = {
  es: {
    hook: 'Arranca con energía y curiosidad, como quien cuenta un chisme buenísimo.',
    twist: 'Este es el giro: sorpresa de verdad, con una pausa breve antes de la frase.',
    reflect: 'Momento emotivo: más despacio, voz cálida y sincera, casi en confianza; respeta cada pausa.',
    cta: 'Cierre amable y cercano, con una sonrisa en la voz.',
    react: 'Es una reacción espontánea y corta: exagérala con naturalidad, como una persona real.',
    any: 'Conversación natural entre amigos.',
  },
  en: {
    hook: 'Open with energy and curiosity, like you are spilling the best gossip.',
    twist: 'This is the twist: real surprise, with a tiny pause before the line.',
    reflect: 'Emotional moment: slower, warm and sincere, almost confiding; respect every pause.',
    cta: 'Friendly, warm close, with a smile in your voice.',
    react: 'A short spontaneous reaction: exaggerate it naturally, like a real person would.',
    any: 'Natural conversation between friends.',
  },
};
function instructions(lang, mood) {
  const M = MOOD[lang === 'es' ? 'es' : 'en'];
  if (lang === 'es') return 'Eres una persona real, no un locutor ni un robot. Habla como un joven cubano de Miami: español caribeño, relajado, con chispa y picardía; te comes algunas eses y dices «pa\'». '
    + 'Habla con emoción y naturalidad: respira en las comas, haz pausas en los puntos y en los puntos suspensivos, sube la entonación en las preguntas (¿…?) y pon energía en las exclamaciones (¡…!). Varía el ritmo y el tono como en una conversación real. ' + (M[mood] || M.any);
  return 'You are a real person, never a narrator or a robot. Speak like a young American in their late teens or twenties (Gen Z): natural, casual, expressive General American accent, the way friends talk on TikTok; never British, never formal. '
    + 'Speak with emotion and natural rhythm: breathe at commas, pause at periods and ellipses, let questions rise and exclamations pop. Vary pace and pitch like a real conversation. ' + (M[mood] || M.any);
}

async function openaiSpeak(text, voice, apiKey, lang, mood) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice, input: text, response_format: 'mp3', instructions: instructions(lang, mood) }),
  });
  if (!res.ok) throw await cloudError(res);
  return res.arrayBuffer();
}

// Voz de cada personaje según su género (A usa la elegida si es de su género)
export function voiceForRole(voiceId, role, genders = {}) {
  const gg = genders[role] || 'm'; const list = gg === 'f' ? OA_F : OA_M;
  const kk = { A: 0, B: 1, C: 2, D: 3 }[role] || 0;
  const sameBefore = ['A', 'B', 'C', 'D'].slice(0, kk).filter(x => (genders[x] || 'm') === gg).length;
  const first = list.includes(voiceId) ? voiceId : list[0];
  const rot = [first, ...list.filter(v => v !== first)];
  return rot[sameBefore % rot.length];
}

const memo = new Map();
let decodeCtx = null;
const getCtx = () => (decodeCtx ||= new OfflineAudioContext(1, 1, 48000));
const decode = ab => new Promise((res, rej) => { const p = getCtx().decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); });

export async function synth(text, { voiceId, lang, apiKey, mood = 'any' }) {
  if (!text.trim()) return null;
  if (!apiKey) throw new Error('Falta tu clave de OpenAI.');
  const key = [voiceId, lang, mood, text].join('|');
  if (memo.has(key)) return memo.get(key);
  const dec = await decode(await openaiSpeak(text, voiceId, apiKey, lang, mood));
  const s = trimSilence(dec.getChannelData(0), dec.sampleRate);
  const ab = getCtx().createBuffer(1, s.length, dec.sampleRate); ab.copyToChannel(s, 0);
  memo.set(key, ab);
  return ab;
}

function trimSilence(s, sr) {
  const th = 0.012; let a = 0, b = s.length - 1;
  while (a < b && Math.abs(s[a]) < th) a++;
  while (b > a && Math.abs(s[b]) < th) b--;
  a = Math.max(0, a - Math.floor(sr * 0.02)); b = Math.min(s.length - 1, b + Math.floor(sr * 0.08));
  const out = s.slice(a, b + 1);
  let peak = 0; for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0.01) { const k = 0.89 / peak; for (let i = 0; i < out.length; i++) out[i] *= k; }
  return out;
}
