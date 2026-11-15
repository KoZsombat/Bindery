import fsp from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { sqlite, now } from '../db/index.js';

const execFileAsync = promisify(execFile);
const TEXT_EXT = new Set(['.txt', '.md', '.markdown', '.csv', '.json', '.tex', '.js', '.html', '.css']);
const MAX_EXTRACTED = 150000;

async function assertPdf(file) {
  const fh = await fsp.open(file.path, 'r');
  try {
    const head = Buffer.alloc(5);
    await fh.read(head, 0, 5, 0);
    if (head.toString('latin1') !== '%PDF-') throw new Error('Not a valid PDF: ' + file.originalname);
  } finally {
    await fh.close();
  }
}

async function pdfText(filePath, name) {
  try {
    const { stdout } = await execFileAsync('pdftotext', ['-layout', filePath, '-'], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
    return stdout;
  } catch {
    throw new Error('Could not extract text from ' + name + '. Install poppler-utils or upload a text file.');
  }
}

/**
 * Extracts text from one uploaded file, keeps the text in the uploads table and
 * deletes the raw file. The site keeps its own copy of the combined source.
 */
export async function extractUpload(file, userId) {
  const original = path.basename(String(file.originalname || 'upload'));
  const ext = path.extname(original).toLowerCase();
  let text = '';
  try {
    if (ext === '.pdf') {
      await assertPdf(file);
      text = await pdfText(file.path, original);
    } else if (TEXT_EXT.has(ext)) {
      const buf = await fsp.readFile(file.path);
      if (buf.includes(0)) throw new Error('Binary file rejected: ' + original);
      text = buf.toString('utf8');
    } else {
      throw new Error('Unsupported file type: ' + ext + '. Use PDF, TXT, MD, CSV, JSON, TEX, JS, HTML or CSS.');
    }
  } finally {
    // Only the extracted text is needed from here on.
    await fsp.unlink(file.path).catch(() => {});
  }
  text = text.slice(0, MAX_EXTRACTED);
  const result = sqlite.prepare('INSERT INTO uploads (user_id,name,path,chars,extracted,created_at) VALUES (?,?,?,?,?,?)')
    .run(userId, original, file.filename || '', text.length, text, now());
  return { id: Number(result.lastInsertRowid), name: original, chars: text.length, extracted: text };
}
