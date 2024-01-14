const path = require("path");
const winston = require('winston');

const logFormat = winston.format.printf(
  ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`
);

const programFilename = path.basename(process.argv[1]);

const logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), logFormat)
    }),
    new winston.transports.File({
      filename: `${path.basename(programFilename, path.extname(programFilename))}.log`,
      tailable: true,
      maxsize: 1024 * 1024 * 10,
      maxFiles: 5,
      format: winston.format.combine(winston.format.timestamp(), logFormat),
    }),
  ]
});

module.exports = logger;
