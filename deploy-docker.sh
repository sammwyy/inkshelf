#!/bin/bash

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Inkshelf Docker Deployment Script   ${NC}"
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
read -p "Persistent storage path (host directory) [/srv/inkshelf]: " HOST_STORAGE_PATH
HOST_STORAGE_PATH=${HOST_STORAGE_PATH:-/srv/inkshelf}

# Generate secrets
echo -e "\n${YELLOW}--- Generating Security Tokens ---${NC}"
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✓ Generated JWT_ACCESS_SECRET${NC}"
echo -e "${GREEN}✓ Generated JWT_REFRESH_SECRET${NC}"

# Ensure host storage path exists
mkdir -p "$HOST_STORAGE_PATH"

echo -e "\n${YELLOW}--- Building Docker Image ---${NC}"
docker build -t inkshelf .

echo -e "\n${YELLOW}--- Cleaning up old containers ---${NC}"
docker stop inkshelf 2>/dev/null || true
docker rm inkshelf 2>/dev/null || true

echo -e "\n${YELLOW}--- Starting Inkshelf Container ---${NC}"
docker run -d \
  --name inkshelf \
  -p 3000:3000 \
  --restart unless-stopped \
  -v "$HOST_STORAGE_PATH:/app/uploads" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e REDIS_HOST="$REDIS_HOST" \
  -e REDIS_PORT="$REDIS_PORT" \
  -e REDIS_PASSWORD="$REDIS_PASSWORD" \
  -e JWT_ACCESS_SECRET="$JWT_ACCESS_SECRET" \
  -e JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  -e STORAGE_TYPE="local" \
  -e STORAGE_LOCAL_PATH="/app/uploads" \
  -e SERVE_STATIC="true" \
  -e NODE_ENV="production" \
  inkshelf

echo -e "\n${GREEN}=======================================${NC}"
echo -e "${GREEN}   Deployment Complete!                ${NC}"
echo -e "${GREEN}=======================================${NC}"
echo -e "Inkshelf is now running on: ${YELLOW}http://localhost:3000${NC}"
echo -e "You can check logs with: ${YELLOW}docker logs -f inkshelf${NC}"
