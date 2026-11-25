import { Injectable } from '@nestjs/common';

/** Colección en memoria: userId → (stickerId → ISO de cuándo se añadió). */
@Injectable()
export class CollectionRepository {
  private readonly byUser = new Map<string, Map<string, string>>();

  list(userId: string): [stickerId: string, addedAt: string][] {
    return [...(this.byUser.get(userId) ?? [])];
  }

  has(userId: string, stickerId: string): boolean {
    return this.byUser.get(userId)?.has(stickerId) ?? false;
  }

  count(userId: string): number {
    return this.byUser.get(userId)?.size ?? 0;
  }

  add(userId: string, stickerId: string, addedAt: string): void {
    const stickers = this.byUser.get(userId) ?? new Map<string, string>();
    stickers.set(stickerId, addedAt);
    this.byUser.set(userId, stickers);
  }

  /** stickerId → número de usuarios que la poseen (solo con ≥ 1). */
  countByStickerId(): Map<string, number> {
    const counts = new Map<string, number>();
    for (const stickers of this.byUser.values()) {
      for (const stickerId of stickers.keys()) {
        counts.set(stickerId, (counts.get(stickerId) ?? 0) + 1);
      }
    }
    return counts;
  }
}
