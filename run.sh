#!/bin/bash

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Please set the DATABASE_URL environment variable before proceeding."
  exit 1
fi

echo "Running Prisma migrations..."
npx prisma generate
npx prisma migrate deploy

npx playwright install-deps chromium

echo "Starting the application..."
npm run start
