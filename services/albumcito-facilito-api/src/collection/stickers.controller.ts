import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { resolveLimit } from '../common/limit.js';
import { CollectionService } from './collection.service.js';
import type { TopSticker } from './collection.types.js';

@Controller('stickers')
export class StickersController {
  constructor(private readonly collection: CollectionService) {}

  @Get('top')
  top(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): TopSticker[] {
    return this.collection.top(resolveLimit(limit));
  }
}
