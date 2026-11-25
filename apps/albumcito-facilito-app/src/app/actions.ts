"use server";

import { redirect } from "next/navigation";
import { login, signup, type AuthResponse } from "@/lib/api";
import { clearSession, setSession } from "@/lib/session";

export interface FormState {
  error?: string;
  /** Valores enviados, para repoblar el formulario (React 19 lo resetea tras la acción). */
  values?: { name?: string; email?: string };
}

const field = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function finish(
  result: AuthResponse,
  values: FormState["values"],
): Promise<FormState> {
  if (!result.ok) return { error: result.error, values };
  await setSession(result.data.accessToken);
  redirect(`/${result.data.user.username}`);
}

export async function signupAction(_prev: FormState, data: FormData): Promise<FormState> {
  const values = { name: field(data, "name"), email: field(data, "email") };
  return finish(
    await signup({ name: values.name!, email: values.email!, password: String(data.get("password") ?? "") }),
    values,
  );
}

export async function loginAction(_prev: FormState, data: FormData): Promise<FormState> {
  const values = { email: field(data, "email") };
  return finish(await login({ ...values, password: String(data.get("password") ?? "") }), values);
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
