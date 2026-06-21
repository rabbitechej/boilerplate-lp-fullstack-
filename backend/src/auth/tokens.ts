import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import {
  getAccessTokenTtlSeconds,
  getJwtAudience,
  getJwtIssuer,
  getRefreshTokenTtlMs,
  isSecureAuthCookie,
  requireEnv,
} from '../config/env';
import { ADMIN_ROLES, type AdminRole } from '../models/Admin';

export const REFRESH_COOKIE_NAME = 'boilerplate_refresh';

export type AccessTokenClaims = {
  adminId: string;
  sessionId: string;
  role: AdminRole;
};

export function signAccessToken(claims: AccessTokenClaims): string {
  return jwt.sign(
    { sid: claims.sessionId, role: claims.role, type: 'access' },
    requireEnv('JWT_SECRET'),
    {
      algorithm: 'HS256',
      audience: getJwtAudience(),
      issuer: getJwtIssuer(),
      subject: claims.adminId,
      expiresIn: getAccessTokenTtlSeconds(),
      jwtid: randomUUID(),
    },
  );
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const payload = jwt.verify(token, requireEnv('JWT_SECRET'), {
    algorithms: ['HS256'],
    audience: getJwtAudience(),
    issuer: getJwtIssuer(),
  }) as JwtPayload;

  if (
    payload.type !== 'access' ||
    typeof payload.sub !== 'string' ||
    typeof payload.sid !== 'string' ||
    typeof payload.role !== 'string' ||
    !ADMIN_ROLES.includes(payload.role as AdminRole)
  ) {
    throw new Error('Access token com claims invalidas');
  }

  return {
    adminId: payload.sub,
    sessionId: payload.sid,
    role: payload.role as AdminRole,
  };
}

export function createRefreshSecret(): string {
  return randomBytes(48).toString('base64url');
}

export function formatRefreshToken(sessionId: string, secret: string): string {
  return `${sessionId}.${secret}`;
}

export function parseRefreshToken(token: string): { sessionId: string; secret: string } | undefined {
  const separator = token.indexOf('.');
  if (separator <= 0) return undefined;
  const sessionId = token.slice(0, separator);
  const secret = token.slice(separator + 1);
  if (!/^[a-f\d]{24}$/i.test(sessionId) || !/^[A-Za-z0-9_-]{64}$/.test(secret)) return undefined;
  return { sessionId, secret };
}

export function hashRefreshSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function readRefreshTokenCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [name, ...valueParts] = part.trim().split('=');
    if (name !== REFRESH_COOKIE_NAME) continue;
    try {
      return decodeURIComponent(valueParts.join('='));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecureAuthCookie(),
    sameSite: 'strict',
    path: '/',
    maxAge: getRefreshTokenTtlMs(),
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isSecureAuthCookie(),
    sameSite: 'strict',
    path: '/',
  });
}
