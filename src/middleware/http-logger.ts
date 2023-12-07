import { IncomingMessage, ServerResponse } from 'http';
import pino from 'pino-http';
import { logger } from '../util/logger';

export const httpLoggerMiddleware = pino({
  logger,
  customLogLevel(
    _req: IncomingMessage,
    res:ServerResponse<IncomingMessage>,
    err: unknown,
  ) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } if (res.statusCode >= 500 || err) {
      return 'error';
    } if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },
});
