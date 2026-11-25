import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ONBOARDING_COMPLETED,
  type OnboardingCompletedEvent,
} from './onboarding.events.js';

@Injectable()
export class OnboardingMetricsListener {
  private readonly logger = new Logger(OnboardingMetricsListener.name);

  @OnEvent(ONBOARDING_COMPLETED)
  handle(event: OnboardingCompletedEvent): void {
    this.logger.log(JSON.stringify({ event: ONBOARDING_COMPLETED, ...event }));
  }
}
