import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import { LOG_DIR } from '@config';
const logDir: string = LOG_DIR || 'logs';
const logPath: string = join(process.cwd(), logDir);
if (!existsSync(logPath)) {
  mkdirSync(logPath, { recursive: true });
}
const logFormat = winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat,
  ),
  transports: [
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: join(logPath, 'error'),
      filename: `%DATE%.log`,
      maxFiles: 7,
      handleExceptions: true,
      json: false,
      zippedArchive: false,
    }),
  ],
});
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(winston.format.splat(), winston.format.colorize()),
  }),
);
const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};
export { logger, stream };