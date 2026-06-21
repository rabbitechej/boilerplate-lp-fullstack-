import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildRateLimitKey } from './rateLimit';

describe('buildRateLimitKey', () => {
  it('produz a mesma chave para requisicoes na mesma janela de tempo', () => {
    const windowMs = 60_000;
    const base = new Date('2026-01-01T00:00:10.000Z');
    const later = new Date('2026-01-01T00:00:50.000Z');

    const keyA = buildRateLimitKey('login', '1.2.3.4', windowMs, base);
    const keyB = buildRateLimitKey('login', '1.2.3.4', windowMs, later);

    assert.equal(keyA, keyB);
  });

  it('produz chaves diferentes quando a janela de tempo muda', () => {
    const windowMs = 60_000;
    const beforeBoundary = new Date('2026-01-01T00:00:59.999Z');
    const afterBoundary = new Date('2026-01-01T00:01:00.000Z');

    const keyA = buildRateLimitKey('login', '1.2.3.4', windowMs, beforeBoundary);
    const keyB = buildRateLimitKey('login', '1.2.3.4', windowMs, afterBoundary);

    assert.notEqual(keyA, keyB);
  });

  it('produz chaves diferentes para IPs diferentes', () => {
    const windowMs = 60_000;
    const now = new Date('2026-01-01T00:00:00.000Z');

    const keyA = buildRateLimitKey('login', '1.2.3.4', windowMs, now);
    const keyB = buildRateLimitKey('login', '5.6.7.8', windowMs, now);

    assert.notEqual(keyA, keyB);
  });
});
