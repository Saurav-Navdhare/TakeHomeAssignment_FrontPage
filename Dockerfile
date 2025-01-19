FROM node:18-alpine

WORKDIR /app

# Copy package files to install dependencies
COPY package.json package-lock.json ./

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --only=production; \
    else \
      npm install; \
    fi

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
