import { THEMES, ENVIRONMENTS, SITUATIONS } from './content.js';
import { DURATIONS, buildComedy, timeBeats } from './script.js';
import { drawFrame, prepareProject, FONT } from './render.js';
import { renderMix, MUSIC_STYLES } from './audio.js';
import { exportMP4 } from './export.js';
import { IMAGE_MODELS, generateBackgrounds, imagePrice } from './aiimages.js';
import { searchTrends, writeIdeas, PRICE } from './scriptai.js';
import { planShots } from './direction.js';

const $ = s => document.querySelector(s);
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// ---------- estado ----------
const DEFAULTS = { theme: 'despertador', nChars: 2, env: 'auto', color: true, dur: 'm', sit: 0, music: 'mudo', musicVol: 0.6, sfx: true, cta: true, aiOn: false, aiModel: 'gpt-image-1-mini', aiQuality: 'medium', aiIdeas: {}, trend: '', trends: [], usedTrends: false, showTitle: true, reflEdits: {} };
let S = { ...DEFAULTS };
try { S = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('munequitos-mudo') || '{}') }; } catch { /* sin almacenamiento */ }
if (!THEMES.find(t => t.id === S.theme)) S.theme = DEFAULTS.theme;
const save = () => { try { localStorage.setItem('munequitos-mudo', JSON.stringify(S)); } catch { /* ignorar */ } };
let KEYS = { openai: '' };
try { KEYS = { ...KEYS, ...JSON.parse(localStorage.getItem('munequitos-keys') || '{}') }; } catch { /* sin almacenamiento */ }
const saveKeys = () => { try { localStorage.setItem('munequitos-keys', JSON.stringify(KEYS)); } catch { /* ignorar */ } };
let project = null, mix = null, dirty = true;

// ---------- controles ----------
function btn(cls, html, on, onClick) { const b = document.createElement('button'); b.type = 'button'; b.className = cls + (on ? ' on' : ''); b.innerHTML = html; b.addEventListener('click', onClick); return b; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function reflFor(st) { const k = st && st.id; return S.reflEdits && k in S.reflEdits ? S.reflEdits[k] : (st && st.refl) || ''; }
function currentSits() { const ai = S.aiIdeas && S.aiIdeas[S.theme]; return ai && ai.length ? ai : SITUATIONS[S.theme]; }

function renderAll() {
  $('#themes').replaceChildren(...THEMES.map(t => btn('chip', `${t.emoji} ${esc(t.name)}`, S.theme === t.id, () => { S.theme = t.id; S.sit = 0; change(); })));
  $('#nchars').replaceChildren(...[1, 2, 3, 4].map(n => btn('', String(n), S.nChars === n, () => { S.nChars = n; change(); })));
  $('#colorSeg').replaceChildren(btn('', '🎨 Color', S.color, () => { S.color = true; change(false); }), btn('', '⚫⚪ B/N', !S.color, () => { S.color = false; change(false); }));
  $('#envs').replaceChildren(...ENVIRONMENTS.map(e => btn('chip', `${e.emoji} ${esc(e.name)}`, S.env === e.id, () => { S.env = e.id; change(); })));
  $('#durs').replaceChildren(...Object.entries(DURATIONS).map(([k, d]) => btn('', `${d.label}<small>${d.sub}</small>`, S.dur === k, () => { S.dur = k; change(); })));
  const sits = currentSits();
  $('#sits').replaceChildren(...sits.map((s, i) => btn('opt', `<span class="tag${s.ai ? ' ia' : ''}">${s.ai ? 'IA' : '🎬'}</span><div><b>${esc(s.title)}</b><span class="d">${esc(s.desc || '')}</span></div>`, S.sit === i, () => { S.sit = i; change(); })));
  $('#appSits').hidden = !(S.aiIdeas && S.aiIdeas[S.theme]);
  $('#titleOn').checked = S.showTitle !== false;
  { const st = sits[S.sit] || sits[0]; if (document.activeElement !== $('#refl')) $('#refl').value = reflFor(st); }
  $('#trend').value = document.activeElement === $('#trend') ? $('#trend').value : (S.trend || '');
  $('#trendChips').replaceChildren(...(S.trends || []).map(tr => btn('chip trend', `<b>${esc(tr.title)}</b>${tr.summary ? '<br><small>' + esc(tr.summary) + '</small>' : ''}`, S.trend === tr.title, () => { S.trend = tr.title; save(); renderAll(); })));
  $('#music').replaceChildren(...MUSIC_STYLES.map(m => new Option(m.name.es, m.id))); $('#music').value = S.music;
  $('#musicVol').value = S.musicVol; $('#sfx').checked = S.sfx; $('#ctaOn').checked = S.cta !== false;
  if (document.activeElement !== $('#aiKey')) $('#aiKey').value = KEYS.openai || '';
  $('#aiOn').checked = S.aiOn; $('#aiCfg').hidden = !S.aiOn;
  $('#aiModel').replaceChildren(...IMAGE_MODELS.map(m => new Option(m.label.es, m.id))); $('#aiModel').value = S.aiModel;
  $('#aiQuality').replaceChildren(new Option('Baja (rápida)', 'low'), new Option('Media (recomendada)', 'medium'), new Option('Alta (cara)', 'high')); $('#aiQuality').value = S.aiQuality;
  $('#aiHint').textContent = `Cada video usa 2–4 fondos (≈ ${(3 * imagePrice(S.aiModel, S.aiQuality)).toFixed(2)} USD con esta calidad). Tarda 1–2 minutos; deja la pantalla encendida. Si OpenAI pide «verificar la organización», hazlo en platform.openai.com → Settings → Organization.`;
  renderCost();
  if (project) { $('#genBtn').textContent = 'Regenerar vista previa'; $('#meta').textContent = `${project.total.toFixed(1)} s · ${project.beats.length} escenas · ${project.beats.reduce((s, b) => s + b.shots, 0)} planos · 1080×1920`; }
}
function renderCost() {
  const items = [];
  if (S.usedTrends) items.push(['búsqueda de tendencias', PRICE.trends]);
  if (S.aiIdeas && S.aiIdeas[S.theme]) items.push(['historias con IA', PRICE.write]);
  if (S.aiOn) items.push(['fondos con IA', 3 * imagePrice(S.aiModel, S.aiQuality)]);
  const box = $('#costBox'); box.hidden = false;
  if (!items.length) { box.textContent = 'Este video no tiene costo (todo se genera en tu teléfono).'; return; }
  box.innerHTML = `Costo aproximado de este video: <b>≈ ${items.reduce((a, b) => a + b[1], 0).toFixed(2)} USD</b><br><small>${items.map(([n, c]) => `${esc(n)}: ${c.toFixed(3)}`).join(' · ')}</small>`;
}
function change(content = true) { if (content) dirty = true; save(); renderAll(); if (project && !content) { project.color = S.color; drawAt(curTime); } }
function setStatus(msg, err = false) { const el = $('#status'); el.textContent = msg; el.classList.toggle('err', err); }

$('#music').addEventListener('change', e => { S.music = e.target.value; dirty = true; save(); });
$('#musicVol').addEventListener('change', e => { S.musicVol = +e.target.value; dirty = true; save(); });
$('#sfx').addEventListener('change', e => { S.sfx = e.target.checked; dirty = true; save(); });
$('#ctaOn').addEventListener('change', e => { S.cta = e.target.checked; dirty = true; save(); });
$('#aiKey').addEventListener('input', e => { KEYS.openai = e.target.value.trim(); saveKeys(); });
$('#aiOn').addEventListener('change', e => { S.aiOn = e.target.checked; dirty = true; save(); renderAll(); });
$('#aiModel').addEventListener('change', e => { S.aiModel = e.target.value; dirty = true; save(); renderAll(); });
$('#aiQuality').addEventListener('change', e => { S.aiQuality = e.target.value; dirty = true; save(); renderAll(); });
$('#titleOn').addEventListener('change', e => { S.showTitle = e.target.checked; change(false); if (project) { project.showTitle = S.showTitle; drawAt(curTime); } });
$('#refl').addEventListener('input', e => { const st = currentSits()[S.sit] || currentSits()[0]; S.reflEdits = { ...(S.reflEdits || {}), [st.id]: e.target.value }; dirty = true; save(); });
$('#trend').addEventListener('input', e => { S.trend = e.target.value; save(); });
$('#appSits').addEventListener('click', () => { delete S.aiIdeas[S.theme]; S.sit = 0; change(); });
$('#trendBtn').addEventListener('click', async () => {
  if (!KEYS.openai) { setStatus('Primero pega tu clave de OpenAI en la sección 6.', true); return; }
  const b = $('#trendBtn'); b.disabled = true; setStatus('Buscando lo que está viral ahora…');
  try { const list = await searchTrends(KEYS.openai, { lang: 'es', theme: S.theme }); S.trends = list; S.usedTrends = true; save(); renderAll(); setStatus(list.length ? `Encontré ${list.length} tendencias. Toca una para usarla.` : 'No encontré tendencias ahora; escribe una tú arriba.', !list.length); }
  catch (e) { console.warn(e); setStatus(String(e.message || e), true); } finally { b.disabled = false; }
});
$('#writeBtn').addEventListener('click', async () => {
  if (!KEYS.openai) { setStatus('Primero pega tu clave de OpenAI en la sección 6.', true); return; }
  const b = $('#writeBtn'); b.disabled = true; setStatus('Escribiendo 3 historias de comedia muda…');
  try {
    const th = THEMES.find(t => t.id === S.theme);
    const ideas = await writeIdeas(KEYS.openai, { theme: S.theme, themeName: th.name, trend: (S.trend || '').trim(), nChars: S.nChars, dur: S.dur });
    if (!ideas.length) throw new Error('La IA no devolvió historias.');
    S.aiIdeas = { ...S.aiIdeas, [S.theme]: ideas }; S.sit = 0; dirty = true; save(); renderAll(); setStatus('Listo: 3 historias nuevas escritas con IA (marcadas «IA»). Elige una.');
    $('#sits').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) { console.warn(e); setStatus(String(e.message || e), true); } finally { b.disabled = false; }
});

// ---------- generación ----------
async function generate() {
  stop(); $('#genBtn').disabled = true;
  try {
    await document.fonts.load(`700 80px ${FONT}`).catch(() => {});
    const sits = currentSits(); const story = sits[S.sit] || sits[0];
    const beats = buildComedy({ story, dur: S.dur, settings: { env: S.env, cta: S.cta !== false, nChars: S.nChars, reflection: reflFor(story) } });
    const total = timeBeats(beats);
    planShots(beats, S.nChars);
    project = prepareProject({ beats, total, lang: 'es', color: S.color, nChars: S.nChars, music: S.music, sitId: story.id, title: story.title, showTitle: S.showTitle !== false });
    let note = '';
    if (S.aiOn) {
      if (!KEYS.openai) note = 'Para los fondos con IA falta tu clave de OpenAI (sección 6); se usaron los fondos de la app.';
      else try {
        const { images, errors } = await generateBackgrounds(project, { title: { es: story.title } }, { apiKey: KEYS.openai, model: S.aiModel, quality: S.aiQuality, onProgress: (i, n) => setStatus(`Dibujando fondos con IA ${i}/${n}… (1–2 minutos)`) });
        if (images.size) project.aiBg = images;
        if (!images.size) note = 'No se pudieron crear los fondos con IA; se usaron los de la app. ' + (errors[0] || '');
        else if (errors.length) note = `${errors.length} fondo(s) no se pudieron crear y se usaron los de la app.`;
      } catch (e) { console.warn(e); note = 'No se pudieron crear los fondos con IA; se usaron los de la app. ' + (e.message || e); }
    }
    setStatus('Mezclando música y efectos…');
    mix = await renderMix(project, { musicVol: S.musicVol, sfxOn: S.sfx });
    dirty = false;
    $('#emptyMsg').hidden = true; $('#player').hidden = false; $('#exportRow').hidden = false; $('#bigPlay').hidden = false; $('#dl').hidden = true; $('#shareBtn').hidden = true;
    curTime = 0; drawAt(0);
    if (window.matchMedia('(max-width: 900px)').matches) document.querySelector('.phone').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setStatus(note || `Listo: ${total.toFixed(1)} s · ${beats.length} escenas. Míralo y exporta.`, !!note);
    renderAll();
  } catch (e) { console.error(e); setStatus(String(e.message || e), true); }
  finally { $('#genBtn').disabled = false; }
}
$('#genBtn').addEventListener('click', () => generate());

// ---------- vista previa ----------
const canvas = $('#preview'); const pctx = canvas.getContext('2d');
let ac = null, src = null, t0 = 0, playing = false, curTime = 0, raf = 0;
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* no disponible */ }
function unlockAudio() { ac = ac || new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 }); if (ac.state !== 'running') ac.resume(); return ac; }
function drawAt(t) { if (!project) return; drawFrame(pctx, project, Math.min(t, project.total - 0.001), canvas.width / 1080); $('#seek').value = Math.round(t / project.total * 1000); $('#timeLbl').textContent = `${t.toFixed(1)} / ${project.total.toFixed(1)} s`; }
function play() {
  if (!project || !mix) return;
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
  if (!project) return; stop();
  const actx = unlockAudio();
  if (dirty) await generate(); if (!project) return;
  abort = new AbortController();
  $('#exportBtn').disabled = true; $('#exportProg').hidden = false; $('#dl').hidden = true; $('#shareBtn').hidden = true;
  if (IOS) setStatus('Exportando: deja la pantalla encendida y no cambies de app hasta que termine.');
  const bar = $('#exportProg div'), lbl = $('#exportProg span');
  try {
    const { blob, ext, note } = await exportMP4(project, mix, { audioContext: actx, signal: abort.signal, onProgress: p => { bar.style.width = (p * 100).toFixed(1) + '%'; lbl.textContent = `Exportando… ${Math.round(p * 100)} %`; } });
    const a = $('#dl'); if (a.href) URL.revokeObjectURL(a.href);
    a.href = URL.createObjectURL(blob);
    const name = `munequitos-${S.theme}-${(currentSits()[S.sit] || {}).id || 'video'}.${ext}`;
    a.download = name; a.textContent = `⬇ Descargar video (${ext.toUpperCase()}, ${(blob.size / 1e6).toFixed(1)} MB)`; a.hidden = false;
    lastFile = new File([blob], name, { type: blob.type || 'video/mp4' });
    const canShare = !!(navigator.canShare && navigator.canShare({ files: [lastFile] }));
    $('#shareBtn').hidden = !canShare;
    setStatus(note === 'webm' ? 'Tu navegador no graba MP4: se exportó en WebM.' : canShare && IOS ? 'Listo. Toca «Guardar en Fotos / Compartir» y elige «Guardar video».' : 'Listo.', note === 'webm');
    if (!IOS) a.click();
  } catch (e) { if (e.name !== 'AbortError') { console.error(e); setStatus('Error al exportar: ' + (e.message || e), true); } }
  finally { $('#exportBtn').disabled = false; $('#exportProg').hidden = true; abort = null; }
});
$('#cancelBtn').addEventListener('click', () => abort && abort.abort());
$('#shareBtn').addEventListener('click', async () => { if (!lastFile) return; try { await navigator.share({ files: [lastFile], title: lastFile.name }); } catch (e) { if (e.name !== 'AbortError') setStatus(String(e.message || e), true); } });

renderAll();
window.__app = { generate, get project() { return project; }, get mix() { return mix; }, S, drawAt, exportMP4: () => exportMP4(project, mix) };
