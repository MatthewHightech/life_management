# Deploying to Oracle Cloud VM

This guide walks through hosting **web + API + Postgres** on a single Oracle Cloud Always Free VM using the production Docker Compose stack.

## Architecture (production)

```
Internet
   │
   ▼
Caddy (:443) ── HTTPS, auto Let's Encrypt
   ├── life.example.com      → web:3000   (Next.js)
   └── api.life.example.com  → api:4000   (GraphQL + auth)

Internal Docker network:
   postgres:5432  (not exposed publicly)
```

Local development is unchanged: `docker compose up` (dev stack on ports 3000/4000/5432).

---

## Prerequisites

- Oracle Cloud account ([cloud.oracle.com](https://cloud.oracle.com))
- A domain you control (for HTTPS and Google OAuth)
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com/apis/credentials))

---

## Step 1 — Create the VM

1. In Oracle Cloud Console → **Compute** → **Instances** → **Create instance**.
2. **Shape:** `VM.Standard.A1.Flex` (Ampere ARM, Always Free) — 1–4 OCPUs, 6–24 GB RAM. For this app, **2 OCPUs / 12 GB RAM** is plenty.
3. **Image:** Ubuntu 22.04 or 24.04 (aarch64).
4. **Networking:** assign a **public IP**.
5. **SSH key:** add your public key.
6. Create the instance.

### Open ports in Oracle VCN

Oracle blocks traffic at the **Security List** / **NSG** level:

| Port | Purpose |
|------|---------|
| 22   | SSH |
| 80   | HTTP (Caddy → HTTPS redirect + ACME) |
| 443  | HTTPS |

Do **not** open 3000, 4000, or 5432 publicly.

---

## Step 2 — Initial server setup

SSH into the VM:

```bash
ssh ubuntu@<VM_PUBLIC_IP>
```

Run the setup script (installs Docker, configures UFW):

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/YOUR_USER/life_management/main/scripts/setup-vm.sh)"
```

Or clone first and run locally:

```bash
sudo ./scripts/setup-vm.sh
```

Add your user to the `docker` group (log out/in after):

```bash
sudo usermod -aG docker $USER
```

---

## Step 3 — Clone the repo

```bash
sudo mkdir -p /opt/life-management
sudo chown $USER:$USER /opt/life-management
git clone https://github.com/YOUR_USER/life_management.git /opt/life-management
cd /opt/life-management
```

---

## Step 4 — Configure DNS

Create **A records** pointing at the VM public IP:

| Host | Example |
|------|---------|
| Web  | `life.example.com` → VM IP |
| API  | `api.life.example.com` → VM IP |

Wait for DNS propagation before first deploy (Caddy needs this for certificates).

---

## Step 5 — Production environment

```bash
cp .env.production.example .env.production
nano .env.production
```

Fill in every value:

| Variable | Example |
|----------|---------|
| `WEB_DOMAIN` | `life.example.com` |
| `API_DOMAIN` | `api.life.example.com` |
| `WEB_URL` | `https://life.example.com` |
| `API_URL` | `https://api.life.example.com` |
| `POSTGRES_PASSWORD` | strong random string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `SECRET` | from Google Console |
| `ALLOWED_EMAILS` | your family emails |

### Google OAuth redirect URI

Add this **authorized redirect URI** in Google Console:

```
https://api.life.example.com/auth/google/callback
```

Auth sessions use an **HttpOnly** cookie set by the API on OAuth success (shared across `WEB_DOMAIN` / `API_DOMAIN` via cookie `Domain`). You do **not** need extra Google Console settings for that. After deploy, sign out and sign in once so any old JS-readable cookie is replaced.

---

## Step 6 — Deploy

```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

This will:

1. `git pull`
2. Build production images (`Dockerfile.prod`)
3. Run `docker compose -f docker-compose.prod.yml up -d`
4. Apply Prisma migrations
5. Seed default household (idempotent)

Verify:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
curl -s https://api.life.example.com/health
```

Open `https://life.example.com` in a browser and sign in with Google.

---

## Step 7 — Weekly backups

Manual backup:

```bash
./scripts/backup-db.sh
```

Backups land in `./backups/` as gzipped SQL dumps.

### Cron (weekly, Sunday 3am)

```bash
crontab -e
```

```
0 3 * * 0 /opt/life-management/scripts/backup-db.sh >> /var/log/life-management-backup.log 2>&1
```

### Optional: Google Drive via rclone

1. Install and configure [rclone](https://rclone.org/) with a Google Drive remote.
2. Set `RCLONE_REMOTE=gdrive:life-management-backups` in `.env.production` or export it in cron.

---

## Step 8 — Ongoing deploys

After pushing changes to `main`:

```bash
cd /opt/life-management
./scripts/deploy.sh
```

---

## Troubleshooting

| Problem | Check |
|---------|-------|
| Caddy won't get certificate | DNS must resolve to VM IP; ports 80/443 open in Oracle + UFW |
| Google OAuth error | Redirect URI must exactly match `API_URL/auth/google/callback` |
| CORS errors | `WEB_URL` in `.env.production` must match the browser origin |
| API 401 on GraphQL | Token cookie missing — sign in again; check `AUTH_SECRET` unchanged |
| DB connection failed | `docker compose ... logs postgres` — verify `POSTGRES_PASSWORD` |

View logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f api
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f web
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f caddy
```

---

## Migrating to Mac Mini later

The same `docker-compose.prod.yml` runs on any Linux host. Point DNS at the new machine, copy `postgres_data` volume (or restore from backup), and redeploy. See `requirements.md` §9.2.

---

## Cost

Oracle Cloud Always Free ARM VM: **$0/month** (within free tier limits). Domain registration is the only typical cost (~$10–15/year).
