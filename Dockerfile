# Base stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./ 
# Note: Using npm based on package-lock/package.json, but pnpm-lock is present. 
# Attempting to use npm as primary based on package.json scripts.
# If pnpm is preferred, we should install it. 
# Proceeding with npm for standard NestJS setup as per package.json scripts.

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files again for production install
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Set environment to production
ENV NODE_ENV=production

# Expose port (as seen in EADDRINUSE error, app uses 8080)
EXPOSE 8080

# Start command
CMD ["npm", "run", "start:prod"]
