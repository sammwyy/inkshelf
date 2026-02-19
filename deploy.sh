#!/bin/bash

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Inkshelf Global Deployment Script   ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Configuration prompts
echo -e "\n${YELLOW}--- Database Configuration ---${NC}"
read -p "PostgreSQL URL (e.g. postgresql://user:pass@host:5432/db): " DATABASE_URL

echo -e "\n${YELLOW}--- Redis Configuration ---${NC}"
read -p "Redis Host [localhost]: " REDIS_HOST
REDIS_HOST=${REDIS_HOST:-localhost}
read -p "Redis Port [6379]: " REDIS_PORT
REDIS_PORT=${REDIS_PORT:-6379}
read -s -p "Redis Password (optional): " REDIS_PASSWORD
echo ""

echo -e "\n${YELLOW}--- Storage Configuration ---${NC}"
read -p "Persistent storage path (absolute path) [/srv/inkshelf]: " STORAGE_PATH
STORAGE_PATH=${STORAGE_PATH:-/srv/inkshelf}

# Generate secrets
echo -e "\n${YELLOW}--- Generating Security Tokens ---${NC}"
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✓ Generated JWT_ACCESS_SECRET${NC}"
echo -e "${GREEN}✓ Generated JWT_REFRESH_SECRET${NC}"

# Ensure storage path exists
mkdir -p "$STORAGE_PATH"

# Build Frontend
echo -e "\n${YELLOW}--- Building Frontend ---${NC}"
cd frontend
bun install
bun run build
cd ..

# Copy frontend to backend/public
echo -e "\n${YELLOW}--- Preparing Backend ---${NC}"
rm -rf backend/public
cp -r frontend/dist backend/public

# Setup Backend
cd backend
bun install
cat <<EOF > .env
NODE_ENV=production
PORT=3000
DATABASE_URL="$DATABASE_URL"
REDIS_HOST="$REDIS_HOST"
REDIS_PORT="$REDIS_PORT"
REDIS_PASSWORD="$REDIS_PASSWORD"
JWT_ACCESS_SECRET="$JWT_ACCESS_SECRET"
JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
STORAGE_TYPE=local
STORAGE_LOCAL_PATH="$STORAGE_PATH"
SERVE_STATIC=true
EOF

echo -e "${GREEN}✓ .env file created in backend/${NC}"

# Run migrations
echo -e "\n${YELLOW}--- Running Database Migrations ---${NC}"
bun run db:generate
bun run db:deploy

# Build backend
echo -e "\n${YELLOW}--- Building Backend ---${NC}"
bun run build

echo -e "\n${GREEN}=======================================${NC}"
echo -e "${GREEN}   Deployment Complete!                ${NC}"
echo -e "${GREEN}=======================================${NC}"
echo -e "You can now start the server with: ${YELLOW}cd backend && bun run start${NC}"
