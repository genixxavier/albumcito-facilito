"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";

interface Props {
  mode: "login" | "signup";
  action: (prev: FormState, data: FormData) => Promise<FormState>;
}

const INPUT = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2";

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">{isSignup ? "Crear cuenta" : "Iniciar sesión"}</h1>
      <form action={formAction} className="mt-6 space-y-4">
        {isSignup && (
          <label className="block text-sm font-medium">
            Nombre
            <input
              name="name"
              type="text"
              required
              maxLength={80}
              autoComplete="name"
              defaultValue={state.values?.name}
              className={INPUT}
            />
          </label>
        )}
        <label className="block text-sm font-medium">
          Correo
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state.values?.email}
            className={INPUT}
          />
        </label>
        <label className="block text-sm font-medium">
          Contraseña
          <input
            name="password"
            type="password"
            required
            minLength={isSignup ? 8 : undefined}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className={INPUT}
          />
        </label>
        {state.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSignup ? "Registrarme" : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        {isSignup ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-indigo-600 underline">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="text-indigo-600 underline">
              Regístrate
            </Link>
          </>
        )}
      </p>
    </main>
  );
}
