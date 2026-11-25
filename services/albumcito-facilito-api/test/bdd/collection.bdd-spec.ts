import { Test } from '@nestjs/testing';
import { Logger, ValidationPipe, type INestApplication } from '@nestjs/common';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { vi } from 'vitest';
import { AppModule } from '../../src/app.module.js';
import type { AuthResult, PublicUser } from '../../src/auth/auth.types.js';
import type { Collection } from '../../src/collection/collection.types.js';

const feature = await loadFeature('test/features/collection.feature');

describeFeature(feature, ({ Scenario, AfterEachScenario }) => {
  let app: INestApplication<App>;
  let response: request.Response;
  let logSpy: ReturnType<typeof vi.spyOn>;
  const tokens = new Map<string, string>();

  const startApi = async () => {
    tokens.clear();
    logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  };
  const existingUser = async (_ctx: unknown, email: string) => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ name: 'Ana Pérez', email, password: 'secreto123' });
    tokens.set(email, (res.body as AuthResult).accessToken);
  };
  const addSticker = async (stickerId: string, email?: string) => {
    const req = request(app.getHttpServer()).post('/collection/stickers');
    if (email) void req.set('Authorization', `Bearer ${tokens.get(email)}`);
    response = await req.send({ stickerId });
  };
  const getJson = async (path: string, email: string) =>
    request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${tokens.get(email)}`);

  AfterEachScenario(async () => {
    await app.close();
    logSpy.mockRestore();
  });

  const RUNNING = 'la API está en ejecución';
  const EXISTS = 'existe un usuario registrado con correo {string}';
  const STATUS = 'recibo el estado {number}';
  const ADD = 'añado la estampa {string} con el token de {string}';
  const ONBOARDING = 'el campo onboarding de mi perfil es {string}';
  const EVENT = 'se registró una vez el evento {string}';
  const COUNT = 'mi colección tiene {number} estampa';
  const COUNT_PLURAL = 'mi colección tiene {number} estampas';

  const expectStatus = (_c: unknown, status: number) => {
    expect(response.status).toBe(status);
  };
  const expectOnboarding = async (_c: unknown, value: string) => {
    const me = await getJson('/auth/me', 'ana@example.com');
    expect((me.body as PublicUser).onboarding).toBe(value === 'true');
  };
  const expectEvent = (_c: unknown, name: string) => {
    const calls = logSpy.mock.calls.filter(
      ([msg]) => typeof msg === 'string' && msg.includes(`"event":"${name}"`),
    );
    expect(calls).toHaveLength(1);
  };
  const expectCount = (_c: unknown, n: number) => {
    expect((response.body as Collection).stickers).toHaveLength(n);
  };

  Scenario(
    'Una cuenta nueva tiene el onboarding pendiente',
    ({ Given, When, Then, And }) => {
      Given(RUNNING, startApi);
      And(EXISTS, existingUser);
      When(
        'consulto mi perfil con el token de {string}',
        async (_c, email: string) => {
          response = await getJson('/auth/me', email);
        },
      );
      Then(ONBOARDING, (_c, v: string) => {
        expect((response.body as PublicUser).onboarding).toBe(v === 'true');
      });
    },
  );

  Scenario(
    'Añadir la primera estampa completa el onboarding',
    ({ Given, When, Then, And }) => {
      Given(RUNNING, startApi);
      And(EXISTS, existingUser);
      When(ADD, (_c, s: string, e: string) => addSticker(s, e));
      Then(STATUS, expectStatus);
      And('mi colección contiene la estampa {string}', (_c, id: string) => {
        const ids = (response.body as Collection).stickers.map((s) => s.id);
        expect(ids).toContain(id);
      });
      And(ONBOARDING, expectOnboarding);
      And(EVENT, expectEvent);
    },
  );

  Scenario(
    'Añadir una estampa repetida es idempotente',
    ({ Given, When, Then, And }) => {
      Given(RUNNING, startApi);
      And(EXISTS, existingUser);
      And(
        'ya añadí la estampa {string} con el token de {string}',
        (_c, s: string, e: string) => addSticker(s, e),
      );
      When(ADD, (_c, s: string, e: string) => addSticker(s, e));
      Then(STATUS, expectStatus);
      And(COUNT, expectCount);
      And(EVENT, expectEvent);
    },
  );

  Scenario('Añadir una estampa sin token', ({ Given, When, Then }) => {
    Given(RUNNING, startApi);
    When('añado la estampa {string} sin token', (_c, s: string) =>
      addSticker(s),
    );
    Then(STATUS, expectStatus);
  });

  Scenario('Añadir una estampa inexistente', ({ Given, When, Then, And }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    When(ADD, (_c, s: string, e: string) => addSticker(s, e));
    Then(STATUS, expectStatus);
  });

  Scenario(
    'Cada usuario tiene su propia colección',
    ({ Given, When, Then, And }) => {
      Given(RUNNING, startApi);
      And(EXISTS, existingUser);
      And('existe otro usuario con correo {string}', existingUser);
      And(
        'ya añadí la estampa {string} con el token de {string}',
        (_c, s: string, e: string) => addSticker(s, e),
      );
      When(
        'consulto la colección con el token de {string}',
        async (_c, email: string) => {
          response = await getJson('/collection', email);
        },
      );
      Then(STATUS, expectStatus);
      And(COUNT_PLURAL, expectCount);
    },
  );
});
