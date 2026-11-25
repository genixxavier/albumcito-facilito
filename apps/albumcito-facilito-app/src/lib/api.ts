import { cache } from "react";

export interface AlbumSummary {
  id: string;
  title: string;
  description: string;
  stickerCount: number;
  likeCount: number;
}

export interface Sticker {
  id: string;
  number: number;
  name: string;
}

export interface AlbumStickers {
  album: AlbumSummary;
  stickers: Sticker[];
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  username: string;
  /** null = sin onboarding asignado; false = pendiente; true = ya añadió su primera estampa. */
  onboarding: boolean | null;
}

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

export type AuthResponse = { ok: true; data: AuthResult } | { ok: false; error: string };

const API_URL = process.env.API_URL ?? "http://localhost:3000";

/** Único punto de acceso HTTP a la API (solo se usa desde el servidor). */
async function apiFetch(path: string): Promise<Response> {
  return fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
}

export async function getAlbums(): Promise<AlbumSummary[]> {
  const res = await apiFetch("/albums");
  if (!res.ok) throw new Error(`No se pudieron cargar los álbumes (${res.status})`);
  return res.json();
}

/** Devuelve `null` si el álbum no existe. Deduplicado por request con `cache`. */
export const getAlbumStickers = cache(async (id: string): Promise<AlbumStickers | null> => {
  const res = await apiFetch(`/albums/${encodeURIComponent(id)}/stickers`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`No se pudieron cargar las estampas (${res.status})`);
  return res.json();
});

async function authPost(path: string, body: object): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (res.ok) return { ok: true, data: await res.json() };
  const payload = await res.json().catch(() => ({}));
  const message = Array.isArray(payload.message) ? payload.message[0] : payload.message;
  return { ok: false, error: message ?? "No se pudo completar la solicitud" };
}

export const signup = (input: { name: string; email: string; password: string }) =>
  authPost("/auth/signup", input);

export const login = (input: { email: string; password: string }) =>
  authPost("/auth/login", input);

/** Devuelve `null` si el token es inválido o expiró. */
export async function getMe(token: string): Promise<PublicUser | null> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`No se pudo cargar el perfil (${res.status})`);
  return res.json();
}

export interface CollectedSticker extends Sticker {
  addedAt: string;
}

export interface Collection {
  stickers: CollectedSticker[];
}

export type CollectionResponse =
  | { ok: true; data: Collection }
  | { ok: false; status: number; error: string };

async function collectionRequest(
  token: string,
  path: string,
  init: { method?: string; body?: object } = {},
): Promise<CollectionResponse> {
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  if (res.ok) return { ok: true, data: await res.json() };
  const payload = await res.json().catch(() => ({}));
  const message = Array.isArray(payload.message) ? payload.message[0] : payload.message;
  return { ok: false, status: res.status, error: message ?? "No se pudo completar la solicitud" };
}

export const getCollection = (token: string) => collectionRequest(token, "/collection");

/** Idempotente: añadir una estampa que ya se posee no falla. */
export const addToCollection = (token: string, stickerId: string) =>
  collectionRequest(token, "/collection/stickers", { method: "POST", body: { stickerId } });

export interface TopSticker extends Sticker {
  albumId: string;
  collectorCount: number;
}

export interface LikeResult {
  albumId: string;
  liked: boolean;
  likeCount: number;
}

/** Rankings públicos: se cachean con el mismo `revalidate` que el listado. */
export async function getTopAlbums(): Promise<AlbumSummary[]> {
  const res = await apiFetch("/albums/top");
  if (!res.ok) throw new Error(`No se pudo cargar el ranking de álbumes (${res.status})`);
  return res.json();
}

export async function getTopStickers(): Promise<TopSticker[]> {
  const res = await apiFetch("/stickers/top");
  if (!res.ok) throw new Error(`No se pudo cargar el ranking de estampas (${res.status})`);
  return res.json();
}

/** Ids de álbumes con like del usuario; `null` si el token es inválido o expiró. */
export async function getMyLikes(token: string): Promise<string[] | null> {
  const res = await fetch(`${API_URL}/likes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`No se pudieron cargar los likes (${res.status})`);
  return ((await res.json()) as { albumIds: string[] }).albumIds;
}

export type LikeResponse =
  | { ok: true; data: LikeResult }
  | { ok: false; status: number; error: string };

/** Idempotente: `PUT` da like y `DELETE` lo quita. */
export async function setAlbumLike(
  token: string,
  albumId: string,
  liked: boolean,
): Promise<LikeResponse> {
  const res = await fetch(`${API_URL}/albums/${encodeURIComponent(albumId)}/like`, {
    method: liked ? "PUT" : "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.ok) return { ok: true, data: await res.json() };
  const payload = await res.json().catch(() => ({}));
  const message = Array.isArray(payload.message) ? payload.message[0] : payload.message;
  return { ok: false, status: res.status, error: message ?? "No se pudo completar la solicitud" };
}
