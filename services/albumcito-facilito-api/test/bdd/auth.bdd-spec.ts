import { Test } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import type { AuthResult, PublicUser } from '../../src/auth/auth.types.js';

const feature = await loadFeature('test/features/auth.feature');

describeFeature(feature, ({ Scenario, AfterEachScenario }) => {
  let app: INestApplication<App>;
  let response: request.Response;
  const tokens = new Map<string, string>();

  const startApi = async () => {
    tokens.clear();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  };
  const post = async (path: string, body: object) =>
    request(app.getHttpServer()).post(path).send(body);
  const signup = async (name: string, email: string, password: string) => {
    response = await post('/auth/signup', { name, email, password });
  };
  const existingUser = async (_ctx: unknown, email: string) => {
    const res = await post('/auth/signup', {
      name: 'Ana Pérez',
      email,
      password: 'secreto123',
    });
    tokens.set(email, (res.body as AuthResult).accessToken);
  };
  const expectStatus = (status: number) => {
    expect(response.status).toBe(status);
  };

  AfterEachScenario(async () => {
    await app.close();
  });

  const SIGNUP =
    'me registro con nombre {string}, correo {string} y contraseña {string}';
  const LOGIN = 'inicio sesión con correo {string} y contraseña {string}';
  const TOKEN_USER = 'la respuesta incluye un token y el usuario {string}';
  const STATUS = 'recibo el estado {number}';
  const EXISTS = 'existe un usuario registrado con correo {string}';
  const RUNNING = 'la API está en ejecución';

  const tokenAndUser = (_ctx: unknown, username: string) => {
    const body = response.body as AuthResult;
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.user.username).toBe(username);
  };

  Scenario('Registro exitoso', ({ Given, When, Then, And }) => {
    Given(RUNNING, startApi);
    When(SIGNUP, (_c, n: string, e: string, p: string) => signup(n, e, p));
    Then(STATUS, (_c, s: number) => expectStatus(s));
    And(TOKEN_USER, tokenAndUser);
    And('la respuesta no expone la contraseña', () => {
      expect(JSON.stringify(response.body)).not.toMatch(/password/i);
    });
  });

  Scenario('Registro con correo duplicado', ({ Given, When, Then, And }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    When(SIGNUP, (_c, n: string, e: string, p: string) => signup(n, e, p));
    Then(STATUS, (_c, s: number) => expectStatus(s));
  });

  Scenario('Registro con contraseña corta', ({ Given, When, Then }) => {
    Given(RUNNING, startApi);
    When(SIGNUP, (_c, n: string, e: string, p: string) => signup(n, e, p));
    Then(STATUS, (_c, s: number) => expectStatus(s));
  });

  Scenario('Dos usuarios con el mismo nombre', ({ Given, When, Then, And }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    When(SIGNUP, (_c, n: string, e: string, p: string) => signup(n, e, p));
    Then(STATUS, (_c, s: number) => expectStatus(s));
    And(TOKEN_USER, tokenAndUser);
  });

  Scenario('Inicio de sesión exitoso', ({ Given, When, Then, And }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    When(LOGIN, async (_c, e: string, p: string) => {
      response = await post('/auth/login', { email: e, password: p });
    });
    Then(STATUS, (_c, s: number) => expectStatus(s));
    And(TOKEN_USER, tokenAndUser);
  });

  Scenario(
    'Inicio de sesión con contraseña incorrecta',
    ({ Given, When, Then, And }) => {
      Given(RUNNING, startApi);
      And(EXISTS, existingUser);
      When(LOGIN, async (_c, e: string, p: string) => {
        response = await post('/auth/login', { email: e, password: p });
      });
      Then(STATUS, (_c, s: number) => expectStatus(s));
    },
  );

  Scenario('Consultar el perfil con token', ({ Given, When, Then, And }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    When(
      'consulto mi perfil con el token de {string}',
      async (_c, e: string) => {
        response = await request(app.getHttpServer())
          .get('/auth/me')
          .set('Authorization', `Bearer ${tokens.get(e)}`);
      },
    );
    Then(STATUS, (_c, s: number) => expectStatus(s));
    And('el perfil de la respuesta es el usuario {string}', (_c, u: string) => {
      expect((response.body as PublicUser).username).toBe(u);
    });
  });

  Scenario('Consultar el perfil sin token', ({ Given, When, Then }) => {
    Given(RUNNING, startApi);
    When('hago una petición GET a {string}', async (_c, path: string) => {
      response = await request(app.getHttpServer()).get(path);
    });
    Then(STATUS, (_c, s: number) => expectStatus(s));
  });
});
