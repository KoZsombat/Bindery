import fsp from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { sqlite, now } from '../db/index.js';

const execFileAsync = promisify(execFile);

async function pdfText(filePath, name) {
  try {
    const { stdout } = await execFileAsync('pdftotext', ['-layout', filePath, '-'], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
    return stdout;
  } catch {
    throw new Error('Could not extract text from ' + name + '. Install poppler-utils or upload a text file.');
  }
}

export async function extractUpload(file, userId) {
  const ext = path.extname(file.originalname).toLowerCase();
  let text = '';
  if (ext === '.pdf') text = await pdfText(file.path, file.originalname);
  else if (['.txt', '.md', '.markdown', '.csv', '.json', '.tex', '.js', '.html', '.css'].includes(ext)) text = await fsp.readFile(file.path, 'utf8');
  else {
    await fsp.unlink(file.path).catch(() => {});
    throw new Error('Unsupported file type: ' + ext + '. Use PDF, TXT, MD, CSV, JSON, TEX, JS, HTML or CSS.');
  }
  text = text.slice(0, 150000);
  const stored = file.filename;
  const result = sqlite.prepare('INSERT INTO uploads (user_id,name,path,chars,extracted,created_at) VALUES (?,?,?,?,?,?)').run(userId, file.originalname, stored, text.length, text, now());
  return { id: Number(result.lastInsertRowid), name: file.originalname, chars: text.length, extracted: text };
}
