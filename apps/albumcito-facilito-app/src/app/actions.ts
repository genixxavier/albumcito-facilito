"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addToCollection, login, setAlbumLike, signup, type AuthResponse } from "@/lib/api";
import { clearSession, getSession, setSession } from "@/lib/session";

export interface FormState {
  error?: string;
  /** Valores enviados, para repoblar el formulario (React 19 lo resetea tras la acción). */
  values?: { name?: string; email?: string };
}

const field = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function finish(
  result: AuthResponse,
  values: FormState["values"],
  destination: (username: string) => string,
): Promise<FormState> {
  if (!result.ok) return { error: result.error, values };
  await setSession(result.data.accessToken);
  redirect(destination(result.data.user.username));
}

export async function signupAction(_prev: FormState, data: FormData): Promise<FormState> {
  const values = { name: field(data, "name"), email: field(data, "email") };
  return finish(
    await signup({ name: values.name!, email: values.email!, password: String(data.get("password") ?? "") }),
    values,
    () => "/onboarding", // las cuentas nuevas empiezan por añadir su primera estampa
  );
}

export async function loginAction(_prev: FormState, data: FormData): Promise<FormState> {
  const values = { email: field(data, "email") };
  return finish(
    await login({ ...values, password: String(data.get("password") ?? "") }),
    values,
    (username) => `/${username}`,
  );
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export interface AddStickerState {
  error?: string;
  /** Nombre de la última estampa añadida con éxito. */
  added?: string;
}

export async function addStickerAction(
  _prev: AddStickerState,
  data: FormData,
): Promise<AddStickerState> {
  const token = await getSession();
  if (!token) redirect("/login");

  const stickerId = field(data, "stickerId");
  const stickerName = field(data, "stickerName");
  const result = await addToCollection(token, stickerId);
  if (!result.ok) {
    if (result.status === 401) redirect("/login");
    return { error: result.error };
  }
  return { added: stickerName };
}

/** Da o quita like a un álbum. Sin sesión (o con sesión expirada) lleva a `/login`. */
export async function toggleLikeAction(data: FormData): Promise<void> {
  const token = await getSession();
  if (!token) redirect("/login");

  const result = await setAlbumLike(token, field(data, "albumId"), field(data, "like") === "true");
  if (!result.ok && result.status === 401) redirect("/login");
  revalidatePath("/");
}
