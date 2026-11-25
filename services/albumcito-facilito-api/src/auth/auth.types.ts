export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
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
