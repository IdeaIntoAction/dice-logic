#!/usr/bin/env node

/**
 * Module dependencies.
 */
import http from 'http';
import app from '../app/app';
import { config } from '../config';
import { RabbitService } from '../service/rabbit/rabbit';
import { logger } from '../util/logger';

const { port } = config.server;

app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error('requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error('port is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

async function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  logger.info('listening on', bind);

  try {
    const rabbit = await RabbitService.getInstance(
      'postgres_exchange',
      'rpc_exchange',
    );

    rabbit.setCustomMessageHandler(async (message: string) => {
      logger.info(message, 'message');

      const diceRoll = {
        id: '1',
        userId: '2',
        nickname: 'test',
      };

      rabbit.publishMessage(diceRoll, 5, 'rpc_exchange');
      return {
        isWin: true,
        amount: 10,
      };
    });

    rabbit.run();
  } catch (error) {
    logger.error(error);
  }
}

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

process.on('SIGINT', () => {
  server.close(async () => {
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason: Error) => {
  logger.error(reason);
  throw reason;
});

process.on('uncaughtException', () => {
  process.exit(1);
});
