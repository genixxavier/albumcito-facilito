# Design

## Context

Frontend Next.js 16 + React 19 + Tailwind v4 (`globals.css` solo importa Tailwind). Las tarjetas ya tienen `transition hover:border-indigo-500 hover:shadow-md` (`page.tsx`); `LikeButton` es cliente con `useOptimistic`; las estampas son `<li>` estáticos en `/albums/[id]` y `/[username]`. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Animaciones ligeras, solo CSS, sin librerías nuevas.
- Visor accesible reutilizable en las dos pantallas de estampas.

**Non-Goals:**
- Navegación anterior/siguiente dentro del visor, zoom/gestos, transiciones de página.
- Cambios en `/onboarding` o en la API.

## Decisions

1. **CSS (Tailwind + keyframes en `globals.css`) en vez de Framer Motion/motion.** Cubre hover, pop y fade/scale sin añadir bundle.
2. **Movimiento reducido con `motion-safe:`/`motion-reduce:` de Tailwind** y un bloque `@media (prefers-reduced-motion: reduce)` para los keyframes propios.
3. **Visor con `<dialog>` nativo + `showModal()`** en un componente cliente. Da foco contenido, fondo inerte, Escape y rol `dialog` sin código extra. Alternativa descartada: portal + librería de focus-trap (peso y complejidad).
4. **Animación del `<dialog>`**: entrada con `@starting-style` + transición de `opacity/scale`; salida con `transition-behavior: allow-discrete`. Si el navegador no lo soporta, abre/cierra sin animar (degradación aceptable).
5. **Cierre por clic en fondo**: `onClick` del `<dialog>` comparando `event.target === dialog`.
6. **Las estampas pasan a `<button>`** que abre el visor. Un componente cliente compartido (`StickerGrid`) recibe la lista serializable de estampas; las páginas siguen siendo Server Components y no duplican markup.
7. **Like pop**: clase de animación aplicada al `<span>` del corazón cuando `state.liked` es `true`; sin estado extra.

## Risks / Trade-offs

- [Animación de salida de `<dialog>` poco soportada] → Degrada a cierre inmediato; probar en Chromium y Safari actuales.
- [jsdom no implementa `showModal`] → Stubear `HTMLDialogElement.prototype.showModal/close` en `src/test/setup.ts`.
- [Estampas pasan de `<li>` estáticos a botones: cambia la semántica para tests/BDD existentes] → Actualizar selectores y verificar `home.feature` y tests de `[username]`.
- [Hover en táctil] → Los efectos son solo mejora; no ocultan información.
