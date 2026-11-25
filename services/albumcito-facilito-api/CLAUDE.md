# albumcito-facilito-api (backend)

API que gestiona álbumes de Cody, sus estampas y la colección de cada usuario. Contexto general del producto y del monorepo: ver `/CLAUDE.md`.

> Estado: solo el setup base de NestJS (módulo/controlador/servicio "Hello World"). Hay módulos `albums` y `auth` (usuarios in-memory); sin base de datos todavía.

## Stack
- Framework: NestJS 12 (adaptador Express 5), TypeScript 6 estricto.
- **ESM** (`"type": "module"`, `module: nodenext`): los imports relativos llevan extensión `.js` (p. ej. `import { AppService } from './app.service.js'`). `main.ts` usa top-level await.
- Tests: Vitest (unit `*.spec.ts` en `src/`, e2e `*.e2e-spec.ts` en `test/`) + supertest.
- Lint: oxlint con reglas type-aware (`.oxlintrc.json`). Formato: Prettier (`.prettierrc`).
- Gestor de paquetes: pnpm (workspace `@albumcito/api`).
- Base de datos / ORM: TODO (no definido).

## Estructura de directorios
```
.
├── src/
│   ├── main.ts               # bootstrap (puerto: PORT, por defecto 3000)
│   ├── app.module.ts         # módulo raíz
│   ├── app.controller.ts     # GET / -> "Hello World!"
│   ├── app.service.ts
│   └── app.controller.spec.ts
├── test/app.e2e-spec.ts      # e2e con supertest
├── nest-cli.json
├── tsconfig.json / tsconfig.build.json
├── vitest.config.ts          # unit
└── vitest.config.e2e.ts      # e2e
```
Módulo `src/albums/` (repositorio en memoria → servicio → controlador): `GET /albums` (resumen con `stickerCount`) y `GET /albums/:id/stickers` (`{ album, stickers }`, 404 si no existe). Los demás módulos de dominio (colección) irán en `src/<modulo>/` con su propio módulo, controlador, servicio y specs.

## Comandos
Desde este directorio (o desde la raíz con `pnpm turbo run <tarea> --filter=@albumcito/api`):
- Instalar dependencias: `pnpm install` (en la raíz)
- Servidor de desarrollo: `pnpm start:dev`
- Build: `pnpm build` (salida en `dist/`); producción: `pnpm start:prod`
- Tests unitarios: `pnpm test` (`pnpm test:watch`, `pnpm test:cov`)
- Tests e2e: `pnpm test:e2e`
- Tests BDD (Gherkin): `pnpm test:bdd` — features en `test/features/*.feature`, steps en `test/bdd/*.bdd-spec.ts` (`@amiceli/vitest-cucumber`, config `vitest.config.bdd.ts`; los steps deben coincidir con el `.feature` o falla)
- Lint: `pnpm lint`
- Formato: `pnpm format`
- Migraciones: TODO

## Testing (skill `nestjs-best-practices`: `test-*`)
- **Unit**: `Test.createTestingModule` con providers mockeados (`useValue`/`vi.fn()`); nunca instanciar servicios con `new` ni tocar datos reales. Probar comportamiento (resultado, excepciones como `NotFoundException`), no que "se llamó al servicio".
- **E2E / BDD**: levantar `AppModule` con `createNestApplication()`, aplicar la misma config global que `main.ts` (pipes, filtros) antes de `app.init()`, y cerrar con `app.close()`. Aislar el estado entre tests (hoy el repositorio es en memoria; con DB real usar BD de test + limpieza por test).
- Mockear servicios externos (HTTP, DB, colas); cubrir errores y timeouts, no solo el camino feliz.
- Adaptación a este repo: Vitest en vez de Jest (`vi.fn`, `vi.useFakeTimers`), `import request from 'supertest'` (ESM) e imports relativos con `.js`.
- Cobertura pendiente: `src/albums/` no tiene specs unitarios (servicio: 404 si el álbum no existe; repositorio; controlador). Solo hay BDD de `GET /albums` y `GET /albums/:id/stickers`. Añadirlos junto al código como `*.spec.ts`.

## Convenciones
- La API es la fuente de verdad de la colección del usuario.
- Validar toda entrada en el borde de la API; devolver errores con formato consistente (TODO: definir; `class-validator`/`class-transformer` instalados; `ValidationPipe` global en `main.ts` (replicarlo en tests que creen la app)).
- Cambios de contrato (rutas, payloads) se coordinan con `apps/albumcito-facilito-app/` en el mismo cambio.
- Configuración mediante variables de entorno; nunca commitear secretos. Variables actuales: `PORT` (opcional, 3000).
- Para APIs de NestJS u otras librerías, consultar la documentación vigente con context7 (v12 difiere de v11: ESM, Express 5).

## Auth (`src/auth/`)

- `POST /auth/signup|login`, `GET /auth/me` (guard `JwtAuthGuard`, header `Authorization: Bearer`). Passwords con `bcryptjs`; JWT con `@nestjs/jwt`.
- Env: `JWT_SECRET` (obligatorio; ver `.env.example`). Los vitest configs de bdd/e2e lo fijan a `test-secret`.
- `User` incluye `createdAt` (ISO) y `onboarding: boolean | null` (`null` = cuenta previa, `false` al signup, `true` con la primera estampa). `/auth/me` lo expone.

## Colección y onboarding (`src/collection/`, `src/onboarding/`)

- `GET /collection` y `POST /collection/stickers` (`{ stickerId }`, responde 200 con la colección; idempotente; 404 si la estampa no existe), ambos con `JwtAuthGuard`. Repositorio en memoria (`userId → stickerId → addedAt`).
- Primera estampa de un usuario con `onboarding === false` → `onboarding = true` y `EventEmitter2` emite `onboarding.completed` `{ userId, accountCreatedAt, firstStickerAt, durationMs }`; `OnboardingMetricsListener` lo escribe como log JSON. Usuarios con `onboarding === null` no emiten.
- `@nestjs/event-emitter` (`EventEmitterModule.forRoot()` en `AppModule`).
- `username` = slug del nombre con sufijo `-2`, `-3`… y slugs reservados (`albums`, `login`, `signup`…): ver `slug.ts`.

## Likes y rankings (`src/likes/`, `src/albums/`, `src/collection/`)

- `PUT`/`DELETE /albums/:id/like` (Bearer, 200, idempotentes; 404 si el álbum no existe) → `{ albumId, liked, likeCount }`. `GET /likes` (Bearer) → `{ albumIds }`. `AlbumSummary` incluye `likeCount`.
- Públicos: `GET /albums/top` (álbumes con ≥ 1 like, por likes desc, `id` asc) y `GET /stickers/top` (estampas por nº de coleccionistas, con `albumId` y `collectorCount`). `?limit=` 1–20 (por defecto 5; 400 fuera de rango), ver `common/limit.ts`.
- `LikesModule` es un módulo hoja (solo `LikesRepository` en memoria + `GET /likes`); `AlbumsModule` lo importa y aloja las rutas de like y `top`, así no hay ciclos. BDD en `test/features/likes.feature`.
