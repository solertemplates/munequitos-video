// PUBLICAR: textos listos para cada red (Facebook, Instagram, YouTube Shorts y TikTok) en el idioma del video.
export const NETWORKS = [
  { id: 'facebook', name: 'Facebook', emoji: '📘' },
  { id: 'instagram', name: 'Instagram', emoji: '📸' },
  { id: 'youtube', name: 'YouTube Shorts', emoji: '▶️' },
  { id: 'tiktok', name: 'TikTok', emoji: '🎵' },
];

// Hashtags que funcionan de forma estable por tema (la IA puede cambiarlos por los del momento)
const TAGS = {
  es: {
    base: ['#reflexion', '#motivacion', '#parati', '#viral', '#animacion'],
    superacion: ['#superacionpersonal', '#nuncaterindas', '#crecimientopersonal', '#exito'],
    trabajador: ['#trabajador', '#latinosenusa', '#miami', '#vidareal'],
    amistad: ['#amistad', '#amigos', '#mejoresamigos', '#lealtad'],
    matrimonio: ['#matrimonio', '#pareja', '#amor', '#relaciones'],
    trabajo: ['#trabajo', '#liderazgo', '#productividad', '#jefe'],
    emprendimiento: ['#emprendimiento', '#emprendedor', '#negocios', '#mentalidad'],
    familia: ['#familia', '#hijos', '#padres', '#hogar'],
    dinero: ['#finanzaspersonales', '#educacionfinanciera', '#ahorro', '#dinero'],
    habitos: ['#habitos', '#disciplina', '#constancia', '#metas'],
    redes: ['#redessociales', '#celular', '#generacionz', '#vidadigital'],
    fe: ['#fe', '#Dios', '#esperanza', '#bendiciones'],
  },
  en: {
    base: ['#motivation', '#lifelessons', '#viral', '#animation', '#mindset'],
    superacion: ['#selfimprovement', '#nevergiveup', '#personalgrowth', '#success'],
    trabajador: ['#workinglife', '#hustle', '#reallife', '#miami'],
    amistad: ['#friendship', '#friends', '#bestfriends', '#loyalty'],
    matrimonio: ['#marriage', '#relationships', '#love', '#couplegoals'],
    trabajo: ['#work', '#leadership', '#productivity', '#career'],
    emprendimiento: ['#entrepreneur', '#smallbusiness', '#business', '#mindset'],
    familia: ['#family', '#parenting', '#kids', '#home'],
    dinero: ['#personalfinance', '#moneytips', '#saving', '#financialfreedom'],
    habitos: ['#habits', '#discipline', '#consistency', '#goals'],
    redes: ['#socialmedia', '#genz', '#screentime', '#digitallife'],
    fe: ['#faith', '#God', '#hope', '#blessed'],
  },
};
const NET_TAGS = { facebook: { es: [], en: [] }, instagram: { es: ['#reels', '#reelsinstagram'], en: ['#reels', '#explore'] }, youtube: { es: ['#shorts'], en: ['#shorts'] }, tiktok: { es: ['#fyp', '#parati', '#foryou'], en: ['#fyp', '#foryou', '#foryoupage'] } };

const uniq = a => [...new Set(a.filter(Boolean))];
const short = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

// meta: { title, hook, reflect: [..], theme, lang }; links: { facebook, instagram, youtube, tiktok }; page: nombre de la página
export function captionsFor(meta, { links = {}, page = '', aiTags = null } = {}) {
  const es = meta.lang !== 'en'; const L = es ? 'es' : 'en';
  const T = TAGS[L]; const themeTags = T[meta.theme] || T.superacion;
  const refl = (meta.reflect || []).filter(Boolean).join(' ');
  const hook = (meta.hook || '').trim();
  const title = short((meta.title || hook || refl).replace(/[«»"]/g, ''), 60);
  const follow = es ? 'Sígueme para más historias como esta 🙌' : 'Follow me for more stories like this 🙌';
  const share = es ? 'Compártelo con alguien que lo necesite hoy. ❤️' : 'Share it with someone who needs it today. ❤️';
  const save = es ? 'Guárdalo para verlo cuando lo necesites. 📌' : 'Save it for when you need it. 📌';
  const ask = es ? '¿Tú qué hubieras hecho? Te leo en los comentarios. 👇' : 'What would you have done? Tell me in the comments. 👇';
  const tagsFor = (net, n) => uniq([...((aiTags && aiTags[net]) || []), ...NET_TAGS[net][L], ...themeTags, ...T.base]).slice(0, n).map(t => (t.startsWith('#') ? t : '#' + t)).join(' ');
  const handle = net => (links[net] || '').trim();
  const linkLine = (net, label) => (handle(net) ? `${label} ${handle(net)}` : '');
  return {
    facebook: {
      title,
      text: [`${title}`, '', hook && hook !== title ? hook : '', refl ? `💭 ${refl}` : '', '', ask, share, `${follow}${page ? ' — ' + page : ''}`, linkLine('facebook', es ? '👉 Mi página:' : '👉 My page:'), '', tagsFor('facebook', 5)].filter((x, i, a) => x !== '' || a[i - 1] !== '').join('\n').trim(),
    },
    instagram: {
      title,
      text: [`${hook || title} 👀`, '', refl ? `✨ ${refl}` : '', '', save, share, `${follow}${handle('instagram') ? ' → ' + handle('instagram') : page ? ' → ' + page : ''}`, '', '.', '.', tagsFor('instagram', 15)].join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    },
    youtube: {
      title: short(`${title} ${tagsFor('youtube', 1)}`, 100),
      text: [`${short(`${title} ${tagsFor('youtube', 1)}`, 100)}`, '', refl || hook, '', follow, linkLine('youtube', es ? '🔔 Suscríbete:' : '🔔 Subscribe:'), '', tagsFor('youtube', 4)].join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    },
    tiktok: {
      title,
      text: [short(`${hook || title} ${refl ? '💭 ' + refl : ''}`.trim(), 150), `${es ? 'Sígueme pa\' más 🙌' : 'Follow for more 🙌'}${handle('tiktok') ? ' ' + handle('tiktok') : ''}`, tagsFor('tiktok', 6)].join('\n').trim(),
    },
  };
}

// Todos los textos de un video en un solo bloque (para el archivo de textos del lote)
export function captionsText(meta, caps, label = '') {
  return [`==== ${label ? label + ' · ' : ''}${meta.title} ====`, ...NETWORKS.map(n => `--- ${n.name} ---\n${caps[n.id].text}`)].join('\n\n') + '\n';
}
