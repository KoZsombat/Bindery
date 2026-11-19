/**
 * Turn internal generation failures into stable, user-facing messages.
 * The raw text stays in `sites.error` and in the server log; clients only ever
 * receive a code plus a readable sentence, never stack traces or JSON offsets.
 */

const CODES = [
  ['no_api_key', /no api key/i],
  ['model_incomplete', /not valid json|invalid json|json at position|unexpected end|truncated|incomplete/i],
  ['model_auth', /llm api 40[13]|\bunauthori[sz]ed\b|invalid api key|authentication/i],
  ['model_rate_limited', /llm api 429|rate.?limit|too many requests/i],
  ['model_timeout', /timed out|timeout|idle for|aborted/i],
  ['time_budget', /time budget|exceeded its \d+-minute/i],
  ['model_unavailable', /llm api 5\d\d|fetch failed|econn|enotfound|socket hang up|could not be resolved|connection/i],
  ['quality_gate', /depth contract|failed validation|failed the depth|quality gate|schema/i],
];

export const FRIENDLY = {
  no_api_key: 'No API key. Add one in Settings, then retry.',
  model_incomplete: 'The model reply was cut off before the chapter was complete. The draft is saved; retry the generation.',
  model_auth: 'The model provider rejected the API key. Check it in Settings.',
  model_rate_limited: 'The model provider is rate-limiting requests. Retry in a minute.',
  model_timeout: 'The model provider took too long to respond. Retry the generation.',
  time_budget: 'Generation hit its time limit before the checks passed. The draft is saved; retry to resume.',
  model_unavailable: 'The model provider could not be reached. Retry in a moment.',
  quality_gate: 'The generated content did not pass the quality checks. The draft is saved; retry the generation.',
  generation_failed: 'Generation failed. The draft is saved; retry it.',
};

export function generationErrorCode(message) {
  const text = String(message || '');
  if (!text.trim()) return '';
  for (const [code, pattern] of CODES) {
    if (pattern.test(text)) return code;
  }
  return 'generation_failed';
}

export function friendlyGenerationError(message) {
  const code = generationErrorCode(message);
  return code ? FRIENDLY[code] : '';
}
