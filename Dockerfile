# Base stage
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Install pnpm and build tools
RUN npm install -g pnpm && \
    apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Rebuild bcrypt to ensure native binary is present
RUN npm rebuild bcrypt --build-from-source

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start command
CMD ["node", "dist/main"]
