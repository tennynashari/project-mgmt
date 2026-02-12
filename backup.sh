#!/bin/bash

# Database Backup Script
# Setup cron job untuk backup otomatis:
# crontab -e
# 0 2 * * * /home/projectapp/project/backup.sh

# Configuration
DB_NAME="project_management"
DB_USER="projectapp"
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_$DATE.sql"
DAYS_TO_KEEP=7

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🗄️  Starting database backup...${NC}"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Create backup
pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Compress backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    echo -e "${GREEN}✅ Backup created successfully!${NC}"
    echo -e "📁 Location: $BACKUP_FILE"
    echo -e "📊 Size: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # Delete old backups
    echo -e "${YELLOW}🧹 Cleaning old backups (older than $DAYS_TO_KEEP days)...${NC}"
    find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$DAYS_TO_KEEP -delete
    
    echo -e "${GREEN}✅ Backup completed!${NC}"
    echo -e "📋 Recent backups:"
    ls -lht "$BACKUP_DIR" | grep "${DB_NAME}_" | head -5
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi
