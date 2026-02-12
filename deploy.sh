#!/bin/bash

# Deployment script untuk Project Management App
# Jalankan script ini sebagai user aplikasi (bukan root)

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}📂 Current directory: $SCRIPT_DIR${NC}"

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ Error: server/.env file not found!${NC}"
    echo "Please create .env file first. See DEPLOYMENT.md for details."
    exit 1
fi

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
    git pull
fi

# Install server dependencies
echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
cd server
npm install --production

# Run Prisma migrations
echo -e "${YELLOW}🗃️  Running database migrations...${NC}"
npx prisma generate
npx prisma migrate deploy

# Go back to root
cd ..

# Install and build client
echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
cd client
npm install

echo -e "${YELLOW}🏗️  Building client...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: Client build failed!${NC}"
    exit 1
fi

# Go back to root
cd ..

# Create logs directory if not exists
mkdir -p server/logs

# Restart PM2 process
echo -e "${YELLOW}🔄 Restarting PM2 process...${NC}"
if pm2 list | grep -q "project-api"; then
    pm2 restart project-api
else
    # If not running, start with ecosystem file
    cd server
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start index.js --name "project-api"
    fi
    cd ..
fi

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📊 Application Status:"
pm2 list

echo ""
echo "📝 View logs with:"
echo "  pm2 logs project-api"
echo ""
echo "🌐 Application should be running at:"
echo "  Backend:  http://localhost:4000"
echo "  Frontend: Check Nginx configuration"
