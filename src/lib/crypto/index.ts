import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Derive a 32-byte key from the ENCRYPTION_KEY environment variable
 */
function getKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // If the key is already 32 bytes (64 hex chars), use it directly
  if (envKey.length === 64) {
    return Buffer.from(envKey, 'hex');
  }

  // Otherwise, hash it to get a consistent 32-byte key
  return createHash('sha256').update(envKey).digest();
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns format: iv:authTag:ciphertext (all hex encoded)
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(16);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * Input format: iv:authTag:ciphertext (all hex encoded)
 */
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid ciphertext format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Hash a value using SHA-256
 */
export function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a random hex string
 */
export function randomHex(length: number = 32): string {
  return randomBytes(length / 2).toString('hex');
}