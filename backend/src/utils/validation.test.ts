import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isValidEmail, isValidObjectId, isValidSlug, slugify } from './validation';

describe('isValidEmail', () => {
  it('aceita email valido', () => {
    assert.equal(isValidEmail('a@b.com'), true);
  });

  it('rejeita email invalido', () => {
    assert.equal(isValidEmail('nao-e-email'), false);
  });
});

describe('isValidSlug', () => {
  it('aceita slug valido', () => {
    assert.equal(isValidSlug('meu-post-1'), true);
  });

  it('rejeita slug com espacos ou maiusculas', () => {
    assert.equal(isValidSlug('Meu Post'), false);
  });
});

describe('slugify', () => {
  it('remove acentos e normaliza para minusculo com hifens', () => {
    assert.equal(slugify('Título com Ação!'), 'titulo-com-acao');
  });
});

describe('isValidObjectId', () => {
  it('aceita ObjectId hexadecimal de 24 caracteres', () => {
    assert.equal(isValidObjectId('507f1f77bcf86cd799439011'), true);
  });

  it('rejeita string curta', () => {
    assert.equal(isValidObjectId('123'), false);
  });
});
