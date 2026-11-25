import { cache } from "react";

export interface AlbumSummary {
  id: string;
  title: string;
  description: string;
  stickerCount: number;
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
