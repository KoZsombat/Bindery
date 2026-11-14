# Learning Book Builder

A small, self-hosted creator for routed learning-book sites. Users upload notes and paste long
text; the builder adds the `learning-book-site` skill as context, asks a model for one structured
JSON book, and publishes it at its own URL. The original MatekBázis book is included only as a
**project that was already created**, in `examples/matekbazis/`.

- **Routed, not downloadable.** Every site is served at `/s/<slug>/` (and optionally at
  `<slug>.<SITE_DOMAIN>`). There is no ZIP endpoint and no download button.
- **Users only.** Sign-up is disabled. One seeded administrator creates accounts.
- **Daily quota.** Each user has a configurable sites-per-day limit; the admin can change it.
- **Bring your own model.** Use the server-wide `LLM_API_KEY` or save an OpenAI-compatible
  endpoint/key/model per user (encrypted at rest).
- **Reuse first.** The create form searches the catalog; the API also returns up to five
  matching published sites before queueing. The user can open/reuse one, or choose
  **Generate a new site anyway** (`force: true`) without spending a generation on a duplicate.
- **Least compute.** Zero npm dependencies, no build step, no per-site containers. One Node 24
  process + SQLite + static files. The generated sites are JSON + a small static renderer.

## Stack

| Piece | Choice | Why |
|---|---|---|
| Runtime | Node 24, built-in `http`/`fetch`/`crypto`/`node:sqlite` | No install, no build, small image |
| Storage | `/data/builder.db` + `/data/sites/<slug>/site.json` | One file each; SQLite handles auth/quota/catalog |
| Generated site | static HTML/CSS/JS + `site.json` | No per-site process; routed by the same server |
| PDF text | `pdftotext` from Alpine `poppler-utils` | Only needed when a PDF is uploaded |
| Reverse proxy | Traefik + Cloudflare Tunnel via Launchpad | Wildcard DNS already exists |

## Repository layout

```
server.js              creator API, auth, quota, uploads, catalog, generation worker
public/                builder UI (login is server-rendered)
template/              static renderer used by every generated site
shared/katex/          shared math assets
Dockerfile             Node 24 + poppler-utils image
docker-compose.yml     Launchpad-ready service with Traefik labels
.env.example           required and optional settings
examples/matekbazis/   an already-created project, seeded in the catalog
skills/learning-book-site/SKILL.md   required generation context (tracked, not ignored)
```

## Run on Launchpad

1. Push this repository.
2. In Launchpad, create a **Compose project** pointing at the repository, branch `main`, compose
   path `docker-compose.yml`.
3. Scan the compose file. Publish the `builder` service on subdomain `builder` (or your preferred
   name), internal port `8080`, health path `/healthz`.
4. Add the environment variables from [`.env.example`](.env.example). At minimum set
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ENCRYPTION_KEY`, `BASE_DOMAIN`, `SITE_DOMAIN`.
   `ENCRYPTION_KEY` must stay stable, otherwise saved user API keys cannot be decrypted.
5. Deploy. Open `https://builder.<BASE_DOMAIN>` and sign in as the seeded admin.
6. Create a user in **Admin**. The user can then sign in, add an API key in **Settings**, and
   create a site.

The compose file already carries Traefik labels for a direct `docker compose up` behind the same
`web` network. Launchpad may add its own labels when scanning; keep the service port at `8080`.

### Optional subdomain routing

Path routing works out of the box at `https://builder.<BASE_DOMAIN>/s/<slug>/`. If you also want
`https://<slug>.sites.<BASE_DOMAIN>/`, point a wildcard at the same Traefik entrypoint and add a
router for the builder container:

```
traefik.http.routers.builder-sites.rule=HostRegexp(`^[a-z0-9-]+[.]sites[.]example[.]com$`)
```

Set `COOKIE_DOMAIN=.example.com` (and `COOKIE_SECURE=1`) so the session is shared with the
subdomain. The server reads the `Host` header and serves the matching site at `/`.

## Development (no tokens required)

`NODE_ENV` unset means development. With no `.env` and no environment variables:

- first start creates `admin@example.com` with password `admin`
- no model key is required; generation uses the deterministic mock
- the server listens on `http://127.0.0.1:8080`
- SQLite and uploads live in `./data`

```bash
node server.js
```

To use a real model in dev, set `LLM_API_KEY`/`LLM_BASE_URL` (or add a user key), or set
`LLM_MOCK=0` to require a key. `MAX_CONCURRENT_JOBS=3` controls how many generations run at
once; `LLM_MOCK_DELAY=500` is useful for exercising the queue.

## Local run with .env

```bash
cp .env.example .env
# edit ADMIN_EMAIL / ADMIN_PASSWORD / ENCRYPTION_KEY / model settings
node server.js
```

`.env` is loaded by `server.js` directly and is ignored by Git and Docker. The Docker image sets
`NODE_ENV=production`; compose forces it too, so production never uses the dev defaults.

Open <http://127.0.0.1:8080>. `LLM_MOCK=1` returns a deterministic sample instead of calling a
model. For a real run set `LLM_API_KEY` or add a user key.

## API

All routes require the session cookie; JSON writes also require same-origin `Origin`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/login` | Form login |
| `GET` | `/api/me` | User, quota, remaining |
| `GET` | `/api/sites` | Own sites + example |
| `POST` | `/api/sites` | Queue a generation; returns catalog suggestions unless `force: true` |
| `GET` | `/api/sites/:id` | Status + job log |
| `POST` | `/api/sites/:id/clone` | Reuse an existing site |
| `GET` | `/api/catalog?q=` | Search published sites |
| `POST` | `/api/uploads` | Multipart notes/files |
| `GET/PUT` | `/api/settings` | Per-user API config |
| `GET/POST` | `/api/admin/users` | Admin only |
| `PATCH` | `/api/admin/users/:id` | Limit, password, disable |

## Generated-site contract

The model returns one JSON object; `server.js` normalizes and validates it:

```json
{
  "title": "…",
  "subtitle": { "hu": "…", "en": "…" },
  "sections": [{
    "id": "basics", "num": "01",
    "title": { "hu": "…", "en": "…" },
    "chapters": [{
      "id": "first", "num": "1.1",
      "title": { "hu": "…", "en": "…" },
      "lead": { "hu": "…", "en": "…" },
      "why": { "hu": ["…"], "en": ["…"] },
      "theory": [{ "type": "def", "title": { "hu": "…", "en": "…" }, "body": { "hu": "…", "en": "…" } }],
      "examples": [{ "title": { "hu": "…", "en": "…" }, "problem": { "hu": "…", "en": "…" }, "steps": { "hu": ["…"], "en": ["…"] }, "answer": { "hu": "…", "en": "…" } }],
      "mistakes": { "hu": ["…"], "en": ["…"] },
      "exercises": [{ "q": { "hu": "…", "en": "…" }, "a": "4", "type": "number", "hint": { "hu": "…", "en": "…" }, "sol": { "hu": "…", "en": "…" } }]
    }]
  }]
}
```

Prose is bilingual; LaTeX is shared. The renderer supports definitions, theorems, notes, warnings,
formulas, lists, worked examples, mistakes, choice/number/expr/text/proof exercises, local progress,
language switching, search and print. It never exposes a download.

## Security notes

- Only the seeded admin can create users; there is no public sign-up.
- Sessions are random tokens stored server-side; passwords use scrypt.
- Per-user API keys are encrypted with AES-256-GCM under `ENCRYPTION_KEY`.
- `Origin` is checked on API writes; cookies are HttpOnly/SameSite=Lax.
- Generated sites are private unless published to the catalog; published sites are visible to
  signed-in users only.
- The builder does not mount the Docker socket. Generated sites are static files, not containers.
