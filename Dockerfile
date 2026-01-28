# Use a specific Node.js version
FROM node:18-alpine

# Install necessary runtime dependencies
RUN apk add --no-cache libc6-compat curl

# Set working directory
WORKDIR /app

# Copy package files to install dependencies
COPY package*.json ./

# Install production dependencies only
RUN npm install --production --verbose

# Copy the pre-built application (this assumes you have run 'npm run build' locally first)
COPY . .

# Set environment variables for runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["node", ".next/standalone/server.js"]