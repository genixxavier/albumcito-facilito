export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  /** ISO 8601; momento de creación de la cuenta. */
  createdAt: string;
  /** null = sin onboarding asignado (cuenta previa); false = pendiente; true = añadió su primera estampa. */
  onboarding: boolean | null;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

export interface JwtPayload {
  sub: string;
  username: string;
}
