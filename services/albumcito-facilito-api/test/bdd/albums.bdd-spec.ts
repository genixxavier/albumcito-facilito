import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import type {
  AlbumStickers,
  AlbumSummary,
} from '../../src/albums/album.types.js';

const feature = await loadFeature('test/features/albums.feature');

describeFeature(feature, ({ Scenario, AfterEachScenario }) => {
  let app: INestApplication<App>;
  let response: request.Response;

  const startApi = async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  };
  const get = async (path: string) => {
    response = await request(app.getHttpServer()).get(path);
  };
  const expectStatus = (status: number) => {
    expect(response.status).toBe(status);
  };

  AfterEachScenario(async () => {
    await app.close();
  });

  Scenario('Listar los álbumes', ({ Given, When, Then, And }) => {
    Given('la API está en ejecución', startApi);
    When('hago una petición GET a {string}', async (_ctx, path: string) =>
      get(path),
    );
    Then('recibo el estado {number}', (_ctx, status: number) =>
      expectStatus(status),
    );
    And('la respuesta contiene {number} álbumes', (_ctx, count: number) => {
      expect(response.body as AlbumSummary[]).toHaveLength(count);
    });
    And(
      'el álbum {string} tiene {number} estampas',
      (_ctx, title: string, count: number) => {
        const album = (response.body as AlbumSummary[]).find(
          (a) => a.title === title,
        );
        expect(album?.stickerCount).toBe(count);
      },
    );
  });

  Scenario('Ver las estampas de un álbum', ({ Given, When, Then, And }) => {
    Given('la API está en ejecución', startApi);
    When('hago una petición GET a {string}', async (_ctx, path: string) =>
      get(path),
    );
    Then('recibo el estado {number}', (_ctx, status: number) =>
      expectStatus(status),
    );
    And('el álbum de la respuesta se llama {string}', (_ctx, title: string) => {
      expect((response.body as AlbumStickers).album.title).toBe(title);
    });
    And('la respuesta contiene {number} estampas', (_ctx, count: number) => {
      expect((response.body as AlbumStickers).stickers).toHaveLength(count);
    });
    And(
      'la estampa {number} se llama {string}',
      (_ctx, number: number, name: string) => {
        const sticker = (response.body as AlbumStickers).stickers.find(
          (s) => s.number === number,
        );
        expect(sticker?.name).toBe(name);
      },
    );
  });

  Scenario('Consultar un álbum que no existe', ({ Given, When, Then }) => {
    Given('la API está en ejecución', startApi);
    When('hago una petición GET a {string}', async (_ctx, path: string) =>
      get(path),
    );
    Then('recibo el estado {number}', (_ctx, status: number) =>
      expectStatus(status),
    );
  });
});
