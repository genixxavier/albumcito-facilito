import { Module } from '@nestjs/common';
import { AlbumsModule } from './albums/albums.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [AlbumsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
