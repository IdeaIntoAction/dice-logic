import pino from 'pino';

const config = {
  logLevel: 'info',
  isTest: false,
};

export const logger = pino({
  level: config.logLevel,
  enabled: !config.isTest,
  transport: {
    target: 'pino-pretty',
  },
  formatters: {
    level: (level: string) => ({ level }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
