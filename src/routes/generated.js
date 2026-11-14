import express from 'express';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { TEMPLATE_DIR, BETTER_AUTH_URL } from '../config.js';
import { sqlite, siteJsonPath } from '../db/index.js';
import { requireUser } from '../middleware/session.js';

const router = express.Router();

async function serveGenerated(req, res, slug, sub) {
  if (!req.user) return res.redirect(BETTER_AUTH_URL + '/login?next=' + encodeURIComponent(req.originalUrl || '/'));
  const site = sqlite.prepare('SELECT * FROM sites WHERE slug=?').get(slug);
  if (!site || site.status !== 'ready') return res.status(404).send('This site is not ready.');
  if (site.example) return res.redirect('/example/matekbazis/');
  if (!site.published && site.owner_id !== req.user.id && req.user.role !== 'admin') return res.status(404).send('This site is private.');
  const clean = String(sub || '').replace(/^\/+/, '');
  if (!clean) {
    const index = path.join(path.dirname(siteJsonPath(slug)), 'index.html');
    if (fs.existsSync(index)) {
      const html = await fsp.readFile(index, 'utf8');
      if (html.includes('class="brand-mark"') && html.includes('styles.css?v=2') && html.includes('favicon.svg') && html.includes('themeBtn')) {
        res.setHeader('Cache-Control', 'private, no-cache');
        return res.sendFile(index);
      }
    }
    const data = JSON.parse(await fsp.readFile(siteJsonPath(slug), 'utf8'));
    res.setHeader('Cache-Control', 'private, no-cache');
    return res.render('generated', { site: data, slug, json: JSON.stringify(data).replace(/</g, '\\u003c') });
  }
  if (clean === 'site.json') {
    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(siteJsonPath(slug));
  }
  if (clean === 'app.js' || clean === 'styles.css' || clean === 'favicon.svg') {
    return res.sendFile(path.join(TEMPLATE_DIR, clean), { headers: { 'Cache-Control': 'private, no-cache' } });
  }
  res.status(404).send('Not found.');
}

/* Host-based routing: <slug>.sites.example.com */
export function subdomainHandler(req, res, next) {
  if (!req.siteSlug || req.path.startsWith('/shared/')) return next();
  serveGenerated(req, res, req.siteSlug, req.path).catch(next);
}

router.get('/s/:slug', (req, res, next) => {
  if (req.path.endsWith('/')) return next();
  res.redirect('/s/' + encodeURIComponent(req.params.slug) + '/');
});
router.get('/s/:slug/', requireUser, (req, res, next) => serveGenerated(req, res, req.params.slug, '').catch(next));
router.get('/s/:slug/:asset', requireUser, (req, res, next) => serveGenerated(req, res, req.params.slug, req.params.asset).catch(next));

export default router;
