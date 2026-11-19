// Analiza la voz y produce, 60 veces por segundo, el volumen (amp) y el "brillo" (zcr) del sonido.
// Con eso la boca abre más en las vocales fuertes, se redondea en "o/u" y enseña los dientes en "s/ch".
export function computeLip(buffer) {
  if (!buffer) return null;
  const d = buffer.getChannelData(0), sr = buffer.sampleRate, win = Math.round(sr / 60);
  const n = Math.ceil(d.length / win); const amp = new Float32Array(n), zcr = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    let sum = 0, zc = 0, prev = 0; const a = k * win, b = Math.min(d.length, a + win);
    for (let i = a; i < b; i++) { const v = d[i]; sum += v * v; if ((v >= 0) !== (prev >= 0)) zc++; prev = v; }
    amp[k] = Math.sqrt(sum / Math.max(1, b - a)); zcr[k] = zc / Math.max(1, b - a);
  }
  // normaliza con el percentil 95 y suaviza (ataque rápido, caída suave: la boca no "tiembla")
  const sorted = Array.from(amp).sort((x, y) => x - y); const p95 = sorted[Math.floor(sorted.length * 0.95)] || 1;
  let s = 0;
  for (let k = 0; k < n; k++) { const v = Math.min(1, amp[k] / (p95 || 1)); s = v > s ? s + (v - s) * 0.7 : s + (v - s) * 0.35; amp[k] = s; zcr[k] = Math.min(1, zcr[k] * 6); }
  return { amp, zcr };
}
