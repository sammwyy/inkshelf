FROM oven/bun:latest

WORKDIR /app

# Copy package.json and bun.lock
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Generate Prisma client
RUN bun run db:generate

# Build the app
RUN bun run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["bun", "run", "start"]
