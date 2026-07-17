# Deploying to Oracle Cloud VM

End-to-end guide for hosting **web + API + Postgres** on a single **Oracle Cloud Always Free** ARM VM, with **Caddy** for HTTPS.

Follow the steps in order the first time. Later updates are mostly [§13 Ongoing deploys](#13--ongoing-deploys).

---

## Architecture (production)

```
Internet
   │
   ▼
Caddy (:80 / :443) ── HTTPS via Let's Encrypt
   ├── life.mattsmith.sh      → web:3000   (Next.js)
   └── api.life.mattsmith.sh  → api:4000   (GraphQL + OAuth + uploads)

Portfolio (existing, unchanged):
   mattsmith.sh / www.mattsmith.sh  → current portfolio host (not this VM)

Internal Docker network only:
   postgres:5432   (not published to the internet)
```

This app uses **subdomains** of `mattsmith.sh` so it does **not** conflict with the personal portfolio on the apex.
Security model:

- Only **22 / 80 / 443** are reachable from the internet
- Postgres, Next.js, and the API are **not** open on public ports
- Sessions use an **HttpOnly** cookie set by the API (shared across your web + API hostnames)
- Google sign-in is limited to emails in `ALLOWED_EMAILS`

Local development is unchanged: `docker compose up` on ports 3000 / 4000 / 5432.

---

## Checklist overview

| # | Step |
|---|------|
| 0 | Gather accounts and notes |
| 1 | Create Oracle Cloud account |
| 2 | Generate SSH key (on your Mac) |
| 3 | Create the Always Free VM |
| 4 | Open ports in Oracle networking |
| 5 | DNS on `mattsmith.sh` (reuse domain; don’t touch portfolio) |
| 6 | First SSH + server setup |
| 7 | Clone the repo on the VM |
| 8 | Create Google OAuth credentials |
| 9 | (Optional) Plaid production keys |
| 10 | Write `.env.production` |
| 11 | First deploy |
| 12 | Verify HTTPS, login, backups |
| 13 | Ongoing deploys |
| — | Troubleshooting / costs / Mac Mini migration |

Replace `YOUR_GITHUB_USER` and allowlisted emails with your real values. Domain hostnames in this guide use **`mattsmith.sh`** (see §5).

---

## 0 — Gather accounts and notes

You will need:

1. An **Oracle Cloud** account (free tier): [cloud.oracle.com](https://cloud.oracle.com)
2. A **domain** — this project reuses **`mattsmith.sh`** via subdomains (portfolio stays on the apex; see §5)
3. A **GitHub** account with this repo (public or private with deploy access)
4. A **Google Cloud** project for OAuth ([console.cloud.google.com](https://console.cloud.google.com))
5. (Optional) **Plaid** production credentials if you will sync real banks

Keep a private note with:

- VM public IP
- Domain names (`life.mattsmith.sh` and `api.life.mattsmith.sh`)
- Paths to your SSH private key

---

## 1 — Create an Oracle Cloud account

1. Go to [cloud.oracle.com](https://cloud.oracle.com) → **Sign up**.
2. Complete registration (name, email, password, country).
3. Oracle may ask for a **credit card** for identity verification even when using Always Free. Stay within Always Free resources to avoid charges.
4. Choose a **home region** you will use permanently (e.g. `US West (Phoenix)` / `us-phoenix-1`). Free ARM capacity varies by region—if A1 shapes are unavailable, try another home region **before** creating important resources (home region is hard to change).
5. After the tenancy is ready, open the **Cloud Console**.

---

## 2 — Generate an SSH key (on your Mac)

If you already use SSH keys for GitHub, you can reuse that public key. Otherwise:

```bash
ssh-keygen -t ed25519 -C "oracle-life-management" -f ~/.ssh/oracle_life
```

- Private key: `~/.ssh/oracle_life` (never share or commit)
- Public key: `~/.ssh/oracle_life.pub` (paste into Oracle when creating the VM)

Show the public key to copy:

```bash
cat ~/.ssh/oracle_life.pub
```

---

## 3 — Create the Always Free VM

1. Console → **☰** → **Compute** → **Instances** → **Create instance**.
2. **Name:** e.g. `life-management`.
3. **Placement:** leave default AD unless you know otherwise.
4. **Image:** **Ubuntu 22.04** or **24.04** — architecture **aarch64** (ARM).
5. **Shape:** **Change shape** → **Ampere** → `VM.Standard.A1.Flex`.
   - Recommended for this app: **2 OCPUs**, **12 GB RAM** (within Always Free: up to 4 OCPU / 24 GB total across A1).
6. **Networking:**
   - Create new VCN **or** use the default.
   - Assign a **public IPv4 address**.
7. **SSH keys:** paste contents of `oracle_life.pub` (or upload the file).
8. Create the instance. Wait until state is **Running**.
9. Copy the **Public IP** from the instance details page.

Test SSH from your Mac (default Ubuntu user is usually `ubuntu`):

```bash
ssh -i ~/.ssh/oracle_life ubuntu@YOUR_VM_PUBLIC_IP
```

Accept the host key fingerprint the first time. You should get a shell prompt.

Optional convenience in `~/.ssh/config`:

```
Host life-oracle
  HostName YOUR_VM_PUBLIC_IP
  User ubuntu
  IdentityFile ~/.ssh/oracle_life
```

Then: `ssh life-oracle`.

### Capacity “Out of host capacity”

Always Free ARM is popular. If create fails:

- Retry later
- Try **1 OCPU / 6 GB** first
- Try a different availability domain
- As last resort, create a new tenancy in another region (only if you have no important data yet)

---

## 4 — Open ports in Oracle networking (critical)

Oracle’s edge firewall ignores Ubuntu UFW unless the **VCN security list / NSG** allows the traffic.

1. Instance details → **Subnet** link → **Security Lists** (or Network Security Groups attached to the VNIC).
2. On the **default security list** (or your NSG), **Add Ingress Rules**:

| Source CIDR   | Protocol | Dest port | Purpose |
|---------------|----------|-----------|---------|
| `0.0.0.0/0`   | TCP      | 22        | SSH |
| `0.0.0.0/0`   | TCP      | 80        | HTTP (Caddy + Let’s Encrypt) |
| `0.0.0.0/0`   | TCP      | 443       | HTTPS |

3. **Do not** add ingress for `3000`, `4000`, or `5432`.

Optional hardening: restrict SSH (`22`) to your home/office IP instead of `0.0.0.0/0`.

Also confirm the instance’s subnet has an **Internet Gateway** and a route rule `0.0.0.0/0 → Internet Gateway` (default VCN usually does).

---

## 5 — DNS on `mattsmith.sh` (share domain with portfolio)

You already own **`mattsmith.sh`** for the personal portfolio. **You do not need a new domain.** Host Life Management on subdomains so the apex portfolio is untouched.

### 5.1 Hostname plan

| Role | Hostname | Where it points |
|------|----------|-----------------|
| Portfolio (existing) | `mattsmith.sh` and/or `www.mattsmith.sh` | **Leave as-is** — current portfolio host |
| Life Management web | `life.mattsmith.sh` | Oracle VM public IP |
| Life Management API | `api.life.mattsmith.sh` | Same Oracle VM public IP |

Why this layout:

- Portfolio and this app never compete for the same hostname
- Session cookies use `Domain=.life.mattsmith.sh` (derived from `WEB_URL`), so they are shared by web + API but **not** sent to `mattsmith.sh`

Do **not** put this app on bare `mattsmith.sh` — that would replace or conflict with the portfolio.

### 5.2 Create DNS records only for the app

In whatever DNS already manages `mattsmith.sh` (Cloudflare, registrar DNS, etc.), **add** these records. Do not change existing apex / `www` records.

| Type | Name / host | Value | Proxy |
|------|-------------|--------|-------|
| **A** | `life` | Oracle VM public IP | DNS only (grey cloud) for first TLS |
| **A** | `api.life` | Same Oracle VM public IP | DNS only (grey cloud) for first TLS |

In Cloudflare UI that often looks like:

- Name: `life` → resolves to `life.mattsmith.sh`
- Name: `api.life` → resolves to `api.life.mattsmith.sh`

### 5.3 Wait for DNS

From your Mac:

```bash
dig +short life.mattsmith.sh
dig +short api.life.mattsmith.sh
dig +short mattsmith.sh
```

- `life` and `api.life` must return the **Oracle VM public IP**
- `mattsmith.sh` should still return whatever hosts the **portfolio** (unchanged)

Caddy cannot issue certificates until the two app hostnames resolve to the VM.

**Cloudflare proxy tip:** keep the new records **DNS only (grey cloud)** until Let’s Encrypt succeeds. You can orange-cloud later with Full (Strict) if you want; grey cloud is simplest for first bring-up.

---

## 6 — First SSH + server setup

SSH in:

```bash
ssh -i ~/.ssh/oracle_life ubuntu@YOUR_VM_PUBLIC_IP
```

### Option A — clone first, then run setup (recommended)

```bash
sudo mkdir -p /opt/life-management
sudo chown "$USER":"$USER" /opt/life-management
git clone https://github.com/MatthewHightech/life_management.git /opt/life-management
cd /opt/life-management
sudo ./scripts/setup-vm.sh
```

`setup-vm.sh` installs Docker + Compose plugin + git, enables **UFW** for SSH/80/443 only, and prepares `/opt/life-management`.

### Option B — bootstrap before clone

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/YOUR_GITHUB_USER/life_management/main/scripts/setup-vm.sh)"
```

Then clone into `/opt/life-management` as above.

### Docker group

```bash
sudo usermod -aG docker "$USER"
```

**Log out and SSH back in** so the group applies:

```bash
exit
ssh -i ~/.ssh/oracle_life ubuntu@YOUR_VM_PUBLIC_IP
docker ps   # should work without sudo
```

### OS updates (recommended)

```bash
sudo apt-get update && sudo apt-get upgrade -y
```

Reboot if the kernel was updated: `sudo reboot`, then SSH again.

---

## 7 — Repo on the VM

If you did not clone in §6:

```bash
sudo mkdir -p /opt/life-management
sudo chown "$USER":"$USER" /opt/life-management
git clone https://github.com/YOUR_GITHUB_USER/life_management.git /opt/life-management
cd /opt/life-management
```

Private repo: use a [GitHub deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) or a fine-grained PAT, and clone via SSH:

```bash
git clone git@github.com:YOUR_GITHUB_USER/life_management.git /opt/life-management
```

Confirm you are on `main` (or your release branch):

```bash
cd /opt/life-management
git status
git pull
```

---

## 8 — Google OAuth (required for sign-in)

1. Open [Google Cloud Console](https://console.cloud.google.com/) → select or create a project (e.g. `life-management`).
2. **APIs & Services** → **OAuth consent screen**:
   - User type: **External** (unless you only use Workspace Internal)
   - App name, support email, developer contact
   - Scopes: default / `openid`, `email`, `profile` (the app requests these)
   - Test users: add your household emails while the app is in **Testing**, **or** publish the app if you want unrestricted allowlist users without adding each as a test user
3. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**:
   - Application type: **Web application**
   - Name: `Life Management API`
   - **Authorized JavaScript origins:** (optional but useful)
     - `https://life.mattsmith.sh`
   - **Authorized redirect URIs:** (required — must match exactly)
     - `https://api.life.mattsmith.sh/auth/google/callback`
4. Copy **Client ID** and **Client secret** into your notes for `.env.production`.

Do **not** put `localhost` redirect URIs in the production client; keep a separate OAuth client for local dev if needed.

---

## 9 — Plaid (optional)

Skip if you are not using bank sync on day one. You can add keys later and redeploy.

1. [Plaid Dashboard](https://dashboard.plaid.com/) → production (or sandbox first with `PLAID_ENV=sandbox`).
2. Copy `PLAID_CLIENT_ID`, `PLAID_SECRET`.
3. Generate encryption key on the VM (or Mac):

```bash
openssl rand -base64 32
```

Save that as `PLAID_TOKEN_ENCRYPTION_KEY`. Treat it like a password: losing it means you cannot decrypt stored bank tokens (users must reconnect).

4. If Plaid requires an OAuth redirect, register e.g. `https://life.mattsmith.sh/finance/budget` and set `PLAID_REDIRECT_URI` accordingly.

---

## 10 — Write `.env.production` (never commit)

On the VM:

```bash
cd /opt/life-management
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production
```

Generate secrets on the VM:

```bash
openssl rand -base64 32   # POSTGRES_PASSWORD
openssl rand -base64 32   # AUTH_SECRET
openssl rand -base64 32   # PLAID_TOKEN_ENCRYPTION_KEY (if using Plaid)
```

Fill every required field. Concrete values for this deployment:

```bash
WEB_DOMAIN=life.mattsmith.sh
API_DOMAIN=api.life.mattsmith.sh
WEB_URL=https://life.mattsmith.sh
API_URL=https://api.life.mattsmith.sh

POSTGRES_USER=life
POSTGRES_PASSWORD=<openssl-output>
POSTGRES_DB=life_management

AUTH_SECRET=<openssl-output>

GOOGLE_CLIENT_ID=<from-google>
GOOGLE_CLIENT_SECRET=<from-google>
ALLOWED_EMAILS=you@gmail.com,partner@gmail.com

# Optional until you enable bank sync
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=production
PLAID_TOKEN_ENCRYPTION_KEY=
# PLAID_REDIRECT_URI=https://life.mattsmith.sh/finance/budget
```

Rules:

- `WEB_URL` / `API_URL` must be `https://` and match the hostnames users type
- Do **not** set `WEB_URL` to `https://mattsmith.sh` — that would fight the portfolio and widen the session cookie domain
- Cookie domain becomes `.life.mattsmith.sh` (web + API only)
- `ALLOWED_EMAILS` is the only gate after Google login — keep it tight
- Never commit `.env.production` (gitignored)
- Changing `AUTH_SECRET` later invalidates all sessions (everyone signs in again)

Caddy reads `WEB_DOMAIN` / `API_DOMAIN` from this file via Compose. The Caddyfile uses those env vars; you do **not** need to edit `deploy/Caddyfile` by hand for this setup.

---

## 11 — First deploy

```bash
cd /opt/life-management
chmod +x scripts/*.sh
./scripts/deploy.sh
```

What this does:

1. `git pull --ff-only`
2. `docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build`
3. Applies Prisma migrations (`db:migrate:deploy`)
4. Runs an idempotent DB seed (default household)

The API container also checks migrations on startup, so this remains safe across restarts. First build can take several minutes (Next.js + npm).

Watch progress:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f caddy
```

Caddy should obtain Let’s Encrypt certificates once DNS points at the VM and ports 80/443 are open.

---

## 12 — Verify the deployment

### Containers

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Expect `postgres`, `api`, `web`, `caddy` **running** / healthy.

### Health + TLS

```bash
curl -sS https://api.life.mattsmith.sh/health
# {"status":"ok"}

curl -sI https://life.mattsmith.sh | head
# HTTP/2 200 (or 307 to sign-in)

# Portfolio still separate:
curl -sI https://mattsmith.sh | head
```

### Browser

1. Open `https://life.mattsmith.sh` (not the apex portfolio URL)
2. **Continue with Google** with an allowlisted email
3. Confirm you land in the app (tasks / meals / etc.)
4. DevTools → Application → Cookies:
   - `auth_token` present
   - **HttpOnly** checked
   - Domain like `.life.mattsmith.sh`
5. Refresh — you should stay signed in
6. Sign out — cookie cleared; API should reject GraphQL until login again
7. Spot-check `https://mattsmith.sh` — portfolio should still load as before

### Security spot-checks

```bash
# These must NOT be reachable from the public internet
curl -m 3 http://YOUR_VM_PUBLIC_IP:3000 || true
curl -m 3 http://YOUR_VM_PUBLIC_IP:4000 || true
curl -m 3 http://YOUR_VM_PUBLIC_IP:5432 || true
```

They should time out / refuse. Only 80/443 (and 22 for SSH) should answer.

### Weekly backups

Manual:

```bash
cd /opt/life-management
./scripts/backup-db.sh
ls -lh backups/
```

Cron (Sunday 03:00 server local time — set timezone if you care):

```bash
sudo timedatectl set-timezone America/Los_Angeles   # optional
crontab -e
```

Add:

```
0 3 * * 0 /opt/life-management/scripts/backup-db.sh >> /var/log/life-management-backup.log 2>&1
```

Backups are **unencrypted SQL dumps** under `./backups/`. Restrict permissions and consider encrypting before off-box copy:

```bash
chmod 700 /opt/life-management/backups
```

Optional rclone → Google Drive: install [rclone](https://rclone.org/), configure a remote, set `RCLONE_REMOTE=gdrive:life-management-backups` in the environment cron uses (or in `.env.production` — the backup script sources it).

**Treat `PLAID_TOKEN_ENCRYPTION_KEY` and backup files as equally sensitive.**

---

## 13 — Ongoing deploys

From your laptop: merge/push to `main`.

On the VM:

```bash
cd /opt/life-management
./scripts/deploy.sh
```

If `.env.production` changed (new secrets, domains, Plaid), edit the file on the VM first, then redeploy. Rebuild is required when `NEXT_PUBLIC_API_URL` / `API_URL` changes (baked into the web image at build time).

---

## Production hardening checklist

Do these before inviting the household to rely on the app:

- [ ] Oracle security list: only 22/80/443; preferably SSH limited to your IP
- [ ] UFW enabled via `setup-vm.sh`
- [ ] Strong unique `POSTGRES_PASSWORD`, `AUTH_SECRET`, and Plaid encryption key
- [ ] `.env.production` mode `600`, never committed
- [ ] Google redirect URI exact match; `ALLOWED_EMAILS` correct
- [ ] DNS greys cloud / resolved to VM before first TLS
- [ ] Weekly backup cron + at least one successful restore test (see below)
- [ ] OS updates applied; SSH key-only (disable password auth if you harden sshd)
- [ ] Sign out / sign in once after any auth-related deploy

### Restore drill (do once)

On a stopped staging copy or carefully:

```bash
gunzip -c backups/life_management-YYYYMMDD-HHMMSS.sql.gz | \
  docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres \
  psql -U life -d life_management
```

Prefer testing restore on a **spare** database/host before you need it for real.

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Cannot SSH | Security list port 22; correct IP/key/user `ubuntu`; instance Running |
| Caddy cert failure | `dig` DNS → VM IP; ports 80/443 in Oracle **and** UFW; Cloudflare orange cloud off initially; `docker compose ... logs caddy` |
| Google `redirect_uri_mismatch` | Google Console URI must equal `https://API_DOMAIN/auth/google/callback` |
| Allowlist / AccessDenied | Email in `ALLOWED_EMAILS`; OAuth consent **Testing** requires Test users |
| CORS errors | `WEB_URL` must match browser origin exactly (`https://…`, no trailing slash preferred) |
| Signed in but API 401 | Cookie Domain / Secure; sign out & in; `AUTH_SECRET` unchanged; browser not blocking third-party cookies (same-site cookies should be fine) |
| Web can’t reach API | `API_URL` / `NEXT_PUBLIC_API_URL` at **build** time; rebuild web after API URL change |
| Compose build fails missing workspace | Ensure latest `Dockerfile.prod` copies all `packages/*/package.json` (plaid, recipe-import, …) |
| Out of disk | `df -h`; prune: `docker system prune -a` (careful); rotate `backups/` |
| DB / migrate errors | `docker compose ... logs api`; password in `.env.production` matches volume only if volume was created with that password — resetting password on an existing volume requires a deliberate DB change |

Logs:

```bash
cd /opt/life-management
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f api
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f web
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f caddy
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f postgres
```

---

## Cost

| Item | Typical cost |
|------|----------------|
| Oracle Always Free A1 VM | **$0**/month within free-tier limits |
| Domain | ~**$10–15**/year |
| Google OAuth | Free |
| Plaid | Per Plaid plan (sandbox free; production billed by Plaid) |

Watch Oracle email for “overage” warnings; stay on Always Free shapes and do not attach paid block volumes if you want $0 compute.

---

## Migrating to a Mac Mini later

The same `docker-compose.prod.yml` runs on any Docker host:

1. Point DNS A records at the new machine’s public IP (or reverse proxy).
2. Copy `.env.production`, upload volumes / restore from `backup-db.sh`.
3. Run `./scripts/deploy.sh`.
4. Re-issue TLS (Caddy handles Let’s Encrypt when DNS points at the new host).

See also `docs/requirements.md` hosting notes.

---

## Quick reference commands

```bash
# SSH
ssh -i ~/.ssh/oracle_life ubuntu@YOUR_VM_PUBLIC_IP

# Deploy
cd /opt/life-management && ./scripts/deploy.sh

# Status
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# Backup
./scripts/backup-db.sh
```
