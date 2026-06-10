import winston from 'winston';
import { env } from '../config/env';

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'development'
      ? winston.format.prettyPrint()
      : winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});
