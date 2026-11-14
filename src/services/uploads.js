import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { UPLOADS_DIR } from '../config.js';
import { sqlite, now, slugify } from '../db/index.js';

const execFileAsync = promisify(execFile);

async function pdfText(buffer, name) {
  const tmp = path.join(UPLOADS_DIR, 'tmp-' + crypto.randomBytes(8).toString('hex') + '.pdf');
  await fsp.writeFile(tmp, buffer);
  try {
    const { stdout } = await execFileAsync('pdftotext', ['-layout', tmp, '-'], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
    return stdout;
  } catch {
    throw new Error('Could not extract text from ' + name + '. Install poppler-utils or upload a text file.');
  } finally {
    try { await fsp.unlink(tmp); } catch {}
  }
}

export async function extractUpload(file, userId) {
  const ext = path.extname(file.originalname).toLowerCase();
  let text = '';
  if (ext === '.pdf') text = await pdfText(file.buffer, file.originalname);
  else if (['.txt', '.md', '.markdown', '.csv', '.json', '.tex', '.js', '.html', '.css'].includes(ext)) text = file.buffer.toString('utf8');
  else throw new Error('Unsupported file type: ' + ext + '. Use PDF, TXT, MD, CSV, JSON, TEX, JS, HTML or CSS.');
  text = text.slice(0, 150000);
  const stored = crypto.randomBytes(8).toString('hex') + '-' + slugify(path.basename(file.originalname, ext)) + ext;
  await fsp.writeFile(path.join(UPLOADS_DIR, stored), file.buffer);
  const result = sqlite.prepare('INSERT INTO uploads (user_id,name,path,chars,extracted,created_at) VALUES (?,?,?,?,?,?)').run(userId, file.originalname, stored, text.length, text, now());
  return { id: Number(result.lastInsertRowid), name: file.originalname, chars: text.length, extracted: text };
}
