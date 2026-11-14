import { migrateAuth, seedAdmin } from './auth.js';
import { startWorker } from './services/generation.js';
import { app } from './app.js';
import { PORT, BASE_DOMAIN, SITE_DOMAIN, DEV, LLM_MOCK, LLM_API_KEY } from './config.js';

await migrateAuth();
await seedAdmin();
startWorker();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Learning Book Builder on :${PORT} (base ${BASE_DOMAIN}, sites ${SITE_DOMAIN})`);
  if (!LLM_MOCK && DEV && !LLM_API_KEY) console.log('Development mode: no API key, using deterministic mock generation.');
  else if (!LLM_MOCK && !LLM_API_KEY) console.log('No global LLM_API_KEY; users must add their own key.');
});
