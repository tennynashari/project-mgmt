#!/bin/bash

# Initial Setup Script untuk Ubuntu 24.04
# Script ini akan mengsetup database, install dependencies, dan konfigurasi awal
# Jalankan sebagai user aplikasi (projectapp)

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Project Management App - Initial Setup  ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Jangan jalankan script ini sebagai root!${NC}"
    echo -e "Jalankan sebagai user aplikasi (misalnya: projectapp)"
    exit 1
fi

echo -e "${YELLOW}Current user: $(whoami)${NC}"
echo -e "${YELLOW}Project directory: $SCRIPT_DIR${NC}"
echo ""

# Prompt untuk database configuration
echo -e "${BLUE}=== Database Configuration ===${NC}"
read -p "Database name [project_management]: " DB_NAME
DB_NAME=${DB_NAME:-project_management}

read -p "Database user [projectapp]: " DB_USER
DB_USER=${DB_USER:-projectapp}

read -sp "Database password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Password tidak boleh kosong!${NC}"
    exit 1
fi

# Prompt untuk frontend URL
echo ""
echo -e "${BLUE}=== Frontend Configuration ===${NC}"
read -p "Domain/URL (misal: example.com): " DOMAIN
FRONTEND_URL="https://$DOMAIN"

# Generate JWT Secret
echo ""
echo -e "${YELLOW}🔐 Generating JWT Secret...${NC}"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create .env file
echo -e "${YELLOW}📝 Creating .env file...${NC}"
cat > server/.env << EOF
# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

# JWT Configuration
JWT_SECRET="${JWT_SECRET}"

# Server Configuration
PORT=4000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=${FRONTEND_URL}
EOF

echo -e "${GREEN}✅ .env file created${NC}"

# Create client .env if not exists
if [ ! -f "client/.env.production" ]; then
    echo -e "${YELLOW}📝 Creating client .env.production...${NC}"
    cat > client/.env.production << EOF
# API Configuration untuk Production
VITE_API_URL=/api
EOF
    echo -e "${GREEN}✅ client/.env.production created${NC}"
fi

# Install server dependencies
echo ""
echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
cd server
npm install --production

# Generate Prisma Client
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate

# Ask if want to run migrations
echo ""
read -p "Run database migrations now? (y/n): " RUN_MIGRATIONS
if [ "$RUN_MIGRATIONS" = "y" ]; then
    echo -e "${YELLOW}🗃️  Running database migrations...${NC}"
    npx prisma migrate deploy
    
    read -p "Seed database with initial data? (y/n): " SEED_DB
    if [ "$SEED_DB" = "y" ]; then
        echo -e "${YELLOW}🌱 Seeding database...${NC}"
        node prisma/seed.js || echo -e "${YELLOW}⚠️  Seeding failed or no seed file${NC}"
    fi
fi

# Install client dependencies
echo ""
echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
cd ../client
npm install

# Build client
echo -e "${YELLOW}🏗️  Building client for production...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Create logs directory
cd ..
mkdir -p server/logs
mkdir -p backups

# Make scripts executable
echo ""
echo -e "${YELLOW}🔧 Setting script permissions...${NC}"
chmod +x deploy.sh
chmod +x backup.sh

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✅ Setup Completed Successfully!     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo -e "1. Setup PM2 to run the application:"
echo -e "   ${YELLOW}cd server${NC}"
echo -e "   ${YELLOW}pm2 start ecosystem.config.js${NC}"
echo -e "   ${YELLOW}pm2 startup${NC}  # Run the command it shows"
echo -e "   ${YELLOW}pm2 save${NC}"
echo ""
echo -e "2. Configure Nginx:"
echo -e "   ${YELLOW}sudo cp nginx.conf /etc/nginx/sites-available/project-app${NC}"
echo -e "   ${YELLOW}sudo nano /etc/nginx/sites-available/project-app${NC}  # Edit domain"
echo -e "   ${YELLOW}sudo ln -s /etc/nginx/sites-available/project-app /etc/nginx/sites-enabled/${NC}"
echo -e "   ${YELLOW}sudo nginx -t${NC}"
echo -e "   ${YELLOW}sudo systemctl reload nginx${NC}"
echo ""
echo -e "3. Setup SSL with Let's Encrypt:"
echo -e "   ${YELLOW}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
echo ""
echo -e "4. Setup backup cron job:"
echo -e "   ${YELLOW}crontab -e${NC}"
echo -e "   Add line: ${YELLOW}0 2 * * * $SCRIPT_DIR/backup.sh${NC}"
echo ""
echo -e "${BLUE}📊 Database Info:${NC}"
echo -e "   Database: ${GREEN}$DB_NAME${NC}"
echo -e "   User: ${GREEN}$DB_USER${NC}"
echo ""
echo -e "${BLUE}🌐 Application URLs:${NC}"
echo -e "   Frontend: ${GREEN}$FRONTEND_URL${NC}"
echo -e "   Backend: ${GREEN}http://localhost:4000${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "   Quick Start: ${GREEN}QUICK_START.md${NC}"
echo -e "   Full Guide: ${GREEN}DEPLOYMENT.md${NC}"
echo ""
