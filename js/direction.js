// "Director" automático: reparte el diálogo, las reacciones, las entradas/salidas y los planos de cámara.
// Todo es determinista (mismo guion → mismo video), así la vista previa y el MP4 son idénticos.

const H = n => { const x = Math.sin(n * 91.345 + 12.7) * 43758.5453; return x - Math.floor(x); };
const ROLES = ['A', 'B', 'C', 'D'];

// Reacciones habladas del que escucha (cortas, exageradas, con sabor de la calle)
const VOCALS = {
  laugh: { es: ['¡Jajaja, no puede ser!', '¡Ja, ja, ja!', '¡Ñooo, qué risa!', '¡Jajaja, tremendo!'], en: ['Ha ha ha!', 'No way, ha ha!', 'Ha! Classic!', 'Ha ha, stop it!'] },
  shock: { es: ['¿¡Quéee!?', '¡Ñooo!', '¡Ay, mi madre!', '¿¡En serio!?', '¡Anda pa\'llá!'], en: ['Whaaat?!', 'No way!', 'Oh my God!', 'Are you serious?!', 'Wait, what?!'] },
  facepalm: { es: ['¡Uf!', '¡Uff, otra vez!', '¡Ay, no!', '¡Qué clase de lío!'], en: ['Oof!', 'Ugh, again?!', 'Oh no!', 'What a mess!'] },
  love: { es: ['¡Awww!', '¡Ay, qué lindo!', '¡Qué bello!'], en: ['Awww!', 'That\'s so sweet!', 'Aww, come on!'] },
  cry: { es: ['¡Ay, no, no, no!', '¡Qué tristeza!'], en: ['Oh no, no, no!', 'That\'s so sad!'] },
};
const REACT_FX = { laugh: 'laughs', shock: 'gasp', facepalm: 'uf', love: 'aww', cry: 'uf' };

function parseActs(a) { const m = {}; (a || '').split(/\s+/).filter(Boolean).forEach(tok => { const [r, act] = tok.split(':'); if (r === 'all') m._all = act; else m[r] = act; }); return m; }

function moodOf(b) {
  const acts = Object.values(parseActs(b.a)).join(' ');
  if (b.kind === 'twist' || /shock/.test(acts) || ['drum', 'scratch', 'alarm'].includes(b.fx)) return 'shock';
  if (/love|hug/.test(acts) || b.fx === 'heart') return 'love';
  if (/laugh|dance|cheer/.test(acts) || ['laugh', 'applause', 'boing'].includes(b.fx)) return 'laugh';
  if (/cry|sad/.test(acts) || b.fx === 'sad') return 'facepalm';
  return H(b.text.length) > 0.5 ? 'laugh' : 'facepalm';
}

export function planDirection(beats, { nChars, lang }) {
  const roles = ROLES.slice(0, nChars);
  const used = {};
  const pickVocal = (mood, k) => { const list = VOCALS[mood][lang] || VOCALS[mood].es; let i = Math.floor(H(k * 7.1) * list.length); if (used[mood] === i) i = (i + 1) % list.length; used[mood] = i; return list[i]; };
  let reflectN = 0;
  beats.forEach((b, i) => {
    const acts = parseActs(b.a);
    const talkers = roles.filter(r => acts[r] === 'talk' || acts[r] === 'point');
    // quién habla
    let sp = b.who && roles.includes(b.who) ? b.who : null;
    if (!sp) {
      if (b.kind === 'reflect') sp = nChars > 1 && reflectN++ % 2 === 1 ? 'B' : 'A';
      else if (b.kind === 'hook' || b.kind === 'cta') sp = 'A';
      else if (talkers.length) sp = talkers[0];
      else sp = 'A';
    }
    b.speaker = sp;
    b.listener = nChars > 1 ? (sp === 'A' ? 'B' : 'A') : null;
    b.enter = null; b.exit = null; b.react = null;
  });
  // entradas y salidas: el segundo personaje entra en el inicio; algunos salen corriendo y vuelven a entrar
  const setup = beats.find(b => b.kind === 'setup');
  if (setup && nChars > 1) setup.enter = { role: setup.listener || 'B', from: 1, run: false };
  const reps = beats.filter(b => b.kind === 'rep');
  reps.forEach((b, k) => {
    if (k % 3 === 1 && k < reps.length - 1 && nChars > 1) {
      const role = nChars > 2 ? ROLES[2 + (k % (nChars - 2))] : b.listener;
      if (role === b.speaker) return;
      const dir = H(k + 3) > 0.5 ? 1 : -1;
      b.exit = { role, dir };
      reps[k + 1].enter = { role, from: dir, run: true };
    }
  });
  // reacciones del que escucha (primer plano + gesto + sonido + exclamación)
  beats.forEach((b, i) => {
    if (!['setup', 'rep', 'twist', 'after'].includes(b.kind) || b.exit) return;
    const mood = b.r || moodOf(b);
    const m = VOCALS[mood] ? mood : 'shock';
    const role = b.listener || 'A';
    b.react = { role, act: m === 'facepalm' ? (H(i) > 0.5 ? 'facepalm' : 'tired') : m, vocal: pickVocal(m, i + b.text.length), fx: REACT_FX[m] || 'gasp' };
  });
  return beats;
}

// Planos de cámara por escena (después de conocer los tiempos de la voz)
export function planShots(beats) {
  beats.forEach((b, i) => {
    const vs = b.voiceLead || 0, ve = vs + (b.voiceDur || Math.max(0.8, b.dur - 0.6));
    const shots = []; const add = (t0, t1, type, role) => { if (t1 - t0 > 0.05) shots.push({ t0, t1, type, role }); };
    const tail = b.react ? b.reactStart : b.dur;
    if (b.kind === 'hook') { add(0, Math.min(1.3, b.dur * 0.5), 'push', 'A'); add(Math.min(1.3, b.dur * 0.5), b.dur, 'two', 'A'); }
    else if (b.kind === 'reflect') add(0, b.dur, 'slow', b.speaker);
    else if (b.kind === 'cta') add(0, b.dur, 'cta', 'A');
    else if (b.env === 'caminos' && b.side) { add(0, tail, 'side', b.speaker); }
    else {
      const first = b.p || b.enter || b.kind === 'setup' ? 'two' : (i % 2 ? 'single' : 'two');
      if (b.kind === 'twist') { add(0, vs, 'wide', b.speaker); add(vs, tail, 'crash', b.speaker); }
      else if (tail > 2.3) { const mid = Math.min(tail - 0.9, Math.max(1.0, (vs + ve) / 2)); add(0, mid, first, b.speaker); add(mid, tail, first === 'two' ? 'single' : 'two', b.speaker); }
      else add(0, tail, first, b.speaker);
      if (b.exit) shots[shots.length - 1].type = 'two';
    }
    if (b.react) add(b.reactStart, b.dur, 'close', b.react.role);
    if (!shots.length) add(0, b.dur, 'two', b.speaker);
    shots[shots.length - 1].t1 = b.dur;
    b.shotPlan = shots; b.shots = shots.length;
  });
}
