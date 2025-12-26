import { createHmac, timingSafeEqual } from 'crypto';

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60;

type JwtHeader = {
  alg: 'HS256';
  typ: 'JWT';
};

export type AccessTokenPayload = {
  sub: string;
  username: string;
};

export type SignedAccessTokenPayload = AccessTokenPayload & {
  iat: number;
  exp: number;
};

const base64UrlEncode = (input: Buffer | string) => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (input: string) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64');
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
};

const getJwtExpiresInSeconds = () => {
  const rawValue = process.env.JWT_EXPIRES_IN_SECONDS;
  if (!rawValue) {
    return DEFAULT_EXPIRES_IN_SECONDS;
  }
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('JWT_EXPIRES_IN_SECONDS must be a positive number');
  }
  return Math.floor(value);
};

const signToken = (header: JwtHeader, payload: SignedAccessTokenPayload, secret: string) => {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(data).digest();
  return `${data}.${base64UrlEncode(signature)}`;
};

export const createAccessToken = (payload: AccessTokenPayload) => {
  const now = Math.floor(Date.now() / 1000);
  const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };
  const tokenPayload: SignedAccessTokenPayload = {
    ...payload,
    iat: now,
    exp: now + getJwtExpiresInSeconds(),
  };
  return signToken(header, tokenPayload, getJwtSecret());
};

export const verifyAccessToken = (token: string): SignedAccessTokenPayload | null => {
  const secret = getJwtSecret();
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  let header: JwtHeader;
  let payload: SignedAccessTokenPayload;
  try {
    header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf8'));
    payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8'));
  } catch {
    return null;
  }
  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    return null;
  }
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createHmac('sha256', secret).update(data).digest();
  const providedSignature = base64UrlDecode(encodedSignature);
  if (expectedSignature.length !== providedSignature.length) {
    return null;
  }
  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= now) {
    return null;
  }
  return payload;
};
