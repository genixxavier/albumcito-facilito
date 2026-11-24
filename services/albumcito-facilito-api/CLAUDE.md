# albumcito-facilito-api (backend)

API que gestiona álbumes de Cody, sus estampas y la colección de cada usuario. Contexto general del producto y del monorepo: ver `/CLAUDE.md`.

> Estado: solo el setup base de NestJS (módulo/controlador/servicio "Hello World"). Aún no hay dominio, base de datos ni auth.

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
Los módulos de dominio (álbumes, estampas, colección) irán en `src/<modulo>/` con su propio módulo, controlador, servicio y specs.

## Comandos
Desde este directorio (o desde la raíz con `pnpm turbo run <tarea> --filter=@albumcito/api`):
- Instalar dependencias: `pnpm install` (en la raíz)
- Servidor de desarrollo: `pnpm start:dev`
- Build: `pnpm build` (salida en `dist/`); producción: `pnpm start:prod`
- Tests unitarios: `pnpm test` (`pnpm test:watch`, `pnpm test:cov`)
- Tests e2e: `pnpm test:e2e`
- Lint: `pnpm lint`
- Formato: `pnpm format`
- Migraciones: TODO

## Convenciones
- La API es la fuente de verdad de la colección del usuario.
- Validar toda entrada en el borde de la API; devolver errores con formato consistente (TODO: definir; `class-validator`/`class-transformer` aún no están instalados).
- Cambios de contrato (rutas, payloads) se coordinan con `apps/albumcito-facilito-app/` en el mismo cambio.
- Configuración mediante variables de entorno; nunca commitear secretos. Variables actuales: `PORT` (opcional, 3000).
- Para APIs de NestJS u otras librerías, consultar la documentación vigente con context7 (v12 difiere de v11: ESM, Express 5).
