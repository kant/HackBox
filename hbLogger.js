import winston from "winston";

const hbLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({filename: "error.log", level: "error"}),
        new winston.transports.File({filename: "combined.log"})
    ]
});

if (process.env.NODE_ENV !== "production") {
    hbLogger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            winston.format.colorize(),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`))
    }));
}

module.exports = hbLogger;
