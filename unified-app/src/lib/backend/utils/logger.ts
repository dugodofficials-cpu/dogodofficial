import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import { LOG_DIR } from '@backend/config';

// Vercel's deployment bundle is read-only outside of /tmp, so file logging
// is skipped there — Vercel already captures stdout/stderr into its own
// function logs, which the console transport below covers.
const IS_SERVERLESS = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;

const logFormat = winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat,
  ),
  transports: [],
});

if (!IS_SERVERLESS) {
  const logDir: string = LOG_DIR || 'logs';
  const logPath: string = join(process.cwd(), logDir);
  if (!existsSync(logPath)) {
    mkdirSync(logPath, { recursive: true });
  }
  logger.add(
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
  );
}

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