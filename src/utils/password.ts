import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

const PASSWORD_PREFIX = 'scrypt';
const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  keyLen: 64,
};

type ParsedHash = {
  N: number;
  r: number;
  p: number;
  keyLen: number;
  salt: Buffer;
  hash: Buffer;
};

const parseHash = (stored: string): ParsedHash | null => {
  const parts = stored.split('$');
  if (parts.length !== 7 || parts[0] !== PASSWORD_PREFIX) {
    return null;
  }
  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const keyLen = Number(parts[4]);
  if (![N, r, p, keyLen].every((value) => Number.isFinite(value) && value > 0)) {
    return null;
  }
  try {
    const salt = Buffer.from(parts[5], 'base64');
    const hash = Buffer.from(parts[6], 'base64');
    if (!salt.length || !hash.length) {
      return null;
    }
    return { N, r, p, keyLen, salt, hash };
  } catch {
    return null;
  }
};

const constantTimeEqual = (a: Buffer, b: Buffer) => {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
};

export const isHashedPassword = (stored: string) => parseHash(stored) !== null;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, SCRYPT_PARAMS.keyLen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  })) as Buffer;
  return [
    PASSWORD_PREFIX,
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    SCRYPT_PARAMS.keyLen,
    salt.toString('base64'),
    hash.toString('base64'),
  ].join('$');
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const parsed = parseHash(stored);
  if (!parsed) {
    return constantTimeEqual(Buffer.from(password), Buffer.from(stored));
  }
  const hash = (await scrypt(password, parsed.salt, parsed.keyLen, {
    N: parsed.N,
    r: parsed.r,
    p: parsed.p,
  })) as Buffer;
  return constantTimeEqual(hash, parsed.hash);
};
