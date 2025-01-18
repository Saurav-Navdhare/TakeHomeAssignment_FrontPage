const winston = require('winston');

// Define log levels and corresponding colors for console logs
const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue',
    },
};

// Apply colors to log levels
winston.addColors(logLevels.colors);

// Define the format for console and file logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Timestamp format
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    }) // Log message formatting
);

const logger = winston.createLogger({
    levels: logLevels.levels,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.json(),
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.json(),
        }),
    ],
});

// Add console logging for non-production environments
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), // Add color coding to console logs
                logFormat
            ),
        })
    );
}

module.exports = logger;
