import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlbumsRepository } from '../albums/albums.repository.js';
import { UsersRepository } from '../auth/users.repository.js';
import {
  ONBOARDING_COMPLETED,
  type OnboardingCompletedEvent,
} from '../onboarding/onboarding.events.js';
import { CollectionRepository } from './collection.repository.js';
import type { Collection, TopSticker } from './collection.types.js';

@Injectable()
export class CollectionService {
  constructor(
    private readonly collection: CollectionRepository,
    private readonly albums: AlbumsRepository,
    private readonly users: UsersRepository,
    private readonly events: EventEmitter2,
  ) {}

  list(userId: string): Collection {
    const stickers = this.collection.list(userId).flatMap(([id, addedAt]) => {
      const sticker = this.albums.findStickerById(id);
      return sticker ? [{ ...sticker, addedAt }] : [];
    });
    return { stickers };
  }

  /** Idempotente. La primera estampa completa el onboarding y emite el evento. */
  add(userId: string, stickerId: string): Collection {
    const user = this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    if (!this.albums.findStickerById(stickerId)) {
      throw new NotFoundException(`Estampa "${stickerId}" no encontrada`);
    }
    if (this.collection.has(userId, stickerId)) return this.list(userId);

    const isFirst = this.collection.count(userId) === 0;
    const now = new Date();
    this.collection.add(userId, stickerId, now.toISOString());

    if (isFirst && user.onboarding === false) {
      this.users.update(userId, { onboarding: true });
      const event: OnboardingCompletedEvent = {
        userId,
        accountCreatedAt: user.createdAt,
        firstStickerAt: now.toISOString(),
        durationMs: now.getTime() - new Date(user.createdAt).getTime(),
      };
      this.events.emit(ONBOARDING_COMPLETED, event);
    }
    return this.list(userId);
  }

  /** Estampas más coleccionadas: conteo desc, `id` asc; excluye las de 0. */
  top(limit: number): TopSticker[] {
    return [...this.collection.countByStickerId()]
      .flatMap(([id, collectorCount]) => {
        const sticker = this.albums.findStickerById(id);
        const albumId = this.albums.findAlbumIdByStickerId(id);
        return sticker && albumId
          ? [{ ...sticker, albumId, collectorCount }]
          : [];
      })
      .sort(
        (a, b) =>
          b.collectorCount - a.collectorCount || a.id.localeCompare(b.id),
      )
      .slice(0, limit);
  }
}
