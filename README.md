# Muñequitos Video — comedia muda

**Ábrela aquí:** https://solertemplates.github.io/munequitos-video/ (funciona en Safari del iPhone; toca Compartir → «Añadir a pantalla de inicio» para tenerla como app).

App web que genera videos cortos verticales (1080×1920) de **humor mudo** con muñequitos de palitos, inspirados en el cine mudo clásico (sin copiar personajes): **sin voces ni diálogos**. La historia se cuenta con acciones, gestos, caras exageradas, música alegre y efectos de sonido fuertes. Solo hay dos textos: un **título pequeño arriba** (se puede quitar) y una **reflexión corta al final**, que puedes cambiar.

## Cómo se usa

1. **Tema**: el despertador, la guagua, el jefe, el dinero no alcanza, el cansancio o el trabajo.
2. **Personajes, entorno y estilo** (color o blanco y negro).
3. **Duración**: 12–25 s, 25–45 s o 45–60 s. En los cortos quedan las escenas clave; en los largos se agregan gags extra.
4. **Historia**: elige una de la app o toca **✨ Escribir 3 historias con IA** (opcionalmente con una idea o tendencia; **🔎 Buscar lo viral ahora** la busca en internet).
5. **Música y efectos**: «Cine mudo (piano alegre)» por defecto; efectos de golpes, caídas, sorpresas, risas, pasos, bocinas, salpicones.
6. **IA (opcional)**: tu clave de OpenAI para escribir historias y dibujar fondos detallados. Antes de generar se muestra el costo aproximado (≈0,05–0,10 USD por video).
7. **Generar vista previa** → **Exportar MP4** → en el iPhone, «Guardar en Fotos / Compartir».

## Qué hay en cada video

- Escenas de ~2 s donde siempre pasa algo: tropezones, resbalones con cáscara de plátano, desmayos, persecuciones, la guagua que se escapa, va llena o te empapa, el despertador que no para, la cartera de la que sale una polilla, planes que salen mal y un **giro final** sorprendente.
- Cámara viva: planos generales, de dos, de uno y **primeros planos de reacción** con caras exageradas.
- En cada escena solo salen los personajes que actúan en ella.
- Personajes con **estatura de adulto** frente a puertas, muebles, coches y guaguas, grandes en pantalla.
- **Reflexión final** corta (con música más emotiva) y, opcionalmente, animación de **me gusta, compartir y seguir** (solo íconos).
- Audio en AAC dentro del MP4 (también en iPhone).

## Estructura

```
index.html, css/app.css     interfaz
js/app.js                   pantalla, vista previa y exportación
js/content.js               temas, historias mudas y gags extra
js/script.js                arma el video según la duración
js/direction.js             planos de cámara y reacciones
js/render.js                muñecos, poses, escenarios, guagua, cama, cámara
js/audio.js                 música (cine mudo, alegre, enérgica, lo-fi) y efectos
js/scriptai.js              tendencias y guionista de comedia muda (OpenAI)
js/aiimages.js              fondos con IA (OpenAI)
js/export.js                MP4 (H.264 + AAC) con Mediabunny
```

### Agregar historias

En `js/content.js`, cada escena es `G('acciones', 'objeto', 'efecto@segundo,...', { dur, shot, react, env, night, key, twist })`, por ejemplo `G('A:slip', 'banana', 'boing@0.05,thud@0.5', { shot: 'two', react: 'B:laugh' })`.

## Créditos

- [Mediabunny](https://mediabunny.dev) y su codificador AAC (MPL-2.0; el codificador usa FFmpeg, LGPL).
- Tipografía Fredoka (Google Fonts) para la interfaz.
