# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# ============================================================
# Stage 2: Runtime
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install gotty for WebSocket Terminal backend
RUN apk add --no-cache wget ca-certificates && \
    wget -q https://github.com/yudai/gotty/releases/download/v1.0.1/gotty_linux_amd64.tar.gz && \
    tar -xzf gotty_linux_amd64.tar.gz -C /usr/local/bin/ && \
    rm gotty_linux_amd64.tar.gz

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy package.json and install only production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
RUN npm ci --omit=dev --ignore-scripts

# Create data directory with proper permissions
RUN mkdir -p /app/data /app/data/knowledge && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]