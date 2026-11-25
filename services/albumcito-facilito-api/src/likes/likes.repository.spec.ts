import { describe, expect, it } from 'vitest';
import { LikesRepository } from './likes.repository.js';

describe('LikesRepository', () => {
  it('like es idempotente: un usuario cuenta una sola vez', () => {
    const repo = new LikesRepository();
    repo.like('a1', 'u1');
    repo.like('a1', 'u1');
    expect(repo.count('a1')).toBe(1);
  });

  it('unlike es idempotente y no falla si no había like', () => {
    const repo = new LikesRepository();
    repo.unlike('a1', 'u1');
    repo.like('a1', 'u1');
    repo.unlike('a1', 'u1');
    repo.unlike('a1', 'u1');
    expect(repo.count('a1')).toBe(0);
  });

  it('albumIdsByUser devuelve solo los álbumes del usuario, ordenados', () => {
    const repo = new LikesRepository();
    repo.like('b', 'u1');
    repo.like('a', 'u1');
    repo.like('c', 'u2');
    expect(repo.albumIdsByUser('u1')).toEqual(['a', 'b']);
    expect(repo.albumIdsByUser('u3')).toEqual([]);
  });
});
