// Function to broadcast updates to all connected clients
function broadcastUpdates(data) {
    const message = JSON.stringify(data);
    connectedClients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

module.export = {
    broadcastUpdates
}