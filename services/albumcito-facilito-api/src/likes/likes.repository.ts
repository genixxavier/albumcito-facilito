import { Injectable } from '@nestjs/common';

/** Likes en memoria: albumId → conjunto de userId (un like por usuario y álbum). */
@Injectable()
export class LikesRepository {
  private readonly byAlbum = new Map<string, Set<string>>();

  like(albumId: string, userId: string): void {
    const users = this.byAlbum.get(albumId) ?? new Set<string>();
    users.add(userId);
    this.byAlbum.set(albumId, users);
  }

  unlike(albumId: string, userId: string): void {
    this.byAlbum.get(albumId)?.delete(userId);
  }

  count(albumId: string): number {
    return this.byAlbum.get(albumId)?.size ?? 0;
  }

  albumIdsByUser(userId: string): string[] {
    return [...this.byAlbum]
      .filter(([, users]) => users.has(userId))
      .map(([albumId]) => albumId)
      .sort();
  }
}
