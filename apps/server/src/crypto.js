import crypto from 'node:crypto';
import { ENCRYPTION_KEY } from './config.js';

const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

export function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  return [
    iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    body.toString('base64')
  ].join('.');
}

export function decrypt(text) {
  if (!text) return '';
  const [iv, tag, body] = String(text).split('.');
  if (!iv || !tag || !body) return '';
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return '';
  }
}
