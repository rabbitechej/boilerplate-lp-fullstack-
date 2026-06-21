import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import {
  createRefreshSecret,
  formatRefreshToken,
  hashRefreshSecret,
  parseRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from './tokens';

before(() => {
  process.env.JWT_SECRET = 'a'.repeat(32);
  process.env.JWT_ISSUER = 'test-issuer';
  process.env.JWT_AUDIENCE = 'test-audience';
});

describe('access tokens', () => {
  it('assina e verifica um token valido', () => {
    const token = signAccessToken({ adminId: '507f1f77bcf86cd799439011', sessionId: 'sess-1', role: 'admin' });
    const claims = verifyAccessToken(token);
    assert.equal(claims.adminId, '507f1f77bcf86cd799439011');
    assert.equal(claims.sessionId, 'sess-1');
    assert.equal(claims.role, 'admin');
  });

  it('rejeita token assinado com outro segredo', () => {
    const token = signAccessToken({ adminId: '507f1f77bcf86cd799439011', sessionId: 'sess-1', role: 'admin' });
    process.env.JWT_SECRET = 'b'.repeat(32);
    assert.throws(() => verifyAccessToken(token));
    process.env.JWT_SECRET = 'a'.repeat(32);
  });
});

describe('refresh token format', () => {
  it('formata e faz parse de ida e volta', () => {
    const sessionId = '507f1f77bcf86cd799439011';
    const secret = createRefreshSecret();
    const token = formatRefreshToken(sessionId, secret);
    const parsed = parseRefreshToken(token);
    assert.ok(parsed);
    assert.equal(parsed?.sessionId, sessionId);
    assert.equal(parsed?.secret, secret);
  });

  it('rejeita token mal formado', () => {
    assert.equal(parseRefreshToken('lixo-sem-ponto'), undefined);
  });

  it('hash do segredo e deterministico', () => {
    const secret = createRefreshSecret();
    assert.equal(hashRefreshSecret(secret), hashRefreshSecret(secret));
  });
});
