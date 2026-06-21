const REQUIRED_SERVER_VARIABLES = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const;

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }
  return value;
}

export function validateServerEnv(): void {
  const missing = REQUIRED_SERVER_VARIABLES.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Variaveis de ambiente obrigatorias ausentes: ${missing.join(', ')}`);
  }

  if (requireEnv('JWT_SECRET').length < 32) {
    throw new Error('JWT_SECRET deve possuir pelo menos 32 caracteres');
  }

  if (process.env.NODE_ENV === 'production') {
    if (getCorsOrigins().length === 0) {
      throw new Error('CORS_ORIGINS deve ser configurado em producao');
    }
    if (!isSecureAuthCookie()) {
      throw new Error('AUTH_COOKIE_SECURE deve ser true em producao');
    }
  }
}

export function getPort(): number {
  const value = process.env.PORT ?? '5000';
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT invalida: ${value}`);
  }
  return port;
}

export function getCorsOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured && configured.length > 0) {
    return configured;
  }

  return process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173'];
}

export function getTrustProxy(): boolean | number {
  const value = process.env.TRUST_PROXY?.trim();
  if (!value || value === '0' || value === 'false') return false;
  if (value === 'true') return 1;

  const hops = Number(value);
  if (!Number.isInteger(hops) || hops < 0) {
    throw new Error(`TRUST_PROXY invalido: ${value}`);
  }
  return hops;
}

function readPositiveInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} deve ser um numero inteiro positivo`);
  }
  return value;
}

export function getAccessTokenTtlSeconds(): number {
  return readPositiveInteger('ACCESS_TOKEN_TTL_MINUTES', 15) * 60;
}

export function getRefreshTokenTtlMs(): number {
  return readPositiveInteger('REFRESH_TOKEN_TTL_DAYS', 7) * 24 * 60 * 60 * 1000;
}

export function getSessionIdleTtlMs(): number {
  return readPositiveInteger('SESSION_IDLE_TTL_MINUTES', 60) * 60 * 1000;
}

export function isSecureAuthCookie(): boolean {
  const configured = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase();
  if (configured === 'true') return true;
  if (configured === 'false') return false;
  return process.env.NODE_ENV === 'production';
}

export function getJwtIssuer(): string {
  return process.env.JWT_ISSUER?.trim() || 'boilerplate-api';
}

export function getJwtAudience(): string {
  return process.env.JWT_AUDIENCE?.trim() || 'boilerplate-admin';
}
