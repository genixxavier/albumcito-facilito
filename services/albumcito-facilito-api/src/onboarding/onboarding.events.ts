export const ONBOARDING_COMPLETED = 'onboarding.completed';

export interface OnboardingCompletedEvent {
  userId: string;
  accountCreatedAt: string;
  firstStickerAt: string;
  /** Milisegundos entre la creación de la cuenta y la primera estampa. */
  durationMs: number;
}
