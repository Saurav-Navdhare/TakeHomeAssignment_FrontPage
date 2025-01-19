const path = require('path');
const favicon = require('serve-favicon');
const { WebSocketExpress, Router } = require('websocket-express');
const prisma = require('./config/prismaClient');
const logger = require('./utils/logger');
const { scrapeAndStoreNews } = require('./services/scraper');
const { getRecentNewsCount } = require('./utils/database');
const { broadcastUpdates } = require('./utils/websocket');
const { register, websocket_messages_sent, websocket_active_connections } = require('./services/metrics');
require('dotenv').config();

const app = new WebSocketExpress();
const router = new Router();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Maintain a list of connected clients
let connectedClients = [];

router.ws('/news', async (req, res) => {
    const ws = await res.accept();
    console.log('WebSocket client connected');
    connectedClients.push(ws);
    websocket_active_connections.inc();

    try {
        const count = await getRecentNewsCount(5);
        ws.send(JSON.stringify({ message: `News count from the last 5 minutes: ${count}` }));
        websocket_messages_sent.inc();
    } catch (error) {
        logger.error('Error fetching recent news count:', error);
        ws.send(JSON.stringify({ error: 'Failed to fetch recent news count.' }));
    }

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        connectedClients = connectedClients.filter(client => client !== ws);
        websocket_active_connections.dec();
    });
});

setInterval(async () => {
    try {
        console.log("scraping started")

        const newUpdates = await scrapeAndStoreNews();
        if (newUpdates && newUpdates.length > 0) {
            broadcastUpdates(connectedClients, { updates: newUpdates });
            websocket_messages_sent.inc();
        }
    } catch (error) {
        logger.error('Error broadcasting updates:', error);
    }
    finally {
        console.log("scraping ended")
    }
}, 30 * 1000); // Broadcast every 60 seconds

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

        const PORT = process.env.PORT || 8080;
        const server = app.createServer();
        server.listen(PORT, () => {
            logger.info(`Server running at port ${PORT}`);
            console.log(`Server running at port ${PORT}`);
            logger.info('Metrics available at /metrics');
        });
    } catch (error) {
        logger.error('Failed to connect to MySQL:', error);
        process.exit(1);
    }
}

module.exports = startServer;