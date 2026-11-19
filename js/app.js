import { THEMES, ENVIRONMENTS, SITUATIONS, hookOptions, ctaOptions, combineCtas, fillCta, questionOptions } from './content.js';
import { DURATIONS, buildBeats, timeBeats, speakable, toSRT } from './script.js';
import { drawFrame, prepareProject, FONT, LOOKS } from './render.js';
import { IMAGE_MODELS, generateBackgrounds, planBackgrounds, imagePrice, clearBgCache } from './aiimages.js';
import { searchTrends, writeIdeas, punchUp, writeMime, PRICE } from './scriptai.js';
import { computeLip } from './lipsync.js';
import { renderMix, MUSIC_STYLES, MUSIC_CATS, listTracks, addTracks, deleteTrack, loadTrack, renameTrack, setTrackCat, getTrackBlob, normCat } from './audio.js';
import { moodSections, planMusic, catName } from './musicplan.js';
import { synth, OPENAI_VOICES, voiceForRole } from './tts.js';
import { ALL_MESSAGE_STORIES, buildMessage } from './message.js';
import { tagVisuals } from './visuals.js';
import { planDirection, planShots, insertActions } from './direction.js';
import { exportMP4 } from './export.js';

const $ = s => document.querySelector(s);
const I18N = {
  es: {
    title: 'Muñequitos Video', subtitle: 'Videos cortos de reflexión con muñequitos de palitos',
    s1: 'Tema', s2: 'Personajes, entorno y estilo', chars: 'Personajes', style: 'Estilo', env: 'Entorno', s3: 'Duración',
    durHint: 'La app ajusta el ritmo y la cantidad de escenas al rango elegido.', s4: 'Situación cotidiana', s5: 'Gancho inicial',
    s6: 'Llamado a la acción', other: 'Otras opciones', ctaCfg: 'Configurar página y enlace', pageName: 'Nombre de tu página (aparece en el video)',
    linkUrl: 'Enlace (URL)', linkLabel: 'Texto del botón del enlace', s7: 'Voz, música y efectos', voice: 'Voz del protagonista',
    voiceHint: 'La voz neural se descarga una sola vez (≈60 MB) y queda guardada en el navegador.', music: 'Música', musicVol: 'Volumen música',
    sfx: 'Efectos de sonido', generate: 'Generar vista previa', regenerate: 'Regenerar vista previa', empty: 'Elige tus opciones y pulsa «Generar vista previa».',
    export: 'Exportar MP4', srt: 'Subtítulos .srt', cancel: 'Cancelar', script: 'Guion (puedes editarlo)', apply: 'Aplicar cambios',
    foot: 'Todo se genera en tu navegador. Formato vertical 1080×1920 para Shorts, Reels y Facebook.',
    color: 'Color', bw: 'B/N', escalada: 'Repetición + giro', caminos: 'Dos caminos',
    ctaTypes: { like: 'Me gusta', follow: 'Seguir', stars: 'Estrellas', link: 'Enlace', combo: 'Combo' },
    kinds: { msg: 'Frase en pantalla', act: 'Acción (sin voz)', hook: 'Gancho', setup: 'Inicio', rep: 'Repetición', twist: 'Giro final', after: 'Remate', reflect: 'Reflexión', cta: 'Llamado a la acción' },
    vPiper: 'Voz neural', vMe: 'Voz básica sin conexión (robótica)', vNone: 'Sin voz (solo subtítulos)', qLbl: 'Pregunta final en pantalla (para que comenten)', punchBtn: '✨ Hacer este guion más divertido (IA)', punching: 'Reescribiendo el guion con más chispa…', punched: 'Listo: guion mejorado (marcado ✨). Genera la vista previa.', mainLbl: 'Protagonista', girlsLbl: '¿Cuántas muñequitas?', boy: '👦 Varón', girl: '👧 Hembra', actionOn: '🎬 Más acción, menos diálogo', actionHint: 'Menos frases habladas y más comedia física: resbalones, desmayos, persecuciones y huidas, con golpes de sonido reales.', s8: 'Fondos con IA', aiOn: 'Usar fondos dibujados con IA (OpenAI)', aiIntro: 'La IA dibuja escenarios detallados (casas, calles, oficina, iglesia…) y la app anima encima a los muñequitos: hablan, parpadean, gesticulan y caminan.', appSits: 'Historias de la app', trendLbl: 'Tendencia del momento (opcional)', trendPh: 'Ej.: el precio de los huevos, la renta en Miami, las propinas', trendBtn: '🔎 Buscar lo viral ahora', writeBtn: '✨ Escribir 3 historias con IA', writerHint: 'Usa tu clave de OpenAI (pégala en la sección 8). La IA busca en internet lo que está viral y escribe historias con humor, a lo Miami.', searching: 'Buscando lo que está viral ahora…', writing: 'Escribiendo 3 historias nuevas…', trendsFound: n => `Encontré ${n} tendencias. Toca una para usarla.`, written: 'Listo: 3 historias nuevas escritas con IA (marcadas «IA»). Elige una.', noTrends: 'No encontré tendencias ahora; escribe una tú arriba.', needKeyAI: 'Primero pega tu clave de OpenAI en la sección 8.', costTitle: 'Costo aproximado de este video:', cTrends: 'búsqueda de tendencias', cWrite: 'guion con IA', cBg: n => `${n} fondos con IA`, cVoice: 'voz OpenAI', cEleven: 'voz ElevenLabs (créditos de tu plan)', costFree: 'Este video no tiene costo (todo se genera en tu teléfono).', keyNote: 'Tu clave de OpenAI sirve para los fondos, la voz de OpenAI y las historias con IA.', iaTag: 'IA', aiModel: 'Modelo', aiQuality: 'Calidad', aiConsistent: 'Mantener los mismos personajes en todas las escenas', qLow: 'Baja (rápida)', qMedium: 'Media (recomendada)', qHigh: 'Alta (cara)', aiHintTxt: (n, c) => `Cada video usa 2–3 fondos (≈ ${c} USD con esta calidad), cobrados de tu saldo de OpenAI. Tarda 1–2 minutos; deja la pantalla encendida. Esta misma clave sirve para la voz de OpenAI y para escribir historias con IA. Si OpenAI pide «verificar la organización», hazlo en platform.openai.com → Settings → Organization.`, stImg: (i, n) => `Dibujando fondos con IA ${i}/${n}… (1–2 minutos)`, imgFail: 'No se pudieron crear los fondos con IA; se usaron los fondos de la app. Motivo: ', imgSome: n => `${n} fondo(s) no se pudieron crear y se usaron los de la app.`, gFree: 'Gratis (en el navegador)', gEleven: 'ElevenLabs · muy natural (gratis 10 min/mes, requiere clave)', gOpenai: 'OpenAI · natural (de pago, requiere clave)', loadVoices: 'Cargar mis voces', ctaHint: 'Toca uno o dos (se combinan en una sola frase).', hintPiper: 'Gratis. Se descarga una sola vez (≈60 MB, usa Wi‑Fi) y queda guardada en el navegador. Suena aceptable, menos natural que ElevenLabs.', hintMe: 'Robótica. Solo úsala si no tienes internet.', hintNone: 'El video tendrá música, efectos y subtítulos, sin voz.', keyEleven: 'Tu clave de ElevenLabs (API key)', keyOpenai: 'Tu clave de OpenAI (API key)', cloudEleven: 'Se guarda solo en este teléfono. Plan gratis: unos 10 minutos de voz al mes (≈15 videos de 40 s), sin uso comercial. Para monetizar: plan Starter (≈5 USD/mes). Crea tu clave en <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener">elevenlabs.io → API Keys</a>.', cloudOpenai: 'Se guarda solo en este teléfono. Es de pago por uso (unos centavos por video) y necesitas saldo cargado. Crea tu clave en <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com → API keys</a>.', voicesLoaded: n => `Se cargaron ${n} voces de tu cuenta.`, needKey: 'Primero pega tu clave.', cloudFallback: 'No se pudo usar la voz de la nube; se usó la voz neural gratuita.', ctaBadge: n => `${n}º`,
    s0: 'Tipo de video', vVoz: '🎙️ Con voces', vVozD: 'Los personajes hablan', vMus: '🎵 Solo música con mensaje', vMusD: 'Sin voces, frases en pantalla',
    vtypeVoz: 'Los muñequitos hablan en español o inglés, con voces naturales de OpenAI, subtítulos y música que baja sola cuando hablan.', vtypeMus: 'Sin voces: un muñequito hace algo con significado (subir una montaña, caerse y levantarse, caminar bajo la lluvia…) con música emotiva. El mensaje aparece en pocas frases, grandes y cortas, y termina con una reflexión fuerte. No necesita clave.',
    s4msg: 'Historia con mensaje', mimeTag: 'Pantomima', soloTag: 'Mensaje', mimeBtn: '✨ Inventar 3 historias de pantomima nuevas (IA)', writingMime: 'Inventando historias de pantomima nuevas…', wroteMime: n => `Listo: ${n} historias nuevas de pantomima (marcadas «IA»). Elige una y genera el video.`, needKeyMime: 'Para inventar historias con IA, pega tu clave de OpenAI en la sección 8.', noMime: 'La IA no devolvió historias. Prueba otra vez.',
    autoMusic: '🤖 Automática: la app escoge según la historia', bankTitle: '🎵 Mi banco de música', bankHint: n => `Tienes ${n} canción(es) en tu banco. En «Automática», la app lee el guion y escoge la que pega con cada parte de la historia, sin repetir siempre la misma; si la emoción cambia, la música cambia con una transición suave.`, listening: (i, n, name) => `Escuchando y clasificando ${i}/${n}: «${name}»…`, addedN: (n, list) => `Se guardaron ${n} canción(es) en tu teléfono: ${list}. Puedes cambiar la categoría si quieres.`, listen: 'Escuchar', rename: 'Renombrar', renameAsk: 'Nuevo nombre de la canción:', catLbl: 'Categoría', delAsk: n => `¿Borrar «${n}» de tu banco?`, catAuto: c => `✨ La app la escuchó: ${c}`, catByYou: '✋ Categoría elegida por ti', musicUsed: '🎵 Música:', upload: '📂 Subir canciones (varias a la vez)', pixTitle: '📱 Cómo bajar música gratis de Pixabay en tu iPhone', mine: 'Mi música', builtIn: 'Incluida en la app (instrumentos reales)', tagFor: 'Estilo de la canción que subes:',
    musicHintTxt: 'Sube tus canciones (MP3 o M4A, varias a la vez, por ejemplo de Pixabay Music). Se guardan solo en este teléfono, no en internet. La app escucha cada una y le pone sola la categoría. Mientras tu banco esté vacío, usa piano y guitarra reales grabados.', uploaded: n => `Listo: «${n}» quedó guardada en tu teléfono y ya está elegida.`, upFail: 'No se pudo leer ese audio. Prueba con un .mp3 o .m4a.', delTrack: 'Borrar', sfx: 'Efectos de sonido reales',
    pix: ['Abre <b>Safari</b> y entra a <a href="https://pixabay.com/music/" target="_blank" rel="noopener">pixabay.com/music</a>.', 'En el buscador escribe el estilo que quieres: <b>emotional piano</b>, <b>inspiring</b>, <b>motivational</b> o <b>happy ukulele</b>. También puedes usar el filtro <b>Mood</b> (Emotional, Happy, Hopeful…).', 'Toca ▶ para escucharla. Cuando te guste, toca <b>Download</b> (Descargar). Si te pide cuenta, puedes crearla gratis.', 'Safari pregunta si quieres descargar: toca <b>Descargar</b>. La canción (.mp3) se guarda en la app <b>Archivos → Descargas</b> (la flechita ⬇ arriba en Safari la muestra).', 'Vuelve a esta app, elige el estilo (Emotiva, Alegre o Superación) y toca <b>📂 Subir mi música</b> → <b>Explorar</b> → <b>Descargas</b> → toca la canción.', 'Listo: queda guardada en tu teléfono, aparece en la lista <b>Música</b> y la app la baja de volumen sola cuando los muñequitos hablan.', '<b>Licencia:</b> la música de Pixabay se puede usar gratis en tus videos, también monetizados, sin dar crédito (aunque es buen gesto). No la vendas ni la compartas como archivo suelto. Si alguna red marca un aviso de derechos, en la página de la canción en Pixabay está la licencia para disputarlo.'],
    voiceHintTxt: 'Solo voces naturales de OpenAI, habladas con emoción. Cada personaje usa una voz de su género: hombres Onyx y Ash; mujeres Coral y Nova.', cloudOpenaiTxt: 'Es la misma clave de la sección 9 y se guarda solo en este teléfono. Es de pago por uso (unos centavos por video). Créala en <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com → API keys</a>.', noKeyVoice: 'Sin clave de OpenAI el video salió sin voces (solo subtítulos). Pega tu clave en la sección 8 para que hablen.', aiMsgNote: 'En «Solo música con mensaje» se usan los escenarios animados de la app.',
    credits: 'Sonidos: «Oculus Audio Pack 1» de Meta (CC BY 4.0) e «Impact Sounds» de Kenney (CC0). Piano y guitarra: instrumentos grabados de Meta (CC0).',
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
    linkUrl: 'Link (URL)', linkLabel: 'Link button text', s7: 'Voice, music and sound effects', voice: 'Main character voice',
    voiceHint: 'The neural voice downloads once (≈60 MB) and stays saved in your browser.', music: 'Music', musicVol: 'Music volume',
    sfx: 'Sound effects', generate: 'Generate preview', regenerate: 'Regenerate preview', empty: 'Pick your options and press "Generate preview".',
    export: 'Export MP4', srt: 'Subtitles .srt', cancel: 'Cancel', script: 'Script (editable)', apply: 'Apply changes',
    foot: 'Everything is generated in your browser. Vertical 1080×1920 for Shorts, Reels and Facebook.',
    color: 'Color', bw: 'B/W', escalada: 'Rising gag + twist', caminos: 'Two paths',
    ctaTypes: { like: 'Like', follow: 'Follow', stars: 'Stars', link: 'Link', combo: 'Combo' },
    kinds: { msg: 'On-screen phrase', act: 'Action (no voice)', hook: 'Hook', setup: 'Setup', rep: 'Repetition', twist: 'Final twist', after: 'Punchline', reflect: 'Reflection', cta: 'Call to action' },
    vPiper: 'Neural voice', vMe: 'Basic offline voice (robotic)', vNone: 'No voice (subtitles only)', qLbl: 'On-screen final question (to drive comments)', punchBtn: '✨ Make this script funnier (AI)', punching: 'Punching up the script…', punched: 'Done: improved script (marked ✨). Generate the preview.', mainLbl: 'Main character', girlsLbl: 'How many girls?', boy: '👦 Boy', girl: '👧 Girl', actionOn: '🎬 More action, less talking', actionHint: 'Fewer spoken lines and more physical comedy: slips, faints, chases and escapes, with punchy real sound effects.', s8: 'AI backgrounds', aiOn: 'Use AI-drawn backgrounds (OpenAI)', aiIntro: 'The AI draws detailed scenery (houses, streets, office, church…) and the app animates the stick figures on top: they talk, blink, gesture and walk.', appSits: 'App stories', trendLbl: 'Current trend (optional)', trendPh: 'E.g.: egg prices, rent, tipping culture', trendBtn: '🔎 Find what\'s viral now', writeBtn: '✨ Write 3 stories with AI', writerHint: 'Uses your OpenAI key (paste it in section 8). The AI searches the web for what\'s viral and writes funny stories.', searching: 'Searching what\'s viral right now…', writing: 'Writing 3 new stories…', trendsFound: n => `Found ${n} trends. Tap one to use it.`, written: 'Done: 3 new AI stories (tagged "AI"). Pick one.', noTrends: 'No trends found right now; type one above.', needKeyAI: 'Paste your OpenAI key in section 8 first.', costTitle: 'Approximate cost of this video:', cTrends: 'trend search', cWrite: 'AI script', cBg: n => `${n} AI backgrounds`, cVoice: 'OpenAI voice', cEleven: 'ElevenLabs voice (your plan credits)', costFree: 'This video is free (everything runs on your phone).', keyNote: 'Your OpenAI key is used for backgrounds, the OpenAI voice and AI stories.', iaTag: 'AI', aiModel: 'Model', aiQuality: 'Quality', aiConsistent: 'Keep the same characters in every scene', qLow: 'Low (fast)', qMedium: 'Medium (recommended)', qHigh: 'High (expensive)', aiHintTxt: (n, c) => `Each video uses 2–3 backgrounds (≈ ${c} USD at this quality), charged to your OpenAI balance. Takes 1–2 minutes; keep the screen on. The same key works for the OpenAI voice and AI story writing. If OpenAI asks you to verify your organization, do it at platform.openai.com → Settings → Organization.`, stImg: (i, n) => `Drawing AI backgrounds ${i}/${n}… (1–2 minutes)`, imgFail: 'Could not create the AI backgrounds; the app backgrounds were used. Reason: ', imgSome: n => `${n} background(s) failed and the app ones were used.`, gFree: 'Free (in the browser)', gEleven: 'ElevenLabs · very natural (free 10 min/month, needs key)', gOpenai: 'OpenAI · natural (paid, needs key)', loadVoices: 'Load my voices', ctaHint: 'Tap one or two (they are combined into one sentence).', hintPiper: 'Free. Downloads once (≈60 MB, use Wi‑Fi) and stays saved in your browser. Decent, less natural than ElevenLabs.', hintMe: 'Robotic. Use only when offline.', hintNone: 'The video will have music, sound effects and subtitles, no voice.', keyEleven: 'Your ElevenLabs API key', keyOpenai: 'Your OpenAI API key', cloudEleven: 'Saved only on this phone. Free plan: about 10 minutes of voice per month (≈15 videos of 40 s), no commercial use. To monetize: Starter plan (≈5 USD/month). Create your key at <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener">elevenlabs.io → API Keys</a>.', cloudOpenai: 'Saved only on this phone. Pay per use (a few cents per video) and you need prepaid credit. Create your key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com → API keys</a>.', voicesLoaded: n => `Loaded ${n} voices from your account.`, needKey: 'Paste your key first.', cloudFallback: 'The cloud voice failed; the free neural voice was used instead.', ctaBadge: n => `#${n}`,
    s0: 'Video type', vVoz: '🎙️ With voices', vVozD: 'Characters talk', vMus: '🎵 Music + message only', vMusD: 'No voices, on-screen phrases',
    vtypeVoz: 'The stick figures talk in Spanish or English with natural OpenAI voices, subtitles and music that ducks when they speak.', vtypeMus: 'No voices: one stick figure does something meaningful (climbing a mountain, falling and getting up, walking in the rain…) with emotional music. The message appears in a few big, short phrases and ends with a strong reflection. No key needed.',
    s4msg: 'Story with a message', mimeTag: 'Pantomime', soloTag: 'Message', mimeBtn: '✨ Invent 3 new pantomime stories (AI)', writingMime: 'Inventing new pantomime stories…', wroteMime: n => `Done: ${n} new pantomime stories (tagged "AI"). Pick one and generate.`, needKeyMime: 'To invent stories with AI, paste your OpenAI key in section 8.', noMime: 'The AI returned no stories. Try again.',
    autoMusic: '🤖 Automatic: the app picks based on the story', bankTitle: '🎵 My music bank', bankHint: n => `You have ${n} song(s) in your bank. On "Automatic" the app reads the script and picks the one that fits each part of the story, without always repeating the same; if the emotion changes, the music changes with a smooth crossfade.`, listening: (i, n, name) => `Listening and sorting ${i}/${n}: "${name}"…`, addedN: (n, list) => `Saved ${n} song(s) on your phone: ${list}. You can change the category if you want.`, listen: 'Listen', rename: 'Rename', renameAsk: 'New song name:', catLbl: 'Category', delAsk: n => `Delete "${n}" from your bank?`, catAuto: c => `✨ The app listened: ${c}`, catByYou: '✋ Category chosen by you', musicUsed: '🎵 Music:', upload: '📂 Upload songs (several at once)', pixTitle: '📱 How to get free music from Pixabay on your iPhone', mine: 'My music', builtIn: 'Built-in (real instruments)', tagFor: 'Style of the song you upload:',
    musicHintTxt: 'Upload your songs (MP3 or M4A, several at once, e.g. from Pixabay Music). They are saved only on this phone, never online. The app listens to each one and sorts it automatically. While your bank is empty it uses real recorded piano and guitar.', uploaded: n => `Done: "${n}" is saved on your phone and selected.`, upFail: 'Could not read that audio. Try an .mp3 or .m4a.', delTrack: 'Delete', sfx: 'Real sound effects',
    pix: ['Open <b>Safari</b> and go to <a href="https://pixabay.com/music/" target="_blank" rel="noopener">pixabay.com/music</a>.', 'Search for a style: <b>emotional piano</b>, <b>inspiring</b>, <b>motivational</b> or <b>happy ukulele</b>, or use the <b>Mood</b> filter.', 'Tap ▶ to listen. When you like one, tap <b>Download</b>. If it asks for an account, you can sign up for free.', 'Safari asks if you want to download it: tap <b>Download</b>. The song (.mp3) goes to the <b>Files → Downloads</b> app (the ⬇ arrow in Safari shows it).', 'Come back to this app, pick the style (Emotional, Happy or Uplifting) and tap <b>📂 Upload my music</b> → <b>Browse</b> → <b>Downloads</b> → tap the song.', 'Done: it is saved on your phone, appears in the <b>Music</b> list, and the app lowers it automatically when the characters talk.', '<b>License:</b> Pixabay music is free to use in your videos, monetized ones too, no credit required (but nice to give). Do not sell or share it as a standalone file. If a platform flags a copyright notice, the license on the song\'s Pixabay page lets you dispute it.'],
    voiceHintTxt: 'Only natural OpenAI voices, spoken with emotion. Each character gets a voice of their gender: men Onyx and Ash; women Coral and Nova.', cloudOpenaiTxt: 'Same key as section 9, saved only on this phone. Pay per use (a few cents per video). Create it at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com → API keys</a>.', noKeyVoice: 'Without an OpenAI key the video has no voices (subtitles only). Paste your key in section 8 so they talk.', aiMsgNote: 'In "Music + message only" the app\'s animated scenery is used.',
    credits: 'Sounds: "Oculus Audio Pack 1" by Meta (CC BY 4.0) and "Impact Sounds" by Kenney (CC0). Piano and guitar: recorded instruments by Meta (CC0).',
    stVoice: (i, n) => `Generating voice ${i}/${n}…`, stDl: (p) => `Downloading neural voice… ${p}`, stMix: 'Mixing music and sound effects…',
    stReady: (s, n) => `Ready: ${s.toFixed(1)} s · ${n} scenes. Check the preview and export.`, stFallback: 'Could not load the neural voice (offline?). Using the basic offline voice.',
    exporting: p => `Exporting… ${Math.round(p * 100)}%`, exported: 'Download video', exportErr: 'Export error: ', webmNote: 'Your browser cannot record MP4, so it was exported as WebM. Use an up-to-date Chrome, Edge or Safari for MP4.',
    meta: (s, n, sh) => `${s.toFixed(1)} s · ${n} scenes · ${sh} shots · 1080×1920`, linkMissing: 'Set up your link below to use this call to action.', noAudio: 'Note: this browser cannot encode audio; the MP4 has no sound. Use Chrome or Edge.', keepOpen: 'Exporting: keep the screen on and stay in this app until it finishes.', savedHintIOS: 'Done. Tap "Save to Photos / Share" and choose "Save Video".', share: 'Save to Photos / Share', opusNote: 'MP4 ready (Opus audio). If a social network does not pick up the sound, export from Chrome/Edge on Windows or Mac, or Safari: there the audio is AAC.',
  },
};

// ---------- estado ----------
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const DEFAULTS = { vtype: 'voz', msgSel: 0, voice: 'ash', musicHist: [], aiMime: [], mimeTitles: [], mainGender: 'm', nGirls: 1, lang: 'es', theme: 'trabajador', qSel: 0, qSeed: 1, nChars: 2, env: 'auto', color: true, dur: 'm', sit: 0, hookSeed: 1, ctaSeed: 1, hook: 0, cta: 0, ctaSel: [0], voiceSel: null, action: true, aiOn: false, aiModel: 'gpt-image-1-mini', aiQuality: 'medium', aiIdeas: {}, trend: '', trends: [], usedAI: {}, page: '', linkUrl: '', linkLabel: '', music: 'auto', musicVol: 0.6, sfx: true };
let S = { ...DEFAULTS };
try { S = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('munequitos-state') || '{}') }; } catch { /* sin almacenamiento */ }
const save = () => { try { localStorage.setItem('munequitos-state', JSON.stringify(S)); } catch { /* ignorar */ } };
if (!Array.isArray(S.ctaSel) || !S.ctaSel.length) S.ctaSel = [S.cta || 0];
// solo voces de OpenAI (las robóticas y las otras se quitaron)
if (!OPENAI_VOICES.some(v => v.id === S.voice)) S.voice = S.mainGender === 'f' ? 'nova' : 'ash';
if (S.music === 'superacion') S.music = 'inspiracional';
if (!(S.music === 'auto' || MUSIC_STYLES.some(m => m.id === S.music) || String(S.music).startsWith('mine:'))) S.music = 'auto';
delete S.engine; delete S.voiceSel; delete S.voiceId; delete S.elevenList;
// clave de OpenAI: solo en este dispositivo
let KEYS = { openai: '' };
try { KEYS = { ...KEYS, ...JSON.parse(localStorage.getItem('munequitos-keys') || '{}') }; } catch { /* sin almacenamiento */ }
const saveKeys = () => { try { localStorage.setItem('munequitos-keys', JSON.stringify(KEYS)); } catch { /* ignorar */ } };
const MSG = () => S.vtype === 'musica';
let TRACKS = [];
const msgStories = () => [...ALL_MESSAGE_STORIES(), ...(S.aiMime || [])];
async function refreshTracks() { TRACKS = await listTracks(); if (String(S.music).startsWith('mine:') && !TRACKS.some(t => 'mine:' + t.id === S.music)) S.music = 'auto'; renderAll(); }
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

  // tipo de video
  $('#vtypeSeg').replaceChildren(btn('', `${L.vVoz}<small>${L.vVozD}</small>`, !MSG(), () => { S.vtype = 'voz'; change(); }), btn('', `${L.vMus}<small>${L.vMusD}</small>`, MSG(), () => { S.vtype = 'musica'; change(); }));
  $('#vtypeHint').textContent = MSG() ? L.vtypeMus : L.vtypeVoz;
  for (const id of ['#themeCard', '#fNchars', '#envBox', '#actionBox', '#aiWriter', '#punchBtn', '#hookCard', '#qBox', '#voiceLbl', '#voice', '#voiceHint', '#aiCard']) $(id).hidden = MSG();
  $('#s4lbl').textContent = MSG() ? L.s4msg : L.s4;
  $('#mimeBtn').hidden = !MSG(); $('#mimeBtn').textContent = L.mimeBtn;
  const th = $('#themes'); th.replaceChildren(...THEMES.map(t => btn('chip', `${t.emoji} ${esc(t.name[S.lang])}`, S.theme === t.id, () => { S.theme = t.id; S.sit = 0; S.hook = 0; S.hookSeed = 1; S.qSel = 0; change(); })));
  $('#nchars').replaceChildren(...[1, 2, 3, 4].map(n => btn('', String(n), S.nChars === n, () => { S.nChars = n; change(); })));
  $('#fGirls').hidden = MSG(); { const minG = S.mainGender === 'f' ? 1 : 0, maxG = S.mainGender === 'f' ? S.nChars : S.nChars - 1; S.nGirls = Math.max(minG, Math.min(maxG, S.nGirls ?? 1));
    $('#mainSeg').replaceChildren(btn('', L.boy, S.mainGender !== 'f', () => { S.mainGender = 'm'; change(); }), btn('', L.girl, S.mainGender === 'f', () => { S.mainGender = 'f'; change(); }));
    const opts2 = []; for (let k = minG; k <= maxG; k++) opts2.push(k);
    $('#girlsSeg').replaceChildren(...opts2.map(k => btn('', String(k), S.nGirls === k, () => { S.nGirls = k; change(); }))); }
  $('#colorSeg').replaceChildren(btn('', '🎨 ' + L.color, S.color, () => { S.color = true; change(false); }), btn('', '⚫⚪ ' + L.bw, !S.color, () => { S.color = false; change(false); }));
  $('#envs').replaceChildren(...ENVIRONMENTS.map(e => btn('chip', `${e.emoji} ${esc(e.name[S.lang])}`, S.env === e.id, () => { S.env = e.id; change(); })));
  $('#durs').replaceChildren(...Object.entries(DURATIONS).map(([k, d]) => btn('', `${d.label[S.lang]}<small>${k === 's' ? (S.lang === 'es' ? 'Rápido' : 'Quick') : k === 'm' ? (S.lang === 'es' ? 'Estándar' : 'Standard') : (S.lang === 'es' ? 'Completo' : 'Full')}</small>`, S.dur === k, () => { S.dur = k; change(); })));

  const sits = currentSits();
  if (MSG()) $('#sits').replaceChildren(...msgStories().map((m, i) => btn('opt', `<span class="tag${m.ai ? ' ia' : ''}">${m.ai ? L.iaTag + ' · ' : ''}${m.emoji || '🎭'} ${m.kind === 'mime' ? L.mimeTag : L.soloTag}</span><div><b>${esc((m.title && m.title[S.lang]) || '')}</b><span class="d">${esc((m.desc && m.desc[S.lang]) || '')}</span></div>`, (S.msgSel || 0) === i, () => { S.msgSel = i; change(); })));
  else $('#sits').replaceChildren(...sits.map((s, i) => btn('opt', `<span class="tag${s.ai ? ' ia' : ''}">${s.ai ? L.iaTag + ' · ' : ''}${s.mode === 'caminos' ? L.caminos : L.escalada}</span><div><b>${esc(s.title[S.lang])}</b><span class="d">${esc(s.hook[S.lang])}</span></div>`, S.sit === i, () => { S.sit = i; S.hook = 0; S.qSel = 0; change(); })));
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

  const vs = $('#voice');
  vs.replaceChildren(...OPENAI_VOICES.map(v => new Option(v.label[S.lang], v.id))); vs.value = S.voice;
  $('#voiceHint').textContent = L.voiceHintTxt; $('#cloudHint').innerHTML = L.cloudOpenaiTxt;
  if (document.activeElement !== $('#apiKey')) $('#apiKey').value = KEYS.openai || '';
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
  { const qs = questionOptions(S.theme, sit, S.qSeed || 1); $('#questions').replaceChildren(...qs.map((q, i) => btn('opt', `<span class="tag">?</span><div><b>${esc(q[S.lang])}</b></div>`, (S.qSel || 0) === i, () => { S.qSel = i; change(); }))); }
  { const group = (label, opts) => { const g = document.createElement('optgroup'); g.label = label; g.append(...opts); return g; };
    const groups = [new Option(L.autoMusic, 'auto')]; if (TRACKS.length) groups.push(group('🎵 ' + L.mine, TRACKS.map(t => new Option(`${t.name} · ${catName(t.cat, S.lang)}`, 'mine:' + t.id))));
    groups.push(group(L.builtIn, MUSIC_STYLES.filter(m => m.id !== 'none').map(m => new Option(m.name[S.lang], m.id))), new Option(MUSIC_STYLES.find(m => m.id === 'none').name[S.lang], 'none'));
    $('#music').replaceChildren(...groups); $('#music').value = S.music; if ($('#music').selectedIndex < 0) { S.music = 'auto'; $('#music').value = 'auto'; }
    $('#musicHint').textContent = TRACKS.length ? L.bankHint(TRACKS.length) : L.musicHintTxt;
    renderBank(L);
    $('#pixSteps').innerHTML = L.pix.map(x => `<li>${x}</li>`).join(''); }
  $('#musicVol').value = S.musicVol; $('#sfx').checked = S.sfx;
  $('#page').value = S.page; $('#linkUrl').value = S.linkUrl; $('#linkLabel').value = S.linkLabel;
  if (project) $('#meta').textContent = L.meta(project.total, project.beats.length, project.beats.reduce((s, b) => s + b.shots, 0));
}
// Género de cada personaje: A según la protagonista; el resto de muñequitas, desde B en adelante
function castGenders() {
  const g = { A: S.mainGender === 'f' ? 'f' : 'm' }; let left = (S.nGirls ?? 0) - (g.A === 'f' ? 1 : 0);
  for (const r of ['B', 'C', 'D'].slice(0, S.nChars - 1)) { g[r] = left > 0 ? 'f' : 'm'; if (left > 0) left--; }
  return g;
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
$('#voice').addEventListener('change', e => { S.voice = e.target.value; dirty = true; save(); renderAll(); });
$('#apiKey').addEventListener('input', e => { KEYS.openai = e.target.value.trim(); saveKeys(); dirty = true; renderCost(); });
$('#musicFile').addEventListener('change', async e => {
  const files = [...(e.target.files || [])]; e.target.value = ''; if (!files.length) return; const L = tr();
  const res = await addTracks(files, (i, n, name) => setStatus(L.listening(i, n, name.replace(/\.[^.]+$/, ''))));
  const ok = res.filter(r => r.ok), bad = res.filter(r => !r.ok);
  dirty = true; save(); await refreshTracks();
  setStatus(L.addedN(ok.length, ok.map(r => `«${r.name}» → ${catName(r.cat, S.lang)}`).join(' · ')) + (bad.length ? ' ' + L.upFail + ' (' + bad.map(r => r.name).join(', ') + ')' : ''), !!bad.length && !ok.length);
});
let bankAudio = null, bankPlaying = null;
function stopBank() { if (bankAudio) { bankAudio.pause(); URL.revokeObjectURL(bankAudio.src); bankAudio = null; } bankPlaying = null; }
function renderBank(L) {
  $('#myTracks').replaceChildren(...TRACKS.map(t => {
    const d = document.createElement('div'); d.className = 'track';
    const play = document.createElement('button'); play.type = 'button'; play.className = 'play'; play.textContent = bankPlaying === t.id ? '❚❚' : '▶'; play.setAttribute('aria-label', L.listen);
    play.addEventListener('click', async () => {
      if (bankPlaying === t.id) { stopBank(); renderBank(L); return; }
      stopBank(); const blob = await getTrackBlob(t.id); if (!blob) return;
      bankAudio = new Audio(URL.createObjectURL(blob)); bankPlaying = t.id; bankAudio.onended = () => { stopBank(); renderBank(L); };
      bankAudio.play().catch(err => { console.warn(err); stopBank(); }); renderBank(L);
    });
    const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = t.name; nm.title = L.rename;
    const ren = document.createElement('button'); ren.type = 'button'; ren.className = 'x'; ren.textContent = '✏️'; ren.title = L.rename;
    const doRename = async () => { const v = prompt(L.renameAsk, t.name); if (v && v.trim()) { await renameTrack(t.id, v); await refreshTracks(); } };
    ren.addEventListener('click', doRename); nm.addEventListener('click', doRename);
    const sel = document.createElement('select'); sel.setAttribute('aria-label', L.catLbl);
    sel.append(...MUSIC_CATS.map(c => new Option(`${c.emoji} ${c.name[S.lang]}${c.id === t.autoCat ? ' ✨' : ''}`, c.id))); sel.value = t.cat;
    sel.addEventListener('change', async () => { await setTrackCat(t.id, sel.value); dirty = true; await refreshTracks(); });
    const del = document.createElement('button'); del.type = 'button'; del.className = 'x'; del.textContent = '🗑'; del.title = L.delTrack;
    del.addEventListener('click', async () => { if (!confirm(L.delAsk(t.name))) return; if (bankPlaying === t.id) stopBank(); await deleteTrack(t.id); dirty = true; await refreshTracks(); });
    const info = document.createElement('small');
    info.textContent = (t.userCat ? L.catByYou : L.catAuto(catName(t.autoCat || t.cat, S.lang))) + ` · ${Math.round(t.dur || 0)} s` + (t.bpm ? ` · ${t.bpm} BPM` : '');
    d.append(play, nm, ren, sel, del, info); return d;
  }));
}
$('#mimeBtn').addEventListener('click', async () => {
  const L = tr(); if (!KEYS.openai) { setStatus(L.needKeyMime, true); return; }
  const b = $('#mimeBtn'); b.disabled = true; setStatus(L.writingMime);
  try {
    const avoid = [...ALL_MESSAGE_STORIES().map(m => m.title.es), ...(S.mimeTitles || [])].slice(-60);
    const ideas = await writeMime(KEYS.openai, { lang: S.lang, avoid, genders: castGenders() });
    if (!ideas.length) throw new Error(L.noMime);
    S.aiMime = [...ideas, ...(S.aiMime || [])].slice(0, 9);
    S.mimeTitles = [...(S.mimeTitles || []), ...ideas.map(x => x.title.es)].slice(-80);
    S.msgSel = ALL_MESSAGE_STORIES().length; dirty = true; save(); renderAll(); setStatus(L.wroteMime(ideas.length));
  } catch (e) { console.warn(e); setStatus(String(e.message || e), true); } finally { b.disabled = false; }
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
$('#punchBtn').addEventListener('click', async () => {
  const L = tr(); if (!KEYS.openai) { setStatus(L.needKeyAI, true); return; }
  const b = $('#punchBtn'); b.disabled = true; setStatus(L.punching);
  try {
    const sits = currentSits(); const story = sits[S.sit] || sits[0];
    const better = await punchUp(KEYS.openai, story, { lang: S.lang, nChars: S.nChars, dur: S.dur, genders: castGenders() });
    const k = S.theme + '|' + S.lang;
    S.aiIdeas = { ...S.aiIdeas, [k]: [better, ...sits.filter(x => x !== story)].slice(0, 6) }; S.sit = 0; S.hook = 0; S.hookSeed = 1; dirty = true; save(); renderAll(); setStatus(L.punched);
  } catch (e) { console.warn(e); setStatus(String(e.message || e), true); } finally { b.disabled = false; }
});
$('#writeBtn').addEventListener('click', async () => {
  const L = tr(); if (!KEYS.openai) { setStatus(L.needKeyAI, true); return; }
  const b = $('#writeBtn'); b.disabled = true; setStatus(L.writing);
  try {
    const th = THEMES.find(t => t.id === S.theme);
    const ideas = await writeIdeas(KEYS.openai, { lang: S.lang, theme: S.theme, themeName: th.name[S.lang], trend: (S.trend || '').trim(), nChars: S.nChars, dur: S.dur, genders: castGenders() });
    if (!ideas.length) throw new Error('La IA no devolvió historias.');
    S.aiIdeas = { ...S.aiIdeas, [S.theme + '|' + S.lang]: ideas }; S.sit = 0; S.hook = 0; S.hookSeed = 1; dirty = true; save(); renderAll(); setStatus(L.written);
    document.querySelector('#sits').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) { console.warn(e); setStatus(String(e.message || e), true); }
  finally { b.disabled = false; }
});
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
  const L = tr(); const items = []; const engine = MSG() ? 'none' : 'openai';
  const k = S.theme + '|' + S.lang; const aiStory = !!(S.aiIdeas && S.aiIdeas[k]);
  if (S.usedAI && S.usedAI[k + '|t'] && !MSG()) items.push([L.cTrends, PRICE.trends]);
  if (aiStory && !MSG()) items.push([L.cWrite, PRICE.write]);
  if (S.aiOn && !MSG()) { const n = S.dur === 's' ? 2 : 3; items.push([L.cBg(n), n * imagePrice(S.aiModel, S.aiQuality)]); }
  if (engine === 'openai') items.push([L.cVoice, S.dur === 's' ? 0.008 : S.dur === 'm' ? 0.014 : 0.02]);
  const box = $('#costBox');
  if (!items.length) { box.hidden = false; box.textContent = L.costFree; return; }
  const total = items.reduce((a, b) => a + b[1], 0);
  box.hidden = false;
  box.innerHTML = `${esc(L.costTitle)} <b>≈ ${total.toFixed(2)} USD</b><br><small>${items.map(([n, c]) => `${esc(n)}: ${c.toFixed(3)}`).join(' · ')}</small>`;
}
function setStatus(msg, err = false) { const el = $('#status'); el.textContent = msg; el.classList.toggle('err', err); }

// Escoge la música: automática según la emoción de cada parte del guion (cambia con transiciones suaves) o la que elegiste
async function prepareMusic(theme) {
  const secs = moodSections(project.beats, theme, MSG() ? 5 : 5.5);
  const plan = planMusic(secs, { choice: S.music, tracks: TRACKS, history: S.musicHist || [], seed: Date.now() });
  const own = new Map();
  for (const sec of plan) if (sec.kind === 'bank' && !own.has(sec.id)) { try { const b = await loadTrack(sec.id); if (b) own.set(sec.id, b); } catch (e) { console.warn('banco', e); } }
  // recuerda las últimas usadas para no repetir siempre las mismas
  const ids = plan.filter(x => x.kind === 'bank').map(x => x.id);
  if (ids.length) { S.musicHist = [...ids, ...(S.musicHist || []).filter(x => !ids.includes(x))].slice(0, 30); save(); }
  project.musicPlan = plan;
  return own;
}
const musicSummary = (L) => !project || !project.musicPlan ? '' : L.musicUsed + ' ' + project.musicPlan.map(x => x.style === 'none' ? '—' : `${catName(x.cat, S.lang)}${x.kind === 'bank' ? ` («${x.name}»)` : ''}`).join(' → ');

async function generateMessage(L, customTexts) {
  const all = msgStories(); const story = all[S.msgSel || 0] || all[0];
  const ctas = ctaOptions(S.ctaSeed, !!(S.linkUrl || S.linkLabel));
  const chosen = S.ctaSel.map(i => ctas[i]).filter(Boolean);
  const settings = { page: S.page, linkUrl: S.linkUrl, linkLabel: S.linkLabel };
  const { beats, total, ambience, ambienceFrom, ambienceUntil } = buildMessage({ story, lang: S.lang, dur: S.dur, ctas: chosen.length ? chosen : [ctas[0]], settings });
  if (customTexts) beats.forEach((b, i) => { if (customTexts[i] != null && customTexts[i].trim()) b.text = customTexts[i].trim(); });
  project = prepareProject({ mode: 'musica', beats, total, lang: S.lang, color: S.color, nChars: 1, page: S.page, linkUrl: S.linkUrl, linkLabel: S.linkLabel, music: S.music, sitId: story.id, genders: story.genders || { A: S.mainGender === 'f' ? 'f' : 'm' }, ambience, ambienceFrom, ambienceUntil });
  setStatus(L.stMix);
  const own = await prepareMusic('msg');
  mix = await renderMix(project, { musicVol: S.musicVol, sfxOn: S.sfx, own });
  return musicSummary(L);
}

async function generate(customTexts = null) {
  const L = tr(); stop();
  $('#genBtn').disabled = true;
  try {
    await document.fonts.load(`700 80px ${FONT}`).catch(() => {});
    let note = '', warn = false;
    if (MSG()) { note = await generateMessage(L, customTexts); }
    else {
      const sits = currentSits(); const sit = sits[S.sit] || sits[0];
      const hooks = hookOptions(S.theme, sit, S.hookSeed); const ctas = ctaOptions(S.ctaSeed, !!(S.linkUrl || S.linkLabel));
      const settings = { env: S.env, page: S.page, linkUrl: S.linkUrl, linkLabel: S.linkLabel, action: S.action !== false };
      const question = questionOptions(S.theme, sit, S.qSeed || 1)[S.qSel || 0];
      let beats = buildBeats({ situation: sit, lang: S.lang, dur: S.dur, hook: hooks[S.hook] || hooks[0], question, ctas: S.ctaSel.map(i => ctas[i]).filter(Boolean).length ? S.ctaSel.map(i => ctas[i]).filter(Boolean) : [ctas[0]], settings });
      if (customTexts) beats.forEach((b, i) => { if (customTexts[i] != null && customTexts[i].trim()) b.text = customTexts[i].trim(); });
      if (settings.action && !sit.ai && !sit.silent) beats = insertActions(beats, { nChars: S.nChars, lang: S.lang, every: 1 });
      planDirection(beats, { nChars: S.nChars, lang: S.lang, action: settings.action });
      tagVisuals(beats); // lo que se dice, se ve
      const D = DURATIONS[S.dur]; const key = KEYS.openai; const genders = castGenders();
      const vfor = role => voiceForRole(S.voice, role || 'A', genders);
      if (key) {
        for (let i = 0; i < beats.length; i++) {
          const b = beats[i]; if (b.kind === 'act' || b.mute || !b.text) continue;
          setStatus(L.stVoice(i + 1, beats.length));
          const buf = await synth(speakable(b.text), { voiceId: vfor(b.speaker), apiKey: key, lang: S.lang, mood: b.kind });
          if (b.react && b.react.vocal) {
            const rb = await synth(speakable(b.react.vocal), { voiceId: vfor(b.react.role), apiKey: key, lang: S.lang, mood: 'react' });
            b.reactBuffer = rb; b.reactDur = rb ? Math.min(1.6, rb.duration) : 0.7; b.reactLip = computeLip(rb);
          }
          b.voiceBuffer = buf; b.voiceDur = buf ? buf.duration : undefined; b.lip = computeLip(buf);
        }
      } else { note = L.noKeyVoice; warn = true; }
      let total = timeBeats(beats, S.dur, false);
      // si se pasa: primero quita escenas intermedias (nunca la primera ni la última), luego reacciones
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
      project = prepareProject({ mode: 'voz', beats, total, lang: S.lang, color: S.color, nChars: S.nChars, page: S.page, linkUrl: S.linkUrl, linkLabel: S.linkLabel, music: S.music, sitId: sit.id, genders });
      if (S.aiOn) {
        try {
          const { images, errors } = await generateBackgrounds(project, sit, { apiKey: KEYS.openai, model: S.aiModel, quality: S.aiQuality, onProgress: (i2, n) => setStatus(L.stImg(i2, n)) });
          if (images.size) project.aiBg = images;
          if (!images.size) { note = L.imgFail + (errors[0] || ''); warn = true; }
          else if (errors.length) { note = L.imgSome(errors.length) + ' ' + errors[0]; warn = true; }
        } catch (e) { console.warn('IA fondos', e); note = L.imgFail + (e.message || e); warn = true; }
      }
      setStatus(L.stMix);
      const own = await prepareMusic(S.theme);
      mix = await renderMix(project, { musicVol: S.musicVol, sfxOn: S.sfx, own });
      note = [note, musicSummary(L)].filter(Boolean).join(' · ');
    }
    dirty = false;
    renderScript();
    $('#redoBg').hidden = !project.aiBg;
    $('#emptyMsg').hidden = true; $('#player').hidden = false; $('#exportRow').hidden = false; $('#bigPlay').hidden = false; $('#dl').hidden = true;
    curTime = 0; drawAt(0);
    if (window.matchMedia('(max-width: 900px)').matches) document.querySelector('.phone').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setStatus(L.stReady(project.total, project.beats.length) + (note ? ' · ' + note : ''), warn);
    renderAll();
  } catch (e) {
    console.error(e); setStatus(String(e.message || e), true);
  } finally { $('#genBtn').disabled = false; }
}
$('#genBtn').addEventListener('click', () => generate());
$('#redoBg').addEventListener('click', () => { clearBgCache(); generate(); });

function renderScript() {
  const L = tr(); const ol = $('#scriptList');
  ol.replaceChildren(...project.beats.map((b, i) => { const li = document.createElement('li'); li.innerHTML = `<span class="k">${i + 1}. ${L.kinds[b.kind] || L.kinds.msg} · ${b.dur.toFixed(1)} s${b.vis ? ' · 🎞️' : ''}</span>`; const ta = document.createElement('textarea'); ta.value = b.text; ta.rows = 2; ta.dataset.i = i; li.appendChild(ta); return li; }));
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

renderAll(); refreshTracks();
// expone para pruebas automatizadas
window.__app = { generate, get project() { return project; }, get mix() { return mix; }, S, drawAt, exportMP4: () => exportMP4(project, mix) };
