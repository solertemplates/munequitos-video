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
const REACT_FX = { laugh: 'laughs', shock: 'gasp', facepalm: 'uf', love: 'aww', cry: 'sad' };

// Gags de comedia física (escenas sin voz). sfx: [efecto, segundo]; o: onomatopeya; oT: cuándo aparece.
const GAGS = {
  shock: [
    { a: 'A:faint B:shock', sfx: [['gasp', 0], ['thud', 0.6]], o: { es: '¡PLAF!', en: 'THUD!' }, oT: 0.6, react: 'shock' },
    { a: 'A:flee B:shock', sfx: [['gasp', 0], ['zip', 0.15]], o: { es: '¡ZAS!', en: 'ZOOM!' }, oT: 0.25, react: 'shock' },
  ],
  laugh: [
    { a: 'A:slip B:laugh', sfx: [['boing', 0.05], ['thud', 0.5]], o: { es: '¡PATAPLÁN!', en: 'WHOOPS!' }, oT: 0.5, react: 'laugh' },
    { a: 'B:chase A:flee', sfx: [['zip', 0], ['zip', 0.7], ['gasp', 1.2]], o: { es: '¡CORRE!', en: 'RUN!' }, oT: 0.3, dur: 2.3, react: null },
    { a: 'all:dance', sfx: [['ding', 0], ['laughs', 0.6]], o: { es: '¡AZÚCAR!', en: 'YEAH!' }, oT: 0.2, react: null },
  ],
  facepalm: [
    { a: 'A:trip B:facepalm', sfx: [['zip', 0], ['fall', 0.15]], o: { es: '¡CATAPLUM!', en: 'CRASH!' }, oT: 0.65, react: 'laugh' },
    { a: 'A:sneak B:think', sfx: [['sneak', 0]], o: { es: 'shhh...', en: 'shhh...' }, oT: 0.2, react: 'shock' },
  ],
  love: [
    { a: 'A:kneel B:love', p: 'heart', sfx: [['aww', 0.1], ['heart', 0.4]], o: { es: '¡AWWW!', en: 'AWWW!' }, oT: 0.4, react: 'love' },
  ],
  money: [
    { a: 'A:chase', p: 'money', sfx: [['cash', 0], ['zip', 0.2]], o: { es: '¡VUELVE!', en: 'COME BACK!' }, oT: 0.3, dur: 2.2, react: 'laugh' },
  ],
  tired: [
    { a: 'A:faint', sfx: [['uf', 0], ['thud', 0.6]], o: { es: '¡KO!', en: 'K.O.!' }, oT: 0.6, react: 'shock' },
  ],
};

function parseActs(a) { const m = {}; (a || '').split(/\s+/).filter(Boolean).forEach(tok => { const [r, act] = tok.split(':'); if (r === 'all') m._all = act; else m[r] = act; }); return m; }

function moodOf(b) {
  const acts = Object.values(parseActs(b.a)).join(' ');
  if (b.kind === 'twist' || /shock/.test(acts) || ['drum', 'scratch', 'alarm'].includes(b.fx)) return 'shock';
  if (/love|hug/.test(acts) || b.fx === 'heart') return 'love';
  if (/laugh|dance|cheer/.test(acts) || ['laugh', 'applause', 'boing'].includes(b.fx)) return 'laugh';
  if (/cry|sad/.test(acts) || b.fx === 'sad') return 'facepalm';
  return H(b.text.length) > 0.5 ? 'laugh' : 'facepalm';
}

// Inserta escenas de acción sin voz después de las líneas habladas
export function insertActions(beats, { nChars, lang, every = 1 }) {
  const out = []; let n = 0; const usedG = new Set();
  beats.forEach((b, i) => {
    out.push(b);
    if (b.kind === 'act' || !['rep', 'setup'].includes(b.kind)) return;
    if (b.kind === 'setup' && nChars < 2) return;
    if ((n++ % every) !== 0) return;
    let mood = moodOf(b);
    if (b.p === 'money' || b.fx === 'cash') mood = 'money';
    else if (/tired|sleep/.test(b.a || '')) mood = 'tired';
    const list = GAGS[mood] || GAGS.laugh;
    let g = list[Math.floor(H(i * 3.3 + b.text.length) * list.length)];
    if (usedG.has(g)) g = list.find(x => !usedG.has(x)) || [...GAGS.laugh, ...GAGS.shock, ...GAGS.facepalm].find(x => !usedG.has(x)) || g;
    usedG.add(g);
    out.push({ kind: 'act', text: '', a: g.a, p: g.p || '', fx: '', gag: g, onoma: g.o[lang] || g.o.es, onomaT: g.oT, actDur: g.dur ? g.dur - 0.2 : 1.7, env: b.env, sign: b.sign, side: b.side, level: b.level || 0.5 });
  });
  return out;
}

export function planDirection(beats, { nChars, lang, action = false }) {
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
      else if (b.kind === 'hook' || b.kind === 'cta' || b.kind === 'question') sp = 'A';
      else if (talkers.length) sp = talkers[0];
      else sp = 'A';
    }
    b.speaker = b.mute ? null : sp;
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
    if (b.kind === 'act') {
      b.speaker = null;
      if (b.gag.react && nChars > 1) { const acts = parseActs(b.a); const role = roles.find(r => !acts[r]) || roles.find(r => r !== 'A') || 'B'; b.react = { role, act: b.gag.react, vocal: null, fx: REACT_FX[b.gag.react] || 'gasp' }; }
      return;
    }
    if (!['setup', 'rep', 'twist', 'after'].includes(b.kind) || b.exit) return;
    const mood = b.r || moodOf(b);
    const m = VOCALS[mood] ? mood : 'shock';
    const role = b.listener || 'A';
    const speak = !action || b.kind === 'twist' || (i % 3 === 0);
    b.react = { role, act: m === 'facepalm' ? (H(i) > 0.5 ? 'facepalm' : 'tired') : m, vocal: speak ? pickVocal(m, i + b.text.length) : null, fx: REACT_FX[m] || 'gasp' };
  });
  return beats;
}

// Planos de cámara por escena (después de conocer los tiempos de la voz)
export function planShots(beats) {
  beats.forEach((b, i) => {
    const vs = b.voiceLead || 0, ve = vs + (b.voiceDur || Math.max(0.8, b.dur - 0.6));
    const shots = []; const add = (t0, t1, type, role) => { if (t1 - t0 > 0.05) shots.push({ t0, t1, type, role }); };
    const tail = b.react ? b.reactStart : b.dur;
    if (b.kind === 'act') { add(0, b.react ? b.reactStart : b.dur, /chase|flee/.test(b.a || '') ? 'wide' : 'two', 'A'); }
    else if (b.kind === 'hook') { add(0, Math.min(1.3, b.dur * 0.5), 'push', 'A'); add(Math.min(1.3, b.dur * 0.5), b.dur, 'two', 'A'); }
    else if (b.kind === 'reflect') add(0, b.dur, 'slow', b.speaker);
    else if (b.kind === 'cta') add(0, b.dur, 'cta', 'A');
    else if (b.kind === 'question') add(0, b.dur, 'cta', 'A');
    else if (b.env === 'caminos' && b.side) { add(0, tail, 'side', b.speaker); }
    else {
      const first = b.p || b.enter || b.kind === 'setup' ? 'two' : (i % 2 ? 'single' : 'two');
      if (b.kind === 'twist') { add(0, vs, 'wide', b.speaker); add(vs, tail, 'crash', b.speaker); }
      else if (tail > 2.3) { const mid = Math.min(tail - 0.9, Math.max(1.0, (vs + ve) / 2)); add(0, mid, first, b.speaker); add(mid, tail, first === 'two' ? 'single' : 'two', b.speaker); }
      else add(0, tail, first, b.speaker);
      if (b.exit) shots[shots.length - 1].type = 'two';
    }
    // escenas con el móvil: después de ver al personaje, vemos la pantalla en primera persona (POV)
    if (b.p && b.p.startsWith('pov') && shots.length) { const last = shots[shots.length - 1]; const cut = last.t0 + Math.max(0.6, (last.t1 - last.t0) * 0.4); if (last.t1 - cut > 0.5) { shots.push({ t0: cut, t1: last.t1, type: 'pov', role: last.role }); last.t1 = cut; } }
    if (b.react) add(b.reactStart, b.dur, 'close', b.react.role);
    if (!shots.length) add(0, b.dur, 'two', b.speaker);
    shots[shots.length - 1].t1 = b.dur;
    b.shotPlan = shots; b.shots = shots.length;
  });
}
