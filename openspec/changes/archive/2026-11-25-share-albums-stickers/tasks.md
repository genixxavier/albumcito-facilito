# Tasks

## 1. Utilidades de compartir

- [ ] 1.1 Crear `apps/albumcito-facilito-app/src/lib/share.ts` con `buildShareLinks({ url, text })` (Facebook, X, WhatsApp, Telegram, correo) y verificar los endpoints vigentes con la documentación oficial
- [x] 1.2 Tests unitarios `share.test.ts`: cada href correcto y codificación de `&`, `#`, acentos y espacios; `pnpm turbo run test --filter=@albumcito/app` en verde

## 2. Componente de compartir

- [x] 2.1 Crear `src/components/share-button.tsx` (client) con `<dialog>` modal: título, enlaces de red con `target="_blank" rel="noopener noreferrer"`, botón "Cerrar", cierre por Escape y clic fuera, foco devuelto al botón
- [x] 2.2 Añadir "Copiar enlace" con mensaje "Enlace copiado" y fallback a campo `readOnly` si el portapapeles falla, y "Compartir con…" solo con Web Share API (ignorar `AbortError`)
- [x] 2.3 Tests con Testing Library + `userEvent` (`share-button.test.tsx`): abrir/cerrar, enlaces, copia correcta y fallida, con y sin `navigator.share`; verificar que pasan

## 3. Integración en páginas

- [x] 3.1 Añadir `ShareButton` a `AlbumCard` en `src/app/page.tsx`, fuera del `<Link>`, y verificar que no navega ni cambia el like
- [ ] 3.2 Añadir `ShareButton` al encabezado y a cada estampa en `src/app/albums/[id]/page.tsx` con `id="sticker-<id>"` y `scroll-mt`; verificar que `/albums/<id>#sticker-<id>` desplaza a la estampa
- [x] 3.3 BDD: `src/features/share.feature` + `share.feature.test.tsx` (escenarios del spec: botón en home, abrir modal, URL de estampa, copiar); `pnpm test:bdd` en verde

## 4. Documentación y verificación final

- [x] 4.1 Actualizar `apps/albumcito-facilito-app/CLAUDE.md` (componentes y limitación de Facebook en localhost) y la sección de contexto del `CLAUDE.md` raíz si aplica
- [ ] 4.2 Ejecutar `pnpm turbo run lint check-types test build --filter=@albumcito/app` y comprobar manualmente en el navegador los flujos de home y detalle (desktop y móvil)
