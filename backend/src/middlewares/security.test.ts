import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Request, Response } from 'express';
import { rejectUnsafeMongoKeys } from './security';

function fakeReqRes(body: unknown) {
  const req = { body, params: {}, query: {} } as Request;
  let statusCode: number | undefined;
  let payload: unknown;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(value: unknown) {
      payload = value;
      return this;
    },
  } as unknown as Response;
  return { req, res, getStatus: () => statusCode, getPayload: () => payload };
}

describe('rejectUnsafeMongoKeys', () => {
  it('bloqueia chaves com operador $', () => {
    const { req, res, getStatus } = fakeReqRes({ $where: 'true' });
    let calledNext = false;
    rejectUnsafeMongoKeys(req, res, () => {
      calledNext = true;
    });
    assert.equal(getStatus(), 400);
    assert.equal(calledNext, false);
  });

  it('permite corpo seguro', () => {
    const { req, res } = fakeReqRes({ title: 'ola' });
    let calledNext = false;
    rejectUnsafeMongoKeys(req, res, () => {
      calledNext = true;
    });
    assert.equal(calledNext, true);
  });
});
