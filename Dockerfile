FROM node:18-bullseye

WORKDIR /app

# Copy package files to install dependencies
COPY package.json package-lock.json ./

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Set the database URL environment variable
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN if [ "$NODE_ENV" = "production" ]; then \
  npm ci --only=production; \
    else \
  npm install; \
    fi
    
RUN npx playwright install
RUN npx playwright install-deps

COPY . .

RUN npx prisma generate

COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh


EXPOSE 3000

CMD ["sh", "/usr/local/bin/run.sh"]
