# Use a specific Node.js version that matches your local environment
FROM node:18-alpine AS base

# Install necessary build tools and dependencies
RUN apk add --no-cache libc6-compat python3 make g++ curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install --verbose

# Copy the rest of the application code
COPY . .

# Debug: Print current directory and files
RUN echo "=== Current directory contents ===" && ls -la && echo "==============================="

# Debug: Print environment variables
RUN echo "=== Environment Variables ===" && env && echo "============================="

# Set environment variables for the build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=false
ENV NEXT_PUBLIC_BASE_PATH=
ENV PORT=3000

# Check if there are any .env files that might affect the build
RUN if [ -f .env ]; then echo "Found .env file"; else echo "No .env file found"; fi

# Run the build command with more verbose output
RUN echo "Starting build process..." && npm run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Set environment variables for runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output and public directory from builder stage
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]