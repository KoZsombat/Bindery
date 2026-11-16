import { migrateAuth, seedAdmin } from './auth.js';
import { startWorker, stopWorker } from './services/generation.js';
import { cleanupUploads, closeDb } from './db/index.js';
import { app } from './app.js';
import { PORT, BASE_DOMAIN, SITE_DOMAIN, LLM_MOCK } from './config.js';

try {
  await migrateAuth();
  await seedAdmin();
  cleanupUploads();
} catch (e) {
  console.error('Startup failed:', e);
  process.exit(1);
}

startWorker();

const uploadCleanupTimer = setInterval(() => {
  try { cleanupUploads(); } catch (e) { console.error('Upload cleanup failed:', e); }
}, 24 * 60 * 60 * 1000);
uploadCleanupTimer.unref();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bindery on :${PORT} (base ${BASE_DOMAIN}, sites ${SITE_DOMAIN})`);
  if (LLM_MOCK) console.log('Mock generation enabled; no user API key required.');
  else console.log('Every user must add their own API key in Settings.');
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down.`);
  stopWorker();
  server.close(() => {
    closeDb();
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Shutdown timed out.');
    closeDb();
    process.exit(1);
  }, 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection:', reason);
});
process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
  shutdown('uncaughtException');
});
