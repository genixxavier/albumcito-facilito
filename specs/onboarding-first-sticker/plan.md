# Plan: Onboarding — primera estampa en la misma sesión

> Basado en [spec.md](./spec.md). Fase 2 de 4. Plan de plan-mode: `~/.claude/plans/create-an-onboarding-field-partitioned-sutherland-of-746fa88b-6757-41d3-a829-acd97af9b4c8.md`.

## Decisiones técnicas
- **Persistencia:** no hay BD; `onboarding` y `createdAt` se añaden al modelo `User` y a `UsersRepository` (Map en memoria). Ciclo `null → false → true`.
- **Evento:** `@nestjs/event-emitter` (in-process) → evento `onboarding.completed` → listener que escribe log JSON con `Logger` de Nest.
- **Colección:** módulo nuevo `collection` (repo en memoria `userId → Map<stickerId, addedAt>`), endpoints protegidos con `JwtAuthGuard` existente.
- **Contrato:** cambia la API (`/auth/me` + `/collection`), por tanto backend y frontend van en el mismo cambio.

## Contrato de API
| Método | Ruta | Auth | Notas |
|---|---|---|---|
| GET | `/auth/me` | Bearer | añade `onboarding: boolean \| null` |
| POST | `/collection/stickers` | Bearer | body `{ stickerId }`; idempotente; 404 si no existe; 401 sin token |
| GET | `/collection` | Bearer | estampas del usuario |

Evento: `onboarding.completed` → `{ userId, accountCreatedAt, firstStickerAt, durationMs }`.

## Fases

### Fase 1 — Modelo y repositorio (API)
`createdAt` y `onboarding` en `User`/`PublicUser`; `UsersRepository.update`; `signup` fija `onboarding=false` y `createdAt`. Archivos: `auth/auth.types.ts`, `auth/users.repository.ts`, `auth/auth.service.ts`.

### Fase 2 — Colección (API)
Módulo `src/collection/` (repo, servicio, controlador, DTO validado), `findStickerById` en `albums/albums.repository.ts`, registro en `app.module.ts`.

### Fase 3 — Transición y evento (API)
En `CollectionService.add`: primera estampa + `onboarding===false` → `update(true)` y emitir evento. `EventEmitterModule.forRoot()` en `app.module.ts`; `src/onboarding/onboarding-metrics.listener.ts` loguea JSON.

### Fase 4 — Frontend
`lib/api.ts` (tipos + `/collection`), Server Actions para añadir estampa, ruta `/onboarding`, redirección post-signup si `onboarding===false`, dashboard con la colección, omitir.

### Fase 5 — Docs
Actualizar `CLAUDE.md` raíz y `services/albumcito-facilito-api/CLAUDE.md` (contrato, evento).

## Pruebas
- API: unit (servicio, reloj controlado con `vi.useFakeTimers`), BDD (`test/features/*.feature`), e2e (401/404/idempotencia).
- App: Vitest + Testing Library y `.feature` (BDD).
- Verificación: `pnpm turbo run lint test check-types --filter=@albumcito/api` y `--filter=@albumcito/app`; `test:bdd` y `test:e2e` en la API; prueba manual con ambos servicios en puertos distintos.

## Riesgos
- Datos en memoria: reiniciar la API borra usuarios y colecciones (aceptado, igual que hoy).
- `durationMs` depende del reloj del servidor; se calcula solo en servidor.
