import express from 'express';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { TEMPLATE_DIR, BETTER_AUTH_URL } from '../config.js';
import { sqlite, siteJsonPath } from '../db/index.js';


const router = express.Router();

async function serveGenerated(req, res, slug, sub) {
  const site = sqlite.prepare('SELECT * FROM sites WHERE slug=?').get(slug);
  if (!site || site.archived) return res.status(404).send('This site is not available.');
  if (site.example) return res.redirect('/example/matekbazis/');
  const allowed = req.user && (site.owner_id === req.user.id || req.user.role === 'admin');
  if (!site.published && !allowed) {
    if (!req.user) {
      return res.redirect(BETTER_AUTH_URL + '/login?next=' + encodeURIComponent(req.originalUrl || '/'));
    }
    return res.status(404).send('This site is private.');
  }
  const clean = String(sub || '').replace(/^\/+/, '');
  const jsonFile = siteJsonPath(slug);
  if (!clean) {
    let data;
    try {
      data = JSON.parse(await fsp.readFile(jsonFile, 'utf8'));
    } catch {
      return res.status(404).send('This site has no generated content.');
    }
    // Older books stored one title string; use the inferred pair so the page
    // follows the language selector like newly generated books do.
    if (typeof data.title === 'string' && site.title_hu && site.title_en) {
      data.title = { hu: site.title_hu, en: site.title_en };
    }
    if (typeof data.summary === 'string' && site.summary_hu && site.summary_en) {
      data.summary = { hu: site.summary_hu, en: site.summary_en };
    }
    const json = JSON.stringify(data).replace(/</g, '\\u003c');
    res.setHeader('Cache-Control', 'private, no-cache');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.status(200).render('generated', {
      site: data,
      slug,
      json,
      nonce: res.locals.cspNonce || '',
    });
  }
  if (clean === 'site.json') {
    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(jsonFile);
  }
  if (clean === 'app.js' || clean === 'styles.css' || clean === 'favicon.svg') {
    if (!fs.existsSync(path.join(TEMPLATE_DIR, clean))) return res.status(404).send('Not found.');
    return res.sendFile(path.join(TEMPLATE_DIR, clean), {
      headers: { 'Cache-Control': 'private, no-cache', 'X-Robots-Tag': 'noindex' },
    });
  }
  res.status(404).send('Not found.');
}

/* Host-based routing: <slug>.sites.example.com */
export function subdomainHandler(req, res, next) {
  if (!req.siteSlug || req.path.startsWith('/shared/')) return next();
  res.setHeader('X-Robots-Tag', 'noindex');
  serveGenerated(req, res, req.siteSlug, req.path).catch(next);
}

router.get('/s/:slug', (req, res, next) => {
  if (req.path.endsWith('/')) return next();
  res.redirect('/s/' + encodeURIComponent(req.params.slug) + '/');
});
router.get('/s/:slug/', (req, res, next) => serveGenerated(req, res, req.params.slug, '').catch(next));
router.get('/s/:slug/:asset', (req, res, next) => serveGenerated(req, res, req.params.slug, req.params.asset).catch(next));

export default router;
