import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { AuthResult, JwtPayload, PublicUser, User } from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SignupDto } from './dto/signup.dto.js';
import { uniqueSlug } from './slug.js';
import { UsersRepository } from './users.repository.js';

const toPublic = ({ passwordHash: _omit, ...user }: User): PublicUser => user;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    if (this.users.findByEmail(email)) {
      throw new ConflictException('El correo ya está registrado');
    }
    const user = this.users.create({
      id: randomUUID(),
      name: dto.name.trim(),
      email,
      username: uniqueSlug(dto.name, (s) => this.users.usernameExists(s)),
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    return this.issue(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = this.users.findByEmail(dto.email.trim().toLowerCase());
    const ok = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.issue(user);
  }

  me(userId: string): PublicUser {
    const user = this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return toPublic(user);
  }

  private async issue(user: User): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: toPublic(user),
    };
  }
}
