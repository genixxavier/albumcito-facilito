# Tasks

## 1. Animaciones base y tarjetas

- [x] 1.1 Añadir en `src/app/globals.css` los keyframes `like-pop` y el bloque `prefers-reduced-motion`; verificar con `pnpm build` sin errores
- [ ] 1.2 Aplicar hover/focus animado (elevación + escala sutil, `motion-safe:`) a `AlbumCard` y a las tarjetas de "Estampas top" en `src/app/page.tsx`; verificar en `pnpm dev` (hover y Tab) y que `pnpm test:bdd` (`home.feature`) sigue pasando

## 2. Botón de me gusta

- [x] 2.1 Animar `LikeButton` (pop del corazón al pasar a liked, transición al quitar, `active:scale-95`) sin cambiar `aria-pressed`/`aria-label`; verificar con un test de Testing Library que atributos y contador son correctos al alternar
- [ ] 2.2 Verificar en el navegador con emulación `prefers-reduced-motion: reduce` que no hay transformaciones animadas

## 3. Visor de estampas

- [x] 3.1 Crear el componente cliente del visor con `<dialog>` + `showModal()`, animación de entrada/salida, cierre por botón/Escape/fondo y retorno de foco; stubear `showModal/close` en `src/test/setup.ts`; verificar con tests de interacción (abrir, Escape, fondo, rol `dialog` con nombre accesible)
- [x] 3.2 Integrar el visor en `src/app/albums/[id]/page.tsx` y `src/app/[username]/page.tsx` (estampas como botones, componente compartido); verificar que ambas páginas renderizan y que el clic abre el visor
- [x] 3.3 Confirmar que `/onboarding` no cambia: clic sigue añadiendo la estampa (tests existentes y `onboarding.feature` en verde)

## 4. Documentación e integración

- [x] 4.1 Actualizar `apps/albumcito-facilito-app/CLAUDE.md` (animaciones CSS, visor `<dialog>`, reduced-motion); verificar que el texto refleja los componentes creados
- [x] 4.2 Ejecutar `pnpm turbo run lint test check-types build --filter=@albumcito/app` y `pnpm test:bdd`; verificar que todo pasa
