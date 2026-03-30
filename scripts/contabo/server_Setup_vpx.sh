#!/usr/bin/env bash
set -euo pipefail

########################################
# CONFIG
########################################
APP_NAME="internscore"
APP_PORT=7040
DOMAIN="internscore.online"

DEPLOY_USER="deployer"

DB_NAME="internscore_db"
DB_USER="internscore_user"
DB_PASSWORD="Pass@intern1920$"

NODE_VERSION="lts/*"

########################################
echo "🚀 Server provisioning started"
########################################

if [[ $EUID -ne 0 ]]; then
  echo "❌ Run as root"
  exit 1
fi

# ---------- System ----------
apt update -y
apt upgrade -y

apt install -y \
  build-essential \
  curl \
  git \
  nginx \
  ufw \
  ca-certificates \
  gnupg \
  lsb-release \
  postgresql \
  postgresql-contrib \
  postgresql-client \
  python3-certbot-nginx

# ---------- User ----------
if ! id "$DEPLOY_USER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  usermod -aG sudo "$DEPLOY_USER"
fi

# ---------- PostgreSQL ----------
systemctl enable postgresql
systemctl start postgresql

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
sudo -u postgres createdb "$DB_NAME"

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"

sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# ---------- Node ----------
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs

npm install -g pm2

# ---------- PM2 ----------
pm2 startup systemd -u "$DEPLOY_USER" --hp "/home/$DEPLOY_USER"

# ---------- Swap (CRITICAL for Contabo) ----------
if ! swapon --show | grep -q swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ---------- Nginx ----------
cat > /etc/nginx/sites-available/$APP_NAME <<EOF
server {
  listen 80;
  server_name $DOMAIN www.$DOMAIN;

  location / {
    proxy_pass http://127.0.0.1:$APP_PORT;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
  }
}
EOF

ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ---------- Firewall ----------
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# ---------- SSL ----------
certbot --nginx \
  -d $DOMAIN \
  -d www.$DOMAIN \
  --agree-tos \
  -m ak846788@gmail.com \
  --redirect \
  --non-interactive

########################################
echo "✅ SERVER SETUP COMPLETE"
########################################

echo "DATABASE_URL:"
echo "postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
