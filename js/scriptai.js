// Guionista con IA (OpenAI): busca lo que está viral y escribe historias en el estilo de la app.
const R = (es, en) => ({ es, en });

const ACTIONS = ['selfie', 'scroll', 'slip', 'faint', 'trip', 'kneel', 'sneak', 'chase', 'flee', 'idle', 'talk', 'walk', 'run', 'wave', 'hug', 'cheer', 'jump', 'facepalm', 'shrug', 'sad', 'cry', 'angry', 'laugh', 'think', 'type', 'phone', 'sleep', 'fall', 'point', 'sit', 'give', 'dance', 'wait', 'shock', 'love', 'tired', 'strong', 'lift', 'pray'];
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
// Escribe 3 historias habladas para jóvenes que pasan reels: gancho raro, humor limpio, giro final y mensaje que se comparte
export async function writeIdeas(apiKey, { lang, theme, themeName, trend, nChars, dur, genders = {} }) {
  const reps = dur === 's' ? 5 : dur === 'm' ? 8 : 11;
  const es = lang === 'es';
  const roles = ['A', 'B', 'C', 'D'].slice(0, nChars);
  const cast = roles.map(r => `${r} = ${genders[r] === 'f' ? (es ? 'muchacha' : 'girl') : (es ? 'muchacho' : 'guy')}`).join(', ');
  const voice = es
    ? `IDIOMA: español como se habla en la calle en Miami, con sabor cubano ("pa'", "asere", "qué volá", "tremendo", "brother", alguna palabra en inglés natural), fácil de entender para cualquier latino. Nada de frases de libro.`
    : `LANGUAGE: natural, casual American English like American teens and twenty-somethings talk today (light Gen Z slang is fine: "lowkey", "no way", "for real"). Never British, never formal.`;
  const sys = `Eres un guionista de videos virales de muñequitos de palitos (TikTok, Reels, Shorts) para ADOLESCENTES y JÓVENES que pasan reels sin parar. ${voice}
REGLAS:
- Sin nombres propios ni protagonista fijo: personajes genéricos que hablan y cuentan la historia.
- Primer segundo: algo raro o gracioso que obligue a detenerse.
- Humor limpio, sin groserías. Frases cortas (máx 9 palabras; el giro hasta 14).
- Historias reales de la vida joven: el móvil, los reels, las selfies, los likes, la familia, los estudios, el primer trabajo, la amistad. Incluye escenas con el teléfono (selfies, buscando, pasando reels) usando el objeto "pov:reels", "pov:selfie" o "pov:search" para mostrar la pantalla en primera persona.
- Además del humor, historias de RESILIENCIA y SUPERACIÓN (ej.: un hermano mayor que dejó de ser esclavo del teléfono ayuda a su hermanito).
- La historia crece hasta un GIRO FINAL que sorprenda y den ganas de volver a verlo, y termina con una REFLEXIÓN esperanzadora que la gente quiera mandarle a un amigo.
Responde SOLO con JSON válido.`;
  const user = `Tema: ${themeName}. Tendencia o idea del momento: ${trend ? `"${trend}"` : '(ninguna)'}.
Personajes: ${cast}.
Escribe 3 historias DISTINTAS con este formato exacto:
{"ideas":[{
 "title":"título corto (máx 6 palabras)",
 "env":"uno de: ${ENVS.join(', ')}",
 "hookAct":"acción rara o graciosa del primer segundo, ej. 'A:slip' o 'A:scroll'",
 "hooks":["3 ganchos distintos de máx 10 palabras"],
 "setup":{"w":"A","t":"línea","a":"A:talk B:shrug","p":"","fx":"pop","r":"shock"},
 "reps":[ exactamente ${reps} objetos {"w":"quién habla (${roles.join(', ')})","t":"línea","a":"acciones","p":"objeto","fx":"efecto","r":"reacción del que escucha: laugh, shock, facepalm, love o cry"} ],
 "twist":{"w":"A","t":"giro final","a":"...","p":"...","fx":"scratch","r":"shock"},
 "after":{"t":"remate corto","a":"...","p":"","fx":"laugh"},
 "reflect":["frase esperanzadora corta","segunda frase corta que deje pensando"],
 "question":"pregunta final corta para que comenten"
}]}
- "a": "A:accion B:accion" o "all:accion"; acciones válidas: ${ACTIONS.join(', ')}. Solo roles ${roles.join(', ')}.
- "p": ${PROPS.join(', ')}, pov:reels, pov:selfie, pov:search, "clock:H:MM" o "".
- "fx": efectos variados: ${FX.join(', ')}.`;
  const j = await withModels(['gpt-5-mini', 'gpt-4.1', 'gpt-4o'], model => responses(apiKey, { model, input: [{ role: 'system', content: sys }, { role: 'user', content: user }], text: { format: { type: 'json_object' } } }));
  const data = extractJSON(responseText(j));
  return (data.ideas || []).slice(0, 3).map((idea, k) => toSituation(idea, k, nChars)).filter(x => x.reps.length >= 2);
}

function toSituation(idea, k, nChars) {
  const roles = ['A', 'B', 'C', 'D'].slice(0, nChars);
  const REACTS = ['laugh', 'shock', 'facepalm', 'love', 'cry'];
  const cleanA = a => String(a || '').split(/\s+/).filter(tok => { const [r, act] = tok.split(':'); return (r === 'all' || roles.includes(r)) && ACTIONS.includes(act); }).join(' ') || 'A:talk';
  const cleanP = p => { p = String(p || ''); return PROPS.includes(p) || /^pov:(reels|selfie|search)$/.test(p) || /^clock:\d{1,2}:\d{2}$/.test(p) ? p : ''; };
  const both = t => ({ es: String(t || '').trim(), en: String(t || '').trim() });
  const mk = o => ({ t: both(o && o.t), a: cleanA(o && o.a), p: cleanP(o && o.p), fx: FX.includes(o && o.fx) ? o.fx : 'pop', w: o && roles.includes(o.w) ? o.w : undefined, r: o && REACTS.includes(o.r) ? o.r : undefined, core: false });
  const hooks = (idea.hooks || []).filter(Boolean).slice(0, 3).map(both);
  const hookAct = cleanA(idea.hookAct);
  return {
    id: 'ia' + k + Date.now().toString(36), ai: true, mode: 'esc', env: ENVS.includes(idea.env) ? idea.env : 'casa', hookAct,
    title: both(idea.title), hook: hooks[0] || both(idea.title), hooks,
    setup: [mk(idea.setup)], reps: (idea.reps || []).filter(r => r && r.t).map(mk), twist: mk(idea.twist),
    after: idea.after && idea.after.t ? mk(idea.after) : undefined,
    reflect: (idea.reflect || []).slice(0, 2).map(both).concat([both('')]).slice(0, 2), question: idea.question ? both(idea.question) : null,
  };
}

export { R };
