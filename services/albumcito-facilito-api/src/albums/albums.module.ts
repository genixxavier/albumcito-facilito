import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LikesModule } from '../likes/likes.module.js';
import { AlbumsController } from './albums.controller.js';
import { AlbumsRepository } from './albums.repository.js';
import { AlbumsService } from './albums.service.js';

@Module({
  imports: [AuthModule, LikesModule],
  controllers: [AlbumsController],
  providers: [AlbumsService, AlbumsRepository],
  exports: [AlbumsRepository],
})
export class AlbumsModule {}
