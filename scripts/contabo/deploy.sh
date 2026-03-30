#!/usr/bin/env bash
set -euo pipefail

# ================= CONFIG =================
REMOTE_USER="deployer"
REMOTE_HOST="207.180.192.76"
SSH_PRIVATE_KEY_PATH="$HOME/.ssh/id_ed25519"

APP_NAME="internscore"
APP_PORT=7040

GIT_REPO="git@github.com:Public-Transport-Management-softwaredev/intern-recruit-app.git"
GIT_BRANCH="live_server_branch"
KEEP_RELEASES=3
# ========================================

REMOTE="$REMOTE_USER@$REMOTE_HOST"
BASE_DIR="/var/www/$APP_NAME"
RELEASES_DIR="$BASE_DIR/releases"
SHARED_DIR="$BASE_DIR/shared"
CURRENT_DIR="$BASE_DIR/current"

# ---------- HARD FAIL FAST ----------
echo "REMOTE_USER=$REMOTE_USER"
echo "REMOTE_HOST=$REMOTE_HOST"
echo "SSH KEY=$SSH_PRIVATE_KEY_PATH"

[[ -z "$REMOTE_HOST" ]] && { echo "❌ REMOTE_HOST empty"; exit 1; }
[[ ! -f "$SSH_PRIVATE_KEY_PATH" ]] && { echo "❌ SSH key missing"; exit 1; }

# ---------- DIR SETUP ----------
# Ensure directories exist BEFORE cloning
ssh -i "$SSH_PRIVATE_KEY_PATH" "$REMOTE" \
  "mkdir -p '$RELEASES_DIR' '$SHARED_DIR'"

TS=$(ssh -i "$SSH_PRIVATE_KEY_PATH" "$REMOTE" "date +%Y%m%d%H%M%S")
NEW_RELEASE="$RELEASES_DIR/$TS"

ssh -i "$SSH_PRIVATE_KEY_PATH" "$REMOTE" \
  "git clone -b '$GIT_BRANCH' '$GIT_REPO' '$NEW_RELEASE'"

# ---------- ENV ----------
ssh -i "$SSH_PRIVATE_KEY_PATH" "$REMOTE" \
  "ln -sfn '$SHARED_DIR/.env' '$NEW_RELEASE/.env'"

# ---------- BUILD ----------
ssh -i "$SSH_PRIVATE_KEY_PATH" "$REMOTE" bash <<EOF
set -e
cd "$NEW_RELEASE"

# Export variables from .env file for the following commands
set -o allexport
source .env
set +o allexport

node -v
npm -v

npm ci --include=dev
npx prisma migrate deploy
npm run build
EOF

# ---------- ACTIVATE ----------
ssh -i "$SSH_PRIVATE_KEY_PATH" "$REMOTE" \
  "ln -sfn '$NEW_RELEASE' '$CURRENT_DIR'"

# ---------- PM2 ----------
ssh -i "$SSH_PRIVATE_KEY_PATH" "$REMOTE" bash <<EOF
cd "$CURRENT_DIR"
export PORT=$APP_PORT
pm2 delete "$APP_NAME" || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save
EOF

# ---------- CLEANUP ----------
echo "🧹 Cleaning up old releases..."
ssh -i "$SSH_PRIVATE_KEY_PATH" "$REMOTE" bash <<EOF
set -e
cd "$RELEASES_DIR"
# Keep the last N releases and delete the older ones.
# ls -1 lists all releases, one per line (sorted oldest to newest).
# head -n -"$KEEP_RELEASES" outputs all but the last N lines.
ls -1 | head -n -"$KEEP_RELEASES" | xargs -d '\n' rm -rf
EOF

echo "✅ DEPLOY COMPLETE"
echo "📂 Live location: $CURRENT_DIR"
