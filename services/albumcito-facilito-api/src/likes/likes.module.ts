import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LikesController } from './likes.controller.js';
import { LikesRepository } from './likes.repository.js';

/** Módulo hoja: no depende de albums para evitar ciclos. */
@Module({
  imports: [AuthModule],
  controllers: [LikesController],
  providers: [LikesRepository],
  exports: [LikesRepository],
})
export class LikesModule {}
