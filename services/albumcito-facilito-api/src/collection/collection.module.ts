import { Module } from '@nestjs/common';
import { AlbumsModule } from '../albums/albums.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CollectionController } from './collection.controller.js';
import { CollectionRepository } from './collection.repository.js';
import { CollectionService } from './collection.service.js';
import { StickersController } from './stickers.controller.js';

@Module({
  imports: [AuthModule, AlbumsModule],
  controllers: [CollectionController, StickersController],
  providers: [CollectionService, CollectionRepository],
})
export class CollectionModule {}
