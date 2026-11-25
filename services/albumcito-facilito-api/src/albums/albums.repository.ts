import { Injectable } from '@nestjs/common';
import type { Album, Sticker } from './album.types.js';

function stickers(prefix: string, names: string[]) {
  return names.map((name, index) => ({
    id: `${prefix}-${index + 1}`,
    number: index + 1,
    name,
  }));
}

const ALBUMS: Album[] = [
  {
    id: 'cody-aventuras',
    title: 'Las aventuras de Cody',
    description: 'Cody explora el mundo del código por primera vez.',
    stickers: stickers('aventuras', [
      'Cody despierta',
      'Cody y su primera línea de código',
      'Cody encuentra un bug',
      'Cody celebra',
    ]),
  },
  {
    id: 'cody-espacio',
    title: 'Cody en el espacio',
    description:
      'Una misión interestelar para llevar el código a otros planetas.',
    stickers: stickers('espacio', [
      'Cody astronauta',
      'Cohete de Cody',
      'Cody en la Luna',
    ]),
  },
  {
    id: 'cody-programador',
    title: 'Cody programador',
    description: 'Todas las herramientas que usa Cody para programar.',
    stickers: stickers('programador', [
      'Cody y la terminal',
      'Cody y el editor',
      'Cody y Git',
      'Cody y los tests probados',
      'Cody despliega',
    ]),
  },
];

/** Fuente de datos en memoria; se sustituirá por una BD sin tocar el servicio. */
@Injectable()
export class AlbumsRepository {
  findAll(): Album[] {
    return ALBUMS;
  }

  findStickerById(stickerId: string): Sticker | undefined {
    return ALBUMS.flatMap((album) => album.stickers).find(
      (sticker) => sticker.id === stickerId,
    );
  }

  /** Álbum al que pertenece una estampa. */
  findAlbumIdByStickerId(stickerId: string): string | undefined {
    return ALBUMS.find((album) =>
      album.stickers.some((sticker) => sticker.id === stickerId),
    )?.id;
  }

  findById(id: string): Album | undefined {
    return ALBUMS.find((album) => album.id === id);
  }
}
