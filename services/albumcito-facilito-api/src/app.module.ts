import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AlbumsModule } from './albums/albums.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CollectionModule } from './collection/collection.module.js';
import { LikesModule } from './likes/likes.module.js';
import { OnboardingMetricsListener } from './onboarding/onboarding-metrics.listener.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AlbumsModule,
    AuthModule,
    CollectionModule,
    LikesModule,
  ],
  controllers: [AppController],
  providers: [AppService, OnboardingMetricsListener],
})
export class AppModule {}
