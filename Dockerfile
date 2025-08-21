# Use the official Node.js image as the base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for Docker build
ENV USEDOCKER=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Set dummy environment variables for build (will be overridden at runtime)
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=dummy-secret-for-build
ENV GOOGLE_CLIENT_ID=dummy-client-id
ENV GOOGLE_CLIENT_SECRET=dummy-client-secret
ENV R2_ENDPOINT=https://dummy.r2.cloudflarestorage.com
ENV R2_ACCESS_KEY_ID=dummy
ENV R2_SECRET_ACCESS_KEY=dummy
ENV R2_BUCKET_NAME=dummy
ENV R2_PUBLIC_URL=https://dummy.com

# Build the application
RUN npm run build

# Production image, copy all the files and run Next.js
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]