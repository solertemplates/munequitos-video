// Exportación MP4 (H.264 + AAC) con Mediabunny.
// El audio se codifica SIEMPRE en AAC con un codificador WebAssembly propio (no depende del de Safari),
// así el video guardado en la galería del iPhone y subido a redes conserva la voz, la música y los efectos.
import { Output, Mp4OutputFormat, BufferTarget, CanvasSource, AudioBufferSource, canEncodeVideo } from '../vendor/mediabunny.min.mjs';
import { registerAacEncoder } from '../vendor/mediabunny-aac-encoder.min.mjs';
import { W, H, drawFrame } from './render.js?v=15';

const FPS = 30;
let aacReady = false;
function ensureAac() { if (!aacReady) { registerAacEncoder(); aacReady = true; } }

export async function canWebCodecs() {
  try { return typeof VideoEncoder !== 'undefined' && await canEncodeVideo('avc', { width: W, height: H, bitrate: 8e6 }); } catch { return false; }
}

function trimmedMix(mix, seconds) {
  const len = Math.min(mix.length, Math.ceil(seconds * mix.sampleRate));
  const out = new AudioBuffer({ length: len, numberOfChannels: 2, sampleRate: mix.sampleRate });
  for (let c = 0; c < 2; c++) out.copyToChannel(mix.getChannelData(Math.min(c, mix.numberOfChannels - 1)).subarray(0, len), c);
  return out;
}

export async function exportMP4(project, mix, { onProgress, signal, audioContext } = {}) {
  if (!(await canWebCodecs())) return exportRealtime(project, mix, { onProgress, signal, audioContext });
  ensureAac();
  const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = canvas.getContext('2d');
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const video = new CanvasSource(canvas, { codec: 'avc', bitrate: 8_000_000, keyFrameInterval: 2 });
  const audio = new AudioBufferSource({ codec: 'aac', bitrate: 160_000 });
  output.addVideoTrack(video, { frameRate: FPS });
  output.addAudioTrack(audio);
  await output.start();
  const total = project.total; const frames = Math.ceil(total * FPS);
  try {
    await audio.add(trimmedMix(mix, frames / FPS));
    audio.close();
    for (let i = 0; i < frames; i++) {
      if (signal && signal.aborted) throw new DOMException('cancelado', 'AbortError');
      drawFrame(ctx, project, i / FPS, 1);
      await video.add(i / FPS, 1 / FPS);
      if (i % 10 === 0) { onProgress && onProgress(i / frames); await new Promise(r => setTimeout(r, 0)); }
    }
    video.close();
    await output.finalize();
  } catch (e) {
    try { await output.cancel(); } catch { /* ya cerrado */ }
    throw e;
  }
  onProgress && onProgress(1);
  return { blob: new Blob([output.target.buffer], { type: 'video/mp4' }), ext: 'mp4', note: '' };
}

// Respaldo para navegadores sin WebCodecs: grabación en tiempo real
async function exportRealtime(project, mix, { onProgress, signal, audioContext }) {
  const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
  const mime = types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
  if (!mime) throw new Error('Este navegador no puede exportar video. Actualiza tu iPhone o usa Chrome/Edge.');
  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = canvas.getContext('2d');
  const ac = audioContext || new AudioContext({ sampleRate: 48000 });
  if (ac.state !== 'running') await ac.resume();
  const dest = ac.createMediaStreamDestination();
  const src = ac.createBufferSource(); src.buffer = mix; src.connect(dest);
  const stream = new MediaStream([...canvas.captureStream(FPS).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const done = new Promise(r => { rec.onstop = r; });
  drawFrame(ctx, project, 0, 1);
  rec.start(250); const t0 = ac.currentTime + 0.05; src.start(t0);
  await new Promise(resolve => {
    const tick = () => {
      const t = ac.currentTime - t0;
      if ((signal && signal.aborted) || t >= project.total) { resolve(); return; }
      drawFrame(ctx, project, Math.max(0, t), 1); onProgress && onProgress(t / project.total);
      requestAnimationFrame(tick);
    };
    tick();
  });
  rec.stop(); await done; src.stop();
  if (signal && signal.aborted) throw new DOMException('cancelado', 'AbortError');
  const ext = mime.includes('mp4') ? 'mp4' : 'webm';
  return { blob: new Blob(chunks, { type: mime.split(';')[0] }), ext, note: ext === 'webm' ? 'webm' : 'realtime' };
}
