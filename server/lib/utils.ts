import { randomBytes } from 'crypto';

const SLUG_LENGTH = 8;
const TOKEN_LENGTH = 32;

export function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  const bytes = randomBytes(SLUG_LENGTH);
  
  for (let i = 0; i < SLUG_LENGTH; i++) {
    slug += chars[bytes[i] % chars.length];
  }
  
  return slug;
}

export function generateSecretToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

export function calculateExpiresAt(expiration: '1h' | '1d' | '1w' | 'never'): string | null {
  if (expiration === 'never') {
    return null;
  }

  const now = new Date();
  
  switch (expiration) {
    case '1h':
      now.setHours(now.getHours() + 1);
      break;
    case '1d':
      now.setDate(now.getDate() + 1);
      break;
    case '1w':
      now.setDate(now.getDate() + 7);
      break;
  }
  
  return now.toISOString();
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }
  
  return new Date(expiresAt) < new Date();
}

// Rate limiting - simple in-memory store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}
