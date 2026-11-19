// Comedia muda: historias contadas solo con acciones, caras exageradas, música y efectos de sonido.
// Sin voces ni textos: los videos sirven para cualquier país.

export const THEMES = [
  { id: 'despertador', emoji: '⏰', name: 'El despertador' },
  { id: 'guagua', emoji: '🚌', name: 'La guagua' },
  { id: 'jefe', emoji: '👔', name: 'El jefe' },
  { id: 'dinero', emoji: '💸', name: 'El dinero no alcanza' },
  { id: 'cansancio', emoji: '😴', name: 'El cansancio' },
  { id: 'trabajo', emoji: '🛠️', name: 'El trabajo' },
];

export const ENVIRONMENTS = [
  { id: 'auto', emoji: '✨', name: 'Automático' },
  { id: 'casa', emoji: '🛋️', name: 'Casa' },
  { id: 'ciudad', emoji: '🏙️', name: 'Calle' },
  { id: 'oficina', emoji: '🏢', name: 'Oficina' },
  { id: 'cafe', emoji: '☕', name: 'Cafetería' },
  { id: 'parque', emoji: '🌳', name: 'Parque' },
  { id: 'cocina', emoji: '🍳', name: 'Cocina' },
  { id: 'playa', emoji: '🏖️', name: 'Playa' },
  { id: 'vacio', emoji: '⬜', name: 'Fondo liso' },
];

// Escena muda: G('acciones', 'objeto', 'efecto@segundo,efecto@segundo', { dur, react, shot, env, night, look, key })
//  - acciones: "A:run B:laugh" (A es el protagonista; B la pareja o el jefe; C un niño o un compañero)
//  - objeto: alarm, money, wallet, coffee, phone, laptop, clock:H:MM, heart, pizza, box, bus:arrive|leave|full|splash|stuck, banana
//  - react: primer plano de alguien reaccionando al final de la escena ('B:laugh', 'A:shock'...)
//  - key: true = escena clave (no se quita en los videos cortos)
const G = (a, p = '', sfx = '', o = {}) => ({ a, p, sfx: sfx ? sfx.split(',').map(x => { const [n, t] = x.split('@'); return [n.trim(), +(t || 0)]; }) : [], ...o });

export const SITUATIONS = {
  despertador: [
    {
      id: 'pijama', title: 'Se le pegaron las sábanas', desc: 'Sale corriendo al trabajo… y nadie le dice que va en pijama.', env: 'casa', looks: { A: 'pajama', B: 'tie' },
      scenes: [
        G('A:lie', 'alarm', 'alarm@0,alarm@0.8', { shot: 'two', key: true }),
        G('A:lie', 'alarm', 'punch@0.3', { shot: 'close:A' }),
        G('A:lie', 'clock:8:45', 'drum@0.2', { shot: 'two' }),
        G('A:shock', 'clock:8:45', 'gasp@0,boing@0.2', { shot: 'close:A', key: true }),
        G('A:run', '', 'zip@0,steps@0.1', { shot: 'wide' }),
        G('A:trip', '', 'fall@0.1', { shot: 'two' }),
        G('A:run', 'coffee', 'zip@0,steps@0.1', { shot: 'wide' }),
        G('A:slip', 'banana', 'boing@0.05,thud@0.5', { shot: 'two', key: true }),
        G('A:flee', '', 'zip@0.1,steps@0.1,horn@0.6', { shot: 'wide', env: 'ciudad' }),
        G('A:run', 'bus:leave', 'horn@0,zip@0.3', { shot: 'wide', env: 'ciudad' }),
        G('A:walk B:idle C:idle', '', 'steps@0,whoosh@0.1', { shot: 'two', env: 'oficina', key: true }),
        G('B:laugh C:laugh A:shrug', '', 'laughs@0.1,laughs@0.8', { shot: 'two', env: 'oficina', dur: 2.2, react: 'A:shock', key: true, twist: true }),
        G('A:facepalm B:laugh', '', 'punch@0.2,laughs@0.5', { shot: 'close:A', env: 'oficina', key: true }),
      ],
    },
    {
      id: 'madrugada', title: 'Cinco alarmas y ninguna sirve', desc: 'Pone mil alarmas, sale volando… y resulta que son las 3 de la madrugada.', env: 'casa',
      scenes: [
        G('A:lie', 'alarm', 'alarm@0', { shot: 'two', key: true }),
        G('A:lie', 'alarm', 'punch@0.4', { shot: 'close:A' }),
        G('A:lie', 'phone', 'notif@0,notif@0.5', { shot: 'two' }),
        G('A:lie', 'alarm', 'alarm@0,alarm@0.6', { shot: 'close:A' }),
        G('A:shock', 'clock:6:00', 'gasp@0,boing@0.2', { shot: 'single:A', key: true }),
        G('A:run', '', 'zip@0,steps@0.1', { shot: 'wide' }),
        G('A:run', 'coffee', 'steps@0,zip@0.4', { shot: 'two' }),
        G('A:trip', '', 'fall@0.1', { shot: 'two', key: true }),
        G('A:run', '', 'steps@0,horn@0.5', { shot: 'wide', env: 'ciudad', night: true }),
        G('A:wait', 'clock:3:00', 'tick@0,tick@0.6,tick@1.2', { shot: 'two', env: 'ciudad', night: true, key: true }),
        G('A:think', 'clock:3:00', 'drum@0', { shot: 'close:A', env: 'ciudad', night: true }),
        G('A:faint', '', 'scratch@0,thud@0.6', { shot: 'two', env: 'ciudad', night: true, key: true, twist: true }),
        G('A:sleep', '', 'laughs@0.3', { shot: 'close:A', env: 'ciudad', night: true, key: true }),
      ],
    },
  ],
  guagua: [
    {
      id: 'guagua', title: 'Perseguir la guagua', desc: 'La guagua se le escapa, lo empapa… y al final la deja atrás caminando.', env: 'ciudad',
      scenes: [
        G('A:walk', 'coffee', 'steps@0', { shot: 'two', key: true }),
        G('A:idle', 'bus:arrive', 'horn@0.3', { shot: 'wide', key: true }),
        G('A:run', 'bus:leave', 'zip@0,horn@0.4', { shot: 'wide' }),
        G('A:chase', 'bus:leave', 'zip@0,steps@0.1,horn@0.8', { shot: 'wide', key: true }),
        G('A:tired', '', 'uf@0.1', { shot: 'close:A' }),
        G('A:wait', 'clock:7:30', 'tick@0,tick@0.6', { shot: 'two' }),
        G('A:cheer', 'bus:full', 'horn@0.2,ding@0.5', { shot: 'wide', key: true }),
        G('A:shock', 'bus:full', 'gasp@0', { shot: 'close:A' }),
        G('A:fall', 'bus:full', 'punch@0.2,thud@0.5', { shot: 'two', key: true }),
        G('A:walk', 'bus:splash', 'horn@0.2,splash@0.6', { shot: 'wide', key: true }),
        G('A:cry', '', 'sad@0', { shot: 'close:A' }),
        G('A:strong', 'bus:stuck', 'horn@0,horn@0.5,horn@1.0', { shot: 'wide', dur: 2.2, key: true, twist: true }),
        G('A:dance', 'bus:stuck', 'ding@0,laughs@0.5', { shot: 'two', key: true }),
      ],
    },
    {
      id: 'parada', title: 'El que se adelanta en la parada', desc: 'Se cuela en la fila, la guagua llega… y para justo en la otra punta.', env: 'ciudad', looks: { B: 'hair' },
      scenes: [
        G('A:wait B:wait C:wait', '', 'tick@0,tick@0.6', { shot: 'wide', key: true }),
        G('A:sneak B:wait C:wait', '', 'sneak@0', { shot: 'two', key: true }),
        G('A:strong B:angry C:angry', '', 'punch@0.2', { shot: 'two' }),
        G('A:laugh B:angry', '', 'laughs@0.2', { shot: 'close:A' }),
        G('A:cheer B:angry C:angry', 'bus:arrive', 'horn@0.2', { shot: 'wide', key: true }),
        G('A:shock B:cheer C:cheer', 'bus:arrive', 'gasp@0,ding@0.5', { shot: 'wide', key: true, twist: true }),
        G('A:chase', 'bus:leave', 'zip@0,steps@0.1,horn@0.6', { shot: 'wide', key: true }),
        G('A:trip', '', 'fall@0.2', { shot: 'two', key: true }),
        G('A:facepalm', '', 'punch@0.2,laughs@0.6', { shot: 'close:A', key: true }),
      ],
    },
  ],
  jefe: [
    {
      id: 'dormido', title: 'Dormido en el trabajo', desc: 'Se duerme en la oficina y esquiva al jefe… hasta que los dos se quedan dormidos.', env: 'oficina', looks: { B: 'tie' },
      scenes: [
        G('A:type', 'laptop', 'type@0', { shot: 'two', key: true }),
        G('A:sleep', 'laptop', 'boing@0.2', { shot: 'close:A', key: true }),
        G('B:sneak A:sleep', '', 'sneak@0', { shot: 'two', key: true }),
        G('A:type B:think', 'laptop', 'gasp@0,type@0.2', { shot: 'two' }),
        G('B:walk A:sleep', '', 'steps@0,boing@0.8', { shot: 'two' }),
        G('B:sneak A:sleep', '', 'sneak@0', { shot: 'wide' }),
        G('A:type B:angry', 'laptop', 'type@0,punch@0.5', { shot: 'close:B' }),
        G('A:sleep B:sleep', '', 'boing@0.3,boing@1.0', { shot: 'two', dur: 2.2, key: true, twist: true }),
        G('A:shock B:shock C:angry', '', 'scratch@0,drum@0.2', { shot: 'wide', key: true }),
        G('A:flee B:flee', '', 'zip@0,steps@0.1', { shot: 'wide', key: true }),
      ],
    },
    {
      id: 'aumento', title: 'Pedirle aumento al jefe', desc: 'Se arma de valor, el jefe se ríe… y al final lo ve llegar en carro nuevo.', env: 'oficina', looks: { B: 'tie' },
      scenes: [
        G('A:strong', '', 'ding@0', { shot: 'single:A', key: true }),
        G('A:sneak', '', 'sneak@0', { shot: 'two' }),
        G('B:angry A:shock', '', 'drum@0,gasp@0.4', { shot: 'two', key: true }),
        G('A:kneel B:think', 'money', 'pop@0.2', { shot: 'two', key: true }),
        G('B:laugh A:sad', '', 'laughs@0,laughs@0.7', { shot: 'close:B', key: true }),
        G('A:flee', '', 'zip@0,steps@0.1', { shot: 'wide' }),
        G('A:sad', 'chart_down', 'sad@0', { shot: 'close:A' }),
        G('B:cheer A:facepalm', 'bus:car', 'horn@0,horn@0.4,scratch@0.9', { shot: 'wide', env: 'ciudad', dur: 2.3, key: true, twist: true }),
        G('A:cry B:dance', '', 'sad@0,laughs@0.5', { shot: 'close:A', env: 'ciudad', key: true }),
      ],
    },
  ],
  dinero: [
    {
      id: 'polilla', title: 'El sueldo que vuela', desc: 'Cobra, los billetes se le escapan uno a uno y de la cartera sale una polilla.', env: 'ciudad',
      scenes: [
        G('A:cheer', 'money', 'cash@0,ding@0.4', { shot: 'two', key: true }),
        G('A:dance', 'money', 'cash@0', { shot: 'single:A' }),
        G('A:shock', 'money', 'cash@0,gasp@0.4', { shot: 'close:A', key: true }),
        G('A:chase', 'money', 'zip@0,steps@0.1', { shot: 'wide', key: true }),
        G('A:trip', '', 'fall@0.1', { shot: 'two' }),
        G('A:sad', 'wallet', 'boing@0.3', { shot: 'single:A', key: true }),
        G('A:shock', 'wallet', 'gasp@0', { shot: 'close:A' }),
        G('A:kneel', '', 'ding@0.4', { shot: 'two', key: true }),
        G('A:cheer', '', 'cash@0,ding@0.3', { shot: 'close:A' }),
        G('A:slip', 'banana', 'boing@0,thud@0.5', { shot: 'two', key: true, twist: true }),
        G('A:cry', '', 'sad@0,laughs@0.6', { shot: 'close:A', key: true }),
      ],
    },
    {
      id: 'antojo', title: 'Fin de mes y el antojo', desc: 'Huele una pizza, cuenta las monedas… y el niño se la come delante de él.', env: 'casa', looks: { C: 'kid' },
      scenes: [
        G('A:sit', '', 'pop@0', { shot: 'two', key: true }),
        G('A:love', 'pizza', 'heart@0', { shot: 'close:A', key: true }),
        G('A:think', 'wallet', 'boing@0.3', { shot: 'single:A', key: true }),
        G('A:kneel', 'money', 'cash@0.2', { shot: 'two' }),
        G('A:strong', 'money', 'ding@0.2', { shot: 'single:A' }),
        G('A:run', 'pizza', 'steps@0,zip@0.2', { shot: 'wide', key: true }),
        G('A:cheer', 'pizza', 'ding@0', { shot: 'two' }),
        G('C:run A:shock', 'pizza', 'zip@0,gasp@0.5', { shot: 'wide', key: true, twist: true }),
        G('C:laugh A:cry', 'pizza', 'laughs@0,sad@0.6', { shot: 'two', key: true }),
        G('A:facepalm', '', 'punch@0.2', { shot: 'close:A', key: true }),
      ],
    },
  ],
  cansancio: [
    {
      id: 'sofa', title: 'Llegar muerto a casa', desc: 'Llega reventado, todos lo buscan… y cuando por fin se acuesta suena la alarma.', env: 'casa', looks: { B: 'hair', C: 'kid' },
      scenes: [
        G('A:tired', '', 'steps@0,uf@0.6', { shot: 'two', key: true }),
        G('A:faint', '', 'thud@0.6', { shot: 'two', key: true }),
        G('C:jump A:shock', '', 'boing@0,boing@0.5', { shot: 'two', key: true }),
        G('B:dance A:tired', '', 'ding@0', { shot: 'two' }),
        G('A:sleep B:dance', '', 'boing@0.3', { shot: 'close:A' }),
        G('A:phone', 'phone', 'notif@0,notif@0.6', { shot: 'single:A' }),
        G('A:phone', 'clock:1:00', 'tick@0,drum@0.5', { shot: 'close:A' }),
        G('A:lie', '', 'pop@0.3', { shot: 'two', key: true }),
        G('A:lie', 'alarm', 'alarm@0,scratch@0.5', { shot: 'two', key: true, twist: true }),
        G('A:cry', 'alarm', 'alarm@0,sad@0.4', { shot: 'close:A', key: true }),
      ],
    },
    {
      id: 'cafe', title: 'Un cafecito más', desc: 'Cada café lo pone más acelerado… hasta que se desploma de golpe.', env: 'cafe', looks: { B: 'hair' },
      scenes: [
        G('A:tired', 'coffee', 'uf@0', { shot: 'two', key: true }),
        G('A:idle', 'coffee', 'ding@0.2', { shot: 'close:A' }),
        G('A:shock', 'coffee', 'boing@0', { shot: 'close:A', key: true }),
        G('A:dance', 'coffee', 'ding@0,boing@0.5', { shot: 'two', key: true }),
        G('A:run', '', 'zip@0,steps@0.1', { shot: 'wide' }),
        G('A:jump B:shock', 'coffee', 'boing@0,boing@0.4,gasp@0.8', { shot: 'two', key: true }),
        G('A:chase', '', 'zip@0,steps@0.1', { shot: 'wide' }),
        G('A:faint B:shock', '', 'scratch@0,thud@0.6', { shot: 'two', key: true, twist: true }),
        G('A:sleep B:laugh', '', 'laughs@0.2', { shot: 'close:A', key: true }),
      ],
    },
  ],
  trabajo: [
    {
      id: 'caja', title: 'La caja pesada', desc: 'Suda la gota gorda con una caja… y un niño se la lleva con una mano.', env: 'oficina', looks: { B: 'tie', C: 'kid' },
      scenes: [
        G('A:strong', 'box', 'ding@0', { shot: 'single:A', key: true }),
        G('A:lift', '', 'uf@0.2,thud@0.8', { shot: 'two', key: true }),
        G('A:tired', '', 'uf@0', { shot: 'close:A' }),
        G('A:lift', '', 'steps@0,uf@0.6', { shot: 'two' }),
        G('B:point A:shock', '', 'drum@0,gasp@0.5', { shot: 'two', key: true }),
        G('A:lift', '', 'steps@0,uf@0.5', { shot: 'wide' }),
        G('A:faint', '', 'thud@0.6', { shot: 'two', key: true }),
        G('C:lift A:shock', '', 'ding@0,gasp@0.4', { shot: 'two', dur: 2.2, key: true, twist: true }),
        G('A:facepalm C:cheer', '', 'punch@0.2,laughs@0.5', { shot: 'close:A', key: true }),
      ],
    },
  ],
};

// Gags extra (para alargar un video sin perder ritmo)
export const BONUS_GAGS = [
  G('A:slip', 'banana', 'boing@0.05,thud@0.5', { shot: 'two', react: 'B:laugh' }),
  G('A:trip', '', 'zip@0,fall@0.15', { shot: 'two', react: 'B:laugh' }),
  G('A:faint', '', 'gasp@0,thud@0.6', { shot: 'two', react: 'B:shock' }),
  G('B:chase A:flee', '', 'zip@0,steps@0.1,zip@0.8', { shot: 'wide', dur: 2.2 }),
  G('A:sneak', '', 'sneak@0', { shot: 'two', react: 'B:think' }),
  G('A:dance', '', 'ding@0,laughs@0.6', { shot: 'two' }),
];

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
