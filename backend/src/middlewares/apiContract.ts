import type { NextFunction, Request, Response } from 'express';

declare module 'express-serve-static-core' {
  interface Response {
    ok(data: unknown, status?: number): void;
    fail(code: string, message: string, status?: number): void;
  }
}

export function apiV1ResponseContract(_req: Request, res: Response, next: NextFunction): void {
  res.ok = (data, status = 200) => {
    res.status(status).json({ data });
  };
  res.fail = (code, message, status = 400) => {
    res.status(status).json({ error: { code, message } });
  };
  next();
}
