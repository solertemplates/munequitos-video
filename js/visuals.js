// «Que se vea lo que se dice»: si una frase menciona algo concreto (el gym, Instagram, la comida, el trabajo…),
// la escena corta a ese recuerdo: el muñequito aparece haciéndolo, con los objetos reales, de forma limpia y moderna.
const W = src => new RegExp('(?<![\\p{L}\\p{N}])(?:' + src + ')(?![\\p{L}\\p{N}])', 'iu');
export const VISUALS = [
  { id: 'gym', re: W(String.raw`gym|gimnasio|gimnasios|pesas|ejercicio|entrenar|entreno|m[uú]sculos?|workout|work out|weights|lifting|gains`), env: 'gym', act: 'barbell', sfx: 'weights' },
  { id: 'selfie', re: W(String.raw`instagram|insta|selfies?|fotos?|foto perfecta|filtros?|tiktok|post(ear|eo|ed|ing)?|photos?|pics?|filters?`), act: 'selfie', flash: true, sfx: 'shutter' },
  { id: 'reels', re: W(String.raw`reels?|scroll(ear|eando|ing)?|pantalla|feed|redes|celular|tel[eé]fono|m[oó]vil|phone|screen`), act: 'scroll', hand: 'scroll', sfx: 'notif' },
  { id: 'money', re: W(String.raw`dinero|plata|quincena|sueldo|salario|cobr[eéoa]|pago|cheque|renta|alquiler|deudas?|cuentas|tarjeta|money|cash|paycheck|salary|rent|bills?|debt|paid`), act: 'money', hand: 'cash', sfx: 'cash' },
  { id: 'food', re: W(String.raw`comida|comer|com[ií]|cena|cenar|almuerzo|pizza|hamburguesas?|frijoles|arroz|food|eat|ate|dinner|lunch|burger|snacks?`), env: 'cocina', act: 'eat', hand: 'food', sfx: 'pop' },
  { id: 'coffee', re: W(String.raw`caf[eé]|cafecito|colada|coffee|latte`), env: 'cafe', act: 'coffee', hand: 'coffee', sfx: 'pop' },
  { id: 'work', re: W(String.raw`oficina|jefe|jefa|reuni[oó]n|email|correo|computadora|laptop|office|boss|meeting|computer|zoom`), env: 'oficina', act: 'laptop', hand: 'laptop', sfx: 'type' },
  { id: 'shift', re: W(String.raw`turno|almac[eé]n|cajas|construcci[oó]n|obra|f[aá]brica|shift|warehouse|boxes|factory|construction`), act: 'lift', hand: 'boxup', sfx: 'effort' },
  { id: 'sleep', re: W(String.raw`dormir|dorm[ií]|sue[ñn]o|cansad[oa]|cama|siesta|sleep|slept|tired|nap|bed`), env: 'casa', act: 'sleep', sfx: '' },
  { id: 'run', re: W(String.raw`correr|corr[ií]|corriendo|trotar|run|ran|running|jog(ging)?`), env: 'parque', act: 'run', sfx: 'run' },
  { id: 'study', re: W(String.raw`estudiar|estudi[eé]|libros?|leer|le[ií]|escuela|universidad|examen|clases?|study|studied|books?|read|school|college|exam|class`), act: 'read', hand: 'book', sfx: 'book' },
  { id: 'pray', re: W(String.raw`orar|or[eé]|oraci[oó]n|rezar|Dios|iglesia|misa|pray(ed|ing)?|prayer|God|church`), env: 'iglesia', act: 'pray', sfx: 'sparkle' },
  { id: 'beach', re: W(String.raw`playa|vacaciones|beach|vacation`), env: 'playa', act: 'dance', sfx: 'whoosh' },
  { id: 'love', re: W(String.raw`novi[oa]|cita|enamorad[oa]|crush|girlfriend|boyfriend|date`), env: 'parque', act: 'love', sfx: 'heart' },
  { id: 'party', re: W(String.raw`fiesta|bailar|baile|party|dance|dancing`), act: 'dance', sfx: 'laughs' },
];

// Marca cada escena hablada con su «recuerdo visual» (sin repetir el mismo dos veces seguidas)
export function tagVisuals(beats) {
  let last = null; const used = new Map();
  for (const b of beats) {
    if (!['setup', 'rep', 'twist', 'after', 'hook'].includes(b.kind) || !b.text) { last = null; continue; }
    if ((b.p || '').startsWith('pov')) { last = 'pov'; continue; } // ya muestra la pantalla del móvil
    // todas las cosas que menciona, en el orden en que las dice (máx. 2 por frase)
    const hits = VISUALS.map(x => { const m = b.text.match(x.re); return m ? { v: x, at: m.index } : null; }).filter(Boolean).sort((a, c) => a.at - c.at)
      .filter(h => h.v.id !== last && (used.get(h.v.id) || 0) < 2 && !(h.v.act && new RegExp('\\b(A|all):' + h.v.act + '\\b').test(b.a || ''))).slice(0, 2);
    if (!hits.length) { last = null; continue; }
    b.vis = { ...hits[0].v, re: undefined };
    if (hits[1]) { b.vis2 = { ...hits[1].v, re: undefined }; b.visSplit = Math.min(0.75, Math.max(0.35, hits[1].at / b.text.length)); }
    for (const h of hits) used.set(h.v.id, (used.get(h.v.id) || 0) + 1);
    last = hits[hits.length - 1].v.id;
  }
  return beats;
}
// ventana del recuerdo dentro de la escena (segundos relativos)
export function visWindow(b) {
  const t0 = Math.min(0.35, b.dur * 0.2); const end = b.react ? b.reactStart - 0.05 : (b.voiceLead || 0) + (b.voiceDur || b.dur) + 0.15;
  return [t0, Math.max(t0 + 0.9, Math.min(b.dur - 0.2, end))];
}
