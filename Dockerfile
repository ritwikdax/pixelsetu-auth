# Build stage
FROM node:latest AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:latest

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the built dist folder from builder stage
COPY --from=builder /app/dist ./dist


ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Set default PORT environment variable for Cloud Run
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
