// Voz automática. Motor principal: Piper (voces neuronales que corren en el navegador).
// Respaldo sin conexión: meSpeak (eSpeak). Ambos devuelven audio que se mezcla y exporta en el MP4.
import { createPiperPhonemize } from '../vendor/piper-phonemize.mjs';

export const ORT_URL = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/esm/ort.min.js';
export const ORT_WASM = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
export const PHONEMIZE_BASE = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize';
export const HF = 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main';

export const VOICES = {
  es: [
    { id: 'es_MX-claude-high', path: 'es/es_MX/claude/high/es_MX-claude-high.onnx', label: 'Claude · México (alta calidad, más pesada)' },
    { id: 'es_MX-ald-medium', path: 'es/es_MX/ald/medium/es_MX-ald-medium.onnx', label: 'Ald · México' },
    { id: 'es_ES-davefx-medium', path: 'es/es_ES/davefx/medium/es_ES-davefx-medium.onnx', label: 'Davefx · España' },
    { id: 'es_ES-sharvard-medium', path: 'es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx', label: 'Sharvard · España' },
  ],
  en: [
    { id: 'en_US-hfc_female-medium', path: 'en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx', label: 'HFC · female (US)' },
    { id: 'en_US-ryan-medium', path: 'en/en_US/ryan/medium/en_US-ryan-medium.onnx', label: 'Ryan · male (US)' },
    { id: 'en_US-lessac-medium', path: 'en/en_US/lessac/medium/en_US-lessac-medium.onnx', label: 'Lessac · neutral (US)' },
    { id: 'en_US-amy-medium', path: 'en/en_US/amy/medium/en_US-amy-medium.onnx', label: 'Amy · female (US)' },
  ],
};

const CACHE_NAME = 'muñequitos-voces-v1';
async function cachedFetch(url, onProgress) {
  let cache = null;
  try { cache = await caches.open(CACHE_NAME); const hit = await cache.match(url); if (hit) return await hit.arrayBuffer(); } catch { cache = null; }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url.split('/').pop()}`);
  const total = +(res.headers.get('Content-Length') || 0);
  const reader = res.body && res.body.getReader();
  let buf;
  if (reader) {
    const chunks = []; let loaded = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); loaded += value.length; onProgress && onProgress(loaded, total); }
    const out = new Uint8Array(loaded); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; }
    buf = out.buffer;
  } else buf = await res.arrayBuffer();
  if (cache) { try { await cache.put(url, new Response(buf.slice(0), { headers: { 'Content-Type': 'application/octet-stream' } })); } catch { /* cuota llena: seguimos sin caché */ } }
  return buf;
}

// ---------- Piper ----------
let ort = null, phonemizeAssets = null;
const sessions = new Map(), configs = new Map();

async function loadOrt() {
  if (ort) return ort;
  ort = await import(/* @vite-ignore */ ORT_URL);
  ort.env.wasm.wasmPaths = ORT_WASM;
  ort.env.wasm.numThreads = 1;
  return ort;
}
async function loadPhonemizeAssets(onProgress) {
  if (phonemizeAssets) return phonemizeAssets;
  const [wasm, data] = await Promise.all([
    cachedFetch(PHONEMIZE_BASE + '.wasm'),
    cachedFetch(PHONEMIZE_BASE + '.data', (l, t) => onProgress && onProgress('phon', l, t)),
  ]);
  phonemizeAssets = { wasm, data };
  return phonemizeAssets;
}
async function phonemize(text, espeakVoice, onProgress) {
  const { wasm, data } = await loadPhonemizeAssets(onProgress);
  return new Promise((resolve, reject) => {
    let done = false;
    createPiperPhonemize({
      wasmBinary: wasm,
      getPreloadedPackage: () => data.slice(0),
      print: line => { if (done) return; try { const j = JSON.parse(line); done = true; resolve(j.phoneme_ids); } catch { /* ignorar */ } },
      printErr: msg => { if (!done && /error/i.test(msg)) { done = true; reject(new Error(msg)); } },
      locateFile: f => (f.endsWith('.wasm') ? PHONEMIZE_BASE + '.wasm' : f.endsWith('.data') ? PHONEMIZE_BASE + '.data' : f),
    }).then(m => {
      m.callMain(['-l', espeakVoice, '--input', JSON.stringify([{ text }]), '--espeak_data', '/espeak-ng-data']);
      setTimeout(() => { if (!done) { done = true; reject(new Error('phonemize timeout')); } }, 15000);
    }).catch(reject);
  });
}

export async function piperPrepare(voiceId, onProgress) {
  const v = [...VOICES.es, ...VOICES.en].find(x => x.id === voiceId);
  if (!v) throw new Error('voz desconocida');
  const O = await loadOrt();
  await loadPhonemizeAssets(onProgress);
  if (!configs.has(voiceId)) configs.set(voiceId, JSON.parse(new TextDecoder().decode(await cachedFetch(`${HF}/${v.path}.json`))));
  if (!sessions.has(voiceId)) {
    const model = await cachedFetch(`${HF}/${v.path}`, (l, t) => onProgress && onProgress('model', l, t));
    sessions.set(voiceId, await O.InferenceSession.create(model, { executionProviders: ['wasm'] }));
  }
  return { session: sessions.get(voiceId), config: configs.get(voiceId) };
}

async function piperSpeak(text, voiceId, speed = 1, onProgress) {
  const { session, config } = await piperPrepare(voiceId, onProgress);
  const ids = await phonemize(text, config.espeak.voice, onProgress);
  const O = ort;
  const inf = config.inference || {};
  const feeds = {
    input: new O.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
    input_lengths: new O.Tensor('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
    scales: new O.Tensor('float32', Float32Array.from([inf.noise_scale ?? 0.667, (inf.length_scale ?? 1) / speed, inf.noise_w ?? 0.8]), [3]),
  };
  if (config.speaker_id_map && Object.keys(config.speaker_id_map).length) feeds.sid = new O.Tensor('int64', BigInt64Array.from([0n]), [1]);
  const out = await session.run(feeds);
  const data = out.output.data;
  return { samples: Float32Array.from(data), sampleRate: config.audio.sample_rate };
}

// ---------- meSpeak (sin conexión) ----------
let meReady = null;
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('no se pudo cargar ' + src)); document.head.appendChild(s); }); }
async function mespeakInit() {
  if (meReady) return meReady;
  meReady = (async () => {
    const base = new URL('../vendor/mespeak/', import.meta.url).href;
    if (!window.meSpeak) await loadScript(base + 'mespeak.js');
    const [cfg, es, en] = await Promise.all(['mespeak_config.json', 'es.json', 'en-us.json'].map(f => fetch(base + f).then(r => r.json())));
    window.meSpeak.loadConfig(cfg);
    await new Promise(r => window.meSpeak.loadVoice(es, r));
    await new Promise(r => window.meSpeak.loadVoice(en, r));
  })();
  return meReady;
}
async function mespeakSpeak(text, lang, speed, actx, variant) {
  await mespeakInit();
  const buf = window.meSpeak.speak(text, { rawdata: 'arraybuffer', voice: lang === 'es' ? 'es' : 'en/en-us', speed: Math.round(165 * speed), pitch: ({ v1: 72, v2: 32, v3: 60 })[variant] || 48, wordgap: 0, amplitude: 120 });
  if (!buf) throw new Error('meSpeak falló');
  return actx.decodeAudioData(buf.slice ? buf.slice(0) : buf);
}

// ---------- Voces en la nube (más naturales; requieren tu clave) ----------
// ElevenLabs: voces premium. Las predeterminadas sirven para todos los idiomas con el modelo multilingüe.
export const ELEVEN_DEFAULT_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah (mujer, cálida)' },
  { id: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel (mujer, narradora)' },
  { id: 'pNInz6obpgDQGcFmaJgB', label: 'Adam (hombre, grave)' },
  { id: 'ErXwobaYiN019PkySvjV', label: 'Antoni (hombre, cercano)' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', label: 'Josh (hombre, joven)' },
];
export const OPENAI_VOICES = [
  { id: 'nova', label: 'Nova (mujer, alegre)' }, { id: 'shimmer', label: 'Shimmer (mujer, suave)' }, { id: 'coral', label: 'Coral (mujer, cálida)' },
  { id: 'onyx', label: 'Onyx (hombre, grave)' }, { id: 'echo', label: 'Echo (hombre)' }, { id: 'ash', label: 'Ash (hombre, expresivo)' }, { id: 'sage', label: 'Sage (neutral)' },
];

async function cloudError(res, provider) {
  let msg = ''; try { const j = await res.json(); msg = (j.detail && (j.detail.message || j.detail.status || j.detail)) || (j.error && j.error.message) || ''; } catch { /* sin json */ }
  if (res.status === 401) return new Error(`${provider}: la clave no es válida (401). Revísala en la sección de voz.`);
  if (res.status === 429 || /quota|credit/i.test(String(msg))) return new Error(`${provider}: se acabaron los créditos o hay demasiadas peticiones (${res.status}). ${msg}`);
  return new Error(`${provider}: error ${res.status}. ${typeof msg === 'string' ? msg : ''}`);
}

export async function elevenVoices(apiKey) {
  const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) throw await cloudError(res, 'ElevenLabs');
  const j = await res.json();
  return (j.voices || []).map(v => ({ id: v.voice_id, label: v.name + (v.labels && v.labels.gender ? ` (${v.labels.gender})` : '') }));
}

async function elevenSpeak(text, voiceId, apiKey, speed) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: Math.max(0.7, Math.min(1.2, speed)) } }),
  });
  if (!res.ok) throw await cloudError(res, 'ElevenLabs');
  return res.arrayBuffer();
}

async function openaiSpeak(text, voice, apiKey, lang) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice, input: text, response_format: 'mp3',
      instructions: lang === 'es' ? 'Habla en español latino neutro, con tono cálido, expresivo y ritmo ágil, como narrador de videos cortos.' : 'Speak in warm, expressive, upbeat American English, like a short-video narrator.' }),
  });
  if (!res.ok) throw await cloudError(res, 'OpenAI');
  return res.arrayBuffer();
}

// ---------- API ----------
const memo = new Map();
let decodeCtx = null;
const getCtx = () => (decodeCtx ||= new OfflineAudioContext(1, 1, 48000));

// engine: 'piper' | 'mespeak' | 'none'
// Voz distinta para cada personaje (A usa la elegida; B, C y D, otras que contrasten)
const OPENAI_PAIR = { nova: ['onyx', 'shimmer', 'echo'], shimmer: ['echo', 'nova', 'ash'], coral: ['ash', 'nova', 'onyx'], onyx: ['nova', 'echo', 'coral'], echo: ['shimmer', 'onyx', 'coral'], ash: ['coral', 'nova', 'echo'], sage: ['nova', 'onyx', 'shimmer'] };
export function voiceForRole(engine, voiceId, role, lang, elevenList) {
  const k = { A: 0, B: 1, C: 2, D: 3 }[role] || 0;
  if (!k) return voiceId;
  if (engine === 'openai') return (OPENAI_PAIR[voiceId] || ['onyx', 'nova', 'echo'])[k - 1];
  if (engine === 'eleven') { const list = (elevenList && elevenList.length ? elevenList : ELEVEN_DEFAULT_VOICES).map(v => v.id).filter(id => id !== voiceId); return list[(k - 1) % Math.max(1, list.length)] || voiceId; }
  if (engine === 'piper') { const list = VOICES[lang].map(v => v.id).filter(id => id !== voiceId); return list[(k - 1) % list.length] || voiceId; }
  if (engine === 'mespeak') return 'v' + k;
  return voiceId;
}

export async function synth(text, { engine, voiceId, lang, speed = 1, onProgress, apiKey }) {
  if (engine === 'none' || !text.trim()) return null;
  const key = [engine, voiceId, lang, engine === 'openai' ? '' : speed.toFixed(2), text].join('|');
  if (memo.has(key)) return memo.get(key);
  let ab;
  if (engine === 'piper') {
    const { samples, sampleRate } = await piperSpeak(text, voiceId, speed, onProgress);
    const trimmed = trimSilence(samples, sampleRate);
    ab = getCtx().createBuffer(1, trimmed.length, sampleRate); ab.copyToChannel(trimmed, 0);
  } else if (engine === 'eleven' || engine === 'openai') {
    if (!apiKey) throw new Error(engine === 'eleven' ? 'Falta tu clave de ElevenLabs.' : 'Falta tu clave de OpenAI.');
    const mp3 = engine === 'eleven' ? await elevenSpeak(text, voiceId, apiKey, speed) : await openaiSpeak(text, voiceId, apiKey, lang);
    const dec = await getCtx().decodeAudioData(mp3);
    const s0 = dec.getChannelData(0);
    const s = trimSilence(s0, dec.sampleRate);
    ab = getCtx().createBuffer(1, s.length, dec.sampleRate); ab.copyToChannel(s, 0);
  } else {
    const dec = await mespeakSpeak(text, lang, speed, getCtx(), voiceId);
    const s = trimSilence(dec.getChannelData(0), dec.sampleRate);
    ab = getCtx().createBuffer(1, s.length, dec.sampleRate); ab.copyToChannel(s, 0);
  }
  memo.set(key, ab);
  return ab;
}

function trimSilence(s, sr) {
  const th = 0.012; let a = 0, b = s.length - 1;
  while (a < b && Math.abs(s[a]) < th) a++;
  while (b > a && Math.abs(s[b]) < th) b--;
  a = Math.max(0, a - Math.floor(sr * 0.02)); b = Math.min(s.length - 1, b + Math.floor(sr * 0.06));
  const out = s.slice(a, b + 1);
  // normaliza a -1 dB aprox.
  let peak = 0; for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0.01) { const k = 0.89 / peak; for (let i = 0; i < out.length; i++) out[i] *= k; }
  return out;
}
