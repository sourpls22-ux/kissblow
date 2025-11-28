#!/bin/bash

# Deploy script for KissBlow
# Usage: ./scripts/deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project directory
cd /var/www/kissblow || exit 1

echo -e "${YELLOW}📦 Pulling latest changes from git...${NC}"
git pull origin main || git pull origin master

echo -e "${YELLOW}📥 Installing dependencies...${NC}"
npm install --production

echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate

echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy

echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

echo -e "${YELLOW}🔄 Restarting PM2 application...${NC}"
pm2 restart kissblow || pm2 start ecosystem.config.js

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Show PM2 status
pm2 status

echo -e "${GREEN}📊 View logs: pm2 logs kissblow${NC}"


