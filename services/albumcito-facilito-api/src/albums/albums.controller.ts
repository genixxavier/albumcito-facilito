import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/jwt-auth.guard.js';
import { resolveLimit } from '../common/limit.js';
import type { AlbumStickers, AlbumSummary, LikeResult } from './album.types.js';
import { AlbumsService } from './albums.service.js';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albums: AlbumsService) {}

  @Get()
  findAll(): AlbumSummary[] {
    return this.albums.findAll();
  }

  @Get('top')
  top(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): AlbumSummary[] {
    return this.albums.top(resolveLimit(limit));
  }

  @Get(':id/stickers')
  findStickers(@Param('id') id: string): AlbumStickers {
    return this.albums.findStickers(id);
  }

  @Put(':id/like')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  like(@Req() req: AuthenticatedRequest, @Param('id') id: string): LikeResult {
    return this.albums.like(req.user.sub, id);
  }

  @Delete(':id/like')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  unlike(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): LikeResult {
    return this.albums.unlike(req.user.sub, id);
  }
}
