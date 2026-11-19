# Muñequitos Video

**Ábrela aquí:** https://solertemplates.github.io/munequitos-video/ (funciona en Safari del iPhone; toca Compartir → «Añadir a pantalla de inicio» para tenerla como app).

Aplicación web que genera videos cortos verticales (1080×1920) de muñequitos de palitos sobre reflexiones y situaciones cotidianas: amistad, matrimonio, trabajo, emprendimiento, familia, dinero, hábitos, redes sociales y fe. Sirve para Shorts, Reels y Facebook.

Todo se genera en el navegador: no hay servidor, ni claves de API, ni costos.

## Cómo usarla

1. Abre la carpeta con un servidor web local (los módulos de JavaScript no funcionan con `file://`):
   ```bash
   python3 -m http.server 8000
   # o:  npx serve .
   ```
   Luego entra a <http://localhost:8000> con **Chrome o Edge** (recomendado) o con Safari.
2. Elige el **tema**, la **cantidad de personajes** (1–4), el **entorno**, el **estilo** (color o blanco y negro) y el **idioma** (botón ES/EN arriba a la derecha).
3. Elige la **duración**: 12–25 s, 25–45 s o 45–60 s. La app ajusta el número de escenas, el ritmo de la voz y las pausas para quedar dentro del rango.
4. Elige una de las **3 situaciones cotidianas** sugeridas (o pide 3 nuevas a la IA), uno de los **3 ganchos iniciales** y **uno o dos llamados a la acción** (si eliges dos, se combinan en una frase, por ejemplo «Dale me gusta si te tocó el corazón y sigue la página»). «Otras opciones» propone más ganchos y llamados.
   - En «Configurar página y enlace» puedes poner el nombre de tu página (sale en el video) y tu enlace. Con un enlace configurado aparecen los llamados de tipo «Enlace».
5. Elige la voz, la música y si quieres efectos de sonido.
6. Pulsa **Generar vista previa**, mírala con ▶ y, si quieres, edita el guion y pulsa «Aplicar cambios».
7. Pulsa **Exportar MP4**. También puedes descargar los subtítulos en `.srt`.

## Qué incluye cada video

- **Gancho** grande en pantalla al inicio (visible desde el primer fotograma, sirve de miniatura).
- **Estructura narrativa**: repetición que va subiendo de intensidad y giro final sorprendente, o alegoría de **dos caminos con letreros**.
- **Ritmo movido**: corte de plano cada 2–3 s, zooms, barridos entre escenas, cámara que siempre se mueve, vibración que sube con la intensidad y destello en el giro.
- **Frase de reflexión** al final, con un cambio de música a piano emotivo.
- **Llamado a la acción** animado: me gusta, seguir la página, apoyar con estrellas, enlace o combinado.
- **Subtítulos grandes**, con la palabra que se está diciendo resaltada.
- **Voz automática** en español o inglés, **música** generada (alegre, enérgica, lo-fi) que baja sola cuando habla la voz, y **efectos de sonido** (whoosh, pop, boing, scratch de disco en el giro, aplausos, caja registradora, etc.).

## Tipo de video (lo primero que eliges)

- **🎙️ Con voces**: los muñequitos hablan en español (Miami/cubano) o inglés (EE. UU.), con subtítulos.
- **🎵 Solo música con mensaje**: sin voces. Un muñequito hace algo con significado (subir una montaña, caerse y levantarse, caminar bajo la lluvia, sembrar una semilla) con música emotiva; el mensaje aparece poco a poco en frases cortas y grandes, y termina con una reflexión fuerte. No necesita clave.

## Voz

Solo las voces más naturales de OpenAI (`gpt-4o-mini-tts`): **Onyx** y **Ash** (hombres), **Coral** y **Nova** (mujeres). Cada personaje recibe una voz de su género. Se les indica hablar con emoción y naturalidad, respirando en las comas, haciendo pausas en los puntos y «…», subiendo en las preguntas y con energía en las exclamaciones. Los guiones llevan puntuación completa (¿? ¡! , ; …).

La clave se guarda solo en el teléfono. Sin clave, el video sale con subtítulos pero sin voces.

## Música y efectos

- **Banco de música propio**: «📂 Subir canciones» acepta varias a la vez (MP3/M4A desde la app Archivos del iPhone). Se guardan **solo en el teléfono** (IndexedDB), nunca en el repositorio ni en internet. En cada canción puedes **escucharla (▶), renombrarla (✏️), cambiarle la categoría o borrarla (🗑)**.
- **Categorías automáticas**: al subirlas, la app escucha cada canción (ritmo/BPM, energía, brillo, pulso y si va creciendo) y lee el nombre del archivo, y le pone sola una categoría: **romántica, tensión o enojo, triste, emotiva, inspiracional, alegre o humor**. Te muestra la que escogió (✨) y puedes cambiarla si quieres.
- **Música según la historia** (opción «🤖 Automática», la de fábrica): la app lee el guion, detecta la emoción de cada parte (pelea → tensión, tristeza → triste, reconciliación → romántica/emotiva, superación → inspiracional, comedia → humor) y escoge del banco la canción que pega, **sin repetir siempre la misma** (recuerda las últimas usadas). También puedes elegir una canción a mano.
- **La música cambia durante el video** cuando cambia la emoción, con un fundido cruzado suave.
- Si el banco no tiene una categoría, usa la **música incluida**: piano y guitarra grabados de verdad, en los mismos 7 estilos.
- La música **baja sola** cuando alguien habla. Hay una guía para bajar música gratis de **Pixabay Music** en el iPhone.
- **Efectos reales grabados** (pasos, golpes, whoosh, risas, cámara de fotos, pesas, monedas, lluvia…).

## Banco de frases de René Soler Rasua

- En «✍️ Banco de frases» pegas tus frases, reflexiones e ideas: una por línea o muchas de golpe. Se guardan **solo en el teléfono** (no en el repositorio).
- Puedes ponerles tema (fe, familia, superación, trabajo, dinero…); si no, la app lo **adivina sola** por las palabras. Puedes ver, editar (tocando la frase o ✏️), cambiar el tema y borrar (🗑) cada frase.
- Cuando la IA escribe o mejora una historia (con voces o de pantomima), recibe **tus frases del tema elegido** como **visión principal**: la historia, el giro y la reflexión salen de tu forma de pensar, por encima de la tendencia del momento.
- **«Usar una de mis frases como reflexión final»**: A veces (la mitad de los videos), Siempre o Nunca. Usa la menos usada del tema, tal cual, para no repetir.
- La IA también se **inspira en las ideas** de grandes oradores de superación, finanzas, familia y liderazgo (Brian Tracy, Robert Kiyosaki, Margarita Pasos, Yokoi Kenji, John C. Maxwell, Jim Rohn y otros), **sin copiar sus frases**: toma la idea y la dice con palabras nuevas, a tu estilo. Si chocan con tu visión, manda la tuya.

## Pantomima (modo «Solo música con mensaje»)

Además de las historias de un muñequito con frases (montaña, caer y levantarse, lluvia, semilla), hay **historias de pantomima**: varios personajes cuentan todo solo con gestos y mímica (discuten con la boca moviéndose sin sonido, se cruzan de brazos, se dan la espalda, se abrazan) y terminan con una frase corta de reflexión. Incluidas: **La sombrilla** (pareja peleada en un banco del parque; llueve y él la tapa), **El último pedazo de pizza** y **La abuela y el teléfono**. El botón **«✨ Inventar 3 historias de pantomima nuevas (IA)»** crea historias nuevas de este estilo, sin repetir las anteriores, con un giro final que emociona (usa tu clave de OpenAI).

## Sonidos y caras siempre de acuerdo

Antes de mezclar el audio, la app mira qué cara tiene cada personaje en el instante de cada efecto con emoción: **risa → cara alegre/riéndose**, **triste → cara triste o llorando**, **susto → cara de sorpresa**, **enojo o cansancio («uf») → cara brava o cansada**, **«aww» → cara enamorada**. Si no coinciden, cambia el sonido por el de la cara que sí se ve, o lo quita. Si nadie se ríe en la escena, no suena ninguna risa, y la risa usa voz de muchacha o de muchacho según quién se ríe.

## Lo que se dice, se ve

Si una frase menciona algo concreto (el gym, Instagram/fotos, la comida, el café, el trabajo, el dinero, dormir, correr, estudiar, orar, la playa…), la escena corta a un «recuerdo» limpio donde el muñequito lo está haciendo: levantando pesas en el gym, haciéndose una selfie con flash, comiendo, con el laptop, etc. Los objetos van en las manos o en la escena; ya no caen carteles ni objetos del techo.

## Muebles

No hay sillas sueltas, banquetas ni mesitas de centro (tampoco en los fondos con IA). Los personajes solo se sientan en el sofá del escenario o, en las pantomimas del parque, en el banco del parque, ambos a tamaño real; si no hay dónde sentarse, se quedan de pie, siempre en el suelo.

## Historias con IA y tendencias (opcional, usa tu clave de OpenAI)

En **4 · Situación cotidiana**:
- **🔎 Buscar lo viral ahora**: la IA busca en internet lo que está dando de qué hablar esta semana (precios, renta, trabajo, economía, memes) y te muestra 6 tendencias. Toca una para usarla, o escribe la tuya en «Tendencia del momento».
- **✨ Escribir 3 historias con IA**: escribe 3 guiones nuevos sobre el tema, usando la tendencia, en español de la calle (Miami, sabor cubano y latino de EE. UU., con su toque de inglés) o en inglés coloquial. Humor con picardía pero limpio, un golpe nuevo cada pocos segundos y giro final. Aparecen marcados «IA». «Historias de la app» vuelve a las historias incluidas.

## Fondos con IA (opcional)

En **8 · Fondos con IA**, la IA dibuja 2–3 escenarios detallados por video (sin personas). Encima, la app anima a los personajes como marionetas: la boca se mueve según la voz real (con lengua y dientes), los ojos parpadean y miran, las cejas cambian con la emoción y el cuerpo camina y gesticula.

- Costo aproximado por video: **0,05 USD** (económico, calidad media) a **0,20 USD** (mejor calidad).
- Antes de generar, la app muestra el **costo aproximado total** (tendencias, guion, fondos y voz).
- La primera vez OpenAI puede pedir **verificar tu organización** (platform.openai.com → Settings → Organization → General).

## Dirección automática (ritmo y diálogo)

- **Diálogo de ida y vuelta**: cada personaje tiene su propia voz; habla el que dice la línea y el otro escucha asintiendo y gesticulando.
- **Planos de reacción**: después de casi cada línea, primer plano del que escucha con cara exagerada, una exclamación hablada («¡Ñooo!», «¡Uf!», «¡Jajaja!»…) y un efecto de sonido marcado.
- **Escenas cortas**: un corte de plano cada 1–2 s (plano de los dos, plano de uno, primer plano), personajes que entran y salen corriendo, golpes, caídas, risas y sorpresas por encima de la música.

## Novedades

- **Muñequitas**: mismo estilo (cabeza blanca, palitos negros) con moñito o florecita al lado de la cabeza y saya en triangulito. En «2 · Personajes» eliges si la protagonista es varón o hembra y cuántas muñequitas salen; las voces de OpenAI se asignan según el género.
- **Escenas con el móvil**: selfies, buscar en el teléfono y pasar reels, con **planos POV** (la pantalla vista desde los ojos del personaje, con sus manos sujetando el teléfono).
- **🌱 Superación** (primer tema): el hermano mayor que soltó el teléfono y ayuda a su hermanito, 200 selfies para subir una, «me dijeron que no 47 veces». Humor limpio, gancho raro en el primer segundo, giro final y mensaje esperanzador para compartir.
- **Sin nombres ni protagonista fijo**: personajes genéricos que hablan y cuentan la historia.
- **Voces OpenAI**: en español con sabor cubano y de Miami; en inglés, como hablan los jóvenes de EE. UU.
- **Tamaño adulto**: puertas de 2 m, sofás y coches a escala; al sentarse usan el sofá de la casa o una butaca de tamaño real; siempre dos brazos y dos piernas. Camiseta de una sola pieza. Botón «Rehacer los fondos con IA» si un fondo sale mal.
- **Reflexión final** en todos los videos y **títulos pequeños** pegados arriba.
- **✨ Hacer este guion más divertido (IA)**: reescribe la historia elegida (también las de la app) con más chispa, sorpresas y ritmo, sin cambiar la idea. El guionista con IA sigue reglas «cero aburrimiento»: gancho con intriga, cada línea trae algo nuevo, diálogo de ping-pong, regla de tres y giro que conecta con el principio. Menos pausas entre escenas.

## Más acción, menos diálogo (activado por defecto)

En **3 · Duración**, la casilla **🎬 Más acción, menos diálogo**:
- Se dicen menos frases y entre ellas aparecen **escenas de acción sin voz** (≈2 s): resbalones, desmayos, tropezones, persecuciones, huidas, pasos de puntillas, arrodillarse, bailes. Cada una tiene su golpe de sonido y una **onomatopeya de cómic** («¡PLAF!», «¡ZAS!», «¡CATAPLUM!»).
- Las reacciones del que escucha son sobre todo gestos y sonidos; solo de vez en cuando dice algo.
- Las historias con IA salen con la mitad de las escenas mudas y frases de máximo 6 palabras.

## Diseño del video

- **Personajes** a tamaño de persona: cabeza blanca pura pegada a la camiseta, contorno y extremidades negras gruesas, camiseta de manga corta en colores vivos (verde, azul, amarillo, rosa).
- **Textos que nunca tapan a nadie**: el gancho, la reflexión y los botones van en la franja de arriba; los subtítulos en la de abajo; la cámara mantiene a los personajes en la franja del medio.

## Exportación

- El video se renderiza fotograma a fotograma a **MP4 H.264 1080×1920 a 30 fps**.
- El audio (voz, música y efectos) se codifica **siempre en AAC** con un codificador WebAssembly incluido en la app, así que no depende de Safari: el MP4 guardado en Fotos del iPhone y subido a redes conserva el sonido.
- En el iPhone, usa el botón **«Guardar en Fotos / Compartir»** y elige **Guardar video**.

## Estructura

```
munequitos-video/
├── index.html          interfaz
├── css/app.css         estilos (claro/oscuro, móvil)
├── js/app.js           lógica de la interfaz, vista previa y exportación
├── js/content.js       temas, 24 situaciones, ganchos y llamados (ES/EN)
├── js/script.js        arma el guion y ajusta los tiempos a la duración
├── js/render.js        dibujo: muñecos, poses, entornos, cámara, subtítulos, CTA
├── js/audio.js         música (instrumentos reales o la tuya), efectos reales y mezcla
├── js/tts.js           voces de OpenAI (Onyx, Ash, Coral, Nova)
├── js/message.js       historias «solo música con mensaje»
├── js/visuals.js       palabras → escena (lo que se dice, se ve)
├── js/phrases.js      banco de frases del autor y su visión para la IA
├── js/musicplan.js     emoción de cada escena → música del banco (con cambios suaves)
├── audio/              efectos y muestras de piano/guitarra (ver créditos)
├── js/export.js        MP4 (H.264 + AAC) con Mediabunny
└── vendor/             Mediabunny + codificador AAC
```

### Agregar tus propias situaciones

En `js/content.js`, añade una entrada al tema que quieras. Cada línea es
`L(textoES, textoEN, acciones, objeto, efecto)`:

- **acciones**: `"A:talk B:shrug"` o `"all:laugh"`. Disponibles: `idle talk walk run wave hug cheer jump facepalm shrug sad cry angry laugh think type phone sleep fall point sit give dance wait shock love tired strong lift pray`.
- **objeto** (lo sostiene quien habla): `money pizza gift trophy coffee laptop phone light`.
- **efecto**: `pop boing ding whoosh scratch applause cash sad drum type heart alarm laugh notif`.

Para «dos caminos» usa `mode: 'caminos'`, pon en el inicio el objeto `sign:IzqES|DerES|IzqEN|DerEN` y marca cada repetición con `'left'` o `'right'`.

## Publicarla en internet

Como es una página estática, puedes subir la carpeta a GitHub Pages, Netlify o cualquier hosting. Este repositorio se publica con GitHub Pages desde la rama `main` (carpeta raíz).

## Créditos

- Efectos: «Oculus Audio Pack 1» de Meta, [Meta-open-sound](https://github.com/facebookincubator/Meta-open-sound), licencia **CC BY 4.0** (requiere crédito, uso comercial permitido).
- Golpes y pasos: «Impact Sounds» de [Kenney](https://kenney.nl), **CC0**.
- Piano y guitarra de nailon: instrumentos grabados de Meta-open-sound, **CC0**.
- [Mediabunny](https://mediabunny.dev) y su codificador AAC (MPL-2.0; el codificador usa FFmpeg, LGPL).
- Tipografía Fredoka (Google Fonts).
