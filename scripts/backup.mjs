import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { DB_PATH, SITES_DIR } from '../src/config.js';
import Database from 'better-sqlite3';

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.resolve(process.argv[2] || path.join('backups', stamp));
await fsp.mkdir(out, { recursive: true });

const target = path.join(out, 'app.db');
const db = new Database(DB_PATH, { readonly: true });
await db.backup(target);
db.close();
await fsp.cp(SITES_DIR, path.join(out, 'sites'), { recursive: true });
if (fs.existsSync('examples')) await fsp.cp('examples', path.join(out, 'examples'), { recursive: true });
console.log('Backup written to ' + out);
