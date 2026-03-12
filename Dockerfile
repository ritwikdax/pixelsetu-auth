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


ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout
ENV NODE_OPTIONS="--require=newrelic"

# Expose the application port
EXPOSE 8080

# Set default PORT environment variable for Cloud Run
ENV PORT=8080

# Start the application
CMD ["npm", "start"]
