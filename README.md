# 📚 Inkshelf

Inkshelf is a self-hosted, production-ready manga/manhwa/manhua/comics media server and reader client. Built with **Bun**, **TypeScript**, **React**, **PostgreSQL**, and **Redis**.

---

## 🚀 Features

- **JWT Authentication**: Secure access with token rotation and refresh/access tokens.
- **Content Management**: Manage series, volumes, chapters, and pages with multi-language support.
- **Reading Progress**: Track where you left off at a page level.
- **Social Features**: Threaded comments, ratings, and custom user lists.
- **Dual Storage**: Choose between local filesystem or S3-compatible storage.
- **Performance**: High-speed browsing with Redis caching and Bun runtime.
- **Production Ready**: Structured logging, graceful shutdowns, and rate limiting.

---

## 🚀 Getting Started

For detailed installation instructions, including Docker Compose and manual setup, please refer to the **[Deployment Guide (DEPLOY.MD)](DEPLOY.MD)**.

### Quick Run (Docker Compose)
To deploy Inkshelf with a private database and Redis automatically:
```bash
chmod +x deploy-docker-compose.sh
./deploy-docker-compose.sh
```

---

## 🔑 Initial Configuration & Admin User
When you first start the server, Inkshelf automatically checks if an admin exists. If not, it will **create one automatically** and print the credentials to the console logs.

### Regenerating Admin Credentials
- **Docker Compose**: `docker exec -it inkshelf bun run db:generateadmin`
- **Manual**: `cd backend && bun run db:generateadmin`

---

## ⚙️ Environment Variables

A full list of environment variables can be found in the **[Deployment Guide](DEPLOY.MD)**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).