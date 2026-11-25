import { Injectable, NotFoundException } from '@nestjs/common';
import type { Album, AlbumStickers, AlbumSummary } from './album.types.js';
import { AlbumsRepository } from './albums.repository.js';

@Injectable()
export class AlbumsService {
  constructor(private readonly albums: AlbumsRepository) {}

  findAll(): AlbumSummary[] {
    return this.albums.findAll().map(toSummary);
  }

  findStickers(id: string): AlbumStickers {
    const album = this.albums.findById(id);
    if (!album) {
      throw new NotFoundException(`Álbum "${id}" no encontrado`);
    }
    return { album: toSummary(album), stickers: album.stickers };
  }
}

function toSummary({ id, title, description, stickers }: Album): AlbumSummary {
  return { id, title, description, stickerCount: stickers.length };
}
