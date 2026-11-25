---
name: bdd-gherkin
description: Write BDD tests with Gherkin (.feature files) for Next.js apps and NestJS APIs using @amiceli/vitest-cucumber on top of Vitest. Use when asked to add, extend or debug BDD/Gherkin/Given-When-Then/acceptance tests, behavior specs or feature files in this monorepo (apps/albumcito-facilito-app, services/albumcito-facilito-api).
---

# BDD con Gherkin (Next.js + NestJS)

Librería: `@amiceli/vitest-cucumber@^7` (v8 exige Vitest 5; el repo usa Vitest 4). Corre sobre Vitest, sin runner extra.

## Reglas comunes

1. **Primero el `.feature`, luego los steps.** Escribe el comportamiento en Gherkin y después impleméntalo.
2. Gherkin en **español**, orientado a comportamiento de usuario/cliente, no a implementación ("recibo el estado 200", no "se llama al controlador").
3. Un `.feature` por capacidad (p. ej. `albums.feature`, `collection.feature`), con escenarios cortos e independientes.
4. **Los steps deben coincidir exactamente con el `.feature`**: nombre del escenario, texto y orden de cada Given/When/Then/And. Si no, el test falla (es intencional).
5. Parámetros en el texto: `{string}` (entre comillas), `{number}`; se reciben como argumentos tras el contexto: `(_ctx, valor) => {}`.
6. Usa `Background`, `Scenario Outline` + `Examples` y `Rule` cuando eviten duplicación.
7. Estado compartido entre steps: variables en el closure de `describeFeature`; reiníciala en `BeforeEachScenario`/`AfterEachScenario`.
8. Cada step es un test de Vitest. Un step fallido hace fallar el escenario.
9. Si dudas de la API de la librería, consulta context7 (`/amiceli/vitest-cucumber`).

## Instalación (ya hecha en ambos workspaces)

```bash
pnpm add -D @amiceli/vitest-cucumber@^7.0.0 --filter @albumcito/api --filter @albumcito/app
```

## NestJS API (`services/albumcito-facilito-api`)

| Qué | Dónde |
|---|---|
| Features | `test/features/<capacidad>.feature` |
| Steps | `test/bdd/<capacidad>.bdd-spec.ts` |
| Config | `vitest.config.bdd.ts` (include `test/bdd/**/*.bdd-spec.ts`) |
| Ejecutar | `pnpm test:bdd` (o `pnpm turbo run test:bdd --filter=@albumcito/api`) |

Es ESM: imports relativos con extensión `.js`. `loadFeature` resuelve la ruta desde la raíz del paquete.

```gherkin
Feature: Endpoint raíz de la API
  Scenario: Consultar la ruta raíz
    Given la API está en ejecución
    When hago una petición GET a "/"
    Then recibo el estado 200
    And el cuerpo de la respuesta es "Hello World!"
```

```ts
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';

const feature = await loadFeature('test/features/root.feature');

describeFeature(feature, ({ Scenario, AfterEachScenario }) => {
  let app: INestApplication<App>;
  let response: request.Response;

  AfterEachScenario(async () => { await app.close(); });

  Scenario('Consultar la ruta raíz', ({ Given, When, Then, And }) => {
    Given('la API está en ejecución', async () => {
      const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
      app = moduleRef.createNestApplication();
      await app.init();
    });
    When('hago una petición GET a {string}', async (_ctx, path: string) => {
      response = await request(app.getHttpServer()).get(path);
    });
    Then('recibo el estado {number}', (_ctx, status: number) => {
      expect(response.status).toBe(status);
    });
    And('el cuerpo de la respuesta es {string}', (_ctx, body: string) => {
      expect(response.text).toBe(body);
    });
  });
});
```

Pautas:
- Levanta la app con `Test.createTestingModule` + supertest (igual que el e2e); cierra la app en `AfterEachScenario`.
- Sustituye dependencias externas (BD, servicios) con `.overrideProvider(...)` en el Given, no con mocks dentro de los When/Then.
- Pasos de dominio reutilizables ("existe el álbum {string}") van en helpers de `test/bdd/support/`, no copiados en cada spec.
- Un cambio de contrato de la API exige actualizar también el `.feature` del frontend en el mismo cambio.

## Next.js app (`apps/albumcito-facilito-app`)

| Qué | Dónde |
|---|---|
| Features | `src/features/<capacidad>.feature` |
| Steps | `src/features/<capacidad>.feature.test.tsx` (lo recoge el include `src/**/*.test.{ts,tsx}`) |
| Ejecutar | `pnpm test:bdd` (solo features) o `pnpm test` (todo) |

Usa Testing Library + jsdom; importa con el alias `@/…`.

**Importante – limpieza del DOM:** cada step es un test, y RTL limpiaría el DOM entre steps (el `Then` vería el DOM vacío). Por eso `vitest.config.mts` define `env: { RTL_SKIP_AUTO_CLEANUP: "true" }` y cada spec debe limpiar por escenario con `AfterEachScenario(() => cleanup())`. No quites esa variable ni olvides el cleanup.

```gherkin
Feature: Página de inicio
  Scenario: Ver el título de la aplicación
    Given estoy en la página de inicio
    Then veo el encabezado "Albumcito Facilito"
```

```tsx
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen } from "@testing-library/react";
import Home from "@/app/page";

const feature = await loadFeature("src/features/home.feature");

describeFeature(feature, ({ Scenario, AfterEachScenario }) => {
  AfterEachScenario(() => { cleanup(); });

  Scenario("Ver el título de la aplicación", ({ Given, Then }) => {
    Given("estoy en la página de inicio", () => { render(<Home />); });
    Then("veo el encabezado {string}", (_ctx, title: string) => {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    });
  });
});
```

Pautas:
- Consulta por rol/texto accesible (`getByRole`, `getByLabelText`), no por clases ni test-ids salvo necesidad.
- Interacciones con `@testing-library/user-event` (instálalo si hace falta) en los When; aserciones en los Then.
- Server Components async no se renderizan directamente en jsdom: prueba sus componentes cliente/hijos o llama `await Page()` y renderiza el resultado.
- Mockea el cliente de API (módulo único de llamadas HTTP) en el Given con `vi.mock`/`vi.spyOn`; no hagas red real.
- Pantallas clave a cubrir: lista de álbumes, detalle con estampas, marcar/desmarcar estampa, resumen de faltantes.

## Checklist al añadir un feature

1. Crear/editar el `.feature` (español, comportamiento).
2. Crear el spec con `loadFeature` + `describeFeature`; nombres idénticos al `.feature`.
3. Ejecutar `pnpm test:bdd` en el workspace; luego `pnpm lint` (y `pnpm check-types` en el frontend).
4. Si cambió el contrato de la API, actualizar ambos lados.
5. Documentar en el `CLAUDE.md` del componente solo si cambian comandos o convenciones.
