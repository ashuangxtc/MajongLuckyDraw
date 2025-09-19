import crypto from 'crypto';

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function hmacSha256(value: string, secret: string): string {
  return base64url(crypto.createHmac('sha256', secret).update(value).digest());
}

export function createSessionToken(now = Date.now()): string {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'Dreammore123';
  const payload = { exp: now + SESSION_TTL_MS };
  const b = base64url(JSON.stringify(payload));
  const sig = hmacSha256(b, secret);
  return `${b}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null, now = Date.now()): boolean {
  if (!token) return false;
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'Dreammore123';
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [b, sig] = parts;
  const expected = hmacSha256(b, secret);
  if (sig !== expected) return false;
  try {
    const json = JSON.parse(Buffer.from(b.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')) as { exp: number };
    if (!json?.exp || typeof json.exp !== 'number') return false;
    return now < json.exp;
  } catch {
    return false;
  }
}

export function getSessionMaxAgeMs(): number {
  return SESSION_TTL_MS;
}


