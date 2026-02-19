#!/bin/bash
# Automated Update Script for Project Management Application
# Usage: ./update.sh

set -e  # Exit on error

echo "🔄 Starting application update..."
echo "================================================"

# Navigate to project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Pull latest changes
echo "📥 Pulling latest code from repository..."
git pull origin main || {
    echo "⚠️  Git pull failed. Skipping..."
}

# Backend updates
echo ""
echo "🔧 Updating backend..."
cd server

# Install dependencies if package.json changed
if git diff --name-only HEAD@{1} HEAD | grep -q "server/package.json"; then
    echo "📦 Installing backend dependencies..."
    npm install --production
else
    echo "✓ No backend dependency changes detected"
fi

# Update Prisma
echo "🗄️  Updating database schema..."
npx prisma generate
npx prisma migrate deploy

# Frontend updates
echo ""
echo "🎨 Updating frontend..."
cd ../client

# Install dependencies if package.json changed
if git diff --name-only HEAD@{1} HEAD | grep -q "client/package.json"; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✓ No frontend dependency changes detected"
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Fix permissions
echo ""
echo "🔐 Fixing permissions..."
cd ..
sudo chown -R $(whoami):$(whoami) .

# Restart services
echo ""
echo "🔄 Restarting backend service..."
pm2 restart project-api || {
    echo "⚠️  PM2 restart failed. Trying to start..."
    pm2 start server/index.js --name "project-api"
}

# Reload Nginx (optional, only if config changed)
if git diff --name-only HEAD@{1} HEAD | grep -q "nginx.conf"; then
    echo "🌐 Nginx config changed, reloading..."
    sudo systemctl reload nginx
fi

# Verify status
echo ""
echo "✅ Update completed successfully!"
echo "================================================"
echo ""
echo "📊 Service Status:"
pm2 status

echo ""
echo "📝 Recent logs (last 10 lines):"
pm2 logs project-api --nostream --lines 10

echo ""
echo "✅ Application is running!"
echo "💡 Check full logs: pm2 logs project-api"
echo "💡 Monitor: pm2 monit"
