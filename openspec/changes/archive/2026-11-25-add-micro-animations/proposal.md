# Proposal

## Why

La interfaz es funcional pero estática: las tarjetas, el botón de "me gusta" y las estampas no dan retroalimentación visual al interactuar, y las estampas solo se ven como mosaicos pequeños. Micro-animaciones y una vista ampliada de la estampa hacen la app más viva y permiten apreciar el arte de Cody.

## What Changes

- Micro-animación de hover/focus en las tarjetas de álbum (home y secciones top) y en las tarjetas de "Estampas top".
- Micro-animación en `LikeButton`: "pop" del corazón al dar like, transición suave al quitarlo y feedback de pulsación.
- Al hacer clic en una estampa (detalle de álbum `/albums/[id]` y colección `/[username]`) se abre una vista ampliada (lightbox modal) con animación de entrada/salida; se cierra con botón, Escape o clic en el fondo.
- Todas las animaciones respetan `prefers-reduced-motion`.
- Sin cambios en la API ni dependencias nuevas.

## Capabilities

### New Capabilities
- `interaction-animations`: retroalimentación animada de hover/focus en tarjetas y de estado en el botón de me gusta, con soporte de movimiento reducido.
- `sticker-viewer`: vista ampliada modal de una estampa al hacer clic sobre ella.

### Modified Capabilities

(ninguna: `album-likes` y `home-highlights` describen contrato de API/datos, que no cambia)

## Impact

- Frontend `apps/albumcito-facilito-app`: `src/components/like-button.tsx`, `src/app/page.tsx` (tarjetas), `src/app/albums/[id]/page.tsx` y `src/app/[username]/page.tsx` (estampas), `src/app/globals.css` (keyframes/utilidades), nuevo componente cliente del visor.
- `onboarding-picker` queda fuera: allí el clic ya significa "añadir estampa".
- Sin impacto en la API, contratos ni dependencias.
