import { Controller, Get, Param } from '@nestjs/common';
import type { AlbumStickers, AlbumSummary } from './album.types.js';
import { AlbumsService } from './albums.service.js';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albums: AlbumsService) {}

  @Get()
  findAll(): AlbumSummary[] {
    return this.albums.findAll();
  }

  @Get(':id/stickers')
  findStickers(@Param('id') id: string): AlbumStickers {
    return this.albums.findStickers(id);
  }
}
