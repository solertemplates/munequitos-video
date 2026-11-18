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
4. Elige una de las **3 situaciones cotidianas** sugeridas, uno de los **3 ganchos iniciales** y **uno o dos llamados a la acción** (si eliges dos, se combinan en una frase, por ejemplo «Dale me gusta si te tocó el corazón y sigue la página»). «Otras opciones» propone más ganchos y llamados.
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

## Imágenes con IA (opcional)

En la sección **8 · Imágenes con IA** activa «Usar imágenes generadas con IA (OpenAI)» y pega tu clave de OpenAI (la misma de la voz).

- Cada escena se convierte en una ilustración de caricatura (cabezas grandes y blancas, contorno negro, camisetas de color, fondos detallados) con zoom y paneo de cámara.
- La primera imagen se usa como referencia para que los personajes sean los mismos en todo el video.
- Costo aproximado por video (8–11 imágenes): **0,10–0,20 USD** con el modelo económico en calidad media; **0,50–0,80 USD** con gpt-image-1 en calidad media. Se cobra de tu saldo de OpenAI.
- Tarda de 1 a 3 minutos. Si una imagen falla, esa escena usa los muñequitos de la app.
- La primera vez OpenAI puede pedir **verificar tu organización** (platform.openai.com → Settings → Organization → General → Verify Organization).
- Instagram, TikTok, YouTube y Facebook piden marcar el contenido como **generado con IA** al publicarlo.

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
