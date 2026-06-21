import type { Request } from 'express';
import { getRefreshTokenTtlMs, getSessionIdleTtlMs } from '../config/env';
import AuthSession, { type IAuthSession } from '../models/AuthSession';
import {
  createRefreshSecret,
  formatRefreshToken,
  hashRefreshSecret,
  parseRefreshToken,
} from './tokens';

export async function createAuthSession(adminId: string, req: Request) {
  const secret = createRefreshSecret();
  const now = new Date();
  const session = new AuthSession({
    adminId,
    refreshTokenHash: hashRefreshSecret(secret),
    expiresAt: new Date(now.getTime() + getRefreshTokenTtlMs()),
    lastUsedAt: now,
    ip: (req.ip ?? req.socket.remoteAddress)?.slice(0, 100),
    userAgent: req.get('user-agent')?.slice(0, 500),
  });
  await session.save();
  return { session, refreshToken: formatRefreshToken(String(session._id), secret) };
}

export async function rotateAuthSession(rawToken: string) {
  const parsed = parseRefreshToken(rawToken);
  if (!parsed) return undefined;

  const now = new Date();
  const idleCutoff = new Date(now.getTime() - getSessionIdleTtlMs());
  const nextSecret = createRefreshSecret();
  const session = await AuthSession.findOneAndUpdate(
    {
      _id: parsed.sessionId,
      refreshTokenHash: hashRefreshSecret(parsed.secret),
      revokedAt: { $exists: false },
      expiresAt: { $gt: now },
      lastUsedAt: { $gt: idleCutoff },
    },
    {
      $set: {
        refreshTokenHash: hashRefreshSecret(nextSecret),
        lastUsedAt: now,
      },
    },
    { returnDocument: 'after' },
  );

  if (session) {
    return {
      session,
      refreshToken: formatRefreshToken(String(session._id), nextSecret),
    };
  }

  const reusedSession = await AuthSession.findById(parsed.sessionId).select('+refreshTokenHash');
  if (reusedSession && !reusedSession.revokedAt && reusedSession.expiresAt > now) {
    reusedSession.revokedAt = now;
    reusedSession.revocationReason =
      reusedSession.lastUsedAt <= idleCutoff ? 'idle_timeout' : 'refresh_token_reuse';
    await reusedSession.save();
  }
  return undefined;
}

export async function revokeSession(sessionId: string, reason: string): Promise<void> {
  await AuthSession.updateOne(
    { _id: sessionId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date(), revocationReason: reason } },
  );
}

export async function revokeSessionByRefreshToken(rawToken: string, reason: string): Promise<void> {
  const parsed = parseRefreshToken(rawToken);
  if (!parsed) return;
  await AuthSession.updateOne(
    {
      _id: parsed.sessionId,
      refreshTokenHash: hashRefreshSecret(parsed.secret),
      revokedAt: { $exists: false },
    },
    { $set: { revokedAt: new Date(), revocationReason: reason } },
  );
}

export async function revokeAllAdminSessions(adminId: string, reason: string): Promise<void> {
  await AuthSession.updateMany(
    { adminId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date(), revocationReason: reason } },
  );
}

export function serializeSession(session: IAuthSession, currentSessionId: string) {
  return {
    id: String(session._id),
    current: String(session._id) === currentSessionId,
    ip: session.ip,
    userAgent: session.userAgent,
    createdAt: (session as unknown as { createdAt: Date }).createdAt,
    lastUsedAt: session.lastUsedAt,
    expiresAt: session.expiresAt,
  };
}
