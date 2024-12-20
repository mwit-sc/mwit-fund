# Use the official Node.js image as the base image
FROM node:18-alpine AS base

ENV USEDOCKER=true

WORKDIR /app

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN npm ci --include=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Run Prisma generation with Node.js
RUN npx prisma generate

COPY next.config.mjs tsconfig.json ./
COPY tailwind.config.ts ./

# Build the application using Node.js
RUN npm run build

# Production image, copy all the files and run with Node.js
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

# Create user and group with different GID and UID if needed
RUN addgroup --system --gid 1002 nodejs || echo "Group exists" && \
    adduser --system --uid 1002 nextjs || echo "User exists"

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
ENV AUTH_URL=https://tiny.mwit.link

RUN ls -l /app

# Use Node.js to run server.js
CMD HOSTNAME="0.0.0.0" node server.js