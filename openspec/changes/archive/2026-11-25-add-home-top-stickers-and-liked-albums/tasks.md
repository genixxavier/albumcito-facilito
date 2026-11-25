# Tasks

## 1. API: likes de álbum

- [x] 1.1 Crear `LikesRepository` en memoria (`like`, `unlike`, `count`, `countAll`, `albumIdsByUser`) con test unitario de idempotencia; verificar con `pnpm turbo run test --filter=@albumcito/api`
- [x] 1.2 Crear `LikesService` y `LikesController` (`PUT`/`DELETE /albums/:id/like`, `GET /likes`) con `JwtAuthGuard`, 404 en álbum inexistente; verificar con feature/test de los escenarios de `album-likes` (like, repetido, unlike, 401, 404)
- [x] 1.3 Añadir `likeCount` a `AlbumSummary` y a `GET /albums`; verificar escenario "Álbum sin likes" y que los tests existentes de albums siguen pasando
- [x] 1.4 Registrar `LikesModule` en `app.module.ts` evitando ciclos; verificar `pnpm turbo run build lint --filter=@albumcito/api`

## 2. API: rankings

- [x] 2.1 Añadir `GET /albums/top` (declarado antes de rutas con `:id`) con `limit` por defecto 5, validado 1–20; verificar escenarios de orden, exclusión de 0 likes, vacío y `limit` inválido
- [x] 2.2 Añadir `CollectionRepository.countByStickerId()` y `GET /stickers/top` público con `albumId` y `collectorCount`; verificar con test de servicio los escenarios de orden, desempate, vacío y límite
- [x] 2.3 Actualizar `services/albumcito-facilito-api/CLAUDE.md` y la sección de contrato de `CLAUDE.md` raíz con los nuevos endpoints; verificar que los endpoints documentados coinciden con los controladores

## 3. App: home con highlights

- [x] 3.1 Añadir en `src/lib/api.ts` `getTopAlbums`, `getTopStickers`, `getMyLikes` y `likeAlbum`/`unlikeAlbum` con tipos; verificar con `pnpm turbo run check-types --filter=@albumcito/app`
- [x] 3.2 Crear Server Action `toggleLike` (redirige a `/login` sin sesión, `revalidatePath("/")`) y componente cliente `LikeButton` con `useOptimistic`; verificar con test de componente de ambos estados
- [x] 3.3 Actualizar `src/app/page.tsx` con secciones "Estampas top" y "Álbumes más gustados", degradación ante errores y estado vacío; actualizar `src/features/home.feature` y `home.feature.test.tsx` con los escenarios de `home-highlights`; verificar con `pnpm turbo run test lint --filter=@albumcito/app`
- [x] 3.4 Documentar el cambio en `apps/albumcito-facilito-app/CLAUDE.md`; verificar que describe las nuevas llamadas de la home

## 4. Integración

- [x] 4.1 Añadir escenario e2e (`e2e/features/home-highlights.feature` + steps) que da like con un usuario y ve el ranking actualizado, y verificar que pasa con API y app corriendo (puertos distintos)
- [x] 4.2 Ejecutar `pnpm turbo run build lint test check-types` desde la raíz y `openspec validate add-home-top-stickers-and-liked-albums --strict`; verificar que todo pasa
