# Use the official Node.js image as the base image
FROM node:18-alpine AS base

# Set environment variables
ENV USEDOCKER=true \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS deps

# Copy dependency-related files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install production and development dependencies
RUN npm ci --include=dev --legacy-peer-deps

# Build the application
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . . 

# Build Next.js application
RUN npm run build

# Create production image
FROM base AS runner

# Copy only what's needed for runtime
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Create and configure a non-root user
RUN addgroup -S nodejs && \
    adduser -S nextjs -G nodejs && \
    mkdir -p .next && chown -R nextjs:nodejs /app

# Set user permissions and expose port
USER nextjs
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
