// Director de comedia muda: planos de cámara por escena (plano general, de dos, de uno, primer plano) y reacciones.

export function planShots(beats, nChars = 2) {
  beats.forEach(b => {
    const shots = []; const add = (t0, t1, type, role) => { if (t1 - t0 > 0.05) shots.push({ t0, t1, type, role }); };
    const end = b.react ? b.reactStart : b.dur;
    if (b.kind === 'cta') add(0, b.dur, 'cta', 'A');
    else if (b.kind === 'reflect') add(0, b.dur, 'slow', 'A');
    else {
      let [type, role] = String(b.shotHint || 'two').split(':');
      role = role || 'A';
      if (role !== 'A' && ['B', 'C', 'D'].indexOf(role) + 1 >= nChars) role = 'A';
      if (b.twistLike && (type === 'close' || type === 'single')) { add(0, Math.min(0.5, end * 0.3), 'wide', role); add(Math.min(0.5, end * 0.3), end, 'crash', role); }
      else if (b.twistLike) add(0, end, type, role);
      else if (type === 'two' && end > 2.0) { add(0, end * 0.55, 'two', role); add(end * 0.55, end, 'single', role); }
      else add(0, end, type, role);
    }
    if (b.react) { let r = b.react.role; if (['B', 'C', 'D'].indexOf(r) + 1 >= nChars) r = 'A'; b.react.role = r; add(b.reactStart, b.dur, 'close', r); }
    if (!shots.length) add(0, b.dur, 'two', 'A');
    shots[shots.length - 1].t1 = b.dur;
    b.shotPlan = shots; b.shots = shots.length;
  });
}
