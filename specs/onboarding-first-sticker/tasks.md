# Tasks: Onboarding — primera estampa en la misma sesión

> Basado en [plan.md](./plan.md). Fase 3 de 4. Implementado; todas las tareas marcadas.

## Fase 1 — Modelo y repositorio (API)
- [x] 1.1 Añadir `createdAt: string` y `onboarding: boolean | null` a `User`/`PublicUser` (`auth/auth.types.ts`)
- [x] 1.2 Añadir `UsersRepository.update` (`auth/users.repository.ts`)
- [x] 1.3 `signup` guarda `createdAt` y `onboarding = false` (`auth/auth.service.ts`)
- [x] 1.4 Tests: unit del servicio + escenario BDD en `auth.feature` (`/auth/me` devuelve `onboarding=false`)

## Fase 2 — Colección (API)
- [x] 2.1 `findStickerById` en `albums/albums.repository.ts`
- [x] 2.2 `src/collection/`: repositorio en memoria, servicio, DTO validado
- [x] 2.3 Controlador `POST /collection/stickers` y `GET /collection` con `JwtAuthGuard`
- [x] 2.4 Registrar `CollectionModule` en `app.module.ts`
- [x] 2.5 Tests BDD/e2e: 401 sin token, 404 estampa inexistente, idempotencia, aislamiento entre usuarios

## Fase 3 — Transición y evento (API)
- [x] 3.1 Instalar `@nestjs/event-emitter` y registrar `EventEmitterModule.forRoot()`
- [x] 3.2 En `CollectionService.add`: primera estampa + `onboarding === false` → `onboarding = true` y emitir `onboarding.completed` con `durationMs`
- [x] 3.3 `OnboardingMetricsListener` que escribe el evento como log JSON
- [x] 3.4 Tests: emite una vez, `durationMs` correcto (fake timers), no emite si `onboarding === null`, segunda estampa no re-emite

## Fase 4 — Frontend
- [x] 4.1 `lib/api.ts`: `onboarding` en `PublicUser` y funciones de `/collection`
- [x] 4.2 Server Action para añadir estampa (Bearer desde cookie `session`; token expirado → `/login`)
- [x] 4.3 Ruta `/onboarding`: lista de álbumes, estampas, añadir, confirmación y CTA a `/<username>`
- [x] 4.4 Opción de omitir el onboarding
- [x] 4.5 Redirigir a `/onboarding` tras signup si `onboarding === false`; login va directo al dashboard
- [x] 4.6 Dashboard `/<username>` muestra la colección
- [x] 4.7 Tests Vitest + Testing Library y `.feature` del flujo

## Fase 5 — Docs y verificación
- [x] 5.1 Actualizar `CLAUDE.md` raíz y `services/albumcito-facilito-api/CLAUDE.md` (contrato y evento)
- [x] 5.2 `pnpm turbo run lint test check-types` para `@albumcito/api` y `@albumcito/app`; `test:bdd` y `test:e2e` en la API
- [x] 5.3 Prueba manual end-to-end: signup → añadir estampa → log `onboarding.completed`
