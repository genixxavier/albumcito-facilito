import { Injectable, NotFoundException } from '@nestjs/common';
import { LikesRepository } from '../likes/likes.repository.js';
import type {
  Album,
  AlbumStickers,
  AlbumSummary,
  LikeResult,
} from './album.types.js';
import { AlbumsRepository } from './albums.repository.js';

@Injectable()
export class AlbumsService {
  constructor(
    private readonly albums: AlbumsRepository,
    private readonly likes: LikesRepository,
  ) {}

  findAll(): AlbumSummary[] {
    return this.albums.findAll().map((album) => this.toSummary(album));
  }

  findStickers(id: string): AlbumStickers {
    const album = this.requireAlbum(id);
    return { album: this.toSummary(album), stickers: album.stickers };
  }

  /** Álbumes con al menos un like, por likes desc y `id` asc. */
  top(limit: number): AlbumSummary[] {
    return this.findAll()
      .filter((album) => album.likeCount > 0)
      .sort((a, b) => b.likeCount - a.likeCount || a.id.localeCompare(b.id))
      .slice(0, limit);
  }

  like(userId: string, albumId: string): LikeResult {
    this.requireAlbum(albumId);
    this.likes.like(albumId, userId);
    return this.result(albumId, true);
  }

  unlike(userId: string, albumId: string): LikeResult {
    this.requireAlbum(albumId);
    this.likes.unlike(albumId, userId);
    return this.result(albumId, false);
  }

  private result(albumId: string, liked: boolean): LikeResult {
    return { albumId, liked, likeCount: this.likes.count(albumId) };
  }

  private requireAlbum(id: string): Album {
    const album = this.albums.findById(id);
    if (!album) {
      throw new NotFoundException(`Álbum "${id}" no encontrado`);
    }
    return album;
  }

  private toSummary({ id, title, description, stickers }: Album): AlbumSummary {
    return {
      id,
      title,
      description,
      stickerCount: stickers.length,
      likeCount: this.likes.count(id),
    };
  }
}
