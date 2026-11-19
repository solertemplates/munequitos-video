import { THEMES, ENVIRONMENTS, SITUATIONS, hookOptions, ctaOptions, combineCtas, fillCta, questionOptions } from './content.js';
import { DURATIONS, buildBeats, timeBeats, speakable, toSRT } from './script.js';
import { drawFrame, prepareProject, FONT, LOOKS } from './render.js';
import { IMAGE_MODELS, generateBackgrounds, planBackgrounds, imagePrice } from './aiimages.js';
import { searchTrends, writeIdeas, PRICE } from './scriptai.js';
import { computeLip } from './lipsync.js';
import { renderMix, MUSIC_STYLES } from './audio.js';
import { VOICES, synth, ELEVEN_DEFAULT_VOICES, OPENAI_VOICES, elevenVoices, voiceForRole } from './tts.js';
import { planDirection, planShots, insertActions } from './direction.js';
import { exportMP4 } from './export.js';

const $ = s => document.querySelector(s);
const I18N = {
  es: {
    title: 'Muñequitos Video', subtitle: 'Videos cortos de reflexión con muñequitos de palitos',
    s1: 'Tema', s2: 'Personajes, entorno y estilo', chars: 'Personajes', style: 'Estilo', env: 'Entorno', s3: 'Duración',
    durHint: 'La app ajusta el ritmo y la cantidad de escenas al rango elegido.', s4: 'Situación cotidiana', s5: 'Gancho inicial',
    s6: 'Llamado a la acción', other: 'Otras opciones', ctaCfg: 'Configurar página y enlace', pageName: 'Nombre de tu página (aparece en el video)',
    linkUrl: 'Enlace (URL)', linkLabel: 'Texto del botón del enlace', s7: 'Voz, música y efectos', voice: 'Voz automática',
    voiceHint: 'La voz neural se descarga una sola vez (≈60 MB) y queda guardada en el navegador.', music: 'Música', musicVol: 'Volumen música',
    sfx: 'Efectos de sonido', generate: 'Generar vista previa', regenerate: 'Regenerar vista previa', empty: 'Elige tus opciones y pulsa «Generar vista previa».',
    export: 'Exportar MP4', srt: 'Subtítulos .srt', cancel: 'Cancelar', script: 'Guion (puedes editarlo)', apply: 'Aplicar cambios',
    foot: 'Todo se genera en tu navegador. Formato vertical 1080×1920 para Shorts, Reels y Facebook.',
    color: 'Color', bw: 'B/N', escalada: 'Repetición + giro', caminos: 'Dos caminos',
    ctaTypes: { like: 'Me gusta', follow: 'Seguir', stars: 'Estrellas', link: 'Enlace', combo: 'Combo' },
    kinds: { act: 'Acción (sin voz)', hook: 'Gancho', setup: 'Inicio', rep: 'Repetición', twist: 'Giro final', after: 'Remate', reflect: 'Reflexión', cta: 'Llamado a la acción' },
    vPiper: 'Voz neural', vMe: 'Voz básica sin conexión (robótica)', vNone: 'Sin voz (solo subtítulos)', seriesOn: '⭐ Protagonista fijo de la serie (sale en todos los videos)', seriesName: 'Nombre', seriesBio: 'Personalidad (la usa la IA al escribir)', qLbl: 'Pregunta final en pantalla (para que comenten)', actionOn: '🎬 Más acción, menos diálogo', actionHint: 'Menos frases habladas y más comedia física: resbalones, desmayos, persecuciones y huidas, con golpes de sonido y letras de cómic.', s8: 'Fondos con IA', aiOn: 'Usar fondos dibujados con IA (OpenAI)', aiIntro: 'La IA dibuja escenarios detallados (casas, calles, oficina, iglesia…) y la app anima encima a los muñequitos: hablan, parpadean, gesticulan y caminan.', appSits: 'Historias de la app', trendLbl: 'Tendencia del momento (opcional)', trendPh: 'Ej.: el precio de los huevos, la renta en Miami, las propinas', trendBtn: '🔎 Buscar lo viral ahora', writeBtn: '✨ Escribir 3 historias con IA', writerHint: 'Usa tu clave de OpenAI (pégala en la sección 8). La IA busca en internet lo que está viral y escribe historias con humor, a lo Miami.', searching: 'Buscando lo que está viral ahora…', writing: 'Escribiendo 3 historias nuevas…', trendsFound: n => `Encontré ${n} tendencias. Toca una para usarla.`, written: 'Listo: 3 historias nuevas escritas con IA (marcadas «IA»). Elige una.', noTrends: 'No encontré tendencias ahora; escribe una tú arriba.', needKeyAI: 'Primero pega tu clave de OpenAI en la sección 8.', costTitle: 'Costo aproximado de este video:', cTrends: 'búsqueda de tendencias', cWrite: 'guion con IA', cBg: n => `${n} fondos con IA`, cVoice: 'voz OpenAI', cEleven: 'voz ElevenLabs (créditos de tu plan)', costFree: 'Este video no tiene costo (todo se genera en tu teléfono).', keyNote: 'Tu clave de OpenAI sirve para los fondos, la voz de OpenAI y las historias con IA.', iaTag: 'IA', aiModel: 'Modelo', aiQuality: 'Calidad', aiConsistent: 'Mantener los mismos personajes en todas las escenas', qLow: 'Baja (rápida)', qMedium: 'Media (recomendada)', qHigh: 'Alta (cara)', aiHintTxt: (n, c) => `Cada video usa 2–3 fondos (≈ ${c} USD con esta calidad), cobrados de tu saldo de OpenAI. Tarda 1–2 minutos; deja la pantalla encendida. Esta misma clave sirve para la voz de OpenAI y para escribir historias con IA. Si OpenAI pide «verificar la organización», hazlo en platform.openai.com → Settings → Organization.`, stImg: (i, n) => `Dibujando fondos con IA ${i}/${n}… (1–2 minutos)`, imgFail: 'No se pudieron crear los fondos con IA; se usaron los fondos de la app. Motivo: ', imgSome: n => `${n} fondo(s) no se pudieron crear y se usaron los de la app.`, gFree: 'Gratis (en el navegador)', gEleven: 'ElevenLabs · muy natural (gratis 10 min/mes, requiere clave)', gOpenai: 'OpenAI · natural (de pago, requiere clave)', loadVoices: 'Cargar mis voces', ctaHint: 'Toca uno o dos (se combinan en una sola frase).', hintPiper: 'Gratis. Se descarga una sola vez (≈60 MB, usa Wi‑Fi) y queda guardada en el navegador. Suena aceptable, menos natural que ElevenLabs.', hintMe: 'Robótica. Solo úsala si no tienes internet.', hintNone: 'El video tendrá música, efectos y subtítulos, sin voz.', keyEleven: 'Tu clave de ElevenLabs (API key)', keyOpenai: 'Tu clave de OpenAI (API key)', cloudEleven: 'Se guarda solo en este teléfono. Plan gratis: unos 10 minutos de voz al mes (≈15 videos de 40 s), sin uso comercial. Para monetizar: plan Starter (≈5 USD/mes). Crea tu clave en <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener">elevenlabs.io → API Keys</a>.', cloudOpenai: 'Se guarda solo en este teléfono. Es de pago por uso (unos centavos por video) y necesitas saldo cargado. Crea tu clave en <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com → API keys</a>.', voicesLoaded: n => `Se cargaron ${n} voces de tu cuenta.`, needKey: 'Primero pega tu clave.', cloudFallback: 'No se pudo usar la voz de la nube; se usó la voz neural gratuita.', ctaBadge: n => `${n}º`,
    stVoice: (i, n) => `Generando voz ${i}/${n}…`, stDl: (p) => `Descargando voz neural… ${p}`, stMix: 'Mezclando música y efectos…',
    stReady: (s, n) => `Listo: ${s.toFixed(1)} s · ${n} escenas. Revisa la vista previa y exporta.`, stFallback: 'No se pudo cargar la voz neural (¿sin internet?). Usando la voz básica sin conexión.',
    exporting: p => `Exportando… ${Math.round(p * 100)} %`, exported: 'Descargar video', exportErr: 'Error al exportar: ', webmNote: 'Tu navegador no graba MP4: se exportó en WebM. Para MP4 usa Chrome, Edge o Safari actualizados.',
    meta: (s, n, sh) => `${s.toFixed(1)} s · ${n} escenas · ${sh} planos · 1080×1920`, linkMissing: 'Configura tu enlace abajo para usar este llamado.', noAudio: 'Aviso: este navegador no codifica audio; el MP4 salió sin sonido. Usa Chrome o Edge.', keepOpen: 'Exportando: deja la pantalla encendida y no cambies de app hasta que termine.', savedHintIOS: 'Listo. Toca «Guardar en Fotos / Compartir» y elige «Guardar video».', share: 'Guardar en Fotos / Compartir', opusNote: 'MP4 listo (audio Opus). Si alguna red social no reconoce el sonido, exporta desde Chrome/Edge en Windows o Mac, o Safari: allí el audio sale en AAC.',
  },
  en: {
    title: 'Stick Video', subtitle: 'Short reflection videos with stick figures',
    s1: 'Topic', s2: 'Characters, setting and style', chars: 'Characters', style: 'Style', env: 'Setting', s3: 'Length',
    durHint: 'The app adapts the pacing and number of scenes to the chosen range.', s4: 'Everyday situation', s5: 'Opening hook',
    s6: 'Call to action', other: 'More options', ctaCfg: 'Set up page and link', pageName: 'Your page name (shown in the video)',
    linkUrl: 'Link (URL)', linkLabel: 'Link button text', s7: 'Voice, music and sound effects', voice: 'Automatic voice',
    voiceHint: 'The neural voice downloads once (≈60 MB) and stays saved in your browser.', music: 'Music', musicVol: 'Music volume',
    sfx: 'Sound effects', generate: 'Generate preview', regenerate: 'Regenerate preview', empty: 'Pick your options and press "Generate preview".',
    export: 'Export MP4', srt: 'Subtitles .srt', cancel: 'Cancel', script: 'Script (editable)', apply: 'Apply changes',
    foot: 'Everything is generated in your browser. Vertical 1080×1920 for Shorts, Reels and Facebook.',
    color: 'Color', bw: 'B/W', escalada: 'Rising gag + twist', caminos: 'Two paths',
    ctaTypes: { like: 'Like', follow: 'Follow', stars: 'Stars', link: 'Link', combo: 'Combo' },
    kinds: { act: 'Action (no voice)', hook: 'Hook', setup: 'Setup', rep: 'Repetition', twist: 'Final twist', after: 'Punchline', reflect: 'Reflection', cta: 'Call to action' },
    vPiper: 'Neural voice', vMe: 'Basic offline voice (robotic)', vNone: 'No voice (subtitles only)', seriesOn: '⭐ Recurring main character (in every video)', seriesName: 'Name', seriesBio: 'Personality (used by the AI writer)', qLbl: 'On-screen final question (to drive comments)', actionOn: '🎬 More action, less talking', actionHint: 'Fewer spoken lines and more physical comedy: slips, faints, chases and escapes, with punchy sound effects and comic-book letters.', s8: 'AI backgrounds', aiOn: 'Use AI-drawn backgrounds (OpenAI)', aiIntro: 'The AI draws detailed scenery (houses, streets, office, church…) and the app animates the stick figures on top: they talk, blink, gesture and walk.', appSits: 'App stories', trendLbl: 'Current trend (optional)', trendPh: 'E.g.: egg prices, rent, tipping culture', trendBtn: '🔎 Find what\'s viral now', writeBtn: '✨ Write 3 stories with AI', writerHint: 'Uses your OpenAI key (paste it in section 8). The AI searches the web for what\'s viral and writes funny stories.', searching: 'Searching what\'s viral right now…', writing: 'Writing 3 new stories…', trendsFound: n => `Found ${n} trends. Tap one to use it.`, written: 'Done: 3 new AI stories (tagged "AI"). Pick one.', noTrends: 'No trends found right now; type one above.', needKeyAI: 'Paste your OpenAI key in section 8 first.', costTitle: 'Approximate cost of this video:', cTrends: 'trend search', cWrite: 'AI script', cBg: n => `${n} AI backgrounds`, cVoice: 'OpenAI voice', cEleven: 'ElevenLabs voice (your plan credits)', costFree: 'This video is free (everything runs on your phone).', keyNote: 'Your OpenAI key is used for backgrounds, the OpenAI voice and AI stories.', iaTag: 'AI', aiModel: 'Model', aiQuality: 'Quality', aiConsistent: 'Keep the same characters in every scene', qLow: 'Low (fast)', qMedium: 'Medium (recommended)', qHigh: 'High (expensive)', aiHintTxt: (n, c) => `Each video uses 2–3 backgrounds (≈ ${c} USD at this quality), charged to your OpenAI balance. Takes 1–2 minutes; keep the screen on. The same key works for the OpenAI voice and AI story writing. If OpenAI asks you to verify your organization, do it at platform.openai.com → Settings → Organization.`, stImg: (i, n) => `Drawing AI backgrounds ${i}/${n}… (1–2 minutes)`, imgFail: 'Could not create the AI backgrounds; the app backgrounds were used. Reason: ', imgSome: n => `${n} background(s) failed and the app ones were used.`, gFree: 'Free (in the browser)', gEleven: 'ElevenLabs · very natural (free 10 min/month, needs key)', gOpenai: 'OpenAI · natural (paid, needs key)', loadVoices: 'Load my voices', ctaHint: 'Tap one or two (they are combined into one sentence).', hintPiper: 'Free. Downloads once (≈60 MB, use Wi‑Fi) and stays saved in your browser. Decent, less natural than ElevenLabs.', hintMe: 'Robotic. Use only when offline.', hintNone: 'The video will have music, sound effects and subtitles, no voice.', keyEleven: 'Your ElevenLabs API key', keyOpenai: 'Your OpenAI API key', cloudEleven: 'Saved only on this phone. Free plan: about 10 minutes of voice per month (≈15 videos of 40 s), no commercial use. To monetize: Starter plan (≈5 USD/month). Create your key at <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener">elevenlabs.io → API Keys</a>.', cloudOpenai: 'Saved only on this phone. Pay per use (a few cents per video) and you need prepaid credit. Create your key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com → API keys</a>.', voicesLoaded: n => `Loaded ${n} voices from your account.`, needKey: 'Paste your key first.', cloudFallback: 'The cloud voice failed; the free neural voice was used instead.', ctaBadge: n => `#${n}`,
    stVoice: (i, n) => `Generating voice ${i}/${n}…`, stDl: (p) => `Downloading neural voice… ${p}`, stMix: 'Mixing music and sound effects…',
    stReady: (s, n) => `Ready: ${s.toFixed(1)} s · ${n} scenes. Check the preview and export.`, stFallback: 'Could not load the neural voice (offline?). Using the basic offline voice.',
    exporting: p => `Exporting… ${Math.round(p * 100)}%`, exported: 'Download video', exportErr: 'Export error: ', webmNote: 'Your browser cannot record MP4, so it was exported as WebM. Use an up-to-date Chrome, Edge or Safari for MP4.',
    meta: (s, n, sh) => `${s.toFixed(1)} s · ${n} scenes · ${sh} shots · 1080×1920`, linkMissing: 'Set up your link below to use this call to action.', noAudio: 'Note: this browser cannot encode audio; the MP4 has no sound. Use Chrome or Edge.', keepOpen: 'Exporting: keep the screen on and stay in this app until it finishes.', savedHintIOS: 'Done. Tap "Save to Photos / Share" and choose "Save Video".', share: 'Save to Photos / Share', opusNote: 'MP4 ready (Opus audio). If a social network does not pick up the sound, export from Chrome/Edge on Windows or Mac, or Safari: there the audio is AAC.',
  },
};

// ---------- estado ----------
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const DEFAULTS = { lang: 'es', theme: 'trabajador', series: true, seriesName: 'Tito', seriesBio: { es: 'Trabajador de Miami, siempre cansado y pela\'o a fin de mes, pero optimista y chistoso. No sale sin su cafecito ni su gorra roja.', en: 'Hard-working Miami guy, always tired and broke by the end of the month, but upbeat and funny. Never without his coffee and red cap.' }, qSel: 0, qSeed: 1, nChars: 2, env: 'auto', color: true, dur: 'm', sit: 0, hookSeed: 1, ctaSeed: 1, hook: 0, cta: 0, ctaSel: [0], voiceSel: null, action: true, aiOn: false, aiModel: 'gpt-image-1-mini', aiQuality: 'medium', aiIdeas: {}, trend: '', trends: [], usedAI: {}, elevenList: null, page: '', linkUrl: '', linkLabel: '', engine: 'piper', voiceId: { es: IOS ? 'es_MX-ald-medium' : 'es_MX-claude-high', en: 'en_US-hfc_female-medium' }, music: 'alegre', musicVol: 0.6, sfx: true };
let S = { ...DEFAULTS };
try { S = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('munequitos-state') || '{}') }; } catch { /* sin almacenamiento */ }
const save = () => { try { localStorage.setItem('munequitos-state', JSON.stringify(S)); } catch { /* ignorar */ } };
if (!Array.isArray(S.ctaSel) || !S.ctaSel.length) S.ctaSel = [S.cta || 0];
if (!S.voiceSel) S.voiceSel = { es: S.engine === 'piper' ? 'piper:' + S.voiceId.es : S.engine, en: S.engine === 'piper' ? 'piper:' + S.voiceId.en : S.engine };
// claves de voces en la nube: solo en este dispositivo
let KEYS = { eleven: '', openai: '' };
try { KEYS = { ...KEYS, ...JSON.parse(localStorage.getItem('munequitos-keys') || '{}') }; } catch { /* sin almacenamiento */ }
const saveKeys = () => { try { localStorage.setItem('munequitos-keys', JSON.stringify(KEYS)); } catch { /* ignorar */ } };
const voiceParts = () => { const v = S.voiceSel[S.lang] || 'piper:' + DEFAULTS.voiceId[S.lang]; const [engine, ...rest] = v.split(':'); return { engine, voiceId: rest.join(':') }; };
const tr = () => I18N[S.lang];
let project = null, mix = null, dirty = true;

// ---------- render de controles ----------
function btn(cls, html, on, onClick) { const b = document.createElement('button'); b.type = 'button'; b.className = cls + (on ? ' on' : ''); b.innerHTML = html; b.addEventListener('click', onClick); return b; }
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderAll() {
  const L = tr();
  document.documentElement.lang = S.lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { const v = L[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
  if (project) $('#genBtn').textContent = L.regenerate;
  const [es, en] = $('#langBtn').children; es.classList.toggle('on', S.lang === 'es'); en.classList.toggle('on', S.lang === 'en');

  const th = $('#themes'); th.replaceChildren(...THEMES.map(t => btn('chip', `${t.emoji} ${esc(t.name[S.lang])}`, S.theme === t.id, () => { S.theme = t.id; S.sit = 0; S.hook = 0; S.hookSeed = 1; S.qSel = 0; change(); })));
  $('#nchars').replaceChildren(...[1, 2, 3, 4].map(n => btn('', String(n), S.nChars === n, () => { S.nChars = n; change(); })));
  $('#colorSeg').replaceChildren(btn('', '🎨 ' + L.color, S.color, () => { S.color = true; change(false); }), btn('', '⚫⚪ ' + L.bw, !S.color, () => { S.color = false; change(false); }));
  $('#envs').replaceChildren(...ENVIRONMENTS.map(e => btn('chip', `${e.emoji} ${esc(e.name[S.lang])}`, S.env === e.id, () => { S.env = e.id; change(); })));
  $('#durs').replaceChildren(...Object.entries(DURATIONS).map(([k, d]) => btn('', `${d.label[S.lang]}<small>${k === 's' ? (S.lang === 'es' ? 'Rápido' : 'Quick') : k === 'm' ? (S.lang === 'es' ? 'Estándar' : 'Standard') : (S.lang === 'es' ? 'Completo' : 'Full')}</small>`, S.dur === k, () => { S.dur = k; change(); })));

  const sits = currentSits();
  $('#sits').replaceChildren(...sits.map((s, i) => btn('opt', `<span class="tag${s.ai ? ' ia' : ''}">${s.ai ? L.iaTag + ' · ' : ''}${s.mode === 'caminos' ? L.caminos : L.escalada}</span><div><b>${esc(s.title[S.lang])}</b><span class="d">${esc(s.hook[S.lang])}</span></div>`, S.sit === i, () => { S.sit = i; S.hook = 0; S.qSel = 0; change(); })));
  const sit = sits[S.sit] || sits[0];
  const hooks = hookOptions(S.theme, sit, S.hookSeed);
  $('#hooks').replaceChildren(...hooks.map((h, i) => btn('opt', `<span class="tag">${i + 1}</span><div><b>${esc(h[S.lang])}</b></div>`, S.hook === i, () => { S.hook = i; change(); })));
  const ctas = ctaOptions(S.ctaSeed, !!(S.linkUrl || S.linkLabel));
  S.ctaSel = S.ctaSel.filter(i => i < ctas.length); if (!S.ctaSel.length) S.ctaSel = [0];
  $('#ctas').replaceChildren(...ctas.map((c, i) => { const pos = S.ctaSel.indexOf(i); return btn('opt', `<span class="tag">${pos >= 0 && S.ctaSel.length > 1 ? L.ctaBadge(pos + 1) + ' · ' : ''}${L.ctaTypes[c.type]}</span><div><b>${esc(fillPreview(c.text[S.lang], c.type))}</b></div>`, pos >= 0, () => {
    if (pos >= 0) { if (S.ctaSel.length > 1) S.ctaSel.splice(pos, 1); } else if (S.ctaSel.length < 2) S.ctaSel.push(i); else S.ctaSel = [S.ctaSel[0], i];
    change();
  }); }));
  $('#ctaPreview').textContent = S.ctaSel.length > 1 ? '“' + fillPreview(combineCtas(S.ctaSel.map(i => ctas[i]), S.lang)) + '”' : '';

  const vs = $('#voice'); const group = (label, opts) => { const g = document.createElement('optgroup'); g.label = label; g.append(...opts); return g; };
  const elevenList = (S.elevenList && S.elevenList.length ? S.elevenList : ELEVEN_DEFAULT_VOICES);
  vs.replaceChildren(
    group(L.gFree, [...VOICES[S.lang].map(v => new Option(`${L.vPiper}: ${v.label}`, 'piper:' + v.id)), new Option(L.vMe, 'mespeak'), new Option(L.vNone, 'none')]),
    group(L.gEleven, elevenList.map(v => new Option('ElevenLabs: ' + v.label, 'eleven:' + v.id))),
    group(L.gOpenai, OPENAI_VOICES.map(v => new Option('OpenAI: ' + v.label, 'openai:' + v.id))));
  vs.value = S.voiceSel[S.lang] || 'piper:' + DEFAULTS.voiceId[S.lang];
  if (vs.selectedIndex < 0) vs.value = 'piper:' + DEFAULTS.voiceId[S.lang];
  const { engine } = voiceParts(); const cloud = engine === 'eleven' || engine === 'openai';
  $('#voiceHint').textContent = engine === 'piper' ? L.hintPiper : engine === 'mespeak' ? L.hintMe : engine === 'none' ? L.hintNone : '';
  $('#cloudCfg').hidden = !cloud;
  if (cloud) { $('#apiKeyLbl').textContent = engine === 'eleven' ? L.keyEleven : L.keyOpenai; $('#cloudHint').innerHTML = engine === 'eleven' ? L.cloudEleven : L.cloudOpenai; $('#loadVoices').hidden = engine !== 'eleven'; if (document.activeElement !== $('#apiKey')) $('#apiKey').value = KEYS[engine] || ''; $('#apiKey').placeholder = engine === 'eleven' ? 'sk_...' : 'sk-...'; }
  $('#actionOn').checked = S.action !== false; $('#aiOn').checked = S.aiOn; $('#aiCfg').hidden = !S.aiOn;
  if (document.activeElement !== $('#aiKey')) $('#aiKey').value = KEYS.openai || '';
  $('#aiModel').replaceChildren(...IMAGE_MODELS.map(m => new Option(m.label[S.lang], m.id))); $('#aiModel').value = S.aiModel;
  $('#aiQuality').replaceChildren(new Option(L.qLow, 'low'), new Option(L.qMedium, 'medium'), new Option(L.qHigh, 'high')); $('#aiQuality').value = S.aiQuality;
  $('#aiHint').textContent = L.aiHintTxt(3, (3 * imagePrice(S.aiModel, S.aiQuality)).toFixed(2));
  $('#trend').value = document.activeElement === $('#trend') ? $('#trend').value : (S.trend || ''); $('#trend').placeholder = L.trendPh;
  $('#trendChips').replaceChildren(...(S.trends || []).map(tr2 => btn('chip trend', `<b>${esc(tr2.title)}</b>${tr2.summary ? '<br><small>' + esc(tr2.summary) + '</small>' : ''}`, S.trend === tr2.title, () => { S.trend = tr2.title; save(); renderAll(); })));
  $('#writerHint').textContent = L.writerHint;
  $('#appSits').hidden = !(S.aiIdeas && S.aiIdeas[S.theme + '|' + S.lang]);
  renderCost();
  $('#seriesOn').checked = S.series !== false; $('#seriesCfg').hidden = S.series === false;
  if (document.activeElement !== $('#seriesName')) $('#seriesName').value = S.seriesName || '';
  if (document.activeElement !== $('#seriesBio')) $('#seriesBio').value = (S.seriesBio && S.seriesBio[S.lang]) || '';
  { const qs = questionOptions(S.theme, sit, S.qSeed || 1); $('#questions').replaceChildren(...qs.map((q, i) => btn('opt', `<span class="tag">?</span><div><b>${esc(q[S.lang])}</b></div>`, (S.qSel || 0) === i, () => { S.qSel = i; change(); }))); }
  $('#music').replaceChildren(...MUSIC_STYLES.map(m => new Option(m.name[S.lang], m.id))); $('#music').value = S.music;
  $('#musicVol').value = S.musicVol; $('#sfx').checked = S.sfx;
  $('#page').value = S.page; $('#linkUrl').value = S.linkUrl; $('#linkLabel').value = S.linkLabel;
  if (project) $('#meta').textContent = L.meta(project.total, project.beats.length, project.beats.reduce((s, b) => s + b.shots, 0));
}
function currentSits() { const k = S.theme + '|' + S.lang; return (S.aiIdeas && S.aiIdeas[k] && S.aiIdeas[k].length) ? S.aiIdeas[k] : SITUATIONS[S.theme]; }
function fillPreview(text, type) {
  const page = S.page.trim() || (S.lang === 'es' ? 'la página' : 'the page');
  const link = (S.linkLabel || S.linkUrl).trim() || (S.lang === 'es' ? 'en la descripción' : 'in the description');
  return text.replace('{page}', page).replace('{link}', link);
}
function change(content = true) { if (content) dirty = true; save(); renderAll(); if (project && !content) { project.color = S.color; drawAt(curTime); } }

$('#langBtn').addEventListener('click', () => { S.lang = S.lang === 'es' ? 'en' : 'es'; dirty = true; change(); });
$('#moreHooks').addEventListener('click', () => { S.hookSeed++; S.hook = 0; change(); });
$('#moreCtas').addEventListener('click', () => { S.ctaSeed++; S.ctaSel = [0]; change(); });
$('#voice').addEventListener('change', e => { S.voiceSel = { ...S.voiceSel, [S.lang]: e.target.value }; dirty = true; save(); renderAll(); });
$('#apiKey').addEventListener('input', e => { const { engine } = voiceParts(); KEYS[engine] = e.target.value.trim(); saveKeys(); dirty = true; });
$('#loadVoices').addEventListener('click', async () => {
  const L = tr(); if (!KEYS.eleven) { setStatus(L.needKey, true); return; }
  try { const list = await elevenVoices(KEYS.eleven); if (list.length) { S.elevenList = list; S.voiceSel = { ...S.voiceSel, [S.lang]: 'eleven:' + list[0].id }; save(); renderAll(); setStatus(L.voicesLoaded(list.length)); } }
  catch (e) { setStatus(String(e.message || e), true); }
});
$('#trend').addEventListener('input', e => { S.trend = e.target.value; save(); });
$('#appSits').addEventListener('click', () => { delete S.aiIdeas[S.theme + '|' + S.lang]; S.sit = 0; S.hook = 0; change(); });
$('#trendBtn').addEventListener('click', async () => {
  const L = tr(); if (!KEYS.openai) { setStatus(L.needKeyAI, true); return; }
  const b = $('#trendBtn'); b.disabled = true; setStatus(L.searching);
  try { const list = await searchTrends(KEYS.openai, { lang: S.lang, theme: S.theme }); S.trends = list; S.usedAI = { ...S.usedAI, [S.theme + '|' + S.lang + '|t']: true }; save(); renderAll(); setStatus(list.length ? L.trendsFound(list.length) : L.noTrends, !list.length); }
  catch (e) { console.warn(e); setStatus(String(e.message || e), true); }
  finally { b.disabled = false; }
});
$('#writeBtn').addEventListener('click', async () => {
  const L = tr(); if (!KEYS.openai) { setStatus(L.needKeyAI, true); return; }
  const b = $('#writeBtn'); b.disabled = true; setStatus(L.writing);
  try {
    const th = THEMES.find(t => t.id === S.theme);
    const ideas = await writeIdeas(KEYS.openai, { lang: S.lang, theme: S.theme, themeName: th.name[S.lang], trend: (S.trend || '').trim(), nChars: S.nChars, dur: S.dur, hero: S.series !== false ? S.seriesName : '', heroBio: S.series !== false && S.seriesBio ? S.seriesBio[S.lang] : '' });
    if (!ideas.length) throw new Error('La IA no devolvió historias.');
    S.aiIdeas = { ...S.aiIdeas, [S.theme + '|' + S.lang]: ideas }; S.sit = 0; S.hook = 0; S.hookSeed = 1; dirty = true; save(); renderAll(); setStatus(L.written);
    document.querySelector('#sits').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) { console.warn(e); setStatus(String(e.message || e), true); }
  finally { b.disabled = false; }
});
$('#seriesOn').addEventListener('change', e => { S.series = e.target.checked; dirty = true; save(); renderAll(); });
$('#seriesName').addEventListener('input', e => { S.seriesName = e.target.value; dirty = true; save(); });
$('#seriesBio').addEventListener('input', e => { S.seriesBio = { ...(S.seriesBio || {}), [S.lang]: e.target.value }; dirty = true; save(); });
$('#actionOn').addEventListener('change', e => { S.action = e.target.checked; dirty = true; save(); });
$('#aiOn').addEventListener('change', e => { S.aiOn = e.target.checked; dirty = true; save(); renderAll(); });
$('#aiModel').addEventListener('change', e => { S.aiModel = e.target.value; dirty = true; save(); renderAll(); });
$('#aiQuality').addEventListener('change', e => { S.aiQuality = e.target.value; dirty = true; save(); renderAll(); });
$('#aiKey').addEventListener('input', e => { KEYS.openai = e.target.value.trim(); saveKeys(); dirty = true; });
$('#music').addEventListener('change', e => { S.music = e.target.value; dirty = true; save(); });
$('#musicVol').addEventListener('change', e => { S.musicVol = +e.target.value; dirty = true; save(); });
$('#sfx').addEventListener('change', e => { S.sfx = e.target.checked; dirty = true; save(); });
for (const id of ['page', 'linkUrl', 'linkLabel']) $('#' + id).addEventListener('input', e => { S[id] = e.target.value; save(); dirty = true; clearTimeout(window._rt); window._rt = setTimeout(() => { const f = document.activeElement; renderAll(); f && f.focus && f.focus(); }, 500); });

// ---------- generación ----------
function renderCost() {
  const L = tr(); const items = []; const { engine } = voiceParts();
  const k = S.theme + '|' + S.lang; const aiStory = !!(S.aiIdeas && S.aiIdeas[k]);
  if (S.usedAI && S.usedAI[k + '|t']) items.push([L.cTrends, PRICE.trends]);
  if (aiStory) items.push([L.cWrite, PRICE.write]);
  if (S.aiOn) { const n = S.dur === 's' ? 2 : 3; items.push([L.cBg(n), n * imagePrice(S.aiModel, S.aiQuality)]); }
  if (engine === 'openai') items.push([L.cVoice, S.dur === 's' ? 0.008 : S.dur === 'm' ? 0.014 : 0.02]);
  const box = $('#costBox');
  if (!items.length && engine !== 'eleven') { box.hidden = false; box.textContent = L.costFree; return; }
  const total = items.reduce((a, b) => a + b[1], 0);
  box.hidden = false;
  box.innerHTML = `${esc(L.costTitle)} <b>≈ ${total.toFixed(2)} USD</b><br><small>${items.map(([n, c]) => `${esc(n)}: ${c.toFixed(3)}`).join(' · ')}${engine === 'eleven' ? ' · ' + esc(L.cEleven) : ''}</small>`;
}
function setStatus(msg, err = false) { const el = $('#status'); el.textContent = msg; el.classList.toggle('err', err); }

async function generate(customTexts = null) {
  const L = tr(); stop();
  $('#genBtn').disabled = true;
  try {
    await document.fonts.load(`700 80px ${FONT}`).catch(() => {});
    const sits = currentSits(); const sit = sits[S.sit] || sits[0];
    const hooks = hookOptions(S.theme, sit, S.hookSeed); const ctas = ctaOptions(S.ctaSeed, !!(S.linkUrl || S.linkLabel));
    const settings = { env: S.env, page: S.page, linkUrl: S.linkUrl, linkLabel: S.linkLabel, action: S.action !== false, seriesName: S.series !== false ? (S.seriesName || '').trim() : '' };
    const question = questionOptions(S.theme, sit, S.qSeed || 1)[S.qSel || 0];
    let beats = buildBeats({ situation: sit, lang: S.lang, dur: S.dur, hook: hooks[S.hook] || hooks[0], question, ctas: S.ctaSel.map(i => ctas[i]).filter(Boolean).length ? S.ctaSel.map(i => ctas[i]).filter(Boolean) : [ctas[0]], settings });
    if (customTexts) beats.forEach((b, i) => { if (customTexts[i] != null && customTexts[i].trim()) b.text = customTexts[i].trim(); });
    if (settings.action && !sit.ai && !sit.silent) beats = insertActions(beats, { nChars: S.nChars, lang: S.lang, every: 1 });
    planDirection(beats, { nChars: S.nChars, lang: S.lang, action: settings.action });
    let { engine, voiceId } = voiceParts(); const chosen = engine; const D = DURATIONS[S.dur];
    let speed = D.pace; let total = 0; let fallbackWhy = '';
    for (let attempt = 0; attempt < 4; attempt++) {
      for (let i = 0; i < beats.length; i++) {
        setStatus(L.stVoice(i + 1, beats.length));
        const b = beats[i];
        let buf = null;
        if (b.kind === 'act' || b.mute) continue;
        try {
          const prog = (what, l, t) => { if (what === 'model' || what === 'phon') setStatus(L.stDl(t ? Math.round(l / t * 100) + ' %' : Math.round(l / 1e6) + ' MB')); };
          const vfor = role => voiceForRole(engine, voiceId, role, S.lang, S.elevenList);
          buf = await synth(speakable(b.text), { engine, voiceId: vfor(b.speaker), apiKey: KEYS[engine], lang: S.lang, speed: b.kind === 'reflect' ? speed * 0.92 : speed, onProgress: prog });
          if (b.react && b.react.vocal) {
            const rb = await synth(speakable(b.react.vocal), { engine, voiceId: vfor(b.react.role), apiKey: KEYS[engine], lang: S.lang, speed: Math.min(1.25, speed * 1.08), onProgress: prog });
            b.reactBuffer = rb; b.reactDur = rb ? Math.min(1.6, rb.duration) : 0.7; b.reactLip = computeLip(rb);
          }
        } catch (e) {
          console.warn('TTS', e);
          if (engine === 'eleven' || engine === 'openai') { fallbackWhy = e.message || String(e); engine = 'piper'; voiceId = DEFAULTS.voiceId[S.lang]; setStatus(L.cloudFallback + ' ' + fallbackWhy, true); await new Promise(r => setTimeout(r, 1500)); i--; continue; }
          if (engine === 'piper') { fallbackWhy = (fallbackWhy ? fallbackWhy + ' / ' : '') + (e.message || String(e)); engine = 'mespeak'; setStatus(L.stFallback, true); await new Promise(r => setTimeout(r, 1200)); i--; continue; }
          throw e;
        }
        b.voiceBuffer = buf; b.voiceDur = buf ? buf.duration : 0; b.lip = computeLip(buf);
        if (!buf) b.voiceDur = undefined;
      }
      total = timeBeats(beats, S.dur, false);
      if (total <= D.max + 0.5 || engine === 'none' || engine === 'eleven' || engine === 'openai' || speed >= 1.35) break;
      speed = Math.min(1.35, speed * (total / D.max) * 1.02);
    }
    // si aún se pasa: primero quita escenas intermedias (nunca la primera ni la última), luego reacciones
    for (let guard = 0; total > D.max + 0.5 && guard < 10; guard++) {
      const reps = beats.filter(b => b.kind === 'rep');
      if (reps.length <= 3) break;
      const victim = reps.slice(1, -1).filter(b => !b.enter && !b.core).sort((a, b) => b.dur - a.dur)[0] || reps[Math.floor(reps.length / 2)];
      const vi = beats.indexOf(victim);
      if (vi > 0 && beats[vi - 1].exit) beats[vi - 1].exit = null;
      beats.splice(vi, 1);
      total = timeBeats(beats, S.dur, false);
    }
    total = timeBeats(beats, S.dur, true);
    beats.filter(b => b.kind === 'rep').forEach((b, i, arr) => { b.level = (i + 1) / arr.length; });
    planShots(beats);
    project = prepareProject({ beats, total, lang: S.lang, color: S.color, nChars: S.nChars, page: S.page, linkUrl: S.linkUrl, linkLabel: S.linkLabel, music: S.music, sitId: sit.id, series: S.series !== false, seriesName: S.series !== false ? (S.seriesName || '').trim() : '' });
    let imgNote = '';
    if (S.aiOn) {
      try {
        const { images, errors } = await generateBackgrounds(project, sit, { apiKey: KEYS.openai, model: S.aiModel, quality: S.aiQuality, onProgress: (i2, n) => setStatus(L.stImg(i2, n)) });
        if (images.size) project.aiBg = images;
        if (!images.size) imgNote = L.imgFail + (errors[0] || '');
        else if (errors.length) imgNote = L.imgSome(errors.length) + ' ' + errors[0];
      } catch (e) { console.warn('IA fondos', e); imgNote = L.imgFail + (e.message || e); }
    }
    setStatus(L.stMix);
    mix = await renderMix(project, { musicVol: S.musicVol, sfxOn: S.sfx });
    dirty = false;
    renderScript();
    $('#emptyMsg').hidden = true; $('#player').hidden = false; $('#exportRow').hidden = false; $('#bigPlay').hidden = false; $('#dl').hidden = true;
    curTime = 0; drawAt(0);
    if (window.matchMedia('(max-width: 900px)').matches) document.querySelector('.phone').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (imgNote) { setStatus(imgNote, true); renderAll(); return; }
    setStatus(L.stReady(total, beats.length) + (engine !== chosen ? ' · ' + (chosen === 'eleven' || chosen === 'openai' ? L.cloudFallback : L.stFallback) + (fallbackWhy ? ` (${fallbackWhy})` : '') : ''), engine !== chosen);
    renderAll();
  } catch (e) {
    console.error(e); setStatus(String(e.message || e), true);
  } finally { $('#genBtn').disabled = false; }
}
$('#genBtn').addEventListener('click', () => generate());

function renderScript() {
  const L = tr(); const ol = $('#scriptList');
  ol.replaceChildren(...project.beats.map((b, i) => { const li = document.createElement('li'); li.innerHTML = `<span class="k">${i + 1}. ${L.kinds[b.kind]} · ${b.dur.toFixed(1)} s</span>`; const ta = document.createElement('textarea'); ta.value = b.text; ta.rows = 2; ta.dataset.i = i; li.appendChild(ta); return li; }));
  $('#scriptCard').hidden = false;
}
$('#applyBtn').addEventListener('click', () => { const texts = [...document.querySelectorAll('#scriptList textarea')].map(t => t.value); generate(texts); });

// ---------- vista previa ----------
const canvas = $('#preview'); const pctx = canvas.getContext('2d');
let ac = null, src = null, t0 = 0, playing = false, curTime = 0, raf = 0;
// iPhone: que suene aunque el interruptor de silencio esté activado, y activar el audio en el toque
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* no disponible */ }
function unlockAudio() {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
  if (ac.state !== 'running') ac.resume();
  return ac;
}
function drawAt(t) { if (!project) return; drawFrame(pctx, project, Math.min(t, project.total - 0.001), canvas.width / 1080); $('#seek').value = Math.round(t / project.total * 1000); $('#timeLbl').textContent = `${t.toFixed(1)} / ${project.total.toFixed(1)} s`; }
function play() {
  if (!project || !mix) return;
  if (dirty) { /* las opciones cambiaron: se reproduce la versión generada */ }
  unlockAudio();
  if (curTime >= project.total - 0.05) curTime = 0;
  src = ac.createBufferSource(); src.buffer = mix; src.connect(ac.destination);
  t0 = ac.currentTime - curTime; src.start(0, curTime); playing = true;
  $('#playBtn').textContent = '❚❚'; $('#bigPlay').hidden = true;
  const tick = () => { if (!playing) return; curTime = ac.currentTime - t0; if (curTime >= project.total) { stop(); curTime = project.total; drawAt(curTime); $('#bigPlay').hidden = false; return; } drawAt(curTime); raf = requestAnimationFrame(tick); };
  tick();
}
function stop() { playing = false; cancelAnimationFrame(raf); if (src) { try { src.stop(); } catch { /* ya parado */ } src = null; } $('#playBtn').textContent = '▶'; }
$('#playBtn').addEventListener('click', () => (playing ? stop() : play()));
$('#bigPlay').addEventListener('click', play);
canvas.addEventListener('click', () => { if (project) (playing ? stop() : play()); });
$('#seek').addEventListener('input', e => { if (!project) return; const was = playing; stop(); curTime = e.target.value / 1000 * project.total; drawAt(curTime); if (was) play(); });

// ---------- exportación ----------
let abort = null, lastFile = null;
$('#exportBtn').addEventListener('click', async () => {
  if (!project) return; const L = tr(); stop();
  const actx = unlockAudio(); // en iPhone el audio debe activarse dentro del toque
  if (dirty) await generate(); if (!project) return;
  abort = new AbortController();
  $('#exportBtn').disabled = true; $('#exportProg').hidden = false; $('#dl').hidden = true; $('#shareBtn').hidden = true;
  if (IOS) setStatus(L.keepOpen);
  const bar = $('#exportProg div'), lbl = $('#exportProg span');
  try {
    const { blob, ext, note } = await exportMP4(project, mix, { audioContext: actx, signal: abort.signal, onProgress: p => { bar.style.width = (p * 100).toFixed(1) + '%'; lbl.textContent = L.exporting(p); } });
    const a = $('#dl'); if (a.href) URL.revokeObjectURL(a.href);
    a.href = URL.createObjectURL(blob);
    const sit = currentSits()[S.sit] || currentSits()[0];
    const name = `munequitos-${S.theme}-${sit.id}-${S.lang}.${ext}`;
    a.download = name;
    a.textContent = `⬇ ${L.exported} (${ext.toUpperCase()}, ${(blob.size / 1e6).toFixed(1)} MB)`; a.hidden = false;
    lastFile = new File([blob], name, { type: blob.type || 'video/mp4' });
    const canShare = !!(navigator.canShare && navigator.canShare({ files: [lastFile] }));
    $('#shareBtn').hidden = !canShare;
    setStatus(canShare && IOS ? L.savedHintIOS : '');
    if (note === 'webm') setStatus(L.webmNote, true); else if (note === 'sin-audio') setStatus(L.noAudio, true); else if (note === 'opus') setStatus(L.opusNote);
    if (!IOS) a.click();
  } catch (e) { if (e.name !== 'AbortError') { console.error(e); setStatus(L.exportErr + (e.message || e), true); } }
  finally { $('#exportBtn').disabled = false; $('#exportProg').hidden = true; abort = null; }
});
$('#shareBtn').addEventListener('click', async () => {
  if (!lastFile) return;
  try { await navigator.share({ files: [lastFile], title: lastFile.name }); } catch (e) { if (e.name !== 'AbortError') setStatus(String(e.message || e), true); }
});
$('#cancelBtn').addEventListener('click', () => abort && abort.abort());
$('#srtBtn').addEventListener('click', () => {
  if (!project) return; const blob = new Blob([toSRT(project.beats)], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `munequitos-${S.theme}-${S.lang}.srt`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});

renderAll();
// expone para pruebas automatizadas
window.__app = { generate, get project() { return project; }, get mix() { return mix; }, S, drawAt, exportMP4: () => exportMP4(project, mix) };
