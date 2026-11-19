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
export async function writeIdeas(apiKey, { lang, theme, themeName, trend, nChars, dur, hero, heroBio }) {
  const nScenes = dur === 's' ? 5 : dur === 'm' ? 7 : 9;
  const es = lang === 'es';
  const name = (hero || '').trim() || (es ? 'el protagonista' : 'the hero');
  const voice = es
    ? `IDIOMA: español de la calle en Miami (sabor cubano y latino de EE. UU.), fácil para cualquier latino, con alguna palabra en inglés natural (el rent, los bills, el jefe, el weekend, full, brother). Nada de frases de libro.`
    : `LANGUAGE: natural, casual American English.`;
  const sys = `Eres el guionista de una serie viral de muñequitos de palitos (TikTok, Reels, Shorts) con millones de vistas. ${voice}
PROTAGONISTA FIJO (rol A, sale en todos los episodios): ${name}. Personalidad: ${heroBio || 'trabajador, siempre cansado y sin dinero, pero optimista y chistoso'}. La gente debe encariñarse con él.
TEMAS PRIORITARIOS: la vida de la gente trabajadora: el sueldo que no alcanza, las deudas, la renta, los bills, el cansancio, el jefe, salir de noche al trabajo y volver muerto, los precios. Situaciones TAN reales que la gente diga "este eres tú" y etiquete a un amigo o a su pareja.
CÓMO SE CUENTA: casi SIN PALABRAS. La historia la cuentan las acciones, las caras, los carteles de tiempo ("6:00 AM", "DÍA 15", "VIERNES", "3 HORAS DESPUÉS") y los efectos de sonido. El protagonista NO narra lo que hace (prohibido "ahora voy al trabajo"). Como mucho una frase corta y graciosa (máx 6 palabras) cada 2 o 3 escenas; puede decirla otro personaje.
HUMOR: picante pero limpio, sin groserías. Cada escena trae algo nuevo (sorpresa, exageración, golpe) y todo crece hasta un giro final que dé risa o toque el corazón.
Responde SOLO con JSON válido.`;
  const user = `Tema: ${themeName}. Tendencia o noticia del momento para usar: ${trend ? `"${trend}"` : '(ninguna: usa algo de la vida diaria del trabajador)'}.
Personajes: ${nChars} (roles ${['A', 'B', 'C', 'D'].slice(0, nChars).join(', ')}; A = ${name}).
Escribe 3 episodios DISTINTOS. Formato exacto:
{"ideas":[{
 "title":"título corto",
 "env":"uno de: ${ENVS.join(', ')}",
 "hooks":["3 ganchos para los primeros 2 segundos, máx 10 palabras, estilo 'POV: …' o 'Este eres tú cuando…' o 'Etiqueta a…'"],
 "scenes":[ exactamente ${nScenes} escenas {"card":"cartel de tiempo corto (máx 18 caracteres)","a":"acciones","p":"objeto","fx":"efecto","o":"onomatopeya o texto corto de cómic (máx 16 caracteres) o vacío","q":"frase corta hablada o vacío","w":"quién dice la frase (A, B…)","r":"reacción del otro: laugh, shock, facepalm, love o cry"} ],
 "twist":{"card":"...","a":"...","p":"...","fx":"scratch","o":"...","q":"frase del giro (máx 10 palabras) o vacío","w":"A"},
 "reflect":["frase corta que toque el corazón","segunda frase corta"],
 "question":"pregunta final corta para que comenten, como '¿A ti también te pasa?'"
}]}
Reglas: "a" con formato "A:accion B:accion" o "all:accion"; acciones válidas: ${ACTIONS.join(', ')}. "p": ${PROPS.join(', ')}, "clock:H:MM" o "". "fx" (VARÍALOS, que suenen fuerte): ${FX.join(', ')}. Al menos 2 de cada 3 escenas SIN frase ("q":""). Cambia la acción en cada escena.`;
  const j = await withModels(['gpt-5-mini', 'gpt-4.1', 'gpt-4o'], model => responses(apiKey, { model, input: [{ role: 'system', content: sys }, { role: 'user', content: user }], text: { format: { type: 'json_object' } } }));
  const data = extractJSON(responseText(j));
  return (data.ideas || []).slice(0, 3).map((idea, k) => toSituation(idea, k, lang, nChars));
}

// Convierte la respuesta de la IA en un episodio (historia casi muda) de la app, validando todo
function toSituation(idea, k, lang, nChars) {
  const roles = ['A', 'B', 'C', 'D'].slice(0, nChars);
  const REACTS = ['laugh', 'shock', 'facepalm', 'love', 'cry'];
  const cleanA = a => String(a || '').split(/\s+/).filter(tok => { const [r, act] = tok.split(':'); return (r === 'all' || roles.includes(r)) && ACTIONS.includes(act); }).join(' ') || 'A:idle';
  const cleanP = p => { p = String(p || ''); return PROPS.includes(p) || /^clock:\d{1,2}:\d{2}$/.test(p) ? p : ''; };
  const both = t => ({ es: String(t || '').trim(), en: String(t || '').trim() });
  const scene = o => {
    o = o || {}; const q = String(o.q || '').trim(); const on = String(o.o || '').trim().slice(0, 18); const card = String(o.card || '').trim().slice(0, 20);
    return { card: card ? both(card) : null, a: cleanA(o.a), p: cleanP(o.p), fx: FX.includes(o.fx) ? o.fx : 'pop', o: on ? both(on) : null, q: q ? both(q) : null, w: roles.includes(o.w) ? o.w : 'A', r: REACTS.includes(o.r) ? o.r : null };
  };
  const hooks = (idea.hooks || []).filter(Boolean).slice(0, 3).map(both);
  return {
    id: 'ia' + k + Date.now().toString(36), ai: true, silent: true, mode: 'mudo', env: ENVS.includes(idea.env) ? idea.env : 'casa',
    title: both(idea.title), hook: hooks[0] || both(idea.title), hooks,
    scenes: (idea.scenes || []).map(scene).filter(x => x.card || x.q || x.o), twist: scene(idea.twist),
    reflect: (idea.reflect || []).slice(0, 2).map(both), question: idea.question ? both(idea.question) : null,
  };
}

export { R };
