import { Injectable } from '@nestjs/common';
import type { User } from './auth.types.js';

@Injectable()
export class UsersRepository {
  private readonly users = new Map<string, User>();

  findByEmail(email: string): User | undefined {
    return [...this.users.values()].find((u) => u.email === email);
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  usernameExists(username: string): boolean {
    return [...this.users.values()].some((u) => u.username === username);
  }

  create(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  update(id: string, changes: Partial<Omit<User, 'id'>>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...changes };
    this.users.set(id, updated);
    return updated;
  }
}
