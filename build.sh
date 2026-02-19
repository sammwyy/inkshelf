#!/bin/bash
set -e

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting Build Process...${NC}"

# 1. Build Frontend
echo -e "\n${BLUE}--- Building Frontend ---${NC}"
cd frontend
bun install
bun run build
cd ..

# 2. Build Backend
echo -e "\n${BLUE}--- Building Backend ---${NC}"
cd backend
bun install
bun run db:generate
bun run build
cd ..

# 3. Assemble Global Dist
echo -e "\n${BLUE}--- Assembling Global Dist Folder ---${NC}"
rm -rf dist
mkdir -p dist

# Copy backend compiled files
echo "Copying backend build..."
cp -r backend/dist/* dist/
cp backend/package.json dist/
cp backend/bun.lock dist/
cp -r backend/prisma dist/

# Copy frontend to backend's public (for local dev/standalone use)
echo "Synchronizing frontend build to backend public folder..."
rm -rf backend/public
mkdir -p backend/public
cp -r frontend/dist/* backend/public/

# Copy frontend to global dist public (for distribution)
echo "Copying frontend build to global dist/public..."
mkdir -p dist/public
cp -r frontend/dist/* dist/public/

echo -e "\n${GREEN}Build completed successfully!${NC}"
echo -e "You can find the production-ready files in the ${GREEN}dist/${NC} directory."
