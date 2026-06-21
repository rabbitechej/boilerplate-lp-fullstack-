import type { NextFunction, Request, Response } from 'express';

function containsUnsafeMongoKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsUnsafeMongoKey);
  if (!value || typeof value !== 'object') return false;

  return Object.entries(value).some(
    ([key, child]) => key.startsWith('$') || key.includes('.') || containsUnsafeMongoKey(child),
  );
}

export function rejectUnsafeMongoKeys(req: Request, res: Response, next: NextFunction): void {
  if (
    containsUnsafeMongoKey(req.body) ||
    containsUnsafeMongoKey(req.params) ||
    containsUnsafeMongoKey(req.query)
  ) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'A requisicao contem campos invalidos.' } });
    return;
  }

  next();
}

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production' && req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}
