# Stage 1: Build
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Build-time argument for environment
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Copy package files and install dependencies
COPY package.json package-lock.json ./

RUN if [ "$NODE_ENV" = "production" ]; then \
  npm ci --only=production; \
else \
  npm install; \
fi

# Install Playwright binaries and dependencies
RUN npx playwright install && npx playwright install-deps

# Generate Prisma client
COPY ./prisma ./prisma
RUN npx prisma generate

# Copy application code
COPY . .

# Stage 2: Runtime
FROM node:18-bullseye-slim

WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=builder /app /app

# Copy the runtime script and make it executable
COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["sh", "/usr/local/bin/run.sh"]
