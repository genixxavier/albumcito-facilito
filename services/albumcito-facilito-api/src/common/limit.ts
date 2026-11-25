import { BadRequestException } from '@nestjs/common';

export const DEFAULT_LIMIT = 5;
export const MAX_LIMIT = 20;

/** Valida el parámetro `limit` de los rankings (1–20; por defecto 5). */
export function resolveLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_LIMIT;
  if (limit < 1 || limit > MAX_LIMIT) {
    throw new BadRequestException(`limit debe estar entre 1 y ${MAX_LIMIT}`);
  }
  return limit;
}
