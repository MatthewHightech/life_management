#!/usr/bin/env bash
# Initial Oracle Cloud VM setup helper. Run once as root or with sudo on Ubuntu 22.04/24.04.
set -euo pipefail

echo "==> Installing Docker..."
apt-get update
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin git

echo "==> Configuring firewall (UFW): allow SSH, HTTP, HTTPS only"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Creating app directory"
mkdir -p /opt/life-management
echo "Clone your repo into /opt/life-management, then:"
echo "  cp .env.production.example .env.production"
echo "  # edit .env.production"
echo "  ./scripts/deploy.sh"
echo ""
echo "Add weekly backup cron:"
echo "  crontab -e"
echo "  0 3 * * 0 /opt/life-management/scripts/backup-db.sh >> /var/log/life-management-backup.log 2>&1"
