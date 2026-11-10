# Plan — Mini app para princess

**Fecha:** 10/11/2026
**Stack:** HTML + CSS + JavaScript vanilla (sin frameworks, sin build)
**Objetivo:** regalo interactivo de una sola página, pensado para verse y sentirse bien en un celular Android, donde cada frase del mensaje ocupa una pantalla y se avanza scrolleando.

---

## 1. Resumen de la experiencia

Una página vertical con **19 pantallas a tamaño viewport**. Cada pantalla contiene una frase del mensaje (o una interacción) y se revela con una animación suave al entrar en pantalla. El scroll es nativo, con *scroll snap* para que el avance se sienta de a una sección.

El recorrido emocional va de lo tierno a lo gracioso:

1. Saludo y agradecimiento por el regalo.
2. Explicación de las disculpas y de la app.
3. “Contrato de reglas” con foto de la firma de él y firma de ella.
4. Regalito con tres botones animados (besos, mimos, abrazos).
5. Sorpresa con botón “No” que no funciona y “Yes” que sí.
6. Caja sorpresa que se abre y muestra un ticket.
7. Cierre amoroso.

---

## 2. Alcance

### Incluye

- Página estática mobile-first, sin backend.
- Scroll por secciones con `scroll-snap` y animaciones de aparición.
- Foto del regalo y foto de la firma (assets provistos por el usuario).
- Firma de ella con input de texto (se renderiza como firma manuscrita).
- 3 animaciones distintas para besos, mimos y abrazos.
- Flujo “No / Yes” con el “No” intencionalmente inerte.
- Caja sorpresa animada con ticket final.
- Persistencia local de la firma (opcional pero incluida).
- Accesibilidad básica y respeto por `prefers-reduced-motion`.

### No incluye (por ahora)

- Login, base de datos o envío de notificaciones.
- Audio/música (evita problemas de autoplay y peso).
- Multiusuario o múltiples contratos.
- Panel de administración.

---

## 3. Stack y decisiones técnicas

| Tema | Decisión | Motivo |
|---|---|---|
| HTML | Un único `index.html` semántico | Simple de abrir y hostear |
| CSS | Un `styles.css`, mobile-first, variables CSS | Sin dependencias ni build |
| JS | Un `main.js` clásico con `defer` | Funciona con `file://` sin CORS de módulos |
| Animaciones | CSS keyframes + JS para partículas/estado | Liviano, 60 fps en Android |
| Scroll | Nativo + CSS `scroll-snap-type: y mandatory` (proximity en landscape/pantallas bajas) | Garantiza que cada swipe deje una sección completa a la vista |
| Imágenes | Locales, comprimidas, `loading="lazy"` | Velocidad y funcionamiento offline |
| Fuentes | Locales (`woff2`) con fallback a sistema | No depender de Google Fonts |
| Persistencia | `localStorage` con `try/catch` | Recordar la firma sin backend |

**Sin build, sin npm, sin frameworks.** Se puede abrir `index.html` con doble clic y también publicar en GitHub Pages, Netlify o Vercel como sitio estático.

---

## 4. Estructura de archivos

```text
bellakita/
├─ index.html
├─ plan.md
├─ initial_prompt.md
├─ css/
│  └─ styles.css
├─ js/
│  └─ main.js
└─ assets/
   ├─ regalo.jpg          ← foto real del regalo
   ├─ firma.png           ← foto real de la firma de él (fondo transparente)
   ├─ fonts/
   │  ├─ fraunces.woff2   ← títulos (opcional)
   │  └─ nunito.woff2     ← texto (opcional)
   └─ favicon.svg         ← corazón simple
```

- Si todavía no están las fotos, usar placeholders locales (`regalo-placeholder.svg`, `firma-placeholder.svg`) y reemplazarlos al final.
- Los íconos de corazones, labios y caja se dibujan con **SVG inline** o emoji del sistema: no se agregan librerías.

---

## 5. Mapa de secciones

| # | id | Pantalla | Contenido | Interacción |
|---|---|---|---|---|
| 1 | `hola` | Saludo | “Hola princess, espero que estés teniendo un bonito dia.” | Indicador de scroll animado |
| 2 | `quiero-que-sepas` | Intro | “quiero que sepas...” | Aparición suave |
| 3 | `tu-regalo` | Regalo | “que me gusto mucho tu regalito” + foto del regalo | Foto estilo polaroid |
| 4 | `gracias` | Agradecimiento | “Gracias!!!” | Texto grande con corazones |
| 5 | `por-otra-parte` | Transición | “Por otra parte...” | Aparición suave |
| 6 | `mi-perdon` | Disculpas | “Queria recalcar mi perdon...” | Texto centrado |
| 7 | `esta-app` | Explicación | “Así que por eso sentí...” | Texto centrado |
| 8 | `empecemos` | Intro contrato | “Empecemos, asegurando de que esto no vuelva a pasar...” | Aparición suave |
| 9 | `contrato` | Reglas + firma | Lista de 4 reglas + foto de firma + input para firmar | Firma persistente |
| 10 | `segundo-regalo` | Regalito (intro) | “En segundo lugar, quiero darte este regalito.” | Aparición suave |
| 11 | `besos-mimos-abrazos` | Regalito interactivo | Botones Besos / Mimos / Abrazos | 3 animaciones |
| 12 | `sorpresa` | Sorpresa | “Queres una sorpresa mas?” + botones No / Yes | No inerte, Yes lleva al cuestionario |
| 13 | `cuestionario` | Intro del quiz | “ok pero para ganarte la sorpresa...” | Botón Empezar |
| 14 | `pregunta-1` | Pregunta 1 | “Que hay mas alla de Moreno?” | Multiple choice |
| 15 | `pregunta-2` | Pregunta 2 | “Cuanto es 1 + 2?” | Multiple choice |
| 16 | `pregunta-3` | Pregunta 3 | “Cuando fue el dia que te pedi ser mi novia?” | Multiple choice; desbloquea la caja |
| 17 | `caja` | Caja sorpresa | Dibujo SVG de caja + botón “Abrir” | Abre y muestra ticket |
| 18 | `final` | Cierre | “Espero que te haya gustado mi mini app!” | Aparición suave |
| 19 | `te-amo` | Cierre final | “Te amo mucho muchote<3” | Corazones flotando |

> La sección 17 es la única que no viene de una frase entre comillas: es la pantalla interactiva de la caja, a la que se llega al terminar el cuestionario.

---

## 6. Diseño visual

### 6.1 Concepto

- Estética **romántica, cálida y simple**: fondo crema, rosa empolvado, tipografía con serif elegante para títulos y sans redondeada para el cuerpo.
- Nada de saturación excesiva ni brillos neón. El look debe sentirse hecho a mano, como una carta.
- Mucho aire: una idea por pantalla, texto centrado, ancho máximo de lectura ~34ch.
- Detalles: esquinas redondeadas, sombras muy suaves, líneas punteadas tipo papel, pequeños corazones decorativos.

### 6.2 Tokens (variables CSS)

```css
:root {
  --bg: #FFF6F1;
  --bg-alt: #FFEDF0;
  --surface: #FFFFFF;
  --ink: #3A2A2E;
  --muted: #6F565C;
  --primary: #C24E66;      /* botones y acentos */
  --primary-dark: #A93B53; /* texto sobre fondo claro */
  --rose-soft: #F7C8D0;
  --gold: #C8A24A;
  --radius-sm: 14px;
  --radius-md: 22px;
  --radius-lg: 30px;
  --shadow-soft: 0 14px 40px rgba(90, 45, 55, 0.12);
  --font-heading: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body: "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
```

- Contraste verificado: usar `--primary-dark` para texto sobre crema (≥ 4.5:1) y `--primary` solo en botones con texto blanco grande/semibold.
- Fondos por tramo: saludo crema → regalo rosa → disculpas durazno → contrato blanco → regalito rosa → sorpresa más rosa → caja con fondo ciruela suave para destacar el ticket → cierre crema.
- Los cambios de fondo se hacen con gradientes sutiles por sección, sin animaciones costosas.

### 6.3 Tipografía y escala

| Rol | Tamaño | Peso |
|---|---|---|
| Título de sección | `clamp(1.55rem, 8vw, 2.4rem)` | 600–700 |
| Texto principal | `clamp(1.05rem, 4.8vw, 1.35rem)` | 400–500 |
| Reglas del contrato | `clamp(0.9rem, 4vw, 1.05rem)` | 500 |
| Botones | `1rem` | 700 |
| Ticket | `clamp(0.82rem, 3.8vw, 0.95rem)` | 500–600 |

- Interlineado 1.5–1.6 para los párrafos largos.
- Títulos con `letter-spacing` levemente negativo y `text-wrap: balance` donde esté disponible.

### 6.4 Layout

- Una columna, `max-width: 560px`, centrada.
- Cada `.section` es `min-height: 100svh`, con padding vertical y `padding-inline` que contempla `safe-area-inset`.
- Contenido centrado vertical y horizontalmente con flex; las secciones con mucho contenido (contrato) crecen en altura en vez de recortarse.
- En desktop se ve como una “tarjeta de celular” centrada sobre un fondo ambiente; el contenido no se estira a lo ancho.

---

## 7. Scroll y navegación

### 7.1 Comportamiento

```css
html {
  scroll-snap-type: y mandatory; /* una pantalla por swipe; se desactiva al enfocar inputs */
  scroll-behavior: smooth;
  overscroll-behavior-y: contain;
}

.section {
  min-height: 100svh;
  min-height: 100vh; /* fallback */
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: calc(28px + env(safe-area-inset-top)) 22px calc(32px + env(safe-area-inset-bottom));
}
```

- `scroll-snap-stop: always` evita que un swipe fuerte saltee varias pantallas.
- Se usa `svh` (small viewport height) para que la barra de direcciones de Android no corte contenido; `100vh` queda como fallback.
- **No se secuestra el scroll**: se conserva el momentum nativo de Android.
- Al enfocar el input de firma se desactiva temporalmente el snap (`html.input-focus { scroll-snap-type: none; }`) para que el teclado no pelee con el scroll. Se restaura al salir del input.
- Se verificó que las 19 pantallas entran completas desde 320×568. Si una sección crece por contenido (o en landscape), el modo pasa a `proximity` para poder leerla sin pelear con el snap.
- El snap se desactiva mientras el input de firma tiene foco para que el teclado de Android no pelee con la sección.

### 7.2 Reveal de contenido

- `IntersectionObserver` con `threshold: 0.5` agrega `.is-visible` a la sección.
- Estado inicial: `opacity: 0`, `translateY(18px)`; al entrar: `opacity: 1`, `translateY(0)`, 550 ms `ease-out`.
- Los hijos (título, foto, botones, reglas) aparecen con un pequeño *stagger* de 80 ms usando `transition-delay` o la variable `--i`.
- Si JS falla, el contenido debe verse igual: se activan los estados ocultos solo cuando `<html>` tiene la clase `.js` (agregada por el script).
- Se anima solo `opacity` y `transform`.

### 7.3 Indicador de progreso

- Barra fina (3 px) fija arriba con gradiente rosa, ancho proporcional al scroll.
- Se actualiza con `requestAnimationFrame` y listener `scroll` pasivo.
- En la primera sección, una flechita rebotando invita a scrollear; desaparece después del primer scroll.

---

## 8. Componentes e interacciones

### 8.1 Contrato y firma (sección 9)

**Contenido:**

- Título: “Contrato de reglas por si nos peleamos”.
- Lista de 4 reglas en una tarjeta blanca con borde punteado.
- Foto de la firma de él (`firma.png`) sobre una línea, con la leyenda “Mi firma”.
- Input para que ella firme + botón “Firmar”.

**Flujo:**

1. Input `type="text"` con `label` visible “Tu nombre”, `maxlength="24"`, `autocomplete="name"`, `enterkeyhint="done"`.
2. Botón “Firmar” deshabilitado hasta que haya al menos 2 caracteres (sin contar espacios).
3. Al enviar:
   - Se guarda el nombre en `localStorage` (`bk.name`, `bk.signed`).
   - El input y el botón se reemplazan por la firma renderizada: el nombre con una fuente manuscrita (ej. “Caveat”, fallback `cursive`), una línea y la fecha del día.
   - Animación: pequeño *pop* + corazones flotando (2–3, sutiles).
   - Se anuncia “Contrato firmado” en una región `aria-live="polite"`.
4. Si ya firmó antes, al cargar se muestra directamente el estado firmado con su nombre.
5. El texto del nombre se inserta con `textContent` (nunca `innerHTML`) para evitar inyección.
6. `?reset=1` en la URL borra el estado local (útil para probar).

**Estados:**

- `sin firmar` → input + botón.
- `firmando` → botón con spinner breve (300 ms mínimo) para dar feedback.
- `firmado` → firma manuscrita + fecha + mensaje “Firmado con amor”.

**Alternativa descartada:** canvas para dibujar con el dedo. Es más lindo, pero más complejo de validar y de limpiar; se puede sumar después como mejora.

### 8.2 Besos, mimos y abrazos (secciones 10 y 11)

- Tres botones grandes en fila (o grilla de 3 columnas con gap de 8 px), cada uno con ícono + texto, mínimo 48 px de alto:
  - 💋 **Besos**
  - 🥰 **Mimos**
  - 🫂 **Abrazos**
- Los botones se pueden tocar varias veces; las animaciones se reinician sin acumular elementos infinitos (máximo ~20 partículas vivas).
- Escenario de animación fijo de ~170 px de alto, para que el layout no salte.

| Botón | Animación |
|---|---|
| **Besos** | Estallido de labios y corazones que suben y se desvanecen; el escenario se tiñe de rosa; el botón hace un “pop”. |
| **Mimos** | Una carita 🥰 se achica y se estira como si le hicieran cariño; una mano ✋ baja dos veces; aparecen destellos ✨. |
| **Abrazos** | Dos emojis/figuras se acercan, se aprietan (squash) y aparece un resplandor cálido con corazones alrededor. |

- Implementación: JS genera partículas con posición, rotación, duración y retardo aleatorios via variables CSS (`--x`, `--r`, `--d`), y las elimina en `animationend`.
- `navigator.vibrate(10)` opcional y protegido, solo si el dispositivo lo soporta.
- Con `prefers-reduced-motion: reduce`, cada botón muestra un texto corto (“💕 besos para vos”) con fade simple, sin partículas.

### 8.3 “¿Querés una sorpresa más?” (sección 12)

- Dos botones centrados: **No** y **Yes**.
- **No**: no hace nada intencionalmente, tal como pide el prompt. Para que no se sienta roto, al tocarlo hace un pequeño *shake* y aparece una microcopy traviesa: “Este botón no funciona 😌”. No navega ni cambia de sección.
- **Yes**: hace scroll suave a la sección `cuestionario` y dispara una pequeña lluvia de corazones.
- Accesibilidad: ambos son `<button type="button">`; el “No” no debe quedar `disabled` (se vería apagado), simplemente no avanza.

### 8.4 Cuestionario (secciones 13 a 16)

- Intro con el texto “ok pero para ganarte la sorpresa vas a tener que resolver este mini cuestionario. Empezemos!” y botón **Empezar**.
- Una sección por pregunta, con opciones tipo botón y feedback inmediato:
  - Pregunta 1: “Que hay mas alla de Moreno?” → **Gorgonia**.
  - Pregunta 2: “Cuanto es 1 + 2?” → **esa es una pregunta para mongolitos.**
  - Pregunta 3: “Cuando fue el dia que te pedi ser mi novia?” → **22 de enero del 2026**.
- Respuesta incorrecta: la opción tiembla y aparece “Mmm, no era esa. Probá de nuevo 😌”; se puede reintentar.
- Respuesta correcta: se marca en verde y avanza sola a la siguiente pregunta (o a la caja en la última).
- Al terminar las tres, se desbloquea el botón **Abrir** de la caja y se hace scroll a esa sección. Si se salta el quiz, la caja queda bloqueada con el mensaje “Primero resolvé el cuestionario 😌”.

### 8.5 Caja sorpresa y ticket (sección 17)

**Dibujo:**

- SVG inline de una caja de regalo: cuerpo, tapa, cinta vertical/horizontal y moño.
- Paleta rosa/ciruela con sombras simples; tamaño adaptable `clamp(180px, 55vw, 260px)`.
- Botón “Abrir” debajo, grande y claro.

**Secuencia al tocar “Abrir” (≈1.6 s):**

1. Se deshabilita el botón y se agrega `.is-opening`.
2. La caja tiembla 350 ms.
3. La tapa sale volando/rota hacia arriba con `ease-out` (650 ms); el moño se suelta.
4. Del interior emerge el ticket: `translateY` + `rotate` + `scale` desde 0.6 hasta su posición final, con rebote suave.
5. Explosión de corazones y brillos alrededor de la caja.
6. El botón desaparece; el ticket queda visible y se mueve el foco a él para lectores de pantalla.

**Ticket:**

- Tarjeta color papel (`#FFFDF7`) con borde punteado, sombra suave y una leve rotación (-2°).
- Contenido literal requerido:
  > ticket valido para pedirme lo que querias en el barrio chino. Solo valido el dia 14/11/2026
- Se puede agregar arriba un decorative “✦ Ticket de regalo ✦” y “N.º 001”, sin alterar el texto pedido.
- Tipografía legible, fecha en negrita; `max-width: 320px`; debe entrar completa en 320 px de ancho.
- Si `prefers-reduced-motion` está activo: la caja se abre sin temblor ni rebote, con un fade corto.

**Estado:** al recargar la página la caja vuelve a estar cerrada (para que pueda abrirla de nuevo). No se persiste.

---

## 9. Responsive Android

| Punto | Decisión |
|---|---|
| Viewport | `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` — sin bloquear zoom |
| Alturas | `100svh` + fallback `100vh`; el contenido crítico nunca depende de `100dvh` solo |
| Safe areas | Padding con `env(safe-area-inset-*)` para notch y barra de gestos |
| Anchos de prueba | 320, 360, 393, 412 y 430 px |
| Alturas de prueba | 568, 640, 740, 800 y 915 px |
| Toques | Targets ≥ 48×48 px, separación ≥ 8 px, `touch-action: manipulation` |
| Hover | Ninguna información depende de hover; hay estados `:active` claros |
| Teclado | Al enfocar inputs se desactiva el snap; el botón queda visible con el teclado abierto |
| Overflow | `overflow-x: hidden`, imágenes `max-width: 100%`, textos largos con `overflow-wrap` |
| Orientación | Funciona en horizontal, aunque la experiencia está pensada para vertical |
| Navegadores | Chrome Android y Samsung Internet actualizados; WebView moderno |

---

## 10. Accesibilidad

- HTML semántico: `header/main/section/footer`, un `h1` en la primera pantalla y `h2` en las demás (visualmente integrados al diseño).
- Todos los controles son `<button>` o `<input>` reales, con `label` asociado.
- `alt` significativos:
  - Foto del regalo: “Foto del regalo que me dio”.
  - Firma: “Firma de [nombre]”.
- Región `aria-live="polite"` para confirmar la firma y la apertura del ticket.
- Foco visible con `:focus-visible` (anillo rosa de 3 px), sin quitarlo en ningún caso.
- Navegación por teclado natural: Tab, Enter, flechas y PageDown siguen funcionando.
- `prefers-reduced-motion: reduce`: se reducen reveals, partículas y la apertura de la caja a fades simples.
- Contraste mínimo 4.5:1 en texto; no se usa color como único indicador.
- El texto “Te amo mucho muchote<3” se escribe con `&lt;3` en el HTML para que el `<` no rompa el marcado.

---

## 11. Rendimiento

- Objetivo: primera carga < 1.5 MB y LCP < 2.5 s en 4G.
- Foto del regalo: máx. 1600 px de lado, JPEG/WebP ≤ 250 KB.
- Firma: PNG transparente ≤ 600 px de ancho y ≤ 80 KB.
- Fuentes: solo dos archivos `woff2`, subset latino, `font-display: swap`; si no se consiguen, usar Georgia + system-ui y listo.
- Imágenes con `width`/`height` o `aspect-ratio` para evitar saltos de layout; `loading="lazy"` y `decoding="async"` en las que están bajo el pliegue.
- Animaciones solo con `transform` y `opacity`; límite de partículas y limpieza en `animationend`.
- Sin librerías externas, sin CDN, sin analytics.
- Probar con CPU 4× más lenta en DevTools y en un Android real de gama media.

---

## 12. Persistencia

Claves en `localStorage` (todas dentro de `try/catch` por si el navegador las bloquea):

| Clave | Valor | Uso |
|---|---|---|
| `bk.signed` | `"1"` | Saber si el contrato ya se firmó |
| `bk.name` | string | Nombre para renderizar la firma |
| `bk.date` | ISO date | Fecha en que firmó |

- No se guarda nada sensible ni se envía a ningún servidor.
- `?reset=1` limpia las claves (para pruebas y para volver a empezar).
- Si `localStorage` falla, la app funciona igual en memoria durante la sesión.

---

## 13. Organización del JavaScript

Un solo archivo `main.js`, envuelto en una IIFE, sin variables globales:

```js
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js');

  initReveal();      // IntersectionObserver
  initProgress();    // barra superior
  initSignature();   // input + estado firmado
  initAffection();   // besos / mimos / abrazos
  initSurprise();    // No / Yes
  initBox();         // apertura de caja + ticket
  initScrollHint();  // flechita inicial
})();
```

- Estado centralizado en un objeto `state = { signed, name, boxOpened }`.
- Listeners pasivos donde corresponde (`scroll`, `touchstart`).
- Funciones de render separadas de los handlers para que sea fácil de testear a mano.
- Nada de `eval`, nada de HTML dinámico con datos del usuario.

---

## 14. Plan de implementación

### Fase 1 — Esqueleto y estilos base

- [ ] Crear estructura de carpetas y archivos.
- [ ] `index.html` con las 19 secciones y todo el copy.
- [ ] Variables CSS, tipografía, fondos y layout mobile-first.
- [ ] Barra de progreso y flechita de scroll.

**Listo cuando:** recorrido completo con scroll, legible a 360×640 y sin overflow horizontal.

### Fase 2 — Scroll y reveals

- [ ] `scroll-snap` con `mandatory` y `scroll-snap-stop`.
- [ ] `IntersectionObserver` + clases `.is-visible` + stagger.
- [ ] Fallback sin JS y `prefers-reduced-motion`.

**Listo cuando:** cada sección aparece al entrar y el scroll sigue sintiéndose nativo.

### Fase 3 — Contrato y firma

- [ ] Maquetar reglas, foto de firma e input.
- [ ] Lógica de habilitación, guardado y estado firmado.
- [ ] Render manuscrito, fecha, `aria-live` y reset.

**Listo cuando:** se puede firmar con el teclado abierto, se guarda y se recupera al recargar.

### Fase 4 — Besos, mimos y abrazos

- [ ] Tres botones y escenario de animación.
- [ ] Partículas y animaciones diferenciadas.
- [ ] Límites de rendimiento y reduced motion.

**Listo cuando:** los tres botones se sienten distintos, se pueden repetir y no rompen el layout.

### Fase 5 — Sorpresa y caja

- [ ] Botones No/Yes con sus comportamientos.
- [ ] SVG de la caja y secuencia de apertura.
- [ ] Ticket con el texto literal y fecha.
- [ ] Foco y anuncio accesible al abrir.

**Listo cuando:** el No no avanza, el Yes lleva al cuestionario y el ticket se lee completo en 320 px.

### Fase 6 — Pulido y assets reales

- [ ] Reemplazar placeholders por foto del regalo y firma real.
- [ ] Ajustar tamaños, contrastes y espaciados.
- [ ] Comprimir imágenes y revisar peso.
- [ ] Probar en Android real (Chrome y Samsung Internet).
- [ ] Publicar en hosting estático y compartir el link.

---

## 15. QA en dispositivo

### Checklist funcional

- [ ] Las 19 pantallas se ven completas y centradas.
- [ ] No hay scroll horizontal en ningún ancho.
- [ ] El scroll avanza de a una sección y no se sienten saltos bruscos.
- [ ] La foto del regalo carga con su espacio reservado (sin saltos).
- [ ] La firma aparece con la foto de él; el input acepta acentos y espacios.
- [ ] El botón “Firmar” está deshabilitado con menos de 2 caracteres.
- [ ] Al firmar y recargar, la firma sigue visible.
- [ ] Besos, mimos y abrazos reproducen su animación y se pueden repetir.
- [ ] “No” no cambia de sección; “Yes” lleva al cuestionario.
- [ ] “Abrir” no se puede tocar dos veces mientras anima.
- [ ] El ticket muestra el texto completo y la fecha 14/11/2026.
- [ ] El cierre final se ve bien con el `<3` escapado.
- [ ] Con `prefers-reduced-motion` no hay partículas ni rebotes agresivos.

### Checklist Android

- [ ] Chrome Android actualizado.
- [ ] Samsung Internet actualizado.
- [ ] Barra de direcciones expandida/contraída sin cortar contenido.
- [ ] Teclado abierto sobre el input de firma: se ve el campo y el botón.
- [ ] Rotación horizontal sin romper el layout.
- [ ] Modo oscuro del sistema no altera colores no previstos.
- [ ] Prueba en 360×640 (gama baja) y 412×915.
- [ ] Prueba con red 4G simulada y en modo avión después de cargar (offline).

---

## 16. Criterios de aceptación

1. Se puede recorrer toda la experiencia solo scrolleando, sin menús ni botones de navegación.
2. Cada frase entre comillas tiene su propia pantalla y se lee cómodamente en un celular Android.
3. El contrato permite firmar con el nombre de ella y muestra la firma de él.
4. Los tres botones de cariño producen animaciones claramente distintas.
5. El “No” no funciona y el “Yes” sí; el flujo llega a la caja.
6. La caja se abre con animación y revela el ticket con el texto y la fecha exactos.
7. La experiencia se siente fluida (> 50 fps promedio) en un Android de gama media.
8. Funciona sin internet una vez cargada y sin errores en consola.
9. Respeta `prefers-reduced-motion` y se puede usar con teclado y lector de pantalla.
10. No hay dependencias externas ni build: solo HTML, CSS y JS.

---

## 17. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| El contrato no entra en 360×640 | Tipografía fluida, espaciado compacto; verificado desde 320×568. En landscape/short se usa `proximity` |
| El teclado tapa el input de firma | Desactivar snap al enfocar y `scrollIntoView` del campo |
| Faltan las fotos reales | Placeholders locales y reemplazo en la fase 6 |
| El “No” parece un botón roto | Microcopy traviesa + shake, sin deshabilitarlo visualmente |
| WebView/Android viejo no soporta `svh` | Fallback `100vh` y pruebas en dispositivo |
| Fuentes externas lentas o bloqueadas | Fuentes locales o fallback a Georgia/system-ui |
| Animaciones con muchas partículas | Límite de nodos, limpieza en `animationend`, reduced motion |
| `localStorage` bloqueado en modo privado | `try/catch` y estado solo en memoria |
| El texto final con `<3` rompe el HTML | Usar `&lt;3` |

---

## 18. Próximos pasos

1. Confirmar los assets: foto del regalo y foto de la firma (o arrancar con placeholders).
2. Implementar las fases 1 a 3 y revisar el contrato en un Android real.
3. Implementar las fases 4 y 5 (animaciones y caja).
4. Pulir, publicar y compartir el link.

---

## Apéndice A — Copy literal

> Se copia tal cual fue escrito, incluyendo tildes omitidas y mayúsculas. No corregir sin consultar.

1. Hola princess, espero que estés teniendo un bonito dia.
2. quiero que sepas...
3. que me gusto mucho tu regalito
4. Gracias!!!
5. Por otra parte...
6. Queria recalcar mi perdon por lo sucedido. Conociendote, seguro tu cabezita estuvo a mil estas horas, ni imaginarme las emociones que sentiste.
7. Así que por eso sentí que no fue suficiente pedirte disculpas de palabra y decidí crear esta mini app para demostrarte que en verdad lo siento y que sos una personita muy valiosa para mi que me gustaria seguir manteniendo en mi vida como mi novia.
8. Empecemos, asegurando de que esto no vuelva a pasar...
9. Contrato de reglas por si nos peleamos:
   - prohibido amenazar con terminar la relación.
   - prohibido la agresion fisica.
   - prohibido gritar.
   - permitido enojarse pero fijamos un horario para hablarlo mas tarde en frio.
10. En segundo lugar, quiero darte este regalito.
11. Queres una sorpresa mas?
12. *(Pantalla interactiva de la caja, sin frase.)*
13. Espero que te haya gustado mi mini app!
14. Te amo mucho muchote<3

**Ticket (literal):**

> ticket valido para pedirme lo que querias en el barrio chino. Solo valido el dia 14/11/2026

---

## Apéndice B — Assets a preparar

| Archivo | Contenido | Especificación | Estado |
|---|---|---|---|
| `assets/regalo.jpg` | Foto del regalo que ella le dio | ≤ 1600 px, ≤ 250 KB, vertical u horizontal | Pendiente del usuario |
| `assets/firma.png` | Foto de la firma de él | Fondo transparente, ≤ 600 px de ancho, ≤ 80 KB | Pendiente del usuario |
| `assets/favicon.svg` | Corazón simple | 32×32, SVG | A crear |
| `assets/fonts/*.woff2` | Fraunces + Nunito | Subset latino, `font-display: swap` | Opcional |
| `assets/regalo-placeholder.svg` | Marco con texto “Foto del regalo” | SVG liviano | Placeholder temporal |
| `assets/firma-placeholder.svg` | Firma de ejemplo | SVG liviano | Placeholder temporal |
