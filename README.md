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

## Voz

| Voz | Precio | Calidad | Cómo se usa |
|---|---|---|---|
| **Voz neural (Piper)** | Gratis | Buena | Viene en la app. La primera vez descarga ≈60 MB (usa Wi‑Fi) y queda guardada. |
| **ElevenLabs** | Gratis ≈10 min/mes (sin uso comercial); Starter ≈5 USD/mes para monetizar | Excelente, la más natural | Crea tu clave en elevenlabs.io → API Keys y pégala en la app. «Cargar mis voces» trae las voces de tu cuenta. |
| **OpenAI** | De pago por uso (centavos por video), requiere saldo | Muy buena | Crea tu clave en platform.openai.com → API keys y pégala en la app. |
| **Voz básica sin conexión** | Gratis | Robótica | Solo como respaldo cuando no hay internet. |

Las claves se guardan solo en el navegador del teléfono. Si una voz de la nube falla (clave mala o sin créditos), la app usa la voz neural gratuita y explica el motivo.

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

## La serie de Tito (videos para hacerse virales)

- **Tema «💪 Vida de trabajador»** (el primero): el sueldo que dura un fin de semana, el turno de noche, pedirle aumento al jefe, llegar muerto del trabajo.
- **Historias casi mudas**: las cuentan las acciones, las caras, los **carteles de tiempo** («6:00 AM», «DÍA 15», «VIERNES») y los efectos; solo de vez en cuando una frase corta y graciosa. Nadie narra lo que hace.
- **Protagonista fijo**: **Tito**, con gorra roja y camiseta verde, sale en todos los videos y su nombre aparece en el gancho. En «2 · Personajes» puedes cambiarle el nombre y la personalidad (la usa la IA al escribir). Su esposa lleva pelo largo; el jefe, corbata roja.
- **«Este eres tú»**: ganchos tipo «POV: cobraste el viernes y el lunes ya estás pela'o» o «Etiqueta a ese que trabaja de noche».
- **Pregunta final en pantalla** antes del llamado a la acción («¿A ti también te pasa?», «¿Este eres tú o tu pareja?»…), con 3 opciones para elegir en «6 · Llamado a la acción». Sale en todos los videos.
- **✨ Escribir 3 historias con IA** ahora escribe episodios de la serie con Tito, casi mudos, priorizando dinero, deudas, renta, cansancio, el jefe y el trabajo de noche.

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
├── js/audio.js         música procedural, efectos y mezcla
├── js/tts.js           voz (Piper neural + meSpeak sin conexión)
├── js/export.js        MP4 (H.264 + AAC) con Mediabunny
└── vendor/             Mediabunny + codificador AAC, piper-phonemize y meSpeak
```

### Agregar tus propias situaciones

En `js/content.js`, añade una entrada al tema que quieras. Cada línea es
`L(textoES, textoEN, acciones, objeto, efecto)`:

- **acciones**: `"A:talk B:shrug"` o `"all:laugh"`. Disponibles: `idle talk walk run wave hug cheer jump facepalm shrug sad cry angry laugh think type phone sleep fall point sit give dance wait shock love tired strong lift pray`.
- **objeto** (aparece grande y animado): `clock:9:30 money pizza heart gift box chart_up chart_down trophy calendar coffee bulb rocket plant laptop phone confetti light`.
- **efecto**: `pop boing ding whoosh scratch applause cash sad drum type heart alarm laugh notif`.

Para «dos caminos» usa `mode: 'caminos'`, pon en el inicio el objeto `sign:IzqES|DerES|IzqEN|DerEN` y marca cada repetición con `'left'` o `'right'`.

## Publicarla en internet

Como es una página estática, puedes subir la carpeta a GitHub Pages, Netlify o cualquier hosting. Este repositorio se publica con GitHub Pages desde la rama `main` (carpeta raíz).

## Créditos

- [Piper](https://github.com/rhasspy/piper) (voces neuronales) mediante `@diffusionstudio/piper-wasm` y `onnxruntime-web`.
- [meSpeak / eSpeak](https://www.masswerk.at/mespeak/) (GPL) para la voz sin conexión.
- [Mediabunny](https://mediabunny.dev) y su codificador AAC (MPL-2.0; el codificador usa FFmpeg, LGPL).
- Tipografía Fredoka (Google Fonts).
