import dns from 'node:dns/promises';
import net from 'node:net';
import { LLM_ALLOW_PRIVATE_HOSTS } from '../config.js';

/** [network, prefix length] ranges that must never be reached by the job worker. */
const BLOCKED_V4 = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function v4ToInt(address) {
  return address.split('.').reduce((n, part) => (n << 8) + Number(part), 0) >>> 0;
}

function inV4Range(address, network, bits) {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (v4ToInt(address) & mask) === (v4ToInt(network) & mask);
}

function isBlockedV4(address) {
  return BLOCKED_V4.some(([network, bits]) => inV4Range(address, network, bits));
}

function isBlockedV6(address) {
  const a = address.toLowerCase();
  if (a === '::' || a === '::1') return true;
  if (a.startsWith('::ffff:')) return isBlockedV4(a.slice(7));
  return a.startsWith('fc') || a.startsWith('fd') || /^fe[89ab]/.test(a) || a.startsWith('ff');
}

function isBlockedAddress(address) {
  if (net.isIPv4(address)) return isBlockedV4(address);
  if (net.isIPv6(address)) return isBlockedV6(address);
  return true;
}

/** Resolver errors worth a retry; a typo (NXDOMAIN) still fails fast enough. */
const TRANSIENT_DNS = new Set(['EAI_AGAIN', 'ENOTFOUND', 'ESERVFAIL', 'ETIMEOUT', 'ECONNREFUSED']);

/**
 * Resolve a hostname, retrying transient resolver failures. Resolution runs on
 * every model call, so a single blip must not fail a whole book: the draft is
 * fine, the endpoint is fine, only the local resolver hiccuped.
 */
async function lookupHost(host, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return (await dns.lookup(host, { all: true })).map(row => row.address);
    } catch (e) {
      lastError = e;
      if (!TRANSIENT_DNS.has(e.code) || attempt === attempts - 1) break;
      await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  const reason = lastError?.code || lastError?.message || 'unknown error';
  throw new Error(`API base URL host could not be resolved: ${host} (${reason}).`);
}

/**
 * Validates a user-supplied OpenAI-compatible endpoint before it is saved or
 * fetched. Blocks loopback, private, link-local, CGNAT, multicast and IPv6
 * unique-local targets (set LLM_ALLOW_PRIVATE_HOSTS=1 for local models) and
 * requires https outside that opt-in.
 */
export async function assertSafeLlmBase(base) {
  let url;
  try {
    url = new URL(String(base));
  } catch {
    throw new Error('API base URL is not a valid URL.');
  }
  if (url.username || url.password) throw new Error('API base URL must not contain credentials.');
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('API base URL must use http or https.');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (!host) throw new Error('API base URL has no host.');
  if (url.protocol === 'http:' && !LLM_ALLOW_PRIVATE_HOSTS) {
    throw new Error('API base URL must use https.');
  }

  const literal = net.isIP(host);
  let addresses;
  if (literal) {
    addresses = [host];
  } else {
    addresses = await lookupHost(host);
  }
  if (!LLM_ALLOW_PRIVATE_HOSTS && addresses.some(isBlockedAddress)) {
    throw new Error('API base URL points to a private, loopback or link-local address.');
  }
  return url;
}
