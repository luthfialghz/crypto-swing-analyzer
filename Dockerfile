# Multi-stage build to separate build and runtime environments
FROM node:20-alpine AS builder

# Install necessary build tools and dependencies
RUN apk add --no-cache libc6-compat python3 make g++ curl

# Set working directory
WORKDIR /app

# Increase Node.js memory limit for the build process
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install --verbose

# Copy the rest of the application code
COPY . .

# Set environment variables for the build
ARG GEMINI_API_KEY
ARG DISCORD_WEBHOOK_URL
ARG NEXT_PUBLIC_BASE_URL

ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV DISCORD_WEBHOOK_URL=$DISCORD_WEBHOOK_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=false

# Build the application with increased memory
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Install necessary runtime dependencies
RUN apk add --no-cache libc6-compat curl

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY package*.json ./
RUN npm install --production --verbose

# Copy the built application from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data

# Expose port
EXPOSE 3000

# Set environment variables for runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Create data directory and set permissions (important for volumes)
RUN mkdir -p /app/data && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app/data

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Start the application
CMD ["node", "server.js"]