const buckets = new Map();

function prune(now) {
  if (buckets.size < 5000) return;
  for (const [key, value] of buckets) if (value.until <= now) buckets.delete(key);
}

/**
 * Small in-memory fixed-window limiter for API routes.
 * `key` may return a per-user id; otherwise the client IP is used.
 */
export function rateLimit({ windowMs, max, key, code = 'rate_limited' }) {
  return function (req, res, next) {
    const t = Date.now();
    const id = (key ? key(req) : (req.ip || req.socket.remoteAddress || 'unknown')) + ':' + req.method + ':' + req.path;
    let bucket = buckets.get(id);
    if (!bucket || bucket.until <= t) {
      bucket = { count: 0, until: t + windowMs };
      buckets.set(id, bucket);
      prune(t);
    }
    bucket.count++;
    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.until - t) / 1000)));
      if (req.path.startsWith('/api/') || req.baseUrl.startsWith('/api')) {
        return res.status(429).json({ error: code, message: 'Too many requests. Try again later.' });
      }
      return res.status(429).send('Too many requests. Try again later.');
    }
    next();
  };
}
