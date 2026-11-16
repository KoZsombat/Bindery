# Deploying on Launchpad

Bindery is one Node process with SQLite on a persistent volume, so the Launchpad stack is one
application service plus the stack's own Cloudflare connector: [`compose.prod.yaml`](compose.prod.yaml).
Launchpad scans it, publishes one hostname, and routes to container port `8080`.

```
Internet ── HTTPS ──> Cloudflare ──┬──> Launchpad tunnel (wildcard) ──> Traefik ──> bindery :8080
                                   └──> stack `tunnel` (cloudflared) ─────────────> bindery :8080
                                                                                      │
                                                                            /data/builder.db
                                                                            /data/sites/<slug>/
                                                                            /data/uploads/
```

No host ports are published. The hostname is served either by the panel's Traefik + wildcard tunnel
or by this stack's own `tunnel` service — not both. `/data` is the only stateful directory; the
container runs as the non-root `node` user with `tini` as PID 1.

Two deployment paths are supported; this guide covers the compose project. For the prebuilt-image
path, see [README → Deploy on Launchpad A](README.md#a-single-container-from-ghcr-recommended).

## 1. Prerequisites

- Launchpad running with a `BASE_DOMAIN` and its shared `web` Docker network.
- A Cloudflare zone for that domain. Either the wildcard `*.<BASE_DOMAIN>` already points at the
  panel's Traefik, or this stack's own tunnel will publish the bindery hostname.
- The repository on GitHub, with this branch checked out.
- A Cloudflare API token/account access to create the tunnel (section 3.1).

## 2. Create the compose project

1. Launchpad → **New app** → **Compose project**.
2. Source: **GitHub repository**, branch `main`, compose path `compose.prod.yaml`.
3. **Scan compose**. Publish exactly one service:

   | Service | Container port | Health path | Subdomain |
   | --- | --- | --- | --- |
   | `bindery` | `8080` | `/readyz` | `bindery` |

   Leave `tunnel` **unpublished**: it has no `expose:` and no port, because cloudflared only dials
   out. `compose.prod.yaml` publishes no host ports, so there is nothing to remove. Launchpad
   attaches `bindery` to the `web` network and adds its Traefik labels. The named volume
   `bindery-data` is prefixed by Launchpad (`launchpad-<app>-bindery-data`) and survives redeploys.
4. Deployment target: **This host**.

The service needs roughly 512 MB RAM; the image includes `poppler-utils` for PDF uploads and builds
the React SPA in its own stage, so the runtime image does not carry build tooling.

## 3. Variables

Launchpad lists every `${VAR}` from the compose file. Fill them from
[`.env.prod.example`](.env.prod.example):

| Variable | Value |
| --- | --- |
| `BASE_DOMAIN` | your Launchpad base domain, e.g. `example.com` |
| `SITE_ORIGIN` | the exact public origin, e.g. `https://bindery.example.com` (scheme + host, no trailing slash) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | `openssl rand -base64 32`; keep it stable forever |
| `ADMIN_EMAIL` | the first administrator's e-mail |
| `ADMIN_PASSWORD` | at least 10 characters; used only while no admin exists |
| `CLOUDFLARE_TUNNEL_TOKEN` | the token of this stack's own tunnel — see [3.1](#31-the-stacks-own-tunnel) |
| `COOKIE_DOMAIN` | optional: `.example.com` when generated books use subdomains |

`SITE_ORIGIN`, `BETTER_AUTH_SECRET`, `ENCRYPTION_KEY` and `ADMIN_PASSWORD` are load-bearing:

- `SITE_ORIGIN` is passed to the app as `BETTER_AUTH_URL`; Better Auth rejects a browser origin that
  does not match it.
- A production start fails when `BETTER_AUTH_SECRET` is missing or shorter than 32 characters.
- `ENCRYPTION_KEY` encrypts each user's provider key. Rotating it makes every saved key
  undecryptable; users must enter their keys again.
- `ADMIN_PASSWORD` is used only for the first admin. Changing the variable later does not change
  the existing password; reset it from **Admin → Users** or by deleting the admin row with a
  backup in hand.

Each user supplies their own OpenAI-compatible endpoint, model and API key in **Settings**.
There is no server-wide model key. `LLM_BASE_URL` and `LLM_MODEL` are only defaults.

### 3.1 The stack's own tunnel

`tunnel` is a **remotely managed** Cloudflare tunnel: `compose.prod.yaml` carries only the token;
every hostname and target lives in the Cloudflare dashboard. It exists because Launchpad starts
every service in the scanned file, so the connector cannot be a `profiles`-gated extra; its token is
`${:?}`, which makes a missing value stop the deploy while parsing the file.

1. Zero Trust → **Networks → Tunnels → Create a tunnel → Cloudflared**, name it after the app, copy
   the token into `CLOUDFLARE_TUNNEL_TOKEN`.
2. On the tunnel's **Public hostname** tab add:

   | Hostname | Service |
   | --- | --- |
   | `bindery.example.com` | `http://bindery:8080` |
   | `*.sites.example.com` (optional) | `http://bindery:8080` |

   The wildcard is only needed when generated books are served on `<slug>.sites.<BASE_DOMAIN>`;
   path routing at `https://bindery.example.com/s/<slug>/` works without it.
3. Cloudflare creates a proxied `CNAME` per name. A specific record wins over the `*.example.com`
   wildcard, so the bindery name takes precedence over the panel's tunnel. Remove old `A`/`AAAA`
   records for the same name.

One hostname must belong to one tunnel. If you would rather keep the wildcard → Traefik path for the
panel, create the tunnel anyway — the service cannot be skipped, since Launchpad starts every
service in the file — but add **no** public hostname to it: with a valid token and no ingress rules
it registers and serves nothing. Never configure the same name on both tunnels; Cloudflare answers
from whichever one wins.

`docker compose -f compose.prod.yaml logs -f tunnel` shows `Registered tunnel connection` when it
works, `failed to authenticate` when the token is wrong or was rotated (update the variable and
redeploy).

## 4. Deploy and verify

Submit the deployment and watch the log: the image builds the SPA, the container creates the admin,
starts the queue worker and answers `/readyz`, then the connector registers.

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://bindery.example.com/readyz
curl -sS https://bindery.example.com/readyz | jq
```

`/readyz` returns `200` only when SQLite is open and the worker heartbeat is fresh; the JSON also
shows queue counts. Then open `https://bindery.example.com`, sign in with `ADMIN_EMAIL` /
`ADMIN_PASSWORD`, and create accounts from **Admin**.

Path routing works immediately: every generated book lives at
`https://bindery.example.com/s/<slug>/`. No extra hostname is required.

## 5. Optional: generated-book subdomains

To serve books at `https://<slug>.sites.example.com/` as well:

1. Add the wildcard hostname `*.sites.example.com → http://bindery:8080` to the tunnel (3.1), or
   point a wildcard record at the panel's Traefik.
2. Add a Traefik router if you use the panel path:

   ```
   traefik.http.routers.bindery-sites.rule=HostRegexp(`^[a-z0-9-]+[.]sites[.]example[.]com$`)
   ```

3. Set `COOKIE_DOMAIN=.example.com` (and keep `COOKIE_SECURE=1`) so the session is shared, then
   redeploy. The server reads the `Host` header and serves the matching site at `/`.

Don't configure both a `*.sites` wildcard and per-slug records for the same name.

## 6. Backups

Everything durable is under `/data`. From the host:

```bash
docker compose -f compose.prod.yaml exec bindery npm run backup
```

or run the same command in a one-off container with the volume mounted. Backups land in
`backups/<timestamp>/` inside the container; copy them out before pruning. The SQLite database is
in WAL mode, so prefer the script (it checkpoints) over copying `builder.db` while the app runs.

## 7. Protecting Bindery

Bindery has its own login, but put it behind **Cloudflare Access** like the panel itself:
Zero Trust → Access → Add a self-hosted application for `bindery.example.com`, policy Allow → your
e-mail. The same policy covers `/s/<slug>/`; generated books require a signed-in Bindery session, so
no separate site hostname needs a policy.

## 8. Redeploys

Compose projects use the push webhook, not the GitHub Actions image workflow:

1. In the Launchpad project, copy the webhook URL and per-app secret.
2. GitHub → repository → Settings → Webhooks → Add webhook:
   - Payload URL: the Launchpad webhook URL,
   - Content type: `application/json`,
   - Secret: the webhook secret,
   - Events: **Just the push event**.
3. Push to `main`. Launchpad re-reads the compose file, rebuilds the image and swaps the stack.
   The previous stack is started again if the new one fails to become healthy.

The database, uploads and generated sites stay in the named volume, so they survive the swap.

## 9. Running the production stack locally

```bash
cp .env.prod.example .env.prod
# fill in the values; for local use:
#   BASE_DOMAIN=localhost
#   SITE_ORIGIN=http://localhost:8080
#   CLOUDFLARE_TUNNEL_TOKEN=placeholder

docker compose -f compose.prod.yaml --env-file .env.prod up -d --build
```

`compose.prod.yaml` publishes no ports and starts the connector, so add a throwaway override that
publishes Bindery and takes the tunnel out of the way:

```yaml
# compose.local.yaml
services:
  bindery:
    ports:
      - "8080:8080"
    environment:
      COOKIE_SECURE: "0"
  tunnel:
    command: ["--version"]
    restart: "no"
```

```bash
docker compose -f compose.prod.yaml -f compose.local.yaml --env-file .env.prod up -d --build
curl -sS http://localhost:8080/readyz
```

`compose.prod.yaml` still needs a non-empty `CLOUDFLARE_TUNNEL_TOKEN` to parse, so keep the
placeholder in `.env.prod`.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `502` on the hostname | `bindery` is running and listening on `8080`; health path is `/readyz`. |
| Container exits at start | The log names the missing variable; `BETTER_AUTH_SECRET` must be 32+ characters and `ADMIN_PASSWORD` 10+. |
| Login says the origin is wrong | `SITE_ORIGIN` must exactly match the browser origin; no trailing slash. |
| Login works, requests 401 | `TRUST_PROXY=1` is set by the compose file; check the session cookie and that `COOKIE_SECURE=1` matches HTTPS. |
| `tunnel` restarts, `failed to authenticate` | The token is wrong or rotated: update `CLOUDFLARE_TUNNEL_TOKEN` and redeploy. |
| Hostname times out, tunnel connects | The tunnel has no public hostname, or it points at the wrong service; use `http://bindery:8080`. |
| Same hostname answers from the panel instead | Remove the other tunnel's public hostname or the conflicting DNS record. |
| PDF upload fails | The image ships `poppler-utils`; a custom image must include it. |
| Generation says "No API key" | Each user adds a key in **Settings**; `LLM_MOCK=1` is only for demos. |
| Generation fails with 400 from the provider | Lower `LLM_MAX_TOKENS` in **Admin → Generation limits**, or use `CHAPTER_BATCH_SIZE=1`. |
| Data disappeared after redeploy | The volume is not mounted at `/data`; check the scanned volume and `DATA_DIR=/data`. |
| `/readyz` returns 503 | SQLite or the worker heartbeat is stale; inspect the container log for a crashed worker. |
| Compose deploy asks for a variable | Fill every `${VAR:?}` placeholder; `:?` makes them mandatory. |

## Single-container alternative

If you prefer a prebuilt image, `deploy.yml` builds and pushes
`ghcr.io/<owner>/<repository>:<sha>` and `:latest`, then calls the Launchpad deploy webhook.
Create a **Docker image** app instead of a compose project, publish port `8080`, set health path
`/readyz`, mount a volume at `/data`, and add the variables above in the app settings. See
[README → Deploy on Launchpad A](README.md#a-single-container-from-ghcr-recommended).
