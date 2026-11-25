import { Test } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import type { AuthResult } from '../../src/auth/auth.types.js';
import type { AlbumSummary, LikeResult } from '../../src/albums/album.types.js';

const feature = await loadFeature('test/features/likes.feature');

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
  const existingUser = async (_c: unknown, email: string) => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ name: email.split('@')[0], email, password: 'secreto123' });
    tokens.set(email, (res.body as AuthResult).accessToken);
  };
  const auth = (req: request.Test, email: string) =>
    req.set('Authorization', `Bearer ${tokens.get(email)}`);
  const like = async (_c: unknown, email: string, id: string) => {
    response = await auth(
      request(app.getHttpServer()).put(`/albums/${id}/like`),
      email,
    );
  };
  const unlike = async (_c: unknown, email: string, id: string) => {
    response = await auth(
      request(app.getHttpServer()).delete(`/albums/${id}/like`),
      email,
    );
  };
  const addSticker = async (_c: unknown, email: string, stickerId: string) => {
    await auth(
      request(app.getHttpServer()).post('/collection/stickers'),
      email,
    ).send({ stickerId });
  };
  const publicGet = async (_c: unknown, path: string) => {
    response = await request(app.getHttpServer()).get(path);
  };
  const status = (_c: unknown, expected: number) => {
    expect(response.status).toBe(expected);
  };
  const likeResult = (_c: unknown, liked: string, count: number) => {
    const body = response.body as LikeResult;
    expect(body.liked).toBe(liked === 'true');
    expect(body.likeCount).toBe(count);
  };
  const ranking = (_c: unknown, ids: string) => {
    const items = response.body as { id: string }[];
    expect(items.map((i) => i.id).join(',')).toBe(ids);
  };

  AfterEachScenario(async () => {
    await app.close();
  });

  const RUNNING = 'la API está en ejecución';
  const EXISTS = 'existe un usuario registrado con correo {string}';
  const LIKE = '{string} da like al álbum {string}';
  const UNLIKE = '{string} quita el like al álbum {string}';
  const STATUS = 'recibo el estado {number}';
  const RESULT = 'la respuesta indica liked {string} con {number} likes';
  const PUBLIC_GET = 'hago una petición pública GET a {string}';
  const RANKING = 'el ranking es {string}';
  const LIKED = '{string} ya dio like al álbum {string}';
  const TWO_USERS = 'existen los usuarios {string} y {string}';
  const LIKES = 'se dan los likes {string}';
  const STICKERS = 'se añaden las estampas {string}';
  const pairs = (list: string) =>
    list.split(',').map((p) => p.split(':') as [string, string]);
  const twoUsers = async (_c: unknown, a: string, b: string) => {
    await existingUser(_c, a);
    await existingUser(_c, b);
  };
  const manyLikes = async (_c: unknown, list: string) => {
    for (const [email, id] of pairs(list)) await like(_c, email, id);
  };
  const manyStickers = async (_c: unknown, list: string) => {
    for (const [email, id] of pairs(list)) await addSticker(_c, email, id);
  };

  Scenario('Primer like a un álbum', ({ Given, And, When, Then }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    When(LIKE, like);
    Then(STATUS, status);
    And(RESULT, likeResult);
  });

  Scenario('Like repetido no suma', ({ Given, And, When, Then }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    And(LIKED, like);
    When(LIKE, like);
    Then(STATUS, status);
    And(RESULT, likeResult);
  });

  Scenario('Quitar un like', ({ Given, And, When, Then }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    And(LIKED, like);
    When(UNLIKE, unlike);
    Then(STATUS, status);
    And(RESULT, likeResult);
  });

  Scenario('Quitar un like inexistente', ({ Given, And, When, Then }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    When(UNLIKE, unlike);
    Then(STATUS, status);
    And(RESULT, likeResult);
  });

  Scenario('Like a un álbum inexistente', ({ Given, And, When, Then }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    When(LIKE, like);
    Then(STATUS, status);
  });

  Scenario('Like sin sesión', ({ Given, When, Then }) => {
    Given(RUNNING, startApi);
    When('un visitante da like al álbum {string}', async (_c, id: string) => {
      response = await request(app.getHttpServer()).put(`/albums/${id}/like`);
    });
    Then(STATUS, status);
  });

  Scenario('Mis likes', ({ Given, And, When, Then }) => {
    Given(RUNNING, startApi);
    And(EXISTS, existingUser);
    And(LIKED, like);
    When('{string} consulta sus likes', async (_c, email: string) => {
      response = await auth(request(app.getHttpServer()).get('/likes'), email);
    });
    Then(STATUS, status);
    And('mis likes son {string}', (_c, ids: string) => {
      expect((response.body as { albumIds: string[] }).albumIds.join(',')).toBe(
        ids,
      );
    });
  });

  Scenario(
    'Álbumes sin likes tienen likeCount cero',
    ({ Given, When, Then, And }) => {
      Given(RUNNING, startApi);
      When(PUBLIC_GET, publicGet);
      Then(STATUS, status);
      And('todos los álbumes tienen likeCount 0', () => {
        const albums = response.body as AlbumSummary[];
        expect(albums.length).toBeGreaterThan(0);
        expect(albums.every((a) => a.likeCount === 0)).toBe(true);
      });
    },
  );

  Scenario('Ranking de álbumes más gustados', ({ Given, And, When, Then }) => {
    Given(RUNNING, startApi);
    And(TWO_USERS, twoUsers);
    And(LIKES, manyLikes);
    When(PUBLIC_GET, publicGet);
    Then(STATUS, status);
    And(RANKING, ranking);
  });

  Scenario('Ranking de álbumes vacío', ({ Given, When, Then, And }) => {
    Given(RUNNING, startApi);
    When(PUBLIC_GET, publicGet);
    Then(STATUS, status);
    And(RANKING, ranking);
  });

  Scenario(
    'Límite inválido en el ranking de álbumes',
    ({ Given, When, Then }) => {
      Given(RUNNING, startApi);
      When(PUBLIC_GET, publicGet);
      Then(STATUS, status);
    },
  );

  Scenario('Ranking de estampas top', ({ Given, And, When, Then }) => {
    Given(RUNNING, startApi);
    And(TWO_USERS, twoUsers);
    And(STICKERS, manyStickers);
    When(PUBLIC_GET, publicGet);
    Then(STATUS, status);
    And(RANKING, ranking);
  });

  Scenario('Ranking de estampas vacío', ({ Given, When, Then, And }) => {
    Given(RUNNING, startApi);
    When(PUBLIC_GET, publicGet);
    Then(STATUS, status);
    And(RANKING, ranking);
  });

  Scenario(
    'Límite inválido en el ranking de estampas',
    ({ Given, When, Then }) => {
      Given(RUNNING, startApi);
      When(PUBLIC_GET, publicGet);
      Then(STATUS, status);
    },
  );
});
