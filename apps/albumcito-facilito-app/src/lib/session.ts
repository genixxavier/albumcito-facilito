import { cookies } from "next/headers";

const COOKIE = "session";
const MAX_AGE = 60 * 60; // 1h, igual que la expiración del JWT

export async function setSession(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
