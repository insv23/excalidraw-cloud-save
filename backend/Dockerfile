# Multi-stage build for backend
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage - install production dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage - build application and generate migrations
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs backend

# Copy production dependencies
COPY --from=deps --chown=backend:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/package.json ./

# Copy configuration files needed for migration
COPY --chown=backend:nodejs drizzle.config.ts ./

# Copy complete source structure needed for migration
COPY --from=builder --chown=backend:nodejs /app/src ./src

# Copy existing migration files to make migrations idempotent
COPY --from=builder --chown=backend:nodejs /app/drizzle ./drizzle

# Create data directory for SQLite database and ensure proper ownership
RUN mkdir -p /app/data && chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Health check using wget (more reliable than fetch)
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Default command runs migrations then the application
CMD ["sh", "-c", "npm run db:generate:prod && npm run db:migrate:prod && npm start"]
