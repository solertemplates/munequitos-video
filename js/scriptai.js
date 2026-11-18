// Guionista con IA (OpenAI): busca lo que está viral y escribe historias en el estilo de la app.
const R = (es, en) => ({ es, en });

const ACTIONS = ['idle', 'talk', 'walk', 'run', 'wave', 'hug', 'cheer', 'jump', 'facepalm', 'shrug', 'sad', 'cry', 'angry', 'laugh', 'think', 'type', 'phone', 'sleep', 'fall', 'point', 'sit', 'give', 'dance', 'wait', 'shock', 'love', 'tired', 'strong', 'lift', 'pray'];
const PROPS = ['money', 'pizza', 'heart', 'gift', 'box', 'chart_up', 'chart_down', 'trophy', 'calendar', 'coffee', 'bulb', 'rocket', 'plant', 'laptop', 'phone', 'confetti', 'light'];
const FX = ['pop', 'boing', 'ding', 'whoosh', 'scratch', 'applause', 'cash', 'sad', 'drum', 'type', 'heart', 'alarm', 'laugh', 'notif'];
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
export async function writeIdeas(apiKey, { lang, theme, themeName, trend, nChars, dur }) {
  const reps = dur === 's' ? 4 : dur === 'm' ? 7 : 9;
  const es = lang === 'es';
  const voice = es
    ? `IDIOMA Y TONO: español como se habla en la calle en Miami: sabor cubano y de los latinos de Estados Unidos, fácil de entender para cualquier latino. Mete alguna palabra en inglés de forma natural (el rent, el bill, chequear, parquear, el mall, el weekend, full, brother, nice, sorry, my God). Expresiones permitidas con moderación: asere, qué volá, tremendo, candela, pa', na', mijo/mija, ahorita, dale. NADA de frases de libro ni que suenen a traducción.`
    : `LANGUAGE AND TONE: natural, casual American English, the way people actually talk. No textbook phrasing.`;
  const sys = `Eres un guionista top de videos virales de muñequitos de palitos (Shorts, Reels, TikTok) con millones de vistas. ${voice}
HUMOR: chistes que den risa DE VERDAD: picardía, exageración, sarcasmo cariñoso, situaciones con las que todo el mundo se identifica. Picante pero LIMPIO: sin groserías, sin insultos, sin doble sentido sexual, sin burlarse de grupos.
RITMO: cada línea es un golpe nuevo (sorpresa, chiste, exageración o cambio de lugar) y la situación CRECE hasta el giro final. Pon una mini-sorpresa a la mitad. Cero relleno. Líneas de máximo 10 palabras (el giro puede tener hasta 16).
FINAL: un giro sorprendente y después una reflexión corta que emocione, sin cursilería (2 frases, máx 12 palabras cada una). NO pongas llamado a la acción (la app lo agrega).
Responde SOLO con JSON válido.`;
  const user = `Tema: ${themeName}. Tendencia o noticia del momento para usar en la historia: ${trend ? `"${trend}"` : '(ninguna: usa algo actual de la vida diaria, precios o trabajo)'}.
Personajes: ${nChars} (roles A, B, C, D; A es el protagonista y narra).
Escribe 3 historias DISTINTAS. Usa estructuras variadas: "esc" (repetición que sube + giro) o "caminos" (alegoría de dos caminos con letreros).
Formato exacto:
{"ideas":[{
 "title":"título corto y llamativo",
 "mode":"esc" o "caminos",
 "env":"uno de: ${ENVS.join(', ')}",
 "hooks":["3 ganchos distintos para los primeros 2 segundos, máx 10 palabras, que obliguen a quedarse"],
 "setup":{"t":"línea","a":"A:talk B:shrug","p":"","fx":"pop"},
 "reps":[ exactamente ${reps} objetos {"t":"línea","a":"acciones","p":"objeto","fx":"efecto"${''}} ],
 "twist":{"t":"giro final","a":"...","p":"...","fx":"scratch"},
 "after":{"t":"remate corto y gracioso después del giro","a":"...","p":"","fx":"laugh"},
 "reflect":["frase 1","frase 2"],
 "signs":["letrero izquierdo","letrero derecho"]  (solo si mode es "caminos": camino malo a la izquierda, bueno a la derecha; en "caminos" cada rep lleva además "side":"left" o "right", alternando)
}]}
Reglas de los campos:
- "a": acciones de los personajes con el formato "A:accion B:accion" o "all:accion". Acciones válidas: ${ACTIONS.join(', ')}. Solo roles que existan (${['A', 'B', 'C', 'D'].slice(0, nChars).join(', ')}).
- "p": objeto grande que aparece en pantalla (o ""): ${PROPS.join(', ')}, o "clock:H:MM" para mostrar una hora.
- "fx": efecto de sonido, VARÍALOS: ${FX.join(', ')}.
- Cambia la acción en cada línea para que haya movimiento constante.`;
  const j = await withModels(['gpt-5-mini', 'gpt-4.1', 'gpt-4o'], model => responses(apiKey, { model, input: [{ role: 'system', content: sys }, { role: 'user', content: user }], text: { format: { type: 'json_object' } } }));
  const data = extractJSON(responseText(j));
  return (data.ideas || []).slice(0, 3).map((idea, k) => toSituation(idea, k, lang, nChars));
}

// Convierte la respuesta de la IA en una "situación" de la app, validando todo
function toSituation(idea, k, lang, nChars) {
  const roles = ['A', 'B', 'C', 'D'].slice(0, nChars);
  const cleanA = a => String(a || '').split(/\s+/).filter(tok => { const [r, act] = tok.split(':'); return (r === 'all' || roles.includes(r)) && ACTIONS.includes(act); }).join(' ') || 'A:talk';
  const cleanP = p => { p = String(p || ''); return PROPS.includes(p) || /^clock:\d{1,2}:\d{2}$/.test(p) ? p : ''; };
  const cleanFx = fx => (FX.includes(fx) ? fx : 'pop');
  const both = t => ({ es: String(t || '').trim(), en: String(t || '').trim() });
  const mk = (o, extra = {}) => ({ t: both(o && o.t), a: cleanA(o && o.a), p: cleanP(o && o.p), fx: cleanFx(o && o.fx), core: false, ...extra });
  const caminos = idea.mode === 'caminos' && Array.isArray(idea.signs) && idea.signs.length >= 2;
  const env = caminos ? 'caminos' : (ENVS.includes(idea.env) ? idea.env : 'casa');
  const setup = mk(idea.setup);
  if (caminos) { const sg = idea.signs.map(s => String(s).slice(0, 22)); setup.p = `sign:${sg[0]}|${sg[1]}|${sg[0]}|${sg[1]}`; }
  const reps = (idea.reps || []).filter(r => r && r.t).map(r => { const o = mk(r, { core: caminos }); if (caminos) o.p = r.side === 'left' ? 'left' : 'right'; return o; });
  const hooks = (idea.hooks || []).filter(Boolean).slice(0, 3).map(both);
  return {
    id: 'ia' + k + Date.now().toString(36), ai: true, env, mode: caminos ? 'caminos' : 'esc',
    title: both(idea.title), hook: hooks[0] || both(idea.title), hooks,
    setup: [setup], reps, twist: mk(idea.twist), after: idea.after && idea.after.t ? mk(idea.after) : undefined,
    reflect: (idea.reflect || []).slice(0, 2).map(both),
  };
}

export { R };
