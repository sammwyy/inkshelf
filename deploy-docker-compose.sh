#!/bin/bash
set -e

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}   Inkshelf Docker Compose Deployer        ${NC}"
echo -e "${BLUE}===========================================${NC}"

# Check for dependencies
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: docker is not installed.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed.${NC}"
    exit 1
fi

# Configuration prompts
echo -e "\n${YELLOW}--- Storage Configuration ---${NC}"
read -p "Persistent library path (host folder) [/srv/inkshelf]: " STORAGE_PATH
STORAGE_PATH=${STORAGE_PATH:-/srv/inkshelf}
mkdir -p "$STORAGE_PATH"

# Load existing credentials if .env exists
if [ -f .env ]; then
    echo -e "${BLUE}ℹ Existing .env found, loading credentials...${NC}"
    source .env
fi

# Generate Random Credentials if not already set
echo -e "\n${YELLOW}--- Checking Credentials ---${NC}"
DB_USER=${DB_USER:-"inkshelf_user"}
DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -hex 16)}
DB_NAME=${DB_NAME:-"inkshelf_db"}
REDIS_PASSWORD=${REDIS_PASSWORD:-$(openssl rand -hex 16)}
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET:-$(openssl rand -hex 32)}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-$(openssl rand -hex 32)}

echo -e "${GREEN}✓ Credentials ready.${NC}"

# Create .env for docker-compose
cat <<EOF > .env
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
REDIS_PASSWORD=$REDIS_PASSWORD
JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
STORAGE_PATH=$STORAGE_PATH
EOF

echo -e "${GREEN}✓ .env file created.${NC}"

# Start building and running
echo -e "\n${YELLOW}--- Building and Starting Services ---${NC}"
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

echo -e "\n${GREEN}===========================================${NC}"
echo -e "${GREEN}   Deployment Complete!                    ${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "Inkshelf is running on: ${YELLOW}http://localhost:3000${NC}"
echo -e "Storage is mapped to: ${YELLOW}$STORAGE_PATH${NC}"
echo -e "\n${YELLOW}Important Credentials (Saved in .env):${NC}"
echo -e "Postgres User: ${DB_USER}"
echo -e "Postgres Pass: ${DB_PASSWORD}"
echo -e "Redis Pass:    ${REDIS_PASSWORD}"
echo -e "\nCheck logs with: ${YELLOW}docker compose logs -f${NC}"
