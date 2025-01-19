const path = require('path');
const favicon = require('serve-favicon');
const { WebSocketExpress, Router } = require('websocket-express');
const prisma = require('./config/prismaClient');
const logger = require('./utils/logger');
const { scrapeAndStoreNews } = require('./services/scraper');
const { getRecentNewsCount } = require('./utils/database');
const { broadcastUpdates } = require('./utils/websocket');

const app = new WebSocketExpress();
const router = new Router();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Maintain a list of connected clients
let connectedClients = [];

router.ws('/news', async (req, res) => {
    const ws = await res.accept();
    console.log('WebSocket client connected');
    connectedClients.push(ws);

    try {
        const count = await getRecentNewsCount(5);
        ws.send(JSON.stringify({ message: `News count from the last 5 minutes: ${count}` }));
    } catch (error) {
        logger.error('Error fetching recent news count:', error);
        ws.send(JSON.stringify({ error: 'Failed to fetch recent news count.' }));
    }

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        connectedClients = connectedClients.filter(client => client !== ws);
    });
});

setInterval(async () => {
    try {
        const newUpdates = await scrapeAndStoreNews();
        if (newUpdates && newUpdates.length > 0) {
            broadcastUpdates(connectedClients, { updates: newUpdates });
        }
    } catch (error) {
        logger.error('Error broadcasting updates:', error);
    }
}, 60 * 1000); // Broadcast every 60 seconds

app.use(router);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server
async function startServer() {
    try {
        console.log('Connecting to MySQL...');
        await prisma.$connect();
        console.log('Connected to MySQL successfully.');

        const PORT = process.env.PORT || 3000;
        const server = app.createServer();
        server.listen(PORT, () => {
            logger.info(`Server running at port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to connect to MySQL:', error);
        process.exit(1);
    }
}

module.exports = startServer;