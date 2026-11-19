// Guionista con IA (OpenAI): busca lo que está viral y escribe historias en el estilo de la app.
const R = (es, en) => ({ es, en });

const ACTIONS = ['slip', 'faint', 'trip', 'kneel', 'sneak', 'chase', 'flee', 'idle', 'talk', 'walk', 'run', 'wave', 'hug', 'cheer', 'jump', 'facepalm', 'shrug', 'sad', 'cry', 'angry', 'laugh', 'think', 'type', 'phone', 'sleep', 'fall', 'point', 'sit', 'give', 'dance', 'wait', 'shock', 'love', 'tired', 'strong', 'lift', 'pray'];
const PROPS = ['money', 'pizza', 'heart', 'gift', 'box', 'chart_up', 'chart_down', 'trophy', 'calendar', 'coffee', 'bulb', 'rocket', 'plant', 'laptop', 'phone', 'confetti', 'light'];
const FX = ['punch', 'thud', 'fall', 'zip', 'gasp', 'laughs', 'sneak', 'pop', 'boing', 'ding', 'whoosh', 'scratch', 'applause', 'cash', 'sad', 'drum', 'type', 'heart', 'alarm', 'laugh', 'notif'];
const ENVS = ['oficina', 'casa', 'parque', 'cafe', 'ciudad', 'playa', 'cocina', 'iglesia'];
const THEME_EN = { amistad: 'friendship', matrimonio: 'marriage', trabajo: 'work and jobs', emprendimiento: 'starting a small business', familia: 'family', dinero: 'money, prices and the economy', habitos: 'habits and health', redes: 'social media', fe: 'faith and God' };

// Precios aproximados (USD) para el estimado
export const PRICE = { trends: 0.03, write: 0.01 };

async function apiError(res) {
  let msg = ''; try { const j = await res.json(); msg = (j.error && j.error.message) || ''; } catch { /* sin json */ }
  const e = new Error(res.status === 401 ? 'OpenAI: la clave no es válida (401).' : res.status === 429 ? 'OpenAI: sin saldo o demasiadas peticiones. ' + msg : `OpenAI (${res.status}): ${msg}`);
  e.status = res.status; e.raw = msg; return e;
}

function extractJSON(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('La IA no devolvió un guion válido. Inténtalo otra vez.');
  return JSON.parse(text.slice(a, b + 1));
}

function responseText(j) {
  if (j.output_text) return j.output_text;
  const parts = [];
  for (const o of j.output || []) for (const c of o.content || []) if (c.text) parts.push(c.text);
  return parts.join('\n');
}

async function responses(apiKey, body) {
  const res = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw await apiError(res);
  return res.json();
}

// Prueba modelos del más nuevo al más antiguo, por si la cuenta no tiene alguno
async function withModels(models, fn) {
  let last;
  for (const m of models) {
    try { return await fn(m); } catch (e) { last = e; if (e.status === 401 || (e.status === 429 && !/model/i.test(e.raw || ''))) throw e; if (!(e.status === 400 || e.status === 404 || e.status === 403)) throw e; }
  }
  throw last;
}

// 1) Tendencias: búsqueda real en internet (herramienta web_search de OpenAI)
export async function searchTrends(apiKey, { lang, theme }) {
  const topic = THEME_EN[theme] || theme;
  const prompt = lang === 'es'
    ? `Busca en internet qué está VIRAL o dando de qué hablar ESTA SEMANA (fecha de hoy) en TikTok, Facebook, Instagram Reels y YouTube Shorts entre latinos en Estados Unidos (sobre todo Miami) y en Latinoamérica, relacionado con: vida diaria, trabajo, dinero, precios, inflación, economía y "${topic}". Busca memes, quejas populares, frases de moda, noticias que la gente comenta (precio de los huevos, renta, gasolina, propinas, etc.). Devuelve SOLO JSON: {"trends":[{"title":"frase corta (máx 8 palabras)","summary":"qué es y por qué la gente lo comenta (máx 25 palabras)"}]} con 6 tendencias concretas y actuales, sin inventar.`
    : `Search the web for what is VIRAL or trending THIS WEEK (today's date) on TikTok, Facebook, Instagram Reels and YouTube Shorts in the US, related to everyday life, work, money, prices, inflation, the economy and "${topic}". Look for memes, popular complaints, trending phrases and news people are talking about. Return ONLY JSON: {"trends":[{"title":"short phrase (max 8 words)","summary":"what it is and why people talk about it (max 25 words)"}]} with 6 concrete, current trends. Do not invent.`;
  const j = await withModels(['gpt-5-mini', 'gpt-4.1-mini', 'gpt-4o-mini'], async model => {
    try { return await responses(apiKey, { model, tools: [{ type: 'web_search' }], input: prompt }); }
    catch (e) { if (e.status === 400) return responses(apiKey, { model, tools: [{ type: 'web_search_preview' }], input: prompt }); throw e; }
  });
  const data = extractJSON(responseText(j));
  return (data.trends || []).filter(t => t && t.title).slice(0, 6);
}

// 2) Escribir 3 historias nuevas en el formato de la app
const SHOTS = ['wide', 'two', 'single:A', 'single:B', 'close:A', 'close:B', 'close:C'];
const PROPS2 = ['alarm', 'money', 'wallet', 'coffee', 'phone', 'laptop', 'heart', 'pizza', 'box', 'banana', 'chart_down', 'chart_up', 'trophy', 'calendar', 'bulb', 'plant', 'bus:arrive', 'bus:leave', 'bus:full', 'bus:splash', 'bus:stuck', 'bus:car'];
const SFX2 = ['steps', 'horn', 'punch', 'thud', 'fall', 'crash', 'zip', 'gasp', 'laughs', 'uf', 'boing', 'pop', 'ding', 'cash', 'alarm', 'tick', 'sneak', 'splash', 'scratch', 'drum', 'sad', 'aww', 'notif', 'type', 'whoosh'];
const ENV2 = ['casa', 'ciudad', 'oficina', 'cafe', 'parque', 'cocina', 'playa'];

// Escribe 3 historias de comedia muda (sin diálogos ni textos), al estilo del cine mudo clásico
export async function writeIdeas(apiKey, { theme, themeName, trend, nChars, dur }) {
  const n = dur === 's' ? 9 : dur === 'm' ? 13 : 17;
  const roles = ['A', 'B', 'C', 'D'].slice(0, nChars);
  const sys = `Eres un guionista genial de comedia física muda, al estilo del cine mudo clásico y del humor de un hombre torpe que no habla (sin copiar personajes existentes). Escribes historias de muñequitos de palitos para videos verticales virales que se entienden en CUALQUIER país: NO hay diálogos, NO hay voces, NO hay textos ni carteles en pantalla. Todo se cuenta con acciones, gestos, caras exageradas, música y efectos de sonido.
Temas: la vida diaria de la gente trabajadora (el cansancio, el dinero que no alcanza, el trabajo, el jefe, la guagua o el autobús, el despertador).
Estructura: arranca con algo llamativo en el primer segundo; un plan sencillo; contratiempos que van creciendo (tropezones, confusiones, persecuciones, planes que salen mal, repetición con escalada); y un GIRO FINAL sorprendente que dé risa o ternura. Cada escena dura unos 2 segundos y SIEMPRE pasa algo nuevo. Humor limpio, sin violencia real.
Responde SOLO con JSON válido.`;
  const user = `Tema: ${themeName}. Idea o tendencia a usar (opcional): ${trend ? `"${trend}"` : '(ninguna)'}.
Personajes disponibles: ${roles.join(', ')} (A = protagonista torpe y adorable; B = su pareja o su jefe; C = un niño o un compañero).
Escribe 3 historias DISTINTAS con este formato exacto:
{"ideas":[{
 "title":"título corto (solo para la app, no sale en el video)",
 "desc":"de qué va, en una frase",
 "env":"uno de: ${ENV2.join(', ')}",
 "looks":{"B":"tie"},
 "scenes":[ exactamente ${n} escenas {"a":"acciones","p":"objeto o vacío","sfx":"efecto@segundo,efecto@segundo","shot":"plano","react":"quién reacciona en primer plano al final (ej. B:laugh) o vacío","dur":1.9,"env":"opcional, para cambiar de lugar","night":false,"key":true,"twist":false} ]
}]}
Reglas:
- "a": "A:accion B:accion" con acciones válidas: ${ACTIONS.join(', ')}, además de "lie" (acostado en la cama). Solo roles ${roles.join(', ')}.
- "p": ${PROPS2.join(', ')}, o "clock:H:MM" (reloj de pared con esa hora), o "".
- "sfx": efectos FUERTES y variados: ${SFX2.join(', ')}; el segundo indica cuándo suena (0 a 2).
- "shot": ${SHOTS.join(', ')}. Usa muchos "close:X" para las caras exageradas.
- "looks": opcional; "tie" (corbata, para el jefe), "hair" (pelo largo), "kid" (niño), "pajama" (pijama a rayas).
- Marca "twist":true en la escena del giro final (una de las últimas) y "key":true en las escenas imprescindibles (al menos la mitad).
- "dur" entre 1.5 y 2.5. "night":true si es de noche.`;
  const j = await withModels(['gpt-5-mini', 'gpt-4.1', 'gpt-4o'], model => responses(apiKey, { model, input: [{ role: 'system', content: sys }, { role: 'user', content: user }], text: { format: { type: 'json_object' } } }));
  const data = extractJSON(responseText(j));
  return (data.ideas || []).slice(0, 3).map((idea, k) => toStory(idea, k, roles)).filter(x => x.scenes.length >= 3);
}

function toStory(idea, k, roles) {
  const acts = [...ACTIONS, 'lie'];
  const cleanA = a => String(a || '').split(/\s+/).filter(tok => { const [r, act] = tok.split(':'); return (r === 'all' || roles.includes(r)) && acts.includes(act); }).join(' ') || 'A:idle';
  const cleanP = p => { p = String(p || ''); return PROPS2.includes(p) || /^clock:\d{1,2}:\d{2}$/.test(p) ? p : ''; };
  const cleanSfx = s => String(s || '').split(',').map(x => { const [nm, t] = x.trim().split('@'); return SFX2.includes(nm) ? [nm, Math.max(0, Math.min(2.4, +t || 0))] : null; }).filter(Boolean).slice(0, 4);
  const LOOKS = ['tie', 'hair', 'kid', 'pajama'];
  const looks = {}; Object.entries(idea.looks || {}).forEach(([r, l]) => { if (roles.includes(r) && LOOKS.includes(l)) looks[r] = l; });
  const scenes = (idea.scenes || []).map(sc => {
    sc = sc || {};
    const shot = SHOTS.includes(sc.shot) ? sc.shot : 'two';
    const react = /^[ABCD]:(laugh|shock|love|facepalm|cry|angry|think)$/.test(sc.react || '') && roles.includes(sc.react[0]) ? sc.react : null;
    return { a: cleanA(sc.a), p: cleanP(sc.p), sfx: cleanSfx(sc.sfx), shot, react, dur: Math.max(1.4, Math.min(2.6, +sc.dur || 1.9)), env: ENV2.includes(sc.env) ? sc.env : undefined, night: !!sc.night, key: !!sc.key, twist: !!sc.twist };
  });
  if (!scenes.some(x => x.twist) && scenes.length) scenes[scenes.length - 2 >= 0 ? scenes.length - 2 : 0].twist = true;
  if (scenes.filter(x => x.key).length < 4) scenes.forEach(x => { x.key = true; });
  return { id: 'ia' + k + Date.now().toString(36), ai: true, title: String(idea.title || 'Historia con IA').slice(0, 60), desc: String(idea.desc || '').slice(0, 140), env: ENV2.includes(idea.env) ? idea.env : 'casa', looks, scenes };
}

export { R };
