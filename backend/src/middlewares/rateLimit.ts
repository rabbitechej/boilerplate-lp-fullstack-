import type { NextFunction, Request, Response } from 'express';
import RateLimit from '../models/RateLimit';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

export function rateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = `${options.keyPrefix}:${ip}`;
    const now = new Date();

    try {
      const existing = await RateLimit.findOneAndUpdate(
        { key, expiresAt: { $gt: now } },
        { $inc: { count: 1 } },
        { returnDocument: 'after' },
      );

      if (existing) {
        if (existing.count > options.max) {
          res.status(429).json({
            error: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Tente novamente mais tarde.' },
          });
          return;
        }
        next();
        return;
      }

      await RateLimit.findOneAndUpdate(
        { key },
        { key, count: 1, expiresAt: new Date(now.getTime() + options.windowMs) },
        { upsert: true },
      );
      next();
    } catch (error) {
      console.error('Erro ao aplicar rate limit:', error);
      next();
    }
  };
}
