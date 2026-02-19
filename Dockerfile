# Stage 1: Build everything
FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN chmod +x build.sh && ./build.sh

# Stage 2: Production
FROM oven/bun:1
WORKDIR /app

# Copy the pre-assembled dist folder from the builder
COPY --from=builder /app/dist ./

# Install production dependencies
# Since package.json and bun.lock were copied into dist/ during build.sh
RUN bun install --production

# Generate Prisma client for production
RUN bun run db:generate

# Final environment configuration
ENV NODE_ENV=production
ENV SERVE_STATIC=true
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "index.js"]
