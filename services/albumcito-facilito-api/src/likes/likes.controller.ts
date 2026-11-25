import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/jwt-auth.guard.js';
import { LikesRepository } from './likes.repository.js';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likes: LikesRepository) {}

  @Get()
  mine(@Req() req: AuthenticatedRequest): { albumIds: string[] } {
    return { albumIds: this.likes.albumIdsByUser(req.user.sub) };
  }
}
