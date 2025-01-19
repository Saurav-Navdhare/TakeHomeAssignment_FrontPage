#!/bin/bash

TEMP_SERVER_PID=0

start_temp_server() {
  echo "Starting temporary server to serve wait.html..."
  node -e "
    const http = require('http');
    const fs = require('fs');
    const path = require('path');

    const PORT = 8080;
    const filePath = path.join(__dirname, 'wait.html');
    const server = http.createServer((req, res) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading wait.html');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    });

    server.listen(PORT, () => console.log('Temporary server running on port', PORT));
    process.on('SIGTERM', () => server.close(() => process.exit(0)));
  " &
  TEMP_SERVER_PID=$!
}

stop_temp_server() {
  if [ $TEMP_SERVER_PID -ne 0 ]; then
    echo "Stopping temporary server..."
    kill $TEMP_SERVER_PID
    wait $TEMP_SERVER_PID 2>/dev/null
  fi
}

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Please set the DATABASE_URL environment variable before proceeding."
  exit 1
fi

start_temp_server

echo "Running Prisma migrations..."
npx prisma generate
npx prisma migrate deploy

# echo "Installing Playwright dependencies..."
# npx playwright install-deps chromium

stop_temp_server

echo "Starting the application..."
npm run start
