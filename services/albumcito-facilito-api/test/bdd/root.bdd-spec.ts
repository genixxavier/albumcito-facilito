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

  AfterEachScenario(async () => {
    await app.close();
  });

  Scenario('Consultar la ruta raíz', ({ Given, When, Then, And }) => {
    Given('la API está en ejecución', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
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
