# Stage 1: Install dependencies
FROM node:18-alpine AS deps

# Set environment variables
ENV NODE_ENV=development
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache bash curl git

# Copy dependency files for caching
COPY package.json package-lock.json* yarn.lock* ./

# Install only necessary dependencies
RUN npm ci --legacy-peer-deps

# Stage 2: Build the application
FROM node:18-alpine AS builder

ENV NODE_ENV=production
WORKDIR /app

# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 3: Create the production image
FROM node:18-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm install --production --legacy-peer-deps

# Set up a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose port and run the application
EXPOSE 3000
CMD ["npm", "start"]
