# Proposal

## Why

La home solo lista álbumes de forma estática, sin señales sociales. Mostrar las estampas más populares y los álbumes que más gustan da a los visitantes una razón para explorar, registrarse y volver, y genera engagement.

## What Changes

- La home muestra dos secciones nuevas sobre el listado de álbumes: **Estampas top** y **Álbumes más gustados**.
- Nueva acción "me gusta" sobre un álbum: un usuario autenticado puede dar y quitar like (idempotente, un like por usuario y álbum).
- Nuevos endpoints públicos `GET /albums/top` (ranking de álbumes por likes) y `GET /stickers/top` (ranking de estampas); `PUT`/`DELETE /albums/:id/like` y `GET /likes` (Bearer) para dar, quitar y consultar likes propios.
- "Estampa top" = la que está en más colecciones de usuarios (derivado de `CollectionRepository`; no requiere likes sobre estampas).
- Los rankings se limitan a N elementos (por defecto 5), con desempate determinista y se omiten si no hay datos (estado vacío sin romper la home).
- El resumen de álbum (`AlbumSummary`) expone `likeCount`; el estado "me gusta" del usuario se obtiene aparte con `GET /likes` para no mezclar datos por usuario con respuestas cacheables.

### Supuestos (a confirmar en revisión)

- "Liked" aplica a **álbumes**; las estampas se rankean por popularidad de colección, no por likes.
- Likes en memoria, igual que usuarios y colección (la API aún no tiene BD).
- Visitantes anónimos ven los rankings pero deben iniciar sesión para dar like.
- Fuera de alcance: likes sobre estampas, comentarios, rankings por periodo, ranking por usuario.

## Capabilities

### New Capabilities
- `album-likes`: dar/quitar like a un álbum y exponer el conteo y el estado "me gusta" por usuario.
- `home-highlights`: rankings públicos de estampas top y álbumes más gustados mostrados en la home.

### Modified Capabilities
<!-- Ninguna: no existen specs previos en openspec/specs/. -->

## Impact

- API (`services/albumcito-facilito-api`): nuevo módulo de likes (repositorio en memoria, controlador con JwtAuthGuard para escribir), endpoints de ranking en `albums` y estampas top calculadas desde `collection`; `AlbumSummary` gana campos.
- App (`apps/albumcito-facilito-app`): `src/app/page.tsx`, `src/lib/api.ts`, Server Action de like, componentes de secciones y botón de like.
- Contrato API cambia: backend y frontend deben actualizarse en el mismo cambio; actualizar los `CLAUDE.md` correspondientes.
- Cacheo: la home usa `revalidate: 60`; los rankings pueden tardar hasta 60 s en reflejarse.
