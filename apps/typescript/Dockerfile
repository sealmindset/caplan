# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build static export
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app

# Copy backend package files
COPY package*.json ./
RUN npm install

# Copy backend source files (exclude frontend directory)
COPY src ./src
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY entrypoint.sh ./

# Copy frontend static build to public directory
COPY --from=frontend-builder /app/frontend/out ./public

# Build NestJS application
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 3: Production runtime
FROM node:20-alpine AS production
WORKDIR /app

# Remove npm, yarn, corepack - not needed at runtime (reduces attack surface)
RUN rm -rf /usr/local/lib/node_modules /opt/yarn* \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn \
    /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy production files from builder
COPY --from=backend-builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=backend-builder --chown=nestjs:nodejs /app/public ./public

# Copy entrypoint script
COPY --chown=nestjs:nodejs entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Switch to non-root user
USER nestjs

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health/live || exit 1

ENTRYPOINT ["./entrypoint.sh"]
