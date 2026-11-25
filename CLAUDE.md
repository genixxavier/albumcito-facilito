# albumcito-facilito

Aplicación para coleccionar álbumes de Cody y llevar el control de qué estampas (stickers) ya tiene cada usuario.

> Estado: el repositorio estaba vacío al crear estos archivos. Las secciones marcadas `TODO` deben completarse cuando exista el código; no asumas un stack hasta verificarlo.

## Componentes

| Componente | Ruta | Rol |
|---|---|---|
| API backend | `services/albumcito-facilito-api/` | Expone datos de álbumes, estampas y la colección de cada usuario; persiste el estado. |
| App frontend | `apps/albumcito-facilito-app/` | Interfaz donde el usuario ve álbumes, marca estampas que tiene y consulta las que le faltan. |

Cada componente tiene su propio `CLAUDE.md` con comandos y convenciones; consúltalo antes de trabajar en él.

## API backend (`services/albumcito-facilito-api`)

- Paquete `@albumcito/api`: NestJS 12 + TypeScript (ESM, Express 5), tests con Vitest, lint con oxlint, formato con Prettier.
- Estado: solo setup base (`GET /` responde "Hello World!"); módulo `auth` (signup/login/me con JWT, usuarios in-memory); sin base de datos todavía.
- Puerto por defecto 3000 (variable `PORT`).
- Comandos y convenciones: ver `services/albumcito-facilito-api/CLAUDE.md`.
- Tareas desde la raíz: `pnpm turbo run build|lint|test --filter=@albumcito/api`.

## App frontend (`apps/albumcito-facilito-app`)

- Paquete `@albumcito/app`: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4, tests con Vitest + Testing Library, lint con ESLint (`eslint-config-next`).
- Estado: solo setup base (página de inicio); sin cliente de API ni dominio todavía.
- Puerto por defecto de `next dev` 3000, igual que la API: al correr ambos a la vez, cambia uno (`-p`).
- Comandos y convenciones: ver `apps/albumcito-facilito-app/CLAUDE.md`.
- Tareas desde la raíz: `pnpm turbo run dev|build|lint|test|check-types --filter=@albumcito/app`.

## Cómo trabajan juntos

- El frontend es el único cliente de la API y se comunica con ella por HTTP.
- La API es la fuente de verdad del estado de la colección; el frontend no persiste datos propios más allá de caché/UI.
- Conceptos de dominio compartidos: **álbum**, **estampa**, **usuario**, **colección** (estampas que un usuario posee).
- Protocolo REST/JSON. URL base de la API: `API_URL` (app, solo servidor).
- Auth: `POST /auth/signup` (name, email, password), `POST /auth/login`, `GET /auth/me` (Bearer). La API firma un JWT (1h, `JWT_SECRET` obligatorio); el frontend lo guarda en cookie httpOnly `session` mediante Server Actions. Tras login/signup se redirige a `/<username>` (slug único derivado del nombre).

## Estructura del repositorio

```
.
├── CLAUDE.md                          # este archivo (contexto compartido)
├── package.json                       # raíz: scripts de turbo, devEngines (pnpm)
├── pnpm-workspace.yaml                # define los workspaces
├── turbo.json                         # pipeline de tareas de Turborepo
├── services/albumcito-facilito-api/   # backend  (@albumcito/api)
└── apps/albumcito-facilito-app/       # frontend (@albumcito/app)
```

## Monorepo (Turborepo + pnpm)

- Gestor de paquetes: **pnpm** (versión fijada en `devEngines.packageManager` del `package.json` raíz). No usar npm/yarn.
- Orquestador: **Turborepo** (`turbo` ^2, devDependency de la raíz).
- Workspaces (`pnpm-workspace.yaml`):
  - `apps/*`: aplicaciones cliente (hoy: `@albumcito/app`).
  - `services/*`: APIs/backends (hoy: `@albumcito/api`). Se usa `services/` (no `apis/`) por la ruta ya documentada.
- Turborepo no soporta paquetes anidados (`apps/**`): cada paquete va directamente bajo `apps/` o `services/`.
- Cada workspace tiene su `package.json` con nombre `@albumcito/<nombre>`; define ahí los scripts `dev`, `build`, `lint`, `test`, `check-types` que quiera exponer.
- Tareas en `turbo.json`: `build` (depende de `^build`, outputs `dist/**`, `.next/**`), `lint`, `check-types`, `test`, `dev` (persistente, sin caché). Ajustar `outputs` si un workspace emite en otra carpeta.

### Comandos (desde la raíz)

- Instalar: `pnpm install`
- Todo en paralelo: `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm test`
- Un solo workspace: `pnpm turbo run dev --filter=@albumcito/app`
- Añadir dependencia a un workspace: `pnpm add <pkg> --filter @albumcito/api`
- Dependencia de la raíz: `pnpm add -D <pkg> -w`
- Listar workspaces: `pnpm turbo ls`

## Reglas generales

- Cambios que alteren el contrato de la API deben actualizar backend y frontend en el mismo cambio.
- No dupliques en este archivo detalles específicos de un componente.
- TODO: convención de commits, CI.
