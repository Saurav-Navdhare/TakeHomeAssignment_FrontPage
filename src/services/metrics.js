const client = require('prom-client');

const scrapeCounter = new client.Counter({
    name: 'scrape_count',
    help: 'Number of scrapes performed',
});

function registerMetrics() {
    scrapeCounter.inc(); // Increment count
}

function setupPrometheus(app) {
    app.get('/metrics', async (req, res) => {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    });
}

module.exports = { registerMetrics, setupPrometheus };
