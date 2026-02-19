# Inkshelf: Backend

A production-ready backend API for a Inkshelf: web-based manga/manhwa/manhua reading platform built with Bun, TypeScript, Express, PostgreSQL, Prisma, and Redis.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Token rotation for enhanced security
- Password reset flow
- Role-based access control (USER, ADMIN)
- Secure httpOnly cookies
- Argon2 password hashing

### Content Management
- Series, volumes, chapters, and pages
- Multiple languages per chapter
- Multiple releases per chapter
- Slug-based URLs
- Soft deletes
- Metadata management
- Rich search and filtering

### User Features
- Reading progress tracking (page-level)
- Continue reading list
- Reading history
- Favorites/bookmarks
- Series ratings
- Threaded comments
- Custom user lists

### Performance & Scalability
- Redis caching for hot data
- Efficient database indexing
- Rate limiting
- Horizontal scaling ready
- Cache invalidation strategies

### Security
- Helmet security headers
- CORS configuration
- Request size limits
- Rate limiting (global + auth-specific)
- SQL injection protection via Prisma
- XSS protection
- Brute force protection

### Production Ready
- Structured logging with Winston
- Graceful shutdown
- Health check endpoint
- Environment validation
- Error handling middleware
- TypeScript strict mode

## 📋 Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- PostgreSQL >= 14
- Redis >= 6.0

## 🛠 Installation

1. Clone the repository
```bash
git clone <repository-url>
cd inkshelf/backend
```

2. Install dependencies
```bash
bun install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Generate Prisma client
```bash
bun run db:generate
```

5. Run database migrations
```bash
bun run db:migrate
```

6. Start the development server
```bash
bun run dev
```

## 🗄 Database Schema

### Core Entities

**Users**
- Authentication and profile data
- Role-based permissions
- Soft delete support

**Series**
- Manga/Manhwa metadata
- Tags, status, ratings
- Slug-based URLs

**Volumes & Chapters**
- Hierarchical content structure
- Multi-language support
- Multiple releases per chapter

**Reading Progress**
- Page-level tracking
- Completion status
- Last read timestamp

**Social Features**
- Comments (threaded)
- Ratings
- Favorites
- User lists

## 🔐 Authentication Flow

### Sign Up
```
POST /api/v1/auth/signup
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123"
}
```

### Login
```
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response includes:
- Access token (15min) - sent in response body
- Refresh token (7d) - sent in httpOnly cookie

### Refresh Token
```
POST /api/v1/auth/refresh
Cookie: refreshToken=<token>
```

### Password Reset
```
POST /api/v1/auth/password-reset/request
{
  "email": "user@example.com"
}

POST /api/v1/auth/password-reset/confirm
{
  "token": "<reset-token>",
  "password": "NewSecurePass123"
}
```

## 📡 API Endpoints

### Series
- `GET /api/v1/series` - List series (paginated, filterable)
- `GET /api/v1/series/:id` - Get series by ID
- `GET /api/v1/series/slug/:slug` - Get series by slug
- `POST /api/v1/series` - Create series (admin only)
- `PATCH /api/v1/series/:id` - Update series (admin only)
- `DELETE /api/v1/series/:id` - Delete series (admin only)
- `POST /api/v1/series/:id/favorite` - Add to favorites (authenticated)
- `DELETE /api/v1/series/:id/favorite` - Remove from favorites (authenticated)

### Reading Progress
- `GET /api/v1/progress` - Get user's progress
- `GET /api/v1/progress/continue-reading` - Get continue reading list
- `GET /api/v1/progress/history` - Get reading history
- `GET /api/v1/progress/:chapterId` - Get chapter progress
- `PUT /api/v1/progress/:chapterId` - Update chapter progress
- `DELETE /api/v1/progress/:chapterId` - Delete chapter progress
- `DELETE /api/v1/progress` - Clear all progress

### Health Check
- `GET /api/v1/health` - Server health status

## 🏗 Architecture

### Folder Structure
```
src/
├── app.ts                 # Express app setup
├── server.ts              # Server entry point
├── config/                # Configuration files
│   ├── index.ts
│   ├── env.ts
│   ├── database.ts
│   └── redis.ts
├── modules/               # Feature modules
│   ├── auth/
│   ├── users/
│   ├── series/
│   ├── progress/
│   ├── comments/
│   └── ratings/
├── middlewares/           # Express middlewares
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   └── rateLimit.middleware.ts
├── services/              # Business services
│   └── storage/
├── utils/                 # Utility functions
│   ├── logger.ts
│   ├── errors.ts
│   ├── response.ts
│   └── asyncHandler.ts
├── types/                 # TypeScript types
└── routes/                # Route definitions
```

### Design Patterns

**Clean Architecture**
- Controllers handle HTTP requests/responses
- Services contain business logic
- Repositories (Prisma) handle data access
- Clear separation of concerns

**Dependency Injection**
- Services instantiated in controllers
- Easy to mock for testing

**Error Handling**
- Custom error classes
- Centralized error middleware
- Operational vs programmer errors

**Validation**
- Zod schemas for type-safe validation
- Middleware-based validation
- Clear error messages

## 🔒 Security Best Practices

1. **Authentication**
   - JWT with short-lived access tokens
   - Refresh token rotation
   - Secure httpOnly cookies

2. **Password Security**
   - Argon2 hashing (memory-hard)
   - Minimum password requirements enforced

3. **Rate Limiting**
   - Redis-backed rate limiting
   - Stricter limits on auth endpoints
   - Per-IP tracking

4. **Headers**
   - Helmet for security headers
   - CORS properly configured
   - CSP policies

5. **Input Validation**
   - Zod schema validation
   - Type-safe DTOs
   - SQL injection protection via Prisma

## 📊 Caching Strategy

### Redis Usage
- Session caching (15min TTL)
- Rate limiting
- Series listings (5min TTL)
- Continue reading lists (5min TTL)
- User progress (5min TTL)

### Cache Invalidation
- Explicit invalidation on updates
- Pattern-based key deletion
- Time-based expiration

## 🧪 Testing

```bash
# Run tests
bun test

# Run with coverage
bun test --coverage
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` - JWT signing secrets (min 32 chars)

### Optional Variables
- `STORAGE_TYPE` - 'local' or 's3'
- Feature flags for toggling features

## 🚢 Deployment

### Database Migrations
```bash
bun run db:deploy
```

### Building for Production
```bash
bun run build
```

### Starting Production Server
```bash
bun run start
```

### Docker Support
The application is Docker-ready. Create a `Dockerfile`:
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .
RUN bun run db:generate

EXPOSE 3000
CMD ["bun", "run", "start"]
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### Logging
- Structured JSON logs in production
- Console logs in development
- Separate error and combined log files
- Request/response logging

## 🔧 Development

### Database Management
```bash
# Open Prisma Studio
bun run db:studio

# Create new migration
bunx prisma migrate dev --name migration_name

# Reset database
bunx prisma migrate reset
```

### Code Quality
```bash
# Type checking
bun run type-check

# Linting
bun run lint
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Write tests for new features
3. Use conventional commits
4. Update documentation

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

Built with:
- [Bun](https://bun.sh)
- [Express](https://expressjs.com)
- [Prisma](https://prisma.io)
- [Redis](https://redis.io)
- [TypeScript](https://typescriptlang.org)