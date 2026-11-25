# albumcito-facilito app (frontend)

Aplicación donde el usuario explora álbumes de Cody y marca qué estampas tiene o le faltan. Contexto general del producto: ver `/CLAUDE.md`.

> Estado: solo setup base (página de inicio con el título). Incluye /login, /signup y dashboard /[username] (JWT en cookie httpOnly `session`, ver `src/lib/session.ts` y `src/app/actions.ts`).

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
- Tests BDD (Gherkin): `pnpm test:bdd` — `src/features/*.feature` + `*.feature.test.tsx` (`@amiceli/vitest-cucumber`). Cada step es un test: RTL no limpia el DOM entre steps (`RTL_SKIP_AUTO_CLEANUP`), limpia con `AfterEachScenario(cleanup)`.
- Lint: `pnpm lint`
- Tipos: `pnpm check-types`

## Testing
Las skills `nextjs-best-practices` y `vercel-react-best-practices` no definen reglas de testing; estas pautas se derivan de sus principios (Server Components por defecto, `loading/error/not-found`, un único cliente de API):
- Testear con Testing Library por comportamiento (roles/texto visible), no por detalles de implementación; `userEvent` para interacción.
- Server Components async (`/albums/[id]/page.tsx`): no se renderizan directo con RTL de forma fiable; extraer la UI a componentes presentacionales testeables y testear el componente async invocándolo (`await Page({ params })`) o cubrirlo con BDD/e2e.
- Mockear `@/lib/api` (el único cliente HTTP) con `vi.mock`; nunca llamar a la API real. Cubrir también los estados de error: `notFound()`, `error.tsx`, `loading.tsx`.
- Solo los componentes con `"use client"` necesitan pruebas de interacción (marcar/desmarcar estampa).
- Mockear `next/navigation`, `next/image` cuando el componente los use.
- Cobertura pendiente: `page.test.tsx` fue eliminado; no hay tests para `/`, `/albums/[id]`, `error.tsx` ni `src/lib/api.ts`. Solo existe el BDD de `home.feature`.

## Convenciones
- Todo acceso a datos pasa por la API (`services/albumcito-facilito-api/`); no duplicar lógica de negocio en el cliente.
- Centralizar las llamadas HTTP en un único cliente de API.
- URL base de la API: variable `API_URL` (solo servidor, por defecto `http://localhost:3000`; ver `.env.example`). El cliente único es `src/lib/api.ts`.
- Rutas: `/onboarding` (solo `me.onboarding === false`; tras signup; elegir y añadir la primera estampa, omitible; el resto redirige a su dashboard), `/` (highlights "Estampas top" y "Álbumes más gustados" —ocultos si están vacíos o fallan—, y lista de álbumes; cada tarjeta lleva `LikeButton`, Server Action `toggleLikeAction`, sin sesión redirige a `/login`; con sesión consulta `GET /likes` sin caché) y `/albums/[id]` (estampas; `loading.tsx`, `not-found.tsx`, y `error.tsx` global).
- Micro-animaciones: solo CSS (Tailwind + keyframes/utilidades en `globals.css`, sin librerías). Hover/focus de tarjetas con `motion-safe:`; `LikeButton` hace "pop" del corazón solo al dar like (`animate-like-pop`). Todo respeta `prefers-reduced-motion`.
- Visor de estampas: `src/components/sticker-grid.tsx` (`"use client"`) renderiza las estampas de `/albums/[id]` y `/[username]` como botones que abren un `<dialog>` nativo (`showModal()`; cierra con botón, Escape o clic en el fondo, con animación de salida vía `data-closing` y devolviendo el foco). `/onboarding` no lo usa (el clic añade la estampa). jsdom no implementa `showModal/close`: se emulan en `src/test/setup.ts`.
- Por defecto, Server Components; añade `"use client"` solo donde haga falta interactividad.
- Importa con el alias `@/…` en vez de rutas relativas largas.
- Pantallas clave a cubrir: lista de álbumes, detalle de álbum con estampas, marcar/desmarcar estampa, resumen de faltantes.
- Al instalar o usar librerías, consulta documentación actual con context7 MCP (Next 16 y Tailwind 4 difieren de versiones antiguas).

## E2E (Playwright + BDD)

- `pnpm --filter @albumcito/app test:e2e` (o `pnpm turbo run test:e2e --filter=@albumcito/app`): `playwright-bdd` genera specs desde `e2e/features/*.feature` (steps en `e2e/steps/`) y Playwright levanta solo la API (puerto 3101, `JWT_SECRET=e2e-secret`, siempre limpia) y la app (3102).
- Primera vez: `pnpm exec playwright install chromium`.
- Cubre signup, login, redirects, logout y cookie `session` HttpOnly. No forma parte de `pnpm test`.
