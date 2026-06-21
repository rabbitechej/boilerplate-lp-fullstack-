import type { NextFunction, Request, Response } from 'express';
import RateLimit from '../models/RateLimit';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

export function buildRateLimitKey(prefix: string, ip: string, windowMs: number, now: Date): string {
  const bucket = Math.floor(now.getTime() / windowMs);
  return `${prefix}:${ip}:${bucket}`;
}

export function rateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = new Date();
    const key = buildRateLimitKey(options.keyPrefix, ip, options.windowMs, now);

    try {
      // findOneAndUpdate com upsert + $inc e' atomico: requisicoes concorrentes
      // para a mesma chave incrementam o mesmo contador sem condicao de corrida.
      // A chave ja' embute o "bucket" da janela de tempo, entao a janela nunca
      // precisa ser resetada manualmente (documentos antigos so' expiram via TTL).
      const current = await RateLimit.findOneAndUpdate(
        { key },
        {
          $inc: { count: 1 },
          $setOnInsert: { expiresAt: new Date(now.getTime() + options.windowMs) },
        },
        { upsert: true, returnDocument: 'after' },
      );

      if (current.count > options.max) {
        res.status(429).json({
          error: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Tente novamente mais tarde.' },
        });
        return;
      }
      next();
    } catch (error) {
      console.error('Erro ao aplicar rate limit:', error);
      next();
    }
  };
}
