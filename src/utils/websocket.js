function broadcastUpdates(connectedClients, data) {
    connectedClients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

module.exports = { broadcastUpdates };
