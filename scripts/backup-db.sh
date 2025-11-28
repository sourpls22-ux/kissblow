#!/bin/bash

# Database backup script for KissBlow
# Usage: ./scripts/backup-db.sh
# Can be run via cron: 0 2 * * * /var/www/kissblow/scripts/backup-db.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/kissblow"
DB_NAME="kissblow"
DB_USER="kissblow_user"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/kissblow_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating database backup..."
PGPASSWORD=$(grep DATABASE_URL /var/www/kissblow/.env | cut -d '@' -f1 | cut -d ':' -f3) pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

echo "Backup created: ${BACKUP_FILE}.gz"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "kissblow_*.sql.gz" -mtime +30 -delete

echo "Old backups (older than 30 days) deleted."


