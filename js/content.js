// Biblioteca de contenido: temas, situaciones, ganchos, reflexiones y llamados a la acción.
// Cada línea: L(es, en, acciones, prop, sfx)
//  acciones: "A:talk B:shrug"  (roles A, B, C, D) o "all:laugh"
//  prop: "clock:8:00", "money", "pizza", "sign:Izq|Der", "left"/"right" (en caminos)...
//  sfx: pop, boing, ding, whoosh, scratch, applause, cash, sad, drum, type, heart, alarm, laugh, notif

const L = (es, en, a = '', p = '', fx = '', core = false) => ({ t: { es, en }, a, p, fx, core });
const R = (es, en) => ({ es, en });

export const THEMES = [
  { id: 'superacion', emoji: '🌱', name: R('Superación', 'Comeback stories') },
  { id: 'trabajador', emoji: '💪', name: R('Vida de trabajador', 'Working-class life') },
  { id: 'amistad', emoji: '🤝', name: R('Amistad', 'Friendship') },
  { id: 'matrimonio', emoji: '💍', name: R('Matrimonio', 'Marriage') },
  { id: 'trabajo', emoji: '💼', name: R('Trabajo', 'Work') },
  { id: 'emprendimiento', emoji: '🚀', name: R('Emprendimiento', 'Business') },
  { id: 'familia', emoji: '🏡', name: R('Familia', 'Family') },
  { id: 'dinero', emoji: '💰', name: R('Dinero', 'Money') },
  { id: 'habitos', emoji: '🏃', name: R('Hábitos', 'Habits') },
  { id: 'redes', emoji: '📱', name: R('Redes sociales', 'Social media') },
  { id: 'fe', emoji: '🙏', name: R('Fe y religión', 'Faith') },
];

export const ENVIRONMENTS = [
  { id: 'auto', emoji: '✨', name: R('Automático', 'Automatic') },
  { id: 'oficina', emoji: '🏢', name: R('Oficina', 'Office') },
  { id: 'casa', emoji: '🛋️', name: R('Casa', 'Home') },
  { id: 'parque', emoji: '🌳', name: R('Parque', 'Park') },
  { id: 'cafe', emoji: '☕', name: R('Café', 'Coffee shop') },
  { id: 'ciudad', emoji: '🏙️', name: R('Ciudad', 'City') },
  { id: 'playa', emoji: '🏖️', name: R('Playa', 'Beach') },
  { id: 'cocina', emoji: '🍳', name: R('Cocina', 'Kitchen') },
  { id: 'iglesia', emoji: '⛪', name: R('Iglesia', 'Church') },
  { id: 'vacio', emoji: '⬜', name: R('Fondo liso', 'Plain') },
];

// mode: 'esc' = repetición que sube + giro final | 'caminos' = alegoría de dos caminos
// Historias escritas como habla la gente: español de Miami (cubano y latino de EE. UU.) e inglés coloquial.
// Formato compacto: S(id, env, modo, [título es, en], [gancho es, en], setup, reps, giro, remate, [reflexión 1], [reflexión 2])
const S = (id, env, mode, title, hook, setup, reps, twist, after, r1, r2) => ({
  id, env, mode, title: R(...title), hook: R(...hook), setup: [setup], reps, twist, after: after || undefined, reflect: [R(...r1), R(...r2)],
});

// Escena muda: cartel de tiempo + acción + efecto; la frase corta (q) es opcional
const M = ({ c, a = 'A:idle', p = '', fx = 'pop', o, q, w, r }) => ({ card: R(...c), a, p, fx, o: o ? R(...o) : null, q: q ? R(...q) : null, w: w || 'A', r: r || null });

export const SITUATIONS = {
  superacion: [
    {
      id: 'hermanos', env: 'casa', mode: 'esc', hookAct: 'A:scroll',
      title: R('El hermano que soltó el teléfono', 'The brother who put the phone down'),
      hook: R('Mi hermanito no suelta el teléfono. Yo era igualito.', 'My little brother can\'t put his phone down. I was the same.'),
      setup: [L('Hace un año yo vivía pegado a esta pantalla.', 'A year ago I lived glued to this screen.', 'A:scroll', 'pov:reels', 'notif')],
      reps: [
        L('Siete horas al día pasando reels.', 'Seven hours a day scrolling reels.', 'A:scroll', 'pov:reels', 'notif'),
        L('Me perdí cumpleaños, partidos y hasta el sol.', 'I missed birthdays, games, even the sun.', 'A:sad', '', 'sad'),
        L('Un día lo apagué. Me temblaban las manos.', 'One day I turned it off. My hands were shaking.', 'A:shock', 'phone', 'drum'),
        L('Salí a correr, leí un libro y volví a reírme.', 'I went running, read a book, laughed again.', 'A:run', '', 'whoosh'),
        L('Ahora mi hermanito está igualito que yo.', 'Now my little brother is exactly like I was.', 'B:scroll A:sad', 'pov:reels', 'notif'),
        L('No contesta, no come, no duerme.', 'He won\'t answer, won\'t eat, won\'t sleep.', 'B:scroll A:facepalm', '', 'boing'),
      ],
      twist: L('No le quité el teléfono. Le dije: "Vamos a jugar pelota, que te gano."', 'I didn\'t take his phone. I said: "Let\'s play ball. Bet I win."', 'A:talk B:shock', '', 'scratch'),
      after: L('Una semana después, él me pide a mí que suelte el mío.', 'A week later, he\'s the one telling me to put mine down.', 'B:point A:laugh', '', 'laugh'),
      reflect: [R('Nadie sale solo de un hoyo.', 'Nobody climbs out of a hole alone.'), R('Si tú ya saliste, tiéndele la mano a otro.', 'If you made it out, reach back for someone else.')],
    },
    {
      id: 'likes', env: 'casa', mode: 'esc', hookAct: 'A:selfie',
      title: R('Doscientas selfies pa\' subir una', '200 selfies to post one'),
      hook: R('Tomarse doscientas selfies pa\' subir una. ¿Te suena?', 'Taking 200 selfies to post one. Sound familiar?'),
      setup: [L('Foto, filtro, borrar. Foto, filtro, borrar.', 'Snap, filter, delete. Snap, filter, delete.', 'A:selfie', 'pov:selfie', 'pop')],
      reps: [
        L('La subo y me quedo mirando los likes.', 'I post it and just stare at the likes.', 'A:scroll', 'pov:reels', 'notif'),
        L('Tres likes. Mi vida se acabó.', 'Three likes. My life is over.', 'A:cry', '', 'sad'),
        L('Me comparo con todo el mundo en los reels.', 'I compare myself to everyone on my feed.', 'A:scroll', 'pov:search', 'notif'),
        L('Mi amiga me escribe: "¿Salimos?" Le digo que no.', 'My friend texts: "Wanna hang?" I say no.', 'A:phone B:sad', 'phone', 'boing'),
        L('Mi abuela me ve y me dice: "Mija, tú eres linda así."', 'My grandma looks at me: "Honey, you\'re beautiful just like that."', 'B:talk A:shock', '', 'ding'),
      ],
      twist: L('Ese día salí sin filtro... y fue la mejor foto del año.', 'That day I went out with no filter... best photo of the year.', 'A:selfie B:cheer', 'pov:selfie', 'scratch'),
      after: L('Cero likes. Pero un montón de risas.', 'Zero likes. Tons of laughs.', 'all:laugh', 'heart', 'laugh'),
      reflect: [R('Tu valor no se mide en likes.', 'Your worth isn\'t measured in likes.'), R('Se mide en la gente que te quiere sin filtro.', 'It\'s the people who love you unfiltered.')],
    },
    {
      id: 'otravez', env: 'oficina', mode: 'esc', hookAct: 'A:trip',
      title: R('Me dijeron que no 47 veces', 'I got told no 47 times'),
      hook: R('Me dijeron que no cuarenta y siete veces.', 'I got told no forty-seven times.'),
      setup: [L('Primera entrevista de trabajo. Nervios de candela.', 'First job interview. Super nervous.', 'A:wait', 'clock:9:00', 'alarm')],
      reps: [
        L('"No tienes experiencia." Rechazado.', '"No experience." Rejected.', 'B:talk A:sad', '', 'sad'),
        L('"Te llamamos." Nunca llamaron.', '"We\'ll call you." They never called.', 'A:phone', 'pov:search', 'notif'),
        L('Me caí en plena calle, con traje y todo.', 'Tripped in the middle of the street, suit and all.', 'A:trip', '', 'fall'),
        L('Mi hermano se rió. Yo también.', 'My brother laughed. So did I.', 'B:laugh A:laugh', '', 'laugh'),
        L('Aprendí algo nuevo cada noche.', 'I learned something new every night.', 'A:type', 'laptop', 'type'),
        L('Entrevista número cuarenta y ocho.', 'Interview number forty-eight.', 'A:strong', 'clock:9:00', 'ding'),
      ],
      twist: L('"El puesto es tuyo." Y el jefe era el que me rechazó la primera vez.', '"You\'re hired." And the boss was the guy who rejected me the first time.', 'B:give A:shock', 'trophy', 'scratch'),
      after: L('Me dijo: "Volviste mejor."', 'He said: "You came back better."', 'B:talk A:cheer', 'confetti', 'applause'),
      reflect: [R('Un no hoy no es un no pa\' siempre.', 'A no today isn\'t a no forever.'), R('Levántate una vez más de las que te caes.', 'Get up one more time than you fall.')],
    },
  ],
  // Historias casi mudas: las cuentan las acciones, las caras, los carteles de tiempo y los efectos.
  // M({ c: [cartel es, en], a, p, fx, o: [onomatopeya es, en], q: [frase corta es, en] (opcional), w: quién la dice, r: reacción })
  trabajador: [
    {
      id: 'quincena', env: 'casa', mode: 'mudo', silent: true,
      title: R('El sueldo que dura un fin de semana', 'The paycheck that lasts one weekend'),
      hook: R('POV: cobraste el viernes y el lunes ya estás pela\'o.', 'POV: you got paid Friday and you\'re broke by Monday.'),
      scenes: [
        M({ c: ['VIERNES 5:00 PM', 'FRIDAY 5:00 PM'], a: 'A:cheer', p: 'money', fx: 'cash', o: ['¡COBRÉ!', 'PAYDAY!'] }),
        M({ c: ['VIERNES 5:05 PM', 'FRIDAY 5:05 PM'], a: 'A:phone', p: 'phone', fx: 'notif', q: ['¿El rent ya?', 'Rent already?'], r: 'shock' }),
        M({ c: ['VIERNES 5:10 PM', 'FRIDAY 5:10 PM'], a: 'A:shock', p: 'chart_down', fx: 'cash', o: ['¡LUZ, CARRO, TELÉFONO!', 'BILLS!'] }),
        M({ c: ['SÁBADO', 'SATURDAY'], a: 'A:chase', p: 'money', fx: 'zip', o: ['¡VUELVE!', 'COME BACK!'] }),
        M({ c: ['DOMINGO', 'SUNDAY'], a: 'A:sad', fx: 'sad', q: ['Arroz con... arroz.', 'Rice with... more rice.'], r: 'laugh' }),
        M({ c: ['LUNES 6:00 AM', 'MONDAY 6:00 AM'], a: 'A:tired', p: 'coffee', fx: 'alarm', o: ['¡A TRABAJAR!', 'BACK TO WORK!'] }),
      ],
      twist: M({ c: ['DÍA 15', 'DAY 15'], a: 'A:faint', p: 'phone', fx: 'thud', o: ['¡KO!', 'K.O.!'], q: ['¿Me cobran por no tener dinero?', 'They charge me for being broke?'] }),
      reflect: [R('No eres malo con el dinero.', 'You\'re not bad with money.'), R('Es que la vida está carísima.', 'Life is just that expensive.')],
      question: R('¿A ti también te dura el sueldo un fin de semana?', 'Does your paycheck last a weekend too?'),
    },
    {
      id: 'turno', env: 'ciudad', mode: 'mudo', silent: true,
      title: R('El turno de noche', 'The night shift'),
      hook: R('Etiqueta a ese que trabaja de noche.', 'Tag the friend who works nights.'),
      scenes: [
        M({ c: ['9:00 PM', '9:00 PM'], a: 'A:walk B:wave', fx: 'whoosh', o: ['TODOS A DORMIR...', 'EVERYONE SLEEPS...'] }),
        M({ c: ['11:00 PM', '11:00 PM'], a: 'A:lift', p: 'box', fx: 'punch', o: ['¡PUM!', 'THUMP!'] }),
        M({ c: ['2:00 AM', '2:00 AM'], a: 'A:sleep', fx: 'boing', o: ['Zzz...', 'Zzz...'] }),
        M({ c: ['3:00 AM', '3:00 AM'], a: 'A:shock', p: 'phone', fx: 'drum', o: ['¡RIIING!', 'RIIING!'], q: ['¡Estoy despierto, jefe!', 'I\'m awake, boss!'] }),
        M({ c: ['6:00 AM', '6:00 AM'], a: 'A:tired', p: 'coffee', fx: 'uf', o: ['¡POR FIN!', 'FINALLY!'] }),
        M({ c: ['7:00 AM', '7:00 AM'], a: 'C:jump A:tired', fx: 'laughs', o: ['¡PAPIII!', 'DADDY!'] }),
      ],
      twist: M({ c: ['7:05 AM', '7:05 AM'], a: 'B:talk A:faint', fx: 'thud', o: ['¡PLAF!', 'THUD!'], q: ['Mi amor, ¿me llevas al mall?', 'Babe, can you take me to the mall?'], w: 'B' }),
      reflect: [R('Detrás de cada ojera hay alguien que no se rinde.', 'Behind every tired face is someone who never quits.'), R('Gracias a los que trabajan mientras otros duermen.', 'Respect to those who work while others sleep.')],
      question: R('¿Quién más trabaja de noche?', 'Who else works the night shift?'),
    },
    {
      id: 'aumento', env: 'oficina', mode: 'mudo', silent: true,
      title: R('Pedirle aumento al jefe', 'Asking the boss for a raise'),
      hook: R('Así se pide un aumento en la vida real.', 'How asking for a raise really goes.'),
      scenes: [
        M({ c: ['8:00 AM', '8:00 AM'], a: 'A:strong', fx: 'ding', q: ['Hoy pido aumento.', 'Today I ask for a raise.'] }),
        M({ c: ['8:30 AM', '8:30 AM'], a: 'A:sneak', fx: 'sneak', o: ['shhh...', 'shhh...'] }),
        M({ c: ['8:31 AM', '8:31 AM'], a: 'B:angry A:shock', fx: 'drum', o: ['¡GLUP!', 'GULP!'] }),
        M({ c: ['8:32 AM', '8:32 AM'], a: 'A:talk B:think', fx: 'pop', q: ['Jefe... yo quería...', 'Boss... I was wondering...'] }),
        M({ c: ['8:33 AM', '8:33 AM'], a: 'B:laugh A:sad', fx: 'laughs', o: ['¡JAJAJA!', 'HAHAHA!'] }),
        M({ c: ['8:34 AM', '8:34 AM'], a: 'A:flee', fx: 'zip', o: ['¡ZAS!', 'ZOOM!'] }),
      ],
      twist: M({ c: ['VIERNES', 'FRIDAY'], a: 'B:cheer A:facepalm', p: 'money', fx: 'scratch', o: ['¡CARRO NUEVO!', 'NEW CAR!'], q: ['Con MI aumento.', 'With MY raise.'] }),
      reflect: [R('Tu trabajo vale más de lo que te pagan.', 'Your work is worth more than they pay you.'), R('Nunca dejes de prepararte.', 'Never stop leveling up.')],
      question: R('¿Cuándo fue tu último aumento?', 'When was your last raise?'),
    },
    {
      id: 'muerto', env: 'casa', mode: 'mudo', silent: true,
      title: R('Llegar muerto del trabajo', 'Getting home dead tired'),
      hook: R('Este eres tú después de diez horas de trabajo.', 'This is you after a 10-hour shift.'),
      scenes: [
        M({ c: ['7:00 PM', '7:00 PM'], a: 'A:tired', fx: 'uf', o: ['10 HORAS DESPUÉS...', '10 HOURS LATER...'] }),
        M({ c: ['7:01 PM', '7:01 PM'], a: 'A:faint', fx: 'thud', o: ['¡PLAF!', 'THUD!'] }),
        M({ c: ['7:02 PM', '7:02 PM'], a: 'B:talk A:sleep', fx: 'pop', q: ['Mi amor, ¿y la cena?', 'Babe, what\'s for dinner?'], w: 'B', r: 'laugh' }),
        M({ c: ['7:03 PM', '7:03 PM'], a: 'C:jump A:shock', fx: 'boing', o: ['¡PAPÁÁÁ!', 'DADDY!'] }),
        M({ c: ['10:00 PM', '10:00 PM'], a: 'A:phone', p: 'phone', fx: 'notif', o: ['UN VIDEO MÁS...', 'ONE MORE VIDEO...'] }),
        M({ c: ['1:00 AM', '1:00 AM'], a: 'A:phone', p: 'clock:1:00', fx: 'drum', q: ['Uno más y me acuesto.', 'One more and I\'m done.'] }),
      ],
      twist: M({ c: ['5:30 AM', '5:30 AM'], a: 'A:faint', p: 'clock:5:30', fx: 'alarm', o: ['¡NOOO!', 'NOOO!'] }),
      reflect: [R('Descansar también es parte del trabajo.', 'Rest is part of the job too.'), R('Cuídate. Nadie trabaja por ti.', 'Take care of yourself. Nobody works for you.')],
      question: R('¿Tú también haces esto?', 'Do you do this too?'),
    },
  ],
  amistad: [
    S('tarde', 'cafe', 'esc', ['El socio que siempre llega tarde', 'The friend who\'s always late'],
      ['Todos tenemos un socio que llega tarde. TODOS.', 'We all have that one friend who\'s always late. ALL of us.'],
      L('Quedamos a las 8. Me escribe: "Llego en five."', 'We said 8. He texts: "Be there in five."', 'A:phone', 'clock:8:00', 'pop'),
      [L('8:10. "Ya voy saliendo, asere."', '8:10. "Leaving now, bro."', 'A:wait', 'clock:8:10', 'notif'),
        L('8:30. Todavía en la ducha. Se oye el agua.', '8:30. Still in the shower. I can hear it.', 'A:facepalm', 'clock:8:30', 'boing'),
        L('9:00. "Hay tremendo tráfico." Vive a dos cuadras.', '9:00. "Traffic\'s crazy." He lives two blocks away.', 'A:shock', 'clock:9:00', 'drum'),
        L('9:45. El mesero ya me trajo una almohadita.', '9:45. The waiter brought me a pillow.', 'A:sit', 'clock:9:45', 'pop'),
        L('10:30. Me pedí un postre. Y otro postre.', '10:30. I ordered dessert. Then another dessert.', 'A:sad', 'clock:10:30', 'sad'),
        L('11:00. El mesero ya me invitó a su boda.', '11:00. The waiter just invited me to his wedding.', 'A:laugh', 'clock:11:00', 'laugh')],
      L('Llega con un cake. Era MI cumpleaños. Y yo ni me acordaba.', 'He walks in with a cake. It\'s MY birthday. I forgot.', 'B:give A:shock', 'gift', 'scratch'),
      L('Se pasó tres horas armando la sorpresa.', 'He spent three hours setting up the surprise.', 'all:cheer', 'confetti', 'applause'),
      ['El que llega tarde con el corazón lleno, vale la espera.', 'The friend who shows up late with a full heart is worth the wait.'],
      ['Cuida a los que siempre vuelven por ti.', 'Keep the ones who always come back for you.']),
    S('favores', 'casa', 'esc', ['El amigo que solo llama pa\' pedir', 'The friend who only calls for favors'],
      ['Si este amigo te llama, ya sabes que algo quiere.', 'If this friend calls, you already know he wants something.'],
      L('Suena el teléfono. Es Carlos. Ay, mi madre.', 'Phone rings. It\'s Carlos. Oh no.', 'A:phone', 'phone', 'notif'),
      [L('"Brother, ¿me prestas el taladro?"', '"Bro, can I borrow your drill?"', 'B:talk A:shrug', '', 'pop'),
        L('"¿Me llevas al aeropuerto? A las cuatro de la mañana."', '"Can you drive me to the airport? 4 AM."', 'B:talk A:tired', '', 'boing'),
        L('"¿Me ayudas con la mudanza? Es un tercer piso."', '"Help me move? Third floor, no elevator."', 'A:lift B:point', 'box', 'boing'),
        L('"¿Me prestas doscientos? Te los doy el viernes." ¿Qué viernes?', '"Can I borrow two hundred? I\'ll pay you Friday." Which Friday?', 'B:talk A:facepalm', 'money', 'cash'),
        L('"¿Me cuidas al perro? Na\', dos semanitas."', '"Can you watch my dog? Just two weeks."', 'B:talk A:shock', '', 'boing'),
        L('"Oye, ¿y un riñón? Total, tú tienes dos."', '"Hey, what about a kidney? You\'ve got two."', 'B:talk A:shock', '', 'drum')],
      L('Pero el día que me botaron del trabajo, fue el primero que tocó la puerta.', 'But the day I got laid off, he was the first one at my door.', 'B:run A:sad', '', 'scratch'),
      L('Con comida, con el rent, y sin preguntar na\'.', 'With food, with rent money, no questions asked.', 'A:hug B:hug', 'heart', 'heart'),
      ['Los amigos de verdad no llevan la cuenta.', 'Real friends don\'t keep score.'],
      ['Aparecen cuando más los necesitas.', 'They show up when you need them most.']),
    S('razon', 'caminos', 'caminos', ['Dos caminos: tener la razón o tener al amigo', 'Two paths: being right or keeping your friend'],
      ['Una pelea por una bobería te puede costar un amigo.', 'A dumb fight can cost you a real friend.'],
      L('Una discusión por una bobería. Dos caminos.', 'A fight over nothing. Two paths.', 'A:angry B:angry', 'sign:Tener la razón|Tener al amigo|Being right|Keeping the friend', 'whoosh'),
      [L('Camino uno: le ganas la discusión. ¡Toma!', 'Path one: you win the argument. Boom!', 'A:cheer', 'left', 'ding', true),
        L('Y celebras... solito en tu casa.', 'And you celebrate... alone at home.', 'A:sad', 'left', 'sad', true),
        L('Camino dos: le dices "brother, perdóname".', 'Path two: you say "bro, my bad."', 'A:talk B:idle', 'right', 'pop', true),
        L('Y veinte años después, siguen gozando juntos.', 'Twenty years later, you\'re still laughing together.', 'all:laugh', 'right', 'laugh', true),
        L('Uno tiene la razón. Y nadie con quien almorzar.', 'One has the win. And nobody to grab lunch with.', 'A:sad', 'left', 'sad'),
        L('El otro ya tiene padrino pa\' la boda.', 'The other one\'s got a best man for the wedding.', 'all:dance', 'right', 'ding')],
      L('Lo mejor: ninguno se acuerda de por qué peleaban.', 'Best part: nobody remembers what the fight was about.', 'all:shrug', '', 'scratch'), null,
      ['Hay victorias que salen carísimas.', 'Some wins cost way too much.'],
      ['Escoge a la gente, no la pelea.', 'Choose people, not arguments.']),
  ],
  matrimonio: [
    S('cenar', 'casa', 'esc', ['"¿Dónde quieres comer?"', '"Where do you wanna eat?"'],
      ['La pregunta más peligrosa del matrimonio.', 'The most dangerous question in marriage.'],
      L('"Mi amor, ¿dónde comemos?" "Donde tú quieras."', '"Babe, where do you wanna eat?" "Anywhere."', 'A:talk B:shrug', '', 'pop'),
      [L('"¿Pizza?" "Mmm... no."', '"Pizza?" "Mmm... no."', 'A:talk B:idle', 'pizza', 'boing'),
        L('"¿Sushi?" "Muy caro, con lo caro que está todo."', '"Sushi?" "Too pricey, with how expensive everything is."', 'A:talk B:shrug', 'money', 'boing'),
        L('"¿Comida cubana?" "Ayer comimos arroz con frijoles."', '"Mexican?" "We had tacos yesterday."', 'A:think B:idle', '', 'boing'),
        L('"¿Hamburguesas?" "Me tiene que servir el vestido."', '"Burgers?" "I gotta fit in that dress."', 'A:facepalm B:talk', '', 'boing'),
        L('"¿Cocino yo?" Silencio. Se oyó un grillo.', '"Should I cook?" Silence. A cricket chirped.', 'A:shock B:idle', '', 'drum'),
        L('Una hora después. Con hambre y sin decidir.', 'One hour later. Starving. Still deciding.', 'all:tired', 'clock:21:30', 'sad')],
      L('Al final... pedimos pizza. LA PRIMERA OPCIÓN.', 'In the end... we ordered pizza. THE FIRST OPTION.', 'all:facepalm', 'pizza', 'scratch'),
      L('Y fue la mejor noche de la semana.', 'Best night of the week, though.', 'all:laugh', 'heart', 'laugh'),
      ['El matrimonio no es estar de acuerdo en todo.', 'Marriage isn\'t agreeing on everything.'],
      ['Es seguir escogiéndose, aunque se demoren una hora.', 'It\'s choosing each other, even if it takes an hour.']),
    S('detalles', 'cocina', 'esc', ['Se le olvida todo... menos una cosa', 'He forgets everything... except one thing'],
      ['Mi esposo se olvida de TODO. Pero mira esto.', 'My husband forgets EVERYTHING. But watch this.'],
      L('Mi marido tiene memoria de pescado.', 'My husband has the memory of a goldfish.', 'A:think', 'bulb', 'pop'),
      [L('Se le olvidó el aniversario. Otra vez.', 'Forgot our anniversary. Again.', 'A:shock B:angry', 'calendar', 'boing'),
        L('Se le olvidó el cumpleaños de mi mamá. Ella a él no.', 'Forgot my mom\'s birthday. She didn\'t forget him.', 'A:facepalm', 'gift', 'boing'),
        L('Buscó las llaves media hora. Las tenía en la mano.', 'Looked for his keys for 30 minutes. In his hand.', 'A:think', '', 'pop'),
        L('Lo mandé por pan. Volvió con un televisor.', 'Sent him for bread. Came back with a TV.', 'A:shrug B:facepalm', '', 'boing'),
        L('Se le olvidó dónde parqueó en el mall.', 'Forgot where he parked at the mall.', 'A:tired', '', 'pop'),
        L('Casi se le olvida su propio cumpleaños.', 'Almost forgot his own birthday.', 'A:shock', 'gift', 'drum')],
      L('Pero nunca, NUNCA se le olvida cómo me gusta el cafecito.', 'But he never, EVER forgets how I like my coffee.', 'A:give B:love', 'coffee', 'scratch'),
      L('Veinte años. Todas las mañanas. Con espumita.', 'Twenty years. Every morning. Extra foam.', 'A:hug B:hug', 'heart', 'heart'),
      ['El amor no está en las fechas grandes.', 'Love isn\'t in the big dates.'],
      ['Está en el cafecito de todos los días.', 'It\'s in the coffee every single morning.']),
    S('celular', 'caminos', 'caminos', ['Dos caminos: el celular o tu pareja', 'Two paths: your phone or your partner'],
      ['Así se apaga un matrimonio sin que nadie lo note.', 'This is how a marriage dies and nobody notices.'],
      L('Cena en la casa. Dos caminos.', 'Dinner at home. Two paths.', 'A:idle B:idle', 'sign:El celular|Mirarse|The phone|Each other', 'whoosh'),
      [L('Camino uno: cada uno pegado a su celular.', 'Path one: both glued to their phones.', 'A:phone B:phone', 'left', 'notif', true),
        L('Juntos en la mesa, pero a mil millas.', 'Same table, a thousand miles apart.', 'all:sad', 'left', 'sad', true),
        L('Camino dos: el celular se va pa\' la gaveta.', 'Path two: phones go in the drawer.', 'A:talk B:idle', 'right', 'pop', true),
        L('Y se vuelven a enamorar como en el 2010.', 'And they fall in love like it\'s 2010.', 'A:love B:love', 'right', 'heart', true),
        L('Mil likes de extraños. Cero de la persona de al lado.', 'A thousand likes from strangers. Zero from the person next to you.', 'A:phone', 'left', 'notif'),
        L('Una conversación que se acaba a las dos de la mañana.', 'A talk that goes till 2 AM.', 'all:laugh', 'right', 'laugh')],
      L('Spoiler: el celular nunca te va a dar un abrazo.', 'Spoiler: your phone will never hug you back.', 'A:hug B:hug', '', 'scratch'), null,
      ['Estar presente es el regalo más caro.', 'Being present is the most expensive gift.'],
      ['Y el único que no se compra en Amazon.', 'And the only one you can\'t buy on Amazon.']),
  ],
  trabajo: [
    S('reunion', 'oficina', 'esc', ['La reunión que pudo ser un email', 'The meeting that could\'ve been an email'],
      ['Si trabajas en oficina, esto te va a doler.', 'If you work in an office, this one\'s gonna hurt.'],
      L('Reunión urgente a las 9. "Es rapidito."', 'Urgent meeting at 9. "It\'ll be quick."', 'A:walk', 'clock:9:00', 'alarm'),
      [L('9:00. "Esperemos a que se conecten todos."', '9:00. "Let\'s wait for everyone to join."', 'A:wait', 'clock:9:00', 'pop'),
        L('9:20. "¿Me escuchan? ¿Hello? ¿Hello?"', '9:20. "Can you hear me? Hello? Hello?"', 'B:talk A:facepalm', 'laptop', 'boing'),
        L('9:45. Slide 3 de 87.', '9:45. Slide 3 of 87.', 'A:sleep', 'chart_up', 'pop'),
        L('10:30. Alguien compartió pantalla. Era su TikTok.', '10:30. Someone shares their screen. It\'s their TikTok.', 'all:shock', 'laptop', 'drum'),
        L('11:00. "Esto lo vemos en otra reunión."', '11:00. "Let\'s take this offline."', 'B:talk A:tired', 'clock:11:00', 'sad'),
        L('12:00. Reunión pa\' planear la próxima reunión.', '12:00. A meeting to plan the next meeting.', 'all:tired', 'calendar', 'boing')],
      L('Conclusión final: "Mejor les mando un email."', 'Final conclusion: "I\'ll just send an email."', 'all:facepalm', 'laptop', 'scratch'), null,
      ['El tiempo es lo único que no se recupera.', 'Time is the only thing you never get back.'],
      ['Respeta el tuyo y el de los demás.', 'Respect yours and everybody else\'s.']),
    S('lunes', 'casa', 'esc', ['Lunes: la guerra contra la alarma', 'Monday: the war against the alarm'],
      ['Nadie odia el lunes como yo. Mira.', 'Nobody hates Mondays like me. Watch.'],
      L('Lunes, seis de la mañana. Suena la alarma.', 'Monday, 6 AM. Alarm goes off.', 'A:sleep', 'clock:6:00', 'alarm'),
      [L('Snooze número uno. "Cinco minuticos."', 'Snooze one. "Five more minutes."', 'A:sleep', 'clock:6:10', 'alarm'),
        L('Snooze número cinco. Ya negociando con Dios.', 'Snooze five. Now I\'m negotiating with God.', 'A:sleep', 'clock:6:50', 'alarm'),
        L('¡Se me hizo tarde! Cafecito doble sin respirar.', 'I\'m late! Double espresso, no breathing.', 'A:run', 'coffee', 'whoosh'),
        L('El tráfico del Palmetto. Candela.', 'Highway traffic. Absolute nightmare.', 'A:angry', 'clock:8:40', 'boing'),
        L('Corro tres cuadras con la camisa al revés.', 'Running three blocks with my shirt inside out.', 'A:run', '', 'whoosh'),
        L('Llego sudando. La oficina está vacía.', 'I get there sweating. The office is empty.', 'A:tired', '', 'drum')],
      L('Mensaje del jefe: "¡Feliz día feriado a todos!"', 'Text from the boss: "Happy holiday, everyone!"', 'A:shock', 'phone', 'scratch'),
      L('Y yo ahí, solito, con mi cafecito.', 'And there I am. Alone. With my coffee.', 'A:facepalm', 'coffee', 'sad'),
      ['No vivas esperando el viernes.', 'Don\'t live just waiting for Friday.'],
      ['Hazte una vida de la que no quieras escapar el lunes.', 'Build a life you don\'t wanna escape on Monday.']),
    S('quejarse', 'caminos', 'caminos', ['Dos caminos: quejarte o aprender', 'Two paths: complain or level up'],
      ['Tu jefe te tira un proyecto imposible. ¿Qué haces?', 'Your boss drops an impossible project on you. Now what?'],
      L('Un proyecto que es candela. Dos caminos.', 'A brutal project. Two paths.', 'A:shock', 'sign:Quejarme|Aprender|Complain|Learn', 'whoosh'),
      [L('Camino uno: te quejas todo el día con todo el mundo.', 'Path one: you complain to anyone who\'ll listen.', 'A:angry', 'left', 'boing', true),
        L('Y el proyecto... sigue igualito.', 'And the project... is still there.', 'A:tired', 'left', 'sad', true),
        L('Camino dos: aprendes algo nuevo, aunque duela.', 'Path two: you learn something new, even if it hurts.', 'A:think', 'right', 'ding', true),
        L('Un año después, el jefe eres tú.', 'A year later, you\'re the boss.', 'A:strong', 'right', 'applause', true),
        L('Cada lunes, la misma quejadera.', 'Every Monday, same complaining.', 'A:angry', 'left', 'boing'),
        L('Cada error, una lección.', 'Every mistake, a lesson.', 'A:cheer', 'right', 'ding')],
      L('¿Y adivina quién te pide ayuda ahora? El que se quejaba.', 'And guess who\'s asking you for help now? The complainer.', 'B:sad A:point', 'trophy', 'scratch'), null,
      ['Los problemas no cambian.', 'Problems don\'t change.'],
      ['Cambia quien tú decides ser frente a ellos.', 'What changes is who you decide to be.']),
  ],
  emprendimiento: [
    S('mama', 'ciudad', 'esc', ['Mi primer negocio y mi única clienta', 'My first business and my only customer'],
      ['Así me fue el primer año con mi negocio.', 'Here\'s how my first year in business went.'],
      L('Abrí mi negocio con toda la ilusión del mundo.', 'I opened my business full of hope.', 'A:cheer', 'box', 'ding'),
      [L('Día uno: cero clientes. Cero.', 'Day one: zero customers. Zero.', 'A:wait', 'chart_down', 'sad'),
        L('Día dos: vino mi mamá.', 'Day two: my mom came.', 'B:walk A:cheer', 'heart', 'pop'),
        L('Día cinco: vino mi mamá... otra vez.', 'Day five: my mom... again.', 'B:walk A:shrug', '', 'boing'),
        L('Día diez: mi mamá trajo a la vecina a la fuerza.', 'Day ten: mom dragged the neighbor in.', 'B:point C:walk A:cheer', '', 'pop'),
        L('Día treinta: le vendí a un desconocido. Lloré.', 'Day thirty: a total stranger bought something. I cried.', 'A:cry', 'money', 'cash'),
        L('Día noventa: ya pago la luz yo solito.', 'Day ninety: I\'m paying my own electric bill.', 'A:strong', 'chart_up', 'cash')],
      L('Día 365: mi mamá ahora trabaja pa\' mí.', 'Day 365: my mom works for me now.', 'B:cheer A:laugh', 'trophy', 'scratch'),
      L('Y es la empleada del mes. Todos los meses.', 'Employee of the month. Every single month.', 'all:cheer', 'confetti', 'applause'),
      ['Todo negocio grande empezó con alguien que creyó en ti.', 'Every big business started with someone who believed in you.'],
      ['No te rindas antes de que llegue el segundo cliente.', 'Don\'t quit before the second customer shows up.']),
    S('opinan', 'casa', 'esc', ['Le cuento mi idea a la familia', 'I tell my family my business idea'],
      ['Nunca le cuentes tu idea a la familia. Mira por qué.', 'Never tell your family your business idea. Here\'s why.'],
      L('Tengo una idea de negocio. Se la cuento a todos.', 'I\'ve got a business idea. I tell everybody.', 'A:talk', 'bulb', 'ding'),
      [L('Mi tío: "Eso no sirve."', 'My uncle: "That\'ll never work."', 'B:talk A:sad', '', 'boing'),
        L('Mi vecina: "Búscate un trabajo de verdad."', 'My neighbor: "Get a real job."', 'C:talk A:shrug', '', 'boing'),
        L('Mi primo: "Eso ya lo venden en Temu."', 'My cousin: "They already sell that on Temu."', 'B:laugh A:facepalm', '', 'boing'),
        L('Mi amigo: "¿Y si te sale mal?"', 'My friend: "What if it flops?"', 'B:shrug A:think', '', 'pop'),
        L('Mi suegra: una risita que me dolió en el alma.', 'My mother-in-law: a little laugh that hurt my soul.', 'C:laugh A:angry', '', 'laugh'),
        L('Hasta el perro me miró con lástima.', 'Even the dog looked at me with pity.', 'A:shock', '', 'drum')],
      L('Un año después... todos me piden descuento.', 'One year later... they all want a discount.', 'all:cheer A:strong', 'money', 'scratch'), null,
      ['Los que dudan de ti no pagan tus sueños.', 'The people who doubt you don\'t pay for your dreams.'],
      ['Pero aplauden cuando los cumples.', 'But they\'ll clap when you make it.']),
    S('empezar', 'caminos', 'caminos', ['Dos caminos: esperar o empezar', 'Two paths: wait or start'],
      ['El momento perfecto pa\' emprender no existe.', 'The perfect time to start doesn\'t exist.'],
      L('Tienes una idea. Dos caminos.', 'You\'ve got an idea. Two paths.', 'A:think', 'sign:Esperar|Empezar|Wait|Start', 'whoosh'),
      [L('Camino uno: esperar el momento perfecto.', 'Path one: wait for the perfect moment.', 'A:wait', 'left', 'pop', true),
        L('Diez años después... todavía esperando.', 'Ten years later... still waiting.', 'A:tired', 'left', 'sad', true),
        L('Camino dos: empezar con miedo y todo.', 'Path two: start scared.', 'A:walk', 'right', 'whoosh', true),
        L('Te caes, aprendes y te paras otra vez.', 'Fall, learn, get back up.', 'A:fall', 'right', 'boing', true),
        L('"Mañana empiezo." Desde el 2015.', '"I\'ll start tomorrow." Since 2015.', 'A:sleep', 'left', 'pop'),
        L('Un cliente, diez, cien. Ya es real.', 'One customer, ten, a hundred. It\'s real.', 'A:cheer', 'right', 'cash')],
      L('Lo curioso: los dos caminos dan miedo. Solo uno da resultados.', 'Funny thing: both paths are scary. Only one pays off.', 'A:strong', 'rocket', 'scratch'), null,
      ['No tienes que ser grande pa\' empezar.', 'You don\'t have to be great to start.'],
      ['Pero tienes que empezar pa\' ser grande.', 'But you gotta start to be great.']),
  ],
  familia: [
    S('sueter', 'casa', 'esc', ['Mami y el famoso "ponte un abrigo"', 'Mom and the famous "put on a sweater"'],
      ['Todas las mamás latinas dicen esto.', 'Every Latino mom says this.'],
      L('Estamos a noventa grados en Miami. Mi mamá:', 'It\'s 90 degrees in Miami. My mom:', 'B:talk A:idle', '', 'pop'),
      [L('"Ponte un abrigo."', '"Put on a sweater."', 'B:point A:shrug', '', 'pop'),
        L('"Te vas a resfriar."', '"You\'re gonna catch a cold."', 'B:talk A:tired', '', 'boing'),
        L('"No salgas con el pelo mojado."', '"Don\'t go out with wet hair."', 'B:talk A:facepalm', '', 'boing'),
        L('"Llévate una chaqueta por si acaso."', '"Take a jacket, just in case."', 'B:give A:shock', '', 'boing'),
        L('"Y una frisa pa\'l carro."', '"And a blanket for the car."', 'B:give A:tired', '', 'boing'),
        L('Salgo como un oso polar en pleno verano.', 'I walk out like a polar bear in July.', 'A:sad', '', 'drum')],
      L('Años después... yo le digo lo mismito a mi hijo.', 'Years later... I\'m saying the exact same thing to my kid.', 'A:point C:shrug', '', 'scratch'), null,
      ['Lo que de niño parecía exagerao...', 'What looked like overreacting as a kid...'],
      ['era amor del bueno.', 'was love in its purest form.']),
    S('abuela', 'casa', 'esc', ['"Mañana llamo a la abuela"', '"I\'ll call grandma tomorrow"'],
      ['Si todavía tienes abuelos, mira esto hasta el final.', 'If you still have grandparents, watch this till the end.'],
      L('Siempre digo: "Mañana llamo a la abuela."', 'I always say: "I\'ll call grandma tomorrow."', 'A:talk', 'phone', 'pop'),
      [L('Lunes: mucho trabajo.', 'Monday: too much work.', 'A:type', 'laptop', 'type'),
        L('Martes: estoy muerto del cansancio.', 'Tuesday: I\'m dead tired.', 'A:tired', '', 'sad'),
        L('Miércoles: "El weekend, sin falta."', 'Wednesday: "This weekend, for sure."', 'A:shrug', 'calendar', 'pop'),
        L('Sábado: se me pasó.', 'Saturday: totally forgot.', 'A:facepalm', '', 'boing'),
        L('Un mes después: "Ay, ya la llamo."', 'A month later: "Yeah, I\'ll call her."', 'A:phone', 'calendar', 'pop'),
        L('Y ella, cada tarde, mirando el teléfono.', 'Meanwhile, she checks her phone every evening.', 'B:wait', 'phone', 'sad')],
      L('Hoy la llamé. Contestó llorando: "Yo sabía que ibas a llamar."', 'Today I called. She answered crying: "I knew you\'d call."', 'A:phone B:cry', 'heart', 'scratch'),
      L('Hablamos dos horas. Fue el mejor día de su semana.', 'We talked two hours. Best day of her week.', 'B:love A:laugh', 'heart', 'heart'),
      ['Siempre creemos que va a haber tiempo.', 'We always think there\'ll be time.'],
      ['Llama hoy. Mañana no está garantizado.', 'Call today. Tomorrow isn\'t promised.']),
    S('jugar', 'caminos', 'caminos', ['Dos caminos: "ahora no" o "vamos a jugar"', 'Two paths: "not now" or "let\'s play"'],
      ['Tu hijo te pide jugar. Lo que hagas lo cambia todo.', 'Your kid asks you to play. What you do changes everything.'],
      L('Tu hijo te pide jugar. Dos caminos.', 'Your kid wants to play. Two paths.', 'C:jump A:idle', 'sign:Ahora no|Vamos a jugar|Not now|Let\'s play', 'whoosh'),
      [L('Camino uno: "Ahora no, que estoy ocupado."', 'Path one: "Not now, I\'m busy."', 'A:phone C:sad', 'left', 'notif', true),
        L('Años después, él te dice lo mismito.', 'Years later, he says the same thing to you.', 'C:phone A:sad', 'left', 'sad', true),
        L('Camino dos: sueltas todo y a jugar.', 'Path two: drop everything and play.', 'A:dance C:dance', 'right', 'ding', true),
        L('Y te vuelves su recuerdo favorito.', 'And you become his favorite memory.', 'A:hug C:hug', 'right', 'heart', true),
        L('Un email más. Una tarde menos.', 'One more email. One less afternoon.', 'A:type', 'left', 'type'),
        L('Una risa que le dura toda la vida.', 'A laugh that lasts a lifetime.', 'all:laugh', 'right', 'laugh')],
      L('Spoiler: el email podía esperar. La infancia no.', 'Spoiler: the email could wait. Childhood can\'t.', 'A:shock', 'clock:', 'scratch'), null,
      ['Los niños no se acuerdan de lo que les compraste.', 'Kids don\'t remember what you bought them.'],
      ['Se acuerdan del tiempo que les diste.', 'They remember the time you gave them.']),
  ],
  dinero: [
    S('ahorro', 'ciudad', 'esc', ['"Este mes sí ahorro"', '"This month I\'m saving for real"'],
      ['Me prometí ahorrar este mes. Mira lo que pasó.', 'I swore I\'d save money this month. Look what happened.'],
      L('Día uno: "Este mes sí ahorro, brother."', 'Day one: "This month I\'m saving. For real."', 'A:strong', 'money', 'cash'),
      [L('Día dos: un cafecito nada más. Seis dólares.', 'Day two: just one coffee. Seven bucks.', 'A:idle', 'coffee', 'pop'),
        L('Día cinco: estaba en oferta. Tenía que comprarlo.', 'Day five: it was on sale. I had to.', 'A:cheer', 'gift', 'cash'),
        L('Día diez: "Me lo merezco, yo trabajo mucho."', 'Day ten: "I deserve it, I work hard."', 'A:dance', 'gift', 'cash'),
        L('Día quince: DoorDash, porque estaba cansado.', 'Day fifteen: DoorDash, \'cause I was tired.', 'A:tired', 'pizza', 'notif'),
        L('Día veinte: arroz blanco con fe.', 'Day twenty: white rice and prayers.', 'A:sad', '', 'sad'),
        L('Día treinta: ¿Y mi dinero? ¿Me robaron?', 'Day thirty: where\'s my money? Did I get robbed?', 'A:shock', 'chart_down', 'drum')],
      L('Chequeé el banco: los cafecitos sumaban más que el rent.', 'Checked my bank app: the coffees cost more than my rent.', 'A:facepalm', 'coffee', 'scratch'), null,
      ['No es cuánto ganas.', 'It\'s not how much you make.'],
      ['Es cuánto respetas lo que ganas.', 'It\'s how much you respect what you make.']),
    S('vecino', 'ciudad', 'esc', ['La guerra con el vecino', 'Keeping up with the neighbor'],
      ['Mi vecino y yo empezamos una guerra silenciosa.', 'My neighbor and I started a silent war.'],
      L('El vecino se compró un carro nuevo.', 'My neighbor bought a brand new car.', 'B:cheer A:shock', '', 'pop'),
      [L('Yo me compré uno mejor. Financiado a 84 meses.', 'I bought a better one. 84-month loan.', 'A:cheer', 'money', 'cash'),
        L('Él se compró una tele gigante.', 'He got a giant TV.', 'B:cheer', '', 'pop'),
        L('Yo una más grande. Con la tarjeta.', 'I got a bigger one. On the credit card.', 'A:strong', 'money', 'cash'),
        L('Él se fue en un crucero.', 'He went on a cruise.', 'B:dance', '', 'pop'),
        L('Yo también. En 36 cuotas "sin intereses".', 'Me too. 36 payments, "zero interest."', 'A:dance', 'money', 'cash'),
        L('Ya no duermo pensando en los bills.', 'Now I can\'t sleep thinking about the bills.', 'A:tired', 'chart_down', 'sad')],
      L('Un día me confesó: él también lo hacía pa\' competir conmigo.', 'Then he confessed: he was doing it to compete with ME.', 'all:facepalm', '', 'scratch'),
      L('Dos socios, dos deudas y cero paz.', 'Two buddies, two debts, zero peace.', 'A:laugh B:laugh', '', 'laugh'),
      ['Compramos cosas que no necesitamos...', 'We buy stuff we don\'t need...'],
      ['pa\' impresionar a gente que ni nos importa.', 'to impress people we don\'t even like.']),
    S('sueldo', 'caminos', 'caminos', ['Dos caminos: gastarlo todo o invertir un poco', 'Two paths: blow it all or invest a little'],
      ['Lo que haces el día de cobro decide tu futuro.', 'What you do on payday decides your future.'],
      L('Llegó el cheque. Dos caminos.', 'Payday. Two paths.', 'A:cheer', 'sign:Gastarlo todo|Invertir un poco|Spend it all|Invest a little', 'cash'),
      [L('Camino uno: te lo gastas todo en un fin de semana.', 'Path one: you blow it all in one weekend.', 'A:dance', 'left', 'cash', true),
        L('El lunes, contando las monedas pa\' la gasolina.', 'Monday, counting coins for gas.', 'A:sad', 'left', 'sad', true),
        L('Camino dos: guardas un poquito cada mes.', 'Path two: you save a little every month.', 'A:idle', 'right', 'pop', true),
        L('Diez años después, tu dinero trabaja por ti.', 'Ten years later, your money works for you.', 'A:strong', 'right', 'cash', true),
        L('Mucho brillo, poco futuro.', 'All flash, no future.', 'A:dance', 'left', 'pop'),
        L('Poco a poco, la matica crece.', 'Little by little, the plant grows.', 'A:cheer', 'right', 'ding')],
      L('Lo mejor: el del camino dos también gozó. Pero con cabeza.', 'Best part: path two had fun too. Just smarter.', 'A:laugh', 'plant', 'scratch'), null,
      ['La libertad financiera no es suerte.', 'Financial freedom isn\'t luck.'],
      ['Son decisiones chiquitas repetidas cada mes.', 'It\'s small choices, repeated every month.']),
  ],
  habitos: [
    S('gym', 'parque', 'esc', ['El gimnasio en enero', 'The gym in January'],
      ['Mi relación con el gym, resumida.', 'My relationship with the gym, summed up.'],
      L('Enero: "Este año sí me pongo en forma."', 'January: "This is my year."', 'A:strong', 'calendar', 'ding'),
      [L('Semana uno: gym todos los días. Fotos en Instagram.', 'Week one: gym every day. Posting on Instagram.', 'A:strong', '', 'pop'),
        L('Semana dos: día de descanso... de tres días.', 'Week two: rest day... for three days.', 'A:sleep', '', 'boing'),
        L('Semana tres: "Hoy está lloviendo."', 'Week three: "It\'s raining today."', 'A:shrug', '', 'boing'),
        L('Semana cuatro: "Mañana sin falta."', 'Week four: "Tomorrow, for sure."', 'A:sleep', '', 'boing'),
        L('Febrero: pagando el gym pa\' na\'.', 'February: paying for a gym I never go to.', 'A:sad', 'money', 'cash'),
        L('Marzo: el gym me manda una tarjeta: "Te extrañamos."', 'March: the gym sends a card: "We miss you."', 'A:facepalm', 'heart', 'drum')],
      L('Probé al revés: cinco minutos al día. Ya llevo un año.', 'So I flipped it: five minutes a day. It\'s been a year.', 'A:strong', 'trophy', 'scratch'), null,
      ['No necesitas una motivación gigante.', 'You don\'t need giant motivation.'],
      ['Necesitas un pasito que no abandones.', 'You need one small step you never quit.']),
    S('dormir', 'casa', 'esc', ['"Hoy me acuesto temprano"', '"Tonight I\'m going to bed early"'],
      ['Hoy me acuesto temprano. (Spoiler: no.)', 'Tonight I\'m sleeping early. (Spoiler: nope.)'],
      L('Diez de la noche: "Hoy sí me acuesto temprano."', '10 PM: "Early night tonight."', 'A:sleep', 'clock:22:00', 'pop'),
      [L('Diez y cuarto: un video cortico nada más.', '10:15: just one quick video.', 'A:phone', 'clock:22:15', 'notif'),
        L('Once: otro. El último, lo juro.', '11:00: another one. Last one, I swear.', 'A:phone', 'clock:23:00', 'notif'),
        L('Doce y media: aprendiendo a hacer pan japonés.', '12:30: learning to bake Japanese bread.', 'A:think', 'clock:0:30', 'pop'),
        L('Dos de la mañana: la vida secreta de los pulpos.', '2 AM: the secret life of octopuses.', 'A:shock', 'clock:2:00', 'boing'),
        L('Tres: teorías conspirativas de las palomas.', '3 AM: pigeon conspiracy theories.', 'A:shock', 'clock:3:00', 'drum'),
        L('Seis: suena la alarma. Me quiero morir.', '6 AM: alarm rings. I want to disappear.', 'A:tired', 'clock:6:00', 'alarm')],
      L('El último video que vi: "Cómo dormir mejor."', 'The last video I watched: "How to sleep better."', 'A:facepalm', 'phone', 'scratch'), null,
      ['Lo que haces cada noche...', 'What you do every night...'],
      ['decide quién eres cada mañana.', 'decides who you are every morning.']),
    S('hoy', 'caminos', 'caminos', ['Dos caminos: "mañana empiezo" o "hoy empiezo"', 'Two paths: "tomorrow" or "today"'],
      ['La frase que más sueños ha matado: "mañana empiezo".', 'The phrase that killed the most dreams: "I\'ll start tomorrow."'],
      L('Quieres cambiar tu vida. Dos caminos.', 'You wanna change your life. Two paths.', 'A:think', 'sign:Mañana empiezo|Hoy empiezo|Tomorrow|Today', 'whoosh'),
      [L('Camino uno: "Mañana empiezo."', 'Path one: "I\'ll start tomorrow."', 'A:sleep', 'left', 'pop', true),
        L('Un año después: "Mañana empiezo."', 'A year later: "I\'ll start tomorrow."', 'A:tired', 'left', 'sad', true),
        L('Camino dos: un pasito chiquito, hoy.', 'Path two: one tiny step, today.', 'A:walk', 'right', 'pop', true),
        L('Un año después, ni tú te reconoces.', 'A year later, you don\'t even recognize yourself.', 'A:strong', 'right', 'applause', true),
        L('El mismo sofá, la misma excusa.', 'Same couch, same excuse.', 'A:sit', 'left', 'boing'),
        L('Cada día, uno por ciento mejor.', 'Every day, one percent better.', 'A:run', 'right', 'ding')],
      L('La diferencia entre los dos... fue un solo día.', 'The difference between them... was one single day.', 'A:shock', 'calendar', 'scratch'), null,
      ['Dentro de un año vas a desear haber empezado hoy.', 'A year from now, you\'ll wish you\'d started today.'],
      ['Empieza chiquito, pero empieza hoy.', 'Start small, but start today.']),
  ],
  redes: [
    S('foto', 'cafe', 'esc', ['La foto perfecta pa\' Instagram', 'The perfect photo for Instagram'],
      ['Lo que hay detrás de UNA foto pa\' Instagram.', 'What goes into ONE Instagram photo.'],
      L('Vamos a tirarnos una foto pa\' las redes.', 'Let\'s take a pic for the \'gram.', 'A:selfie B:idle', 'pov:selfie', 'pop'),
      [L('Foto uno: ojos cerrados.', 'Photo one: eyes closed.', 'A:phone B:sleep', '', 'pop'),
        L('Foto quince: salí con papada.', 'Photo fifteen: double chin.', 'A:phone B:shrug', '', 'pop'),
        L('Foto cuarenta: la luz está horrible.', 'Photo forty: lighting is terrible.', 'A:facepalm', '', 'boing'),
        L('Foto ochenta: filtro, recorte y más filtro.', 'Photo eighty: filter, crop, more filter.', 'A:scroll', 'pov:search', 'boing'),
        L('Foto ciento veinte: la comida ya está fría.', 'Photo one-twenty: the food\'s cold now.', 'B:sad', 'pizza', 'sad'),
        L('Foto doscientos: ¡PERFECTA!', 'Photo two hundred: PERFECT!', 'A:cheer', 'phone', 'ding')],
      L('Tres likes. Uno era de mi mamá.', 'Three likes. One was my mom.', 'A:facepalm', 'heart', 'scratch'),
      L('Y el otro, de mi cuenta falsa.', 'Another one was my fake account.', 'B:laugh A:shrug', '', 'laugh'),
      ['La vida no necesita filtro pa\' ser bonita.', 'Life doesn\'t need a filter to be beautiful.'],
      ['Necesita que la vivas.', 'It needs you to live it.']),
    S('grupo', 'casa', 'esc', ['El grupo de WhatsApp de la familia', 'The family group chat'],
      ['Todos tenemos un grupo familiar así.', 'Everybody has a family group chat like this.'],
      L('Grupo de la familia: un mensaje nuevo.', 'Family group chat: one new message.', 'A:phone', 'phone', 'notif'),
      [L('La tía: "Buenos días" con flores y brillo.', 'Auntie: "Good morning" with glitter flowers.', 'A:phone', 'phone', 'notif'),
        L('El tío: una noticia falsa, de las buenas.', 'Uncle: a fake news story. A classic.', 'A:facepalm', 'phone', 'notif'),
        L('La abuela: un audio de ocho minutos.', 'Grandma: an eight-minute voice note.', 'A:shock', 'phone', 'notif'),
        L('El primo: un sticker que nadie entiende.', 'Cousin: a sticker nobody understands.', 'A:think', 'phone', 'notif'),
        L('Mami: "¿Por qué nadie contesta?"', 'Mom: "Why is nobody answering?"', 'A:tired', 'phone', 'notif'),
        L('Trescientos cuarenta y siete mensajes sin leer.', 'Three hundred forty-seven unread messages.', 'A:shock', 'phone', 'drum')],
      L('Un día se cayó el internet... y todos aparecimos en casa de la abuela.', 'One day the Wi-Fi went down... and we all showed up at grandma\'s.', 'all:hug', 'heart', 'scratch'), null,
      ['Los mensajes conectan.', 'Messages connect us.'],
      ['Pero los abrazos unen.', 'But hugs keep us together.']),
    S('comparar', 'caminos', 'caminos', ['Dos caminos: compararte o vivir', 'Two paths: compare or live'],
      ['Esto te pasa cada vez que abres Instagram.', 'This happens every time you open Instagram.'],
      L('Abres Instagram. Dos caminos.', 'You open Instagram. Two paths.', 'A:scroll', 'sign:Compararme|Vivir mi vida|Compare|Live my life', 'notif'),
      [L('Camino uno: comparas tu vida con la de todo el mundo.', 'Path one: you compare your life to everyone\'s.', 'A:scroll', 'left', 'notif', true),
        L('Y nada te alcanza.', 'And nothing\'s ever enough.', 'A:cry', 'left', 'sad', true),
        L('Camino dos: cierras la app y sales a vivir.', 'Path two: you close the app and go live.', 'A:walk', 'right', 'whoosh', true),
        L('Y te das cuenta de que tu vida ya era buena.', 'And you realize your life was already good.', 'A:love', 'right', 'heart', true),
        L('Viajes ajenos, cuerpos ajenos, vidas ajenas.', 'Other people\'s trips, bodies, lives.', 'A:sad', 'left', 'notif'),
        L('Tu cafecito, tu gente, tu atardecer.', 'Your coffee, your people, your sunset.', 'all:laugh', 'right', 'ding')],
      L('Spoiler: los de las fotos perfectas también se comparan.', 'Spoiler: the people with perfect photos compare too.', 'B:sad', '', 'scratch'), null,
      ['No compares tu detrás de cámaras...', 'Don\'t compare your behind-the-scenes...'],
      ['con el mejor momento de otro.', 'with someone else\'s highlight reel.']),
  ],
  fe: [
    S('orar', 'casa', 'esc', ['"Mañana rezo con calma"', '"I\'ll pray properly tomorrow"'],
      ['Esto le pasa a casi todo el que tiene fe.', 'This happens to almost everyone with faith.'],
      L('Siempre digo: "Mañana rezo con calma."', 'I always say: "I\'ll pray properly tomorrow."', 'A:talk', '', 'pop'),
      [L('Lunes: mucho trabajo.', 'Monday: too much work.', 'A:type', 'laptop', 'type'),
        L('Martes: estoy muerto.', 'Tuesday: I\'m exhausted.', 'A:tired', '', 'sad'),
        L('Miércoles: "Déjame chequear el celular primero."', 'Wednesday: "Let me check my phone first."', 'A:phone', 'phone', 'notif'),
        L('Jueves: "Dios me entiende, Él sabe."', 'Thursday: "God gets it. He knows."', 'A:shrug', '', 'boing'),
        L('Viernes: un capítulo más de la novela.', 'Friday: one more episode.', 'A:sit', 'clock:1:00', 'pop'),
        L('Sábado: me quedé dormido rezando.', 'Saturday: fell asleep mid-prayer.', 'A:sleep', '', 'drum')],
      L('Un día todo me salió mal. Recé... y sentí que Él me estaba esperando.', 'One day everything fell apart. I prayed... and felt He\'d been waiting for me.', 'A:pray', 'light', 'scratch'),
      L('Cinco minutos. Y me cambió el día completo.', 'Five minutes. And my whole day changed.', 'A:love', 'heart', 'heart'),
      ['Dios no se cansa de esperarte.', 'God never gets tired of waiting for you.'],
      ['Una oración sencilla te cambia el día.', 'One simple prayer can change your whole day.']),
    S('lista', 'iglesia', 'esc', ['Mi lista de pedidos a Dios', 'My prayer wish list'],
      ['Así era mi lista de oración. Mira cómo cambió.', 'This was my prayer list. Watch how it changed.'],
      L('Mi lista de oración de cada noche:', 'My prayer list, every night:', 'A:pray', '', 'pop'),
      [L('"Señor, un trabajo mejor."', '"Lord, a better job."', 'A:pray', 'bulb', 'pop'),
        L('"Y un carro nuevo, si no es mucha molestia."', '"And a new car, if it\'s not too much trouble."', 'A:pray', 'money', 'boing'),
        L('"Que gane mi equipo el domingo."', '"Let my team win Sunday."', 'A:cheer', 'trophy', 'boing'),
        L('"Que baje el precio de los huevos."', '"Please bring down the price of eggs."', 'A:pray', '', 'boing'),
        L('"Que mi jefe amanezca de buen humor."', '"Let my boss wake up in a good mood."', 'A:pray', '', 'boing'),
        L('"Y que nunca se acabe el café."', '"And may the coffee never run out."', 'A:pray', 'coffee', 'drum')],
      L('Un día probé solo dar gracias... y la lista me salió más larga.', 'One day I tried only saying thanks... and that list was longer.', 'A:shock', 'heart', 'scratch'),
      L('Salud, familia, un techo, un día más.', 'Health, family, a roof, one more day.', 'all:love', 'light', 'heart'),
      ['La gratitud convierte lo que tienes en suficiente.', 'Gratitude turns what you have into enough.'],
      ['Antes de pedir, da gracias.', 'Before you ask, say thank you.']),
    S('confiar', 'caminos', 'caminos', ['Dos caminos: preocuparte o confiar', 'Two paths: worry or trust'],
      ['Cuando llega un problema, hay dos caminos.', 'When trouble hits, there are two paths.'],
      L('Llega un problemón. Dos caminos.', 'Big trouble. Two paths.', 'A:shock', 'sign:Preocuparme|Confiar en Dios|Worry|Trust God', 'whoosh'),
      [L('Camino uno: te preocupas toda la noche.', 'Path one: you worry all night.', 'A:tired', 'left', 'sad', true),
        L('Y el problema sigue igualito.', 'And the problem doesn\'t move.', 'A:cry', 'left', 'sad', true),
        L('Camino dos: rezas y descansas.', 'Path two: you pray and rest.', 'A:pray', 'right', 'ding', true),
        L('Y amaneces con fuerza pa\' enfrentarlo.', 'And you wake up strong enough to face it.', 'A:strong', 'right', 'applause', true),
        L('Mil vueltas en la cama.', 'A thousand turns in bed.', 'A:sleep', 'left', 'boing'),
        L('Paz en medio de la tormenta.', 'Peace in the middle of the storm.', 'A:love', 'right', 'heart')],
      L('Lo curioso: el problema era el mismo. Lo que cambió fue el corazón.', 'Funny thing: same problem. What changed was the heart.', 'A:pray', 'light', 'scratch'), null,
      ['La fe no siempre quita la tormenta...', 'Faith doesn\'t always stop the storm...'],
      ['pero te da paz pa\' atravesarla.', 'but it gives you peace to walk through it.']),
  ],
};

// Ganchos por tema (se combinan con el gancho propio de la situación)
const THEME_HOOKS = {
  superacion: [R('Mira esto hasta el final. Te va a cambiar el día.', 'Watch till the end. It\'ll change your day.'), R('Mándaselo a ese amigo que lo necesita.', 'Send this to the friend who needs it.'), R('Nadie habla de esto, pero nos pasa a todos.', 'Nobody talks about this, but it happens to all of us.')],
  trabajador: [R('Etiqueta a ese que siempre está pela\'o.', 'Tag the friend who\'s always broke.'), R('Este eres tú a fin de mes.', 'This is you at the end of the month.'), R('Si trabajas solo pa\' pagar los bills, esto es pa\' ti.', 'If you work just to pay bills, this one\'s for you.')],
  amistad: [R('Etiqueta a ese amigo que es EXACTAMENTE así.', 'Tag the friend who is EXACTLY like this.'), R('La amistad de verdad se prueba en momentos así.', 'Real friendship gets tested in moments like this.'), R('Si tienes un socio así, no lo sueltes.', 'If you\'ve got a friend like this, never let go.')],
  matrimonio: [R('Si estás casado, esto te va a sonar familiar.', 'If you\'re married, this is gonna sound familiar.'), R('Esto nadie te lo cuenta antes de casarte.', 'Nobody tells you this before you get married.'), R('El matrimonio de verdad. Sin filtro.', 'Real marriage. No filter.')],
  trabajo: [R('Esto pasa en TODOS los trabajos del mundo.', 'This happens at EVERY job on the planet.'), R('Tu jefe no quiere que veas esto.', 'Your boss doesn\'t want you to see this.'), R('Si trabajas, esto es pa\' ti.', 'If you\'ve got a job, this one\'s for you.')],
  emprendimiento: [R('Esta parte de emprender nadie te la cuenta.', 'Nobody tells you this part of starting a business.'), R('Si estás emprendiendo, necesitas ver esto.', 'If you\'re building a business, you need to see this.'), R('Así empiezan los negocios de verdad.', 'This is how real businesses start.')],
  familia: [R('Esto lo vivimos todos en la casa.', 'We all lived this at home.'), R('La familia latina es así. Y por eso la queremos.', 'Latino families are like this. That\'s why we love them.'), R('Mira esto y después llama a tu familia.', 'Watch this, then call your family.')],
  dinero: [R('Por esto nunca te alcanza el dinero.', 'This is why you\'re always broke.'), R('El error de dinero que todos cometemos.', 'The money mistake we all make.'), R('Tu cuenta de banco necesita ver esto.', 'Your bank account needs to see this.')],
  habitos: [R('Si siempre empiezas y lo dejas, mira esto.', 'If you always start and quit, watch this.'), R('El hábito que me cambió la vida en un año.', 'The habit that changed my life in one year.'), R('Tu yo del futuro te va a dar las gracias.', 'Your future self will thank you for this.')],
  redes: [R('Las redes no te enseñan esto.', 'Social media won\'t show you this.'), R('Esto pasa detrás de cada pantalla.', 'This happens behind every screen.'), R('Deja de deslizar un segundo y mira esto.', 'Stop scrolling for a second and watch this.')],
  fe: [R('Si crees en Dios, mira esto hasta el final.', 'If you believe in God, watch this till the end.'), R('Este es el mensaje que necesitabas hoy.', 'This is the message you needed today.'), R('A todos los que tenemos fe nos pasa esto.', 'Everyone with faith goes through this.')],
};
const GENERIC_HOOKS = [
  R('No vas a creer cómo termina esto.', 'You won\'t believe how this ends.'),
  R('Mira hasta el final. El giro lo cambia todo.', 'Watch till the end. The twist changes everything.'),
  R('A todos nos ha pasado. Admítelo.', 'It\'s happened to all of us. Admit it.'),
  R('Nadie habla de esto, pero...', 'Nobody talks about this, but...'),
  R('Esto me pasó ayer. Y aprendí algo.', 'This happened to me yesterday. And I learned something.'),
];

// Llamados a la acción. {page} = nombre de la página, {link} = texto del enlace
// La primera página de opciones son siempre del estilo "sígueme para más".
const CTA_FOLLOW_STYLE = [
  { type: 'follow', text: R('Si aprendiste algo, sígueme pa\' más.', 'If you learned something, follow for more.') },
  { type: 'follow', text: R('¿Te ha pasado? Sígueme pa\' más historias así.', 'Has this happened to you? Follow for more stories like this.') },
  { type: 'follow', text: R('Si te viste en este video, sígueme. Mañana viene otra.', 'If you saw yourself in this, follow me. Another one drops tomorrow.') },
  { type: 'follow', text: R('Sígueme, que la próxima está más buena todavía.', 'Follow me, the next one\'s even better.') },
  { type: 'follow', text: R('¿Tú también? Sígueme y no te pierdas la próxima.', 'You too? Follow so you don\'t miss the next one.') },
  { type: 'follow', text: R('Si esto te hizo pensar, sígueme pa\' más historias.', 'If this made you think, follow for more stories.') },
];
const CTAS = {
  like: [
    R('Si te reíste, dale like. No seas tacaño.', 'If you laughed, hit like. Don\'t be cheap.'),
    R('¿Te ha pasado? Dale like y etiqueta al culpable.', 'Been there? Hit like and tag the guilty one.'),
    R('Dale like si esto es la pura verdad.', 'Like this if it\'s the honest truth.'),
  ],
  follow: CTA_FOLLOW_STYLE.map(c => c.text),
  stars: [
    R('Si este video te ayudó, apóyanos con unas estrellas pa\' seguir creando.', 'If this video helped you, support us with a few stars so we can keep creating.'),
    R('Unas estrellitas y seguimos con la próxima historia.', 'Send a few stars and we\'ll keep the stories coming.'),
  ],
  link: [
    R('Toca el link: {link}. Ahí te explico todo.', 'Tap the link: {link}. I explain everything there.'),
    R('Hay más pa\' ti en el link: {link}.', 'There\'s more for you at the link: {link}.'),
  ],
  combo: [
    R('Mándaselo a ese amigo que lo necesita y sígueme pa\' más.', 'Send this to a friend who needs it, and follow for more.'),
    R('Dale like, compártelo y sígueme pa\' más.', 'Like, share it, and follow for more.'),
    R('Guárdalo, compártelo con quien lo necesite y sígueme.', 'Save it, share it with someone who needs it, and follow.'),
  ],
};

// Segunda parte cuando se combinan dos llamados
const CTA_SHORT = {
  like: R('dale like', 'hit like'),
  follow: R('sígueme pa\' más', 'follow for more'),
  stars: R('apóyanos con unas estrellas', 'support us with a few stars'),
  link: R('toca el link: {link}', 'tap the link: {link}'),
  combo: R('compártelo con quien lo necesite', 'share it with someone who needs it'),
};

export function combineCtas(list, lang) {
  if (list.length < 2) return list[0].text[lang];
  const first = list[0].text[lang].replace(/[.!¡]+$/, '').trim();
  const t2 = list[1].type === list[0].type ? (list[0].type === 'like' ? 'follow' : 'like') : list[1].type;
  const second = CTA_SHORT[t2][lang];
  if (/\s(y|and)\s/i.test(first) || first.split(/\s+/).length > 8) return `${first}. ${second[0].toUpperCase()}${second.slice(1)}.`;
  return `${first} ${lang === 'es' ? 'y' : 'and'} ${second}.`;
}

export function ctaTypesFor(list) { const t = list.map(c => c.type); if (t.length > 1 && t[1] === t[0]) t[1] = t[0] === 'like' ? 'follow' : 'like'; return t; }

export const CTA_TYPES = ['like', 'follow', 'stars', 'link', 'combo'];

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Preguntas finales en pantalla (para que la gente comente)
const QUESTIONS = {
  superacion: [R('¿A quién le mandarías esto?', 'Who would you send this to?'), R('¿Tú también has tenido que volver a empezar?', 'Have you ever had to start over?'), R('¿Cuántas horas pasas tú en el teléfono?', 'How many hours do you spend on your phone?')],
  _: [R('¿A ti también te pasa?', 'Does this happen to you too?'), R('¿Este eres tú o tu pareja?', 'Is this you or your partner?'), R('¿A quién vas a etiquetar?', 'Who are you tagging?'), R('¿Te ha pasado? Cuéntame abajo.', 'Been there? Tell me below.'), R('¿Tú qué hubieras hecho?', 'What would you have done?')],
  trabajador: [R('¿A ti también te pasa?', 'Does this happen to you too?'), R('¿Cuántas horas trabajas tú?', 'How many hours do you work?'), R('¿A quién vas a etiquetar?', 'Who are you tagging?')],
  dinero: [R('¿A ti también se te va el sueldo así?', 'Does your paycheck vanish like this too?'), R('¿A ti también te pasa?', 'Does this happen to you too?'), R('¿Quién más está pela\'o?', 'Who else is broke?')],
  matrimonio: [R('¿Este eres tú o tu pareja?', 'Is this you or your partner?'), R('¿A ti también te pasa?', 'Does this happen to you too?'), R('Etiqueta a tu pareja.', 'Tag your partner.')],
};
export function questionOptions(themeId, situation, seed = 1) {
  const pool = [...(QUESTIONS[themeId] || []), ...QUESTIONS._];
  const out = []; if (situation && situation.question) out.push(situation.question);
  const rnd = mulberry(seed * 31 + 5);
  for (let guard = 0; out.length < 3 && guard < 50; guard++) { const q = pool[Math.floor(rnd() * pool.length)]; if (!out.some(x => x.es === q.es)) out.push(q); }
  return out;
}

export function hookOptions(themeId, situation, seed = 1) {
  if (situation && situation.hooks && situation.hooks.length >= 3 && seed === 1) return situation.hooks.slice(0, 3);
  const rnd = mulberry(seed * 7919 + 13);
  const pool = [...THEME_HOOKS[themeId], ...GENERIC_HOOKS];
  const out = [];
  if (seed % 2 === 1 || !situation) { if (situation) out.push(situation.hook); }
  while (out.length < 3) {
    const h = pick(pool, rnd);
    if (!out.includes(h)) out.push(h);
  }
  if (situation && !out.includes(situation.hook) && seed % 2 === 0) out[rnd() < 0.5 ? 0 : 2] = situation.hook;
  return out;
}

export function ctaOptions(seed = 1, hasLink = false) {
  const rnd = mulberry(seed * 104729 + 7);
  if (seed % 3 === 1) { // estilo "sígueme pa' más": tres frases distintas
    const start = Math.floor((seed - 1) / 3) * 3;
    return [0, 1, 2].map(k => CTA_FOLLOW_STYLE[(start + k) % CTA_FOLLOW_STYLE.length]);
  }
  let types = CTA_TYPES.filter(t => t !== 'link' || hasLink);
  types = types.map(t => [rnd(), t]).sort((a, b) => a[0] - b[0]).map(x => x[1]).slice(0, 3);
  if (hasLink && !types.includes('link')) types[2] = 'link';
  return types.map(type => ({ type, text: pick(CTAS[type], rnd) }));
}

export function fillCta(text, lang, settings) {
  const page = (settings.page || '').trim() || (lang === 'es' ? 'la página' : 'the page');
  const link = (settings.linkLabel || settings.linkUrl || '').trim() || (lang === 'es' ? 'en la descripción' : 'in the description');
  return text.replace('{page}', page).replace('{link}', link);
}
