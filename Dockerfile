# Multi-stage build for Node.js application
FROM node:18-alpine AS base

# Build stage for MCP server
FROM base AS mcp-builder
WORKDIR /app/mcp
COPY mcp/package*.json ./
RUN npm ci --only=production
COPY mcp/tsconfig.json ./
COPY mcp/src ./src
RUN npm run build

# Build stage for API
FROM base AS api-builder
WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci --only=production

# Final production image
FROM base AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy API dependencies and code
COPY --from=api-builder --chown=nodejs:nodejs /app/api/node_modules ./api/node_modules
COPY --chown=nodejs:nodejs api ./api

# Copy MCP built files and dependencies
COPY --from=mcp-builder --chown=nodejs:nodejs /app/mcp/dist ./mcp/dist
COPY --from=mcp-builder --chown=nodejs:nodejs /app/mcp/node_modules ./mcp/node_modules
COPY --chown=nodejs:nodejs mcp/package.json ./mcp/

# Create directories for data persistence
RUN mkdir -p /app/api/exports /app/data && \
    chown -R nodejs:nodejs /app/api/exports /app/data

# Switch to non-root user
USER nodejs

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the API server
CMD ["node", "api/app.js"]
