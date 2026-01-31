# Base stage
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
# --frozen-lockfile ensures reproducible installs
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
# --prod skips devDependencies
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
