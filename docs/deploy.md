# 🚀 Deployment Guide

This document covers how to deploy Inkshelf using Docker, Docker Compose, or manual methods.

## 🐳 Quick Start (All-in-One Docker Compose)

The easiest way to deploy Inkshelf along with its dependencies (PostgreSQL and Redis) in a private network is using our Docker Compose setup.

### Automated Setup
Run the following script to generate secrets and start all services:
```bash
./deploy-docker-compose.sh
```

### Manual Docker Compose
If you prefer to do it yourself, we provide a `docker-compose.yml` file.

1. **Create an `.env` file** based on `.env.example`.
2. **Run**:
   ```bash
   docker-compose up -d
   ```

---

## 🛠 Manual Docker Deployment (Single Container)

If you already have a database and Redis instance running:

1. **Build the image**:
   ```bash
   docker build -t inkshelf .
   ```

2. **Run with persistence**:
   ```bash
   docker run -d \
     --name inkshelf \
     -p 3000:3000 \
     -v /your/storage/path:/app/uploads \
     -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
     -e REDIS_HOST="redis-host" \
     -e JWT_ACCESS_SECRET="your-secret" \
     -e JWT_REFRESH_SECRET="your-secret" \
     -e STORAGE_TYPE="local" \
     -e STORAGE_LOCAL_PATH="/app/uploads" \
     -e SERVE_STATIC="true" \
     inkshelf
   ```

---

## ⚙️ Bare Metal Deployment (Manual)

### Backend
1. `cd backend`
2. `bun install`
3. `cp .env.example .env`
4. `bun run db:generate`
5. `bun run db:migrate`
6. `bun run build && bun run start`

### Frontend
1. `cd frontend`
2. `bun install`
3. `bun run build`
4. Move `dist` contents to backend's `public` folder if using `SERVE_STATIC=true`.

---

## 🔐 Security & Networking

By using Docker Compose, we create an internal network where:
- **PostgreSQL** and **Redis** are NOT exposed to the internet.
- Only the **Inkshelf** container can communicate with them.
- External access is only allowed through the application port (3000).

---

## 💾 Storage & Volumes

Always mount a host directory to `/app/uploads` (or your configured `STORAGE_LOCAL_PATH`) to ensure your manga library persists across container updates.

Example: `-v /srv/inkshelf:/app/uploads`
