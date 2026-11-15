import test from 'node:test';
import assert from 'node:assert/strict';

process.env.LLM_ALLOW_PRIVATE_HOSTS = '';

const { assertSafeLlmBase } = await import('../src/services/url-safety.js');

test('rejects local, private and metadata addresses', async () => {
  const blocked = [
    'https://127.0.0.1',
    'https://10.0.0.5/v1',
    'https://172.16.4.2/v1',
    'https://192.168.1.10/v1',
    'https://169.254.169.254/latest/meta-data',
    'https://[::1]/v1',
    'https://[fd00::1]/v1',
  ];
  for (const url of blocked) {
    await assert.rejects(assertSafeLlmBase(url), /private, loopback or link-local/, url);
  }
});

test('rejects plain http outside the private-host opt-in', async () => {
  await assert.rejects(assertSafeLlmBase('http://1.1.1.1/v1'), /https/);
});

test('rejects credentials in the URL', async () => {
  await assert.rejects(assertSafeLlmBase('https://user:pass@1.1.1.1/v1'), /credentials/);
});

test('accepts a public https endpoint', async () => {
  const url = await assertSafeLlmBase('https://1.1.1.1/v1/');
  assert.equal(url.host, '1.1.1.1');
  assert.equal(url.protocol, 'https:');
});
