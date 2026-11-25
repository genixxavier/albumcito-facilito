import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug } from './slug.js';

describe('slug', () => {
  it('normaliza acentos y espacios', () => {
    expect(slugify('Ana Pérez')).toBe('ana-perez');
  });
  it('añade sufijo si está ocupado', () => {
    const taken = new Set(['ana-perez', 'ana-perez-2']);
    expect(uniqueSlug('Ana Pérez', (s) => taken.has(s))).toBe('ana-perez-3');
  });
  it('evita slugs reservados', () => {
    expect(uniqueSlug('Albums', () => false)).toBe('albums-2');
  });
});
