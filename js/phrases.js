// Banco de frases de René Soler Rasua: frases, reflexiones e ideas propias, guardadas solo en este teléfono.
// La IA las lee para escribir cada historia con su forma de pensar, y a veces una va tal cual como reflexión final.
export const AUTHOR = 'René Soler Rasua';
const KEY = 'munequitos-frases';

const W = src => new RegExp('(?<![\\p{L}\\p{N}])(?:' + src + ')', 'iu');
// pistas para adivinar el tema (ids de THEMES en content.js)
const HINTS = {
  fe: W('dios|fe\\b|jes[uú]s|cristo|oraci|orar|rez|biblia|iglesia|bendic|esp[ií]ritu|cielo|milagro|god|faith|pray|bless|church|jesus|lord|se[ñn]or'),
  familia: W('familia|hij[oa]s?|padre|madre|mam[aá]|pap[aá]|abuel|herman|hogar|casa\\b|family|kids|children|mother|father|mom|dad|home'),
  matrimonio: W('matrimonio|espos[oa]|pareja|marido|mujer\\b|novi[oa]|amor\\b|casad|boda|marriage|wife|husband|spouse|partner|wedding'),
  dinero: W('dinero|plata|ahorr|invert|inversi|deuda|rico|riqueza|pobre|gast|presupuesto|finanz|activo|pasivo|money|save|saving|invest|debt|rich|wealth|poor|spend|budget|financ|asset'),
  emprendimiento: W('negocio|emprend|empresa|cliente|vender|ventas|idea\\b|socio|business|entrepreneur|startup|customer|sell|sales'),
  trabajo: W('trabajo|jefe|empleo|oficina|carrera|profesi|liderazgo|l[ií]der|equipo|work|job|boss|career|office|leader|team'),
  trabajador: W('obrero|turno|sueldo|quincena|cansad|madrugar|horas extra|paycheck|shift|overtime|blue.collar'),
  habitos: W('h[aá]bito|disciplina|rutina|constan|levantarse temprano|ejercicio|salud|tiempo\\b|metas?\\b|habit|discipline|routine|consisten|health|goal'),
  amistad: W('amig|amistad|lealtad|leal\\b|friend|loyal'),
  redes: W('redes|likes?|instagram|tiktok|tel[eé]fono|celular|pantalla|social media|phone|screen|followers'),
  superacion: W('super|levant|ca[ií]da|caer|fracas|rend|lucha|sue[ñn]o|meta|crecer|vencer|valent|miedo|esperanza|never give up|fail|rise|dream|grow|fear|hope|overcome|courage'),
};
export function guessTheme(text) {
  let best = 'superacion', score = 0;
  for (const [th, re] of Object.entries(HINTS)) { const m = (text.match(new RegExp(re.source, 'giu')) || []).length; if (m > score) { score = m; best = th; } }
  return best;
}
export const guessLang = t => (/[ñáéíóú¿¡]|\b(el|la|los|las|que|de|y|no|es|tu|mi|para|con|una?)\b/i.test(t) ? 'es' : 'en');

export function loadPhrases() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
function savePhrases(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* sin espacio */ } }
const clean = t => String(t || '').replace(/^\s*[-•*·\d]+[.)-]?\s+/, '').replace(/\s+/g, ' ').trim();

// Pega una o muchas de golpe: una por línea (o separadas por líneas en blanco)
export function addPhrases(raw, theme = 'auto') {
  const list = loadPhrases(); const have = new Set(list.map(p => p.text.toLowerCase()));
  const parts = String(raw).split(/\n+/).map(clean).filter(t => t.length >= 4);
  const added = [];
  for (const text of parts) {
    if (have.has(text.toLowerCase())) continue; have.add(text.toLowerCase());
    const auto = theme === 'auto';
    const p = { id: 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, theme: auto ? guessTheme(text) : theme, auto, lang: guessLang(text), used: 0, at: Date.now() };
    list.push(p); added.push(p);
  }
  savePhrases(list); return added;
}
export function updatePhrase(id, patch) {
  const list = loadPhrases(); const p = list.find(x => x.id === id); if (!p) return;
  if (patch.text != null) { p.text = clean(patch.text); p.lang = guessLang(p.text); if (p.auto) p.theme = guessTheme(p.text); }
  if (patch.theme) { p.theme = patch.theme === 'auto' ? guessTheme(p.text) : patch.theme; p.auto = patch.theme === 'auto'; }
  if (patch.used != null) p.used = patch.used;
  savePhrases(list);
}
export function deletePhrase(id) { savePhrases(loadPhrases().filter(x => x.id !== id)); }

// Frases para la IA: primero las del tema elegido, luego algunas generales (su visión de fondo)
export function phrasesFor(theme, max = 30) {
  const all = loadPhrases(); const mine = all.filter(p => p.theme === theme); const rest = all.filter(p => p.theme !== theme);
  return [...mine.slice(-max), ...rest.slice(-Math.max(0, Math.min(10, max - mine.length)))].map(p => p.text);
}
// Una frase suya, tal cual, para la reflexión final (la menos usada del tema; corta para que se lea bien)
export function pickFinalPhrase(theme, lang, maxWords = 22) {
  const ok = p => p.lang === lang && p.text.split(/\s+/).length <= maxWords;
  let pool = loadPhrases().filter(p => p.theme === theme && ok(p));
  if (!pool.length) return null;
  const minUsed = Math.min(...pool.map(p => p.used || 0)); pool = pool.filter(p => (p.used || 0) === minUsed);
  const p = pool[Math.floor(Math.random() * pool.length)];
  updatePhrase(p.id, { used: (p.used || 0) + 1 });
  return p.text;
}

// Instrucciones para la IA: la visión del autor manda; los oradores solo inspiran ideas, con palabras nuevas
export function visionPrompt(theme, lang) {
  const list = phrasesFor(theme);
  const mine = list.length
    ? `VISIÓN DEL AUTOR (PRIORIDAD MÁXIMA): estas son frases, reflexiones e ideas de ${AUTHOR}, el creador de estos videos. La historia, el giro y la reflexión deben salir de SU forma de pensar y SU visión, por encima de cualquier tendencia. Puedes usar alguna frase suya tal cual como reflexión final, o adaptarla a las palabras de los muñequitos sin cambiar su sentido:\n${list.map(t => `- ${t}`).join('\n')}\n`
    : `VISIÓN DEL AUTOR: escribe con la visión de ${AUTHOR}: fe, familia, trabajo duro, superación personal, responsabilidad con el dinero y esperanza.\n`;
  return mine + `INSPIRACIÓN DE GRANDES ORADORES (secundaria): puedes inspirarte en las IDEAS de oradores de superación, finanzas, familia y liderazgo como Brian Tracy, Robert Kiyosaki, Margarita Pasos, Yokoi Kenji, John C. Maxwell, Jim Rohn, Zig Ziglar o Les Brown. NUNCA copies sus frases exactas ni los nombres: toma la idea y escríbela con palabras nuevas, al estilo del autor y en la boca de los muñequitos (${lang === 'es' ? 'español de Miami' : 'casual American English'}). Si una idea de un orador choca con la visión del autor, manda la del autor.\n`;
}
