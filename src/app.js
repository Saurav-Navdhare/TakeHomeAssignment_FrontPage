const express = require('express');
const { WebSocketExpress } = require('websocket-express');
const prisma = require('./config/prismaClient');
const logger = require('./utils/logger');
const { scrapeAndStoreNews } = require('./services/scraper');
const { getRecentNewsCount } = require('./utils/database');

const app = express();
const wss = new WebSocketExpress(app);

let connectedClients = [];


wss.on('connection', async (socket) => {
    console.log('WebSocket client connected');
    connectedClients.push(socket);

    // On a new connection, send the count of news published in the last 5 minutes
    try {
        const count = await getRecentNewsCount(5);
        socket.send(JSON.stringify({ message: `News count from the last 5 minutes: ${count}` }));
    } catch (error) {
        console.error('Error fetching recent news count:', error);
        socket.send(JSON.stringify({ error: 'Failed to fetch recent news count.' }));
    }

    socket.on('close', () => {
        console.log('WebSocket client disconnected');
        connectedClients = connectedClients.filter(client => client !== socket);
    });
});

async function startServer() {
    try {
        console.log('Connecting to MySQL...');
        await prisma.$connect(); // Attempt to connect to the database
        console.log('Connected to MySQL successfully.');

        // Start the server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            logger.log(`Server running at port ${PORT}`);

            setInterval(async () => {
                try {
                    await scrapeAndStoreNews();
                } catch (error) {
                    logger.error('Error scraping and storing news:', error);
                }
            }, 60 * 1000); // Scrape every 60 seconds
        });
    } catch (error) {
        console.error('Failed to connect to MySQL:', error);
        process.exit(1); // Exit the process if the database connection fails
    }
}
