const startServer = require('./src/app');

try {
    startServer();
} catch (error) {
    console.log(error)
}