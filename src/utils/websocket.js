const logger = require('./logger');

function broadcastUpdates(connectedClients, data) {
    logger.info('Broadcasting updates to all connected clients...');
    connectedClients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

module.exports = { broadcastUpdates };
