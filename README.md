# Learning Book Builder

A self-hosted creator for **routed learning-book sites**. Users upload notes and paste long text;
the builder adds the `learning-book-site` skill as context, asks a model for one structured JSON
book, and publishes it at a URL. Nothing is downloaded: every site is served by the builder.

The repository is about the creator. The original **MatekBázis** book is included only as a
**project that was already created**, in [`examples/matekbazis/`](examples/matekbazis/). It is
seeded into the catalog and served as an example.

## What it does

- **One administrator** creates users; public sign-up is disabled.
- **Users only** can open the builder, generated sites and the catalog.
- **Daily quota** per user (`3` by default), editable by the admin.
- **Uploads + long text**: PDF, TXT, MD, CSV, JSON, TEX, JS, HTML, CSS.
- **Model choice**: server-wide `LLM_API_KEY` or a per-user OpenAI-compatible endpoint/key/model.
- **Reuse first**: search the catalog; clone an existing site without calling the model.
- **Routed, not downloadable**: `/s/<slug>/`, optionally `<slug>.<SITE_DOMAIN>`.
- **Least compute**: zero npm dependencies, no build step, Node 24 + SQLite + static files; no
  per-site containers.

## Stack

| Piece | Choice |
|---|---|
| Runtime | Node 24 (`http`, `fetch`, `crypto`, `node:sqlite`) |
| Storage | SQLite at `/data/builder.db`, generated JSON at `/data/sites/<slug>/site.json` |
| Generated site | static `index.html` + `app.js` + `styles.css` + `site.json` |
| PDF text | `pdftotext` (Alpine `poppler-utils`), only for PDF uploads |
| Proxy | Launchpad → Traefik → this container |

## Deploy on Launchpad

1. Push this repository.
2. Launchpad → **New app** → **Compose project**.
3. Repository: this repo. Branch: `main`. Compose path: `platform/docker-compose.yml`.
4. Scan compose. Publish the `builder` service on subdomain `builder`, internal port `8080`,
   health path `/healthz`.
5. Add the variables from [`platform/.env.example`](platform/.env.example). At minimum:
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ENCRYPTION_KEY`, `BASE_DOMAIN`, `SITE_DOMAIN`.
6. Deploy and open `https://builder.<BASE_DOMAIN>`.

The compose file includes Traefik labels for a direct `docker compose up` on the shared `web`
network. Launchpad may add its own labels when scanning.

## Local smoke test

```bash
cd platform
cp .env.example .env
# set ADMIN_EMAIL / ADMIN_PASSWORD / ENCRYPTION_KEY
LLM_MOCK=1 node server.js
```

Open <http://127.0.0.1:8080>. `LLM_MOCK=1` returns a deterministic sample instead of calling a
model. For real generation, set `LLM_API_KEY` or add a per-user key in **Settings**.

## Repository layout

```
platform/                 creator: server, UI, generated-site template, compose, Dockerfile
platform/template/        static bilingual renderer used by every generated site
platform/shared/katex/    shared math assets
skills/learning-book-site/SKILL.md   the method injected into generation
examples/matekbazis/      an already-created project (the original book), seeded as an example
```

## Generated-site contract

Every generated site is one JSON document with bilingual prose (`{hu,en}`) and shared LaTeX. The
server normalizes it, stores it as `site.json`, and the static renderer reads it. Supported blocks:
definitions, theorems, notes, warnings, formulas, lists, worked examples, mistakes, and
number/expr/text/choice/proof exercises. Reading progress is local; language switching and search
are client-side. There is no download endpoint.

See [`platform/README.md`](platform/README.md) for the API, security model, auth flow, quotas,
uploads, catalog/reuse and deployment details.
