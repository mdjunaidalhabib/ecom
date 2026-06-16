#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  GlorixBD SaaS — VPS Setup Script
#  একবারই রান করো: bash setup.sh
# ═══════════════════════════════════════════════════════════════

set -e  # error হলে বন্ধ হবে

ROOT_DOMAIN="glorixbd.com"
APP_DIR="/var/www/glorixbd"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   GlorixBD SaaS — Setup Starting    ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ─── Step 1: PM2 check ────────────────────────────────────────
echo "📦 Checking PM2..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
  echo "✅ PM2 installed"
else
  echo "✅ PM2 already installed"
fi

# ─── Step 2: Super Admin Backend ──────────────────────────────
echo ""
echo "🚀 Starting Super Admin Backend..."
cd "$APP_DIR/saas-complete/super-admin-backend"

if [ ! -f ".env" ]; then
  echo "⚠️  .env not found — creating from example"
  cp .env.example .env
  echo ""
  echo "❗ IMPORTANT: Edit .env before continuing:"
  echo "   nano $APP_DIR/saas-complete/super-admin-backend/.env"
  echo ""
  read -p "Press ENTER after editing .env..."
fi

npm install --production
pm2 start server.js --name "sa-backend" --interpreter node
echo "✅ Super Admin Backend started (port 5001)"

# ─── Step 3: Super Admin Panel ────────────────────────────────
echo ""
echo "🎨 Building Super Admin Panel..."
cd "$APP_DIR/saas-complete/super-admin-panel"

if [ ! -f ".env.local" ]; then
  echo "NEXT_PUBLIC_SA_API=https://api-sa.$ROOT_DOMAIN/api/sa" > .env.local
fi

npm install
npm run build
pm2 start npm --name "sa-panel" -- start
echo "✅ Super Admin Panel started (port 3001)"

# ─── Step 4: Nginx wildcard config ────────────────────────────
echo ""
echo "🌐 Setting up Nginx..."
cp "$APP_DIR/saas-complete/nginx-templates/glorixbd-wildcard" \
   /etc/nginx/sites-available/glorixbd-wildcard

if [ ! -L /etc/nginx/sites-enabled/glorixbd-wildcard ]; then
  ln -s /etc/nginx/sites-available/glorixbd-wildcard \
        /etc/nginx/sites-enabled/glorixbd-wildcard
fi

nginx -t && systemctl reload nginx
echo "✅ Nginx configured"

# ─── Step 5: Wildcard SSL (Certbot) ───────────────────────────
echo ""
echo "🔒 SSL Certificate..."
echo "⚠️  Wildcard SSL needs DNS challenge. Running certbot..."
echo "   Make sure *.glorixbd.com points to this server's IP"
echo ""

certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d "$ROOT_DOMAIN" \
  -d "*.$ROOT_DOMAIN" \
  --agree-tos \
  --no-eff-email \
  -m "admin@$ROOT_DOMAIN" || echo "⚠️ SSL setup skipped — run manually later"

# Update nginx for SSL if cert exists
CERT_PATH="/etc/letsencrypt/live/$ROOT_DOMAIN/fullchain.pem"
if [ -f "$CERT_PATH" ]; then
  certbot --nginx -d "$ROOT_DOMAIN" -d "*.$ROOT_DOMAIN" --non-interactive || true
  echo "✅ SSL configured"
fi

# ─── Step 6: Apply backend patch ──────────────────────────────
echo ""
echo "🔧 Applying backend patch..."

BACKEND_DIR="$APP_DIR/Glorixbd-main/backend"

# Copy tenant middleware
cp "$APP_DIR/saas-complete/backend-patch/middlewares/tenantMiddleware.js" \
   "$BACKEND_DIR/src/middlewares/tenantMiddleware.js"

# Copy updated db.js
cp "$APP_DIR/saas-complete/backend-patch/lib/db.js" \
   "$BACKEND_DIR/src/lib/db.js"

# Copy frontend additions
FRONTEND_DIR="$APP_DIR/Glorixbd-main/frontend"
mkdir -p "$FRONTEND_DIR/src/app/api/tenant-config"
cp "$APP_DIR/saas-complete/backend-patch/frontend-additions/api/tenant-config/route.js" \
   "$FRONTEND_DIR/src/app/api/tenant-config/route.js"

echo ""
echo "⚠️  MANUAL STEP NEEDED:"
echo "   backend/server.js এ ২ লাইন যোগ করো:"
echo ""
echo "   1. Import এ:"
echo "      import { resolveTenant } from './src/middlewares/tenantMiddleware.js';"
echo ""
echo "   2. CORS এর পরে:"
echo "      app.use(resolveTenant);"
echo ""
echo "   3. backend/.env এ যোগ করো:"
echo "      MONGO_BASE_URI=mongodb://localhost:27017"
echo "      ROOT_DOMAIN=glorixbd.com"
echo ""
read -p "Press ENTER after doing the manual steps..."

# Restart existing backend
pm2 restart glorixbd-backend 2>/dev/null || echo "ℹ️  Restart manually: pm2 restart <backend-app-name>"

# ─── Step 7: PM2 save ─────────────────────────────────────────
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         ✅ Setup Complete!               ║"
echo "╠══════════════════════════════════════════╣"
echo "║  Super Admin Panel:                      ║"
echo "║  https://superadmin.$ROOT_DOMAIN         ║"
echo "║                                          ║"
echo "║  Login credentials:                      ║"
echo "║  (check super-admin-backend/.env)        ║"
echo "╚══════════════════════════════════════════╝"
echo ""
