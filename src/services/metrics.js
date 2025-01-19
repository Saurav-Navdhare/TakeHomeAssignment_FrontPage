const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const successful_scrapes = new client.Counter({
    name: 'successful_scrapes_total',
    help: 'Total number of successful scrapes',
    registers: [register],
});

const failed_scrapes = new client.Counter({
    name: 'failed_scrapes_total',
    help: 'Total number of failed scrapes',
    registers: [register],
});

const news_processed = new client.Gauge({
    name: 'news_processed_total',
    help: 'Number of news stories processed',
    registers: [register],
});

const websocket_active_connections = new client.Gauge({
    name: 'connected_clients_total',
    help: 'Number of connected WebSocket clients',
    registers: [register],
});

const websocket_messages_sent = new client.Counter({
    name: 'websocket_messages_sent_total',
    help: 'Total messages sent over WebSocket',
    registers: [register],
});

const db_queries_total = new client.Counter({
    name: 'db_queries_total',
    help: 'Total database queries executed',
    registers: [register],
});


const db_connection_errors = new client.Counter({
    name: 'db_connection_errors_total',
    help: 'Total database connection errors',
    registers: [register],
});


// Export the metrics and the register
module.exports = {
    successful_scrapes,
    failed_scrapes,
    news_processed,
    register,
    websocket_active_connections,
    websocket_messages_sent,
    db_queries_total,
    db_connection_errors,
};
