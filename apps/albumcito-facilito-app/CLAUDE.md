# albumcito-facilito app (frontend)

Aplicación donde el usuario explora álbumes de Cody y marca qué estampas tiene o le faltan. Contexto general del producto: ver `/CLAUDE.md`.

> Estado: solo setup base (página de inicio con el título). Sin dominio, cliente de API ni auth todavía.

## Stack
- Framework: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript (strict)
- Estilos: Tailwind CSS v4 (`@import "tailwindcss"` en `src/app/globals.css`, plugin PostCSS `@tailwindcss/postcss`; sin `tailwind.config`)
- Estado / data fetching: TODO
- Gestor de paquetes: pnpm (workspace `@albumcito/app`)
- Tests: Vitest + jsdom + Testing Library (`@testing-library/react`, `jest-dom`)
- Lint: ESLint 10 flat config con `eslint-config-next` (core-web-vitals + typescript). En Next 16 ya no existe `next lint`.

## Estructura de directorios
```
.
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── vitest.config.mts          # jsdom, globals, alias vía tsconfig paths
├── tsconfig.json              # alias "@/*" -> "./src/*"
└── src/
    ├── app/                   # rutas (App Router): layout.tsx, page.tsx, globals.css
    └── test/setup.ts          # setup de Vitest (jest-dom)
```
Los tests viven junto al código como `*.test.ts(x)` dentro de `src/`.

## Comandos
Desde la raíz usa `pnpm turbo run <tarea> --filter=@albumcito/app`; dentro de este directorio:
- Instalar dependencias: `pnpm install` (en la raíz)
- Servidor de desarrollo: `pnpm dev` (http://localhost:3000; si la API usa también 3000, arranca uno con `-p <puerto>`)
- Build: `pnpm build`
- Producción local: `pnpm start`
- Tests: `pnpm test` (una vez) / `pnpm test:watch`
- Lint: `pnpm lint`
- Tipos: `pnpm check-types`

## Convenciones
- Todo acceso a datos pasa por la API (`services/albumcito-facilito-api/`); no duplicar lógica de negocio en el cliente.
- Centralizar las llamadas HTTP en un único cliente de API.
- URL base de la API vía variable de entorno. TODO: nombre de la variable (las expuestas al navegador deben empezar con `NEXT_PUBLIC_`).
- Por defecto, Server Components; añade `"use client"` solo donde haga falta interactividad.
- Importa con el alias `@/…` en vez de rutas relativas largas.
- Pantallas clave a cubrir: lista de álbumes, detalle de álbum con estampas, marcar/desmarcar estampa, resumen de faltantes.
- Al instalar o usar librerías, consulta documentación actual con context7 MCP (Next 16 y Tailwind 4 difieren de versiones antiguas).
