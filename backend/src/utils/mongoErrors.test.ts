import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isDuplicateKeyError } from './mongoErrors';

describe('isDuplicateKeyError', () => {
  it('reconhece um erro de chave duplicada do Mongo (code 11000)', () => {
    assert.equal(isDuplicateKeyError({ code: 11000, message: 'E11000 duplicate key' }), true);
  });

  it('rejeita erros sem o code 11000', () => {
    assert.equal(isDuplicateKeyError(new Error('outro erro')), false);
    assert.equal(isDuplicateKeyError({ code: 500 }), false);
    assert.equal(isDuplicateKeyError(null), false);
    assert.equal(isDuplicateKeyError(undefined), false);
  });
});
