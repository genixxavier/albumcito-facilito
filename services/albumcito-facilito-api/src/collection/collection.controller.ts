import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/jwt-auth.guard.js';
import { CollectionService } from './collection.service.js';
import type { Collection } from './collection.types.js';
import { AddStickerDto } from './dto/add-sticker.dto.js';

@Controller('collection')
@UseGuards(JwtAuthGuard)
export class CollectionController {
  constructor(private readonly collection: CollectionService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest): Collection {
    return this.collection.list(req.user.sub);
  }

  @Post('stickers')
  @HttpCode(200)
  add(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddStickerDto,
  ): Collection {
    return this.collection.add(req.user.sub, dto.stickerId);
  }
}
