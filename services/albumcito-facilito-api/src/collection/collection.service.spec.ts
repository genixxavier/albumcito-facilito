import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlbumsRepository } from '../albums/albums.repository.js';
import type { User } from '../auth/auth.types.js';
import { UsersRepository } from '../auth/users.repository.js';
import { ONBOARDING_COMPLETED } from '../onboarding/onboarding.events.js';
import { CollectionRepository } from './collection.repository.js';
import { CollectionService } from './collection.service.js';

const CREATED_AT = '2026-01-01T10:00:00.000Z';

const makeUser = (onboarding: boolean | null): User => ({
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  username: 'ana',
  passwordHash: 'x',
  createdAt: CREATED_AT,
  onboarding,
});

describe('CollectionService', () => {
  let service: CollectionService;
  let users: UsersRepository;
  let emit: ReturnType<typeof vi.fn>;

  const setup = async (onboarding: boolean | null) => {
    emit = vi.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CollectionService,
        CollectionRepository,
        AlbumsRepository,
        UsersRepository,
        { provide: EventEmitter2, useValue: { emit } },
      ],
    }).compile();
    service = moduleRef.get(CollectionService);
    users = moduleRef.get(UsersRepository);
    users.create(makeUser(onboarding));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:01:30.000Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('la primera estampa pone onboarding=true y emite el evento con la duración', async () => {
    await setup(false);

    const result = service.add('u1', 'aventuras-1');

    expect(result.stickers.map((s) => s.id)).toEqual(['aventuras-1']);
    expect(users.findById('u1')?.onboarding).toBe(true);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(ONBOARDING_COMPLETED, {
      userId: 'u1',
      accountCreatedAt: CREATED_AT,
      firstStickerAt: '2026-01-01T10:01:30.000Z',
      durationMs: 90_000,
    });
  });

  it('una segunda estampa no vuelve a emitir el evento', async () => {
    await setup(false);

    service.add('u1', 'aventuras-1');
    service.add('u1', 'aventuras-2');

    expect(emit).toHaveBeenCalledTimes(1);
  });

  it('añadir la misma estampa es idempotente', async () => {
    await setup(false);

    service.add('u1', 'aventuras-1');
    const result = service.add('u1', 'aventuras-1');

    expect(result.stickers).toHaveLength(1);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it('con onboarding=null no cambia el valor ni emite el evento', async () => {
    await setup(null);

    service.add('u1', 'aventuras-1');

    expect(users.findById('u1')?.onboarding).toBeNull();
    expect(emit).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException si la estampa no existe', async () => {
    await setup(false);

    expect(() => service.add('u1', 'no-existe')).toThrow(NotFoundException);
    expect(emit).not.toHaveBeenCalled();
    expect(users.findById('u1')?.onboarding).toBe(false);
  });

  describe('top', () => {
    const addUser = (id: string) =>
      users.create({
        ...makeUser(null),
        id,
        username: id,
        email: `${id}@x.com`,
      });

    it('ordena por coleccionistas desc con desempate por id y excluye las de 0', async () => {
      await setup(null);
      addUser('u2');
      addUser('u3');
      service.add('u1', 'espacio-2');
      service.add('u2', 'espacio-2');
      service.add('u3', 'espacio-2');
      service.add('u1', 'aventuras-2');
      service.add('u2', 'aventuras-1');

      const result = service.top(5);

      expect(result.map((s) => [s.id, s.collectorCount])).toEqual([
        ['espacio-2', 3],
        ['aventuras-1', 1],
        ['aventuras-2', 1],
      ]);
      expect(result[0]?.albumId).toBe('cody-espacio');
    });

    it('devuelve lista vacía si nadie tiene estampas', async () => {
      await setup(null);
      expect(service.top(5)).toEqual([]);
    });

    it('respeta el límite', async () => {
      await setup(null);
      service.add('u1', 'aventuras-1');
      service.add('u1', 'aventuras-2');
      expect(service.top(1)).toHaveLength(1);
    });
  });
});
