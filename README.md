# Bindery

Bindery is a small, self-hosted creator for routed learning-book sites. Users upload notes and paste
long text; Bindery adds the `learning-book-site` skill as context, has a model design the book
outline and term registry, writes one deep chapter per validated pass, assembles the glossary, runs
the depth contract, and publishes the result at its own URL.
The original MatekBázis book is included only as a **project that was already created**, in
`examples/matekbazis/`.

- **Routed, not downloadable.** Every site is served at `/s/<slug>/` (and optionally at
  `<slug>.<SITE_DOMAIN>`). There is no ZIP endpoint and no download button.
- **Users only.** Sign-up is disabled. One seeded administrator creates accounts.
- **Daily quota.** Each user has a configurable **book generations per day** limit; the admin can
  change it. One deep book is one unit, however many chapter passes it needs.
- **Bring your own model.** Every user saves their own OpenAI-compatible endpoint, model and key
  in Settings (encrypted at rest). There is no server-wide model key.
- **Reuse first.** The create form searches the catalog; the API also returns up to five
  matching published sites before queueing. The user can open/reuse one, or choose
  **Generate a new site anyway** (`force: true`) without spending a generation on a duplicate.
- **React builder, SSR books.** The builder (dashboard, create, catalog, settings, admin) is a
  React 19 + TypeScript SPA. Generated sites remain server-rendered EJS + a small static renderer;
  they never load the React bundle.
- **Bilingual (HU/EN) dashboard** with a navy/gold MatekBázis-style shell, quota and catalog
  shortcuts, plus archive, regenerate and cancel actions.
- **Light and dark themes.** The builder, login, example and generated shells all ship both
  themes; the choice is persisted and applied before CSS loads.
- **Durable queue.** Leased jobs survive restarts and retry once with backoff. A draft is saved after
  every chapter, so a resumed job continues instead of restarting the book. Output is validated
  against the bilingual schema and the depth contract; failing chapters are regenerated, and
  `site.json` is written only after validation passes.
- **Beginner-proof books.** Every definition/theorem has plain words, a reason to exist, a precise
  version, an analogy, common confusions and check-yourself questions; every chapter has a
  refresher, recap, term list and a word budget that scales with its new terms. A searchable
  glossary, term index and hover/tap tooltips are generated from the registry.
- **Habit layer in the book.** Today's plan (30/60/120 minutes), active-minute tracking with a
  ramped target, a five-minute minimum day, daily `.ics` export, a stuck prompt, miss-reason tags,
  a pace planner, a welcome-back screen, and a local buddy summary/import code. No accounts, no
  network, no telemetry.
- **Operations.** `/healthz` and `/readyz`, a SQLite + sites backup script, and CI that runs tests,
  builds the client, and builds the image.

Generation limits are audited in `docs/LIMITS_AUDIT.md` and the recorded verification run is in
`docs/VERIFICATION.md`.

## Stack

| Piece | Choice | Why |
|---|---|---|
| Runtime | Node 24 + Express 5 | Conventional API/SSR server, no server build step |
| Builder frontend | React 19 + TypeScript + Vite 8 + Tailwind 4 | Component reuse, typed API layer, fast builds |
| Auth | Better Auth (email/password, admin plugin) | Session cookies, password hashing, user management |
| Storage | `better-sqlite3` at `/data/builder.db` + `/data/sites/<slug>/site.json` | One file each; auth/quota/catalog |
| Generated site | server-rendered EJS + static CSS/JS + `site.json` | No per-site process and no React payload |
| PDF text | `pdftotext` from Alpine `poppler-utils` | Only needed when a PDF is uploaded |
| Reverse proxy | Traefik + Cloudflare Tunnel via Launchpad | Wildcard DNS already exists |

### Why SQLite instead of PostgreSQL

Bindery runs as **one process on one host**: one worker drains the generation queue, and all
writes are short metadata updates. SQLite in WAL mode handles that load, removes a second stateful
service from the deployment, and makes backups a single file. PostgreSQL would add a container,
connection pooling, and an async rewrite of every query without buying anything until there are
multiple replicas or several writers on different hosts. If the project grows that way, the schema
is plain SQL and the `db/index.js` surface is small; switching later is a contained change.

## Repository layout

```
apps/client/           React SPA (builder only)
  src/components/ui/   shared primitives (Button, Card, Field, Badge, Alert…)
  src/components/      layout and site cards
  src/pages/           login, dashboard, create, site, catalog, settings, admin
  src/context/         auth, i18n, theme, toasts
  src/lib/             API client, types, i18n dictionary, formatters
apps/server/
  src/routes/api.js    JSON API used by the SPA
  src/routes/generated.js  SSR generated-site routes and subdomain handler
  src/services/        generation worker and upload extraction
  src/db/              SQLite schema, profiles, quota, site helpers
  src/views/generated.ejs  the only EJS view (SSR learning book shell)
  src/template/        static renderer used by every generated site
  test/                generation schema tests
shared/katex/          shared math assets
skills/learning-book-site/SKILL.md   required generation context
examples/matekbazis/   an already-created project, seeded in the catalog
Dockerfile             Node 24 + poppler-utils single production image
compose.prod.yaml      Launchpad compose stack (one service, one volume, no host ports)
docker-compose.yml     local compose with a published port
deploy.md              Launchpad walkthrough: scan, variables, redeploys, troubleshooting
.env.example           required and optional settings
.env.prod.example      production values template for compose.prod.yaml
```

## Development (no tokens required)

`NODE_ENV` unset means development. With no `.env` and no environment variables:

- first start creates `admin@example.com` with password `admin12345`
- generation requires a user API key (add one in Settings), unless `LLM_MOCK=1`
- the API listens on `http://localhost:8080`
- SQLite and uploads live in `./data`

```bash
npm install

# terminal 1 — API on :8080
npm run dev:server

# terminal 2 — Vite on :5173 (proxies /api, /s, /shared, /example)
npm run dev:client
```

Open <http://localhost:5173>. Build the production SPA with `npm run build`; then
`npm start` serves it from `:8080` together with the API and generated sites.

In development any non-local `BETTER_AUTH_URL` in `.env` is ignored so login works on localhost.

Back up the database, generated sites and example with `npm run backup` (writes to
`backups/<timestamp>/`). The builder remembers its HU/EN choice in `localStorage`; use the HU/EN
switch in the header.

Add a user key in **Settings** to call a real model; `LLM_BASE_URL` and `LLM_MODEL` are only
defaults. Set `LLM_MOCK=1` for a deterministic sample without a key. `MAX_CONCURRENT_JOBS=3`
controls how many generations run at once; `LLM_MOCK_DELAY=500` is useful when mocking.
Limits live in `apps/server/src/limits.js` (documented constants) and `apps/server/src/config.js`
(env-seeded defaults); `docs/LIMITS_AUDIT.md` has the full before/after table. Defaults:
`MAX_BOOK_CHAPTERS=90` (hard cap 180; the target also scales with source topic count),
`CHAPTER_BATCH_SIZE=1` (one chapter per call), `LLM_MAX_TOKENS=32000` per chapter pass,
`LLM_TIMEOUT_MS=900000`, 400 000 source characters, and a 96 MiB `site.json` cap. The environment
values only seed a fresh install; an administrator can change the three editable caps in
**Admin → Generation limits**. The create form shows the real chapter/word/time estimate before a
job starts, and can split a large source into up to six parts.

## Deploy on Launchpad

There are two supported paths.

### A. Single container from GHCR (recommended)

1. Push this repository to GitHub.
2. In Launchpad, create an app with source **Docker image**
   `ghcr.io/<owner>/<repository>:latest`, internal port `8080`, health path `/readyz`, and a
   persistent volume mounted at `/data` (SQLite + generated sites).
3. Enable **CI/CD with GitHub Actions** and copy the app id + webhook secret.
4. Add repository variables and secrets:

   | Kind | Name | Value |
   |---|---|---|
   | Variable | `LAUNCHPAD_PANEL_URL` | `https://panel.example.com` |
   | Variable | `LAUNCHPAD_APP_ID` | the app id from Launchpad |
   | Secret | `LAUNCHPAD_WEBHOOK_SECRET` | the app's webhook secret |
   | Secret | `CF_ACCESS_CLIENT_ID` | Cloudflare Access service token id |
   | Secret | `CF_ACCESS_CLIENT_SECRET` | Cloudflare Access service token secret |

5. Add the environment variables from [`.env.example`](.env.example) in the Launchpad app.
   At minimum: `BASE_DOMAIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BETTER_AUTH_SECRET`,
   `ENCRYPTION_KEY`. `ENCRYPTION_KEY` must stay stable, otherwise saved user API keys cannot be
   decrypted.
6. Push to `main`. The deploy workflow builds and pushes `ghcr.io/<owner>/<repo>:<sha>` plus
   `:latest`, then calls the Launchpad deploy webhook with that image tag.

Keep the GHCR package public, or store a `read:packages` token under **Settings → GHCR** in
Launchpad for private packages.

### B. Compose project

1. In Launchpad, create a **Compose project** pointing at the repository, branch `main`, compose
   path [`compose.prod.yaml`](compose.prod.yaml).
2. Scan the compose file. Publish the `bindery` service on subdomain `bindery` (or your preferred
   name), internal port `8080`, readiness path `/readyz`. Leave `tunnel` unpublished.
3. Fill the scanned variables (see [`.env.prod.example`](.env.prod.example)). At minimum:
   `BASE_DOMAIN`, `SITE_ORIGIN`, `BETTER_AUTH_SECRET`, `ENCRYPTION_KEY`, `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`, `CLOUDFLARE_TUNNEL_TOKEN`.
4. Deploy. Launchpad prefixes the `bindery-data` volume, so it survives redeploys. The stack's
   `cloudflared` tunnel publishes `bindery.<BASE_DOMAIN>` (and optionally
   `*.sites.<BASE_DOMAIN>`) to `bindery:8080`.

[`deploy.md`](deploy.md) walks through the scan, the Cloudflare tunnel, optional generated-book
subdomains, backups, the push webhook and troubleshooting.

`compose.prod.yaml` publishes no host ports, so `docker-compose.yml` + `docker-compose.override.yml`
remain the local option: `docker compose up --build` serves the builder at
`http://localhost:8080`.

### Optional subdomain routing

Path routing works out of the box at `https://bindery.<BASE_DOMAIN>/s/<slug>/`. If you also want
`https://<slug>.sites.<BASE_DOMAIN>/`, point a wildcard at the same Traefik entrypoint and add a
router for the Bindery container:

```
traefik.http.routers.bindery-sites.rule=HostRegexp(`^[a-z0-9-]+[.]sites[.]example[.]com$`)
```

Set `COOKIE_DOMAIN=.example.com` (and `COOKIE_SECURE=1`) so the session is shared with the
subdomain. The server reads the `Host` header and serves the matching site at `/`.

## API

All routes require the session cookie; mutating requests also require a same-origin `Origin` (or
`Sec-Fetch-Site: same-origin`).

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/healthz` | Liveness |
| `GET` | `/readyz` | DB + generation worker readiness and queue counts |
| `GET` | `/api/me` | User, quota, remaining, key state |
| `GET` | `/api/sites` | Own sites + example |
| `POST` | `/api/sites` | Queue a generation; `maxChapters` and `parts` are optional; returns catalog suggestions unless `force: true` |
| `GET` | `/api/limits?source=&topic=` | Pre-generation limits: target chapters, words, tokens, time |
| `GET` | `/api/sites/:id` | Status, job log and per-chapter progress |
| `POST` | `/api/sites/:id/clone` | Reuse an existing site |
| `POST` | `/api/sites/:id/cancel` | Cancel a queued/running job |
| `POST` | `/api/sites/:id/regenerate` | Queue the site again |
| `DELETE` | `/api/sites/:id` | Archive and remove a site |
| `GET` | `/api/catalog?q=` | Search published sites |
| `POST` | `/api/uploads` | Multipart notes/files; returns extracted upload ids |
| `GET/PUT` | `/api/settings` | Per-user API config |
| `GET` | `/api/settings/shares` | Incoming and outgoing key grants |
| `POST` | `/api/settings/shares` | Share your key with a user by email |
| `DELETE` | `/api/settings/shares/:id` | Revoke a grant (owner or grantee) |
| `GET/POST` | `/api/admin/users` | Admin only |
| `PATCH` | `/api/admin/users/:id` | Limit, disable, or reset password |
| `GET/PATCH` | `/api/admin/settings` | Generation caps: chapters per book, chapters per request, output tokens |
| `POST` | `/api/auth/*` | Better Auth endpoints (sign-in, session, sign-out) |
| `POST` | `/api/logout` | Clears the session and the server session cache |

The admin API never returns password hashes. Public site payloads never contain source text or
owner ids. Key grants only ever expose the owner's name and email: the key itself is decrypted
server-side for generation, an own key always wins over a shared one, and either side can revoke a
grant at any time.

## Generated-site contract

The model returns outline/term JSON, then one chapter object per pass; `apps/server/src/services/generation.js`
normalizes them, `depth.js` validates the depth contract, and schema version 2 is written:

```json
{
  "version": 2,
  "title": "…",
  "subtitle": { "hu": "…", "en": "…" },
  "sections": [{
    "id": "basics", "num": "01",
    "conceptMap": { "hu": ["…"], "en": ["…"] },
    "summary": { "hu": "…", "en": "…" },
    "chapters": [{
      "id": "first", "num": "1.1",
      "title": { "hu": "…", "en": "…" },
      "lead": { "hu": "…", "en": "…" },
      "why": { "hu": ["…"], "en": ["…"] },
      "terms": [{ "id": "power", "term": { "hu": "…", "en": "…" },
                  "plain": { "hu": "…", "en": "…" }, "precise": { "hu": "…", "en": "…" },
                  "requires": [] }],
      "refresher": [{ "label": { "hu": "…", "en": "…" } }],
      "checks": [{ "q": { "hu": "…", "en": "…" }, "a": { "hu": "…", "en": "…" } }],
      "recap": { "points": { "hu": ["…"], "en": ["…"] }, "next": { "hu": "…", "en": "…" } },
      "theory": [{ "type": "def", "title": { "hu": "…", "en": "…" },
                   "body": { "hu": "…", "en": "…" },
                   "plain": { "hu": "…", "en": "…" }, "why": { "hu": "…", "en": "…" },
                   "precise": { "hu": "…", "en": "…" }, "analogy": { "hu": "…", "en": "…" },
                   "confusions": [], "checks": [], "terms": ["power"] }],
      "examples": [{ "problem": { "hu": "…", "en": "…" },
                     "steps": { "hu": ["…"], "en": ["…"] },
                     "reasons": { "hu": ["…"], "en": ["…"] },
                     "answer": { "hu": "…", "en": "…" } }]
    }]
  }],
  "glossary": [{ "id": "power", "term": { "hu": "…", "en": "…" },
                 "plain": { "hu": "…", "en": "…" }, "precise": { "hu": "…", "en": "…" },
                 "requires": [], "chapter": { "section": "basics", "chapter": "first" } }]
}
```

Version-1 books (including the pre-change `data/sites/*/site.json`) still load: the renderer treats
the new fields as optional and never rewrites stored data. A read-time normalizer is exported as
`migrateSite` for tooling.

Prose is bilingual; LaTeX is shared. The renderer supports definitions, theorems, notes, warnings,
code blocks, formulas, lists, worked examples, mistakes, choice/number/expr/text/proof exercises,
local progress, language switching, search and print. Every book also gets the study modes
generated from `site.json`: Today's plan, Focus/Launchpad, Learn and review, Knowledge map, Daily
quest, Error notebook, Mixed run, Error hunt, Progress, Glossary, Formula sheet, Videos, Practice
bank, Exam simulator and Resources. They run entirely in the browser from the generated content and persist per-book state
in `localStorage`; numeric answers are checked with a CSP-safe parser, never `eval`. It never
exposes a download. Only `site.json` is stored at generation time; `generated.ejs` is rendered per
request so template and CSP changes apply immediately.

## Security

- Only the seeded admin can create users; the public sign-up route is blocked and Better Auth's
  own sign-up is disabled for the client path.
- Sessions are random tokens stored server-side; passwords use Better Auth's hash. Logout,
  disable, and admin password resets clear the in-process session cache and (for other users)
  revoke existing sessions.
- Per-user API keys are encrypted with AES-256-GCM under `ENCRYPTION_KEY`.
- Keys can be granted to other users without revealing them: grants expose only the owner's name,
  email and provider host, an own key always wins over a shared one, and either side can revoke.
  Grants are scoped per user and require the owner to have a key.
- Provider base URLs must use `https` and resolve to a public address; loopback, private,
  link-local, CGNAT and metadata addresses are rejected on save and before every call, and
  provider redirects are refused. `LLM_ALLOW_PRIVATE_HOSTS=1` is the explicit opt-in for local
  models (Ollama, vLLM).
- Daily quotas count **book generations** (one job per book run) on the server's local day, so
  cancelling, archiving or regenerating cannot bypass the limit, while a deep 90-chapter book costs
  one unit rather than ninety calls.
- Catalog search never reads private source text, and cloning another user's site copies only the
  generated book, not the source material.
- API writes require same-origin `Origin` and a same-site `Sec-Fetch-Site` where the browser sends
  one; the JSON API sets `Cache-Control: no-store`.
- Helmet ships a CSP with a per-request nonce, HSTS in production, `no-referrer`, `frame-ancestors
  'none'`, and a restrictive permissions policy. The static example page gets a separate CSP
  because its inline bootstrap is trusted and auth-gated.
- Rate limits apply to Better Auth routes (`/sign-in/email` 10 / 15 min) and the builder API;
  `TRUST_PROXY=1` resolves the real client IP behind Traefik/Cloudflare.
- Uploads are capped at 6 files × 8 MB. PDFs are checked for a `%PDF-` header, text files are
  rejected when binary, extracted text is capped, raw files are deleted after extraction, and
  orphaned extraction rows are cleaned after 7 days.
- Generated sites are private unless published to the catalog; published sites are visible to
  signed-in users only.
- The container runs as `node` (non-root), with `tini` as PID 1, no Docker socket, no host ports;
  generated sites are static files, not containers.
- `GET /readyz` returns 503 when the DB or worker heartbeat is stale; `SIGTERM` stops the queue,
  closes the HTTP server, and closes SQLite within 10 seconds.

## Frontend rules

All builder UI follows a shared navy/gold token system, a 4px spacing scale, a fixed type scale,
shared primitives, and no nested interactive elements. Generated books keep their own SSR book
theme and are exempt.

## Tests

```bash
npm test          # generation schema + normalization
npm run build     # TypeScript check and production bundle
```

`npm ci` in CI installs both workspaces; the Docker image builds the client in a separate stage and
ships only production server dependencies.

## License

[GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`), plus the attribution term in [NOTICE](NOTICE). Copyright (C) 2026 KoZsombat.

What that means in practice:

- **Use it however you like**, including commercially. Self-hosting, modifying and redistributing are allowed.
- **Distributing it or a modified version?** Pass on the source under AGPL and keep the notices; state what you changed.
- **Running a modified version for users over a network?** Those users must be offered the corresponding source (AGPL §13).
- **Credit:** whenever you distribute or publish this program, or a work containing it — modified or not — keep `Based on Bindery by KoZsombat — https://github.com/KoZsombat/learn-helper` in its visible legal notices (About page, footer, or equivalent). This is an additional term explicitly permitted by AGPL §7, so the project remains recognized as AGPL-3.0.
- **No warranty.**

Two honest limits: a private, unmodified self-host is not "conveying", so AGPL does not force an in-app credit for it (only a custom license could); and no trademark rights are granted, so forks must not imply endorsement.
