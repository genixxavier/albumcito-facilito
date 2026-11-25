import type { Sticker } from '../albums/album.types.js';

export interface CollectedSticker extends Sticker {
  /** ISO 8601; cuándo se añadió a la colección. */
  addedAt: string;
}

export interface Collection {
  stickers: CollectedSticker[];
}

/** Estampa del ranking público, con cuántos usuarios la poseen. */
export interface TopSticker extends Sticker {
  albumId: string;
  collectorCount: number;
}
