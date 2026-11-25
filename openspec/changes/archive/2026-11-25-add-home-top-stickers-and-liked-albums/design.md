# Design

## Context

La API es NestJS con repositorios en memoria (`AlbumsRepository` con datos estáticos, `CollectionRepository` como `Map<userId, Map<stickerId, addedAt>>`, usuarios en memoria). `AlbumsModule` exporta `AlbumsRepository`; `CollectionModule` lo importa. La home (`apps/.../src/app/page.tsx`) es un Server Component que llama a `getAlbums()` con `revalidate: 60`. Las rutas con sesión usan cookie httpOnly `session` y Server Actions. Ver proposal.md para la motivación y specs/ para los requisitos.

## Goals / Non-Goals

**Goals:**
- Rankings públicos y baratos de calcular con los datos en memoria.
- Likes idempotentes por usuario y álbum.
- La home sigue siendo cacheable; el estado por usuario no contamina respuestas cacheadas.

**Non-Goals:**
- Persistencia en BD (la API aún no la tiene; el repositorio se aísla para sustituirlo después).
- Likes sobre estampas, rankings por periodo, paginación.

## Decisions

1. **Módulo `likes` nuevo** (`LikesRepository`, `LikesService`, `LikesController`) con `Map<albumId, Set<userId>>`. Importa `AlbumsModule` (validar existencia → 404) y `AuthModule` (guard). *Alternativa:* añadir likes dentro de `albums`; descartada para no acoplar `AlbumsRepository` (datos estáticos) a estado mutable.
2. **Rutas y dependencias (como se implementó):** `LikesModule` es un módulo hoja (`LikesRepository` + `GET /likes`, importa solo `AuthModule`). `AlbumsModule` lo importa y aloja `PUT`/`DELETE /albums/:id/like`, `GET /albums/top` y el `likeCount` del resumen, de modo que no hay ciclos. `GET /stickers/top` vive en `CollectionModule` (`StickersController`).
3. **Estampas top** calculadas en `CollectionRepository.countByStickerId()` (itera usuarios, O(usuarios × estampas)); `GET /stickers/top` en un `StickersController` dentro de `CollectionModule`, enriquecido con `albumId` mediante `AlbumsRepository`. *Alternativa:* contador incremental en `add`; descartada por duplicar estado con riesgo de desincronía; revisar cuando haya BD.
4. **Ordenación determinista:** conteo desc, `id` asc; `limit` validado 1–20 con `ParseIntPipe` + rango (400 fuera de rango), por defecto 5.
5. **Frontend:** la home pide en paralelo `getAlbums`, `getTopAlbums`, `getTopStickers` (cacheados 60 s) y, solo con sesión, `getMyLikes(token)` (`no-store`). Cada llamada de highlights se envuelve en `try/catch` para degradar (sección oculta) sin tumbar la home. El like es una Server Action (`toggleLike`) que redirige a `/login` sin sesión y llama `revalidatePath("/")`. El botón es un pequeño client component con `useOptimistic`.
6. **Sin datos por usuario en respuestas cacheables:** por eso `likedByMe` no va en `GET /albums` sino en `GET /likes`.

## Risks / Trade-offs

- [La home pasa a render dinámico al leer la cookie de sesión] → los fetch públicos conservan `revalidate: 60`; solo el listado de likes propios es `no-store`.
- [Los rankings pueden tardar hasta 60 s en reflejar cambios] → `revalidatePath("/")` en la acción de like; aceptable para estampas.
- [Likes y colecciones se pierden al reiniciar la API] → igual que usuarios hoy; el repositorio queda aislado para migrar a BD.
- [Rankings vacíos al inicio (cold start) hacen la home menos atractiva] → estado oculto/vacío definido en specs; se puede sembrar datos más adelante.
- [Cálculo O(n) por petición] → irrelevante a esta escala; cachear/contador al migrar a BD.
- [Posible dependencia circular entre módulos] → ver decisión 2; resolver con módulo hoja si aparece.

## Open Questions

- ¿Quieres mostrar likes también en la página del álbum (`/albums/[id]`)? No cambia los specs actuales; se puede añadir después con el mismo componente.
