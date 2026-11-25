export interface Sticker {
  id: string;
  number: number;
  name: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  stickers: Sticker[];
}

/** Resumen de un álbum para listados (sin estampas). */
export interface AlbumSummary {
  id: string;
  title: string;
  description: string;
  stickerCount: number;
}

export interface AlbumStickers {
  album: AlbumSummary;
  stickers: Sticker[];
}
