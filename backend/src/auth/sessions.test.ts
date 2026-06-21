import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { serializeSession } from './sessions';
import type { IAuthSession } from '../models/AuthSession';

before(() => {
  process.env.JWT_SECRET = 'a'.repeat(32);
});

describe('serializeSession', () => {
  it('marca a sessao atual como current=true', () => {
    const fakeSession = {
      _id: '507f1f77bcf86cd799439011',
      ip: '127.0.0.1',
      userAgent: 'vitest',
      createdAt: new Date('2026-01-01'),
      lastUsedAt: new Date('2026-01-02'),
      expiresAt: new Date('2026-01-09'),
    } as unknown as IAuthSession;

    const dto = serializeSession(fakeSession, '507f1f77bcf86cd799439011');
    assert.equal(dto.current, true);
    assert.equal(dto.id, '507f1f77bcf86cd799439011');
  });

  it('marca outras sessoes como current=false', () => {
    const fakeSession = {
      _id: '507f1f77bcf86cd799439011',
      createdAt: new Date(),
      lastUsedAt: new Date(),
      expiresAt: new Date(),
    } as unknown as IAuthSession;

    const dto = serializeSession(fakeSession, 'outro-id');
    assert.equal(dto.current, false);
  });
});
