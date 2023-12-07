import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { Request } from './interface';
import { RabbitConnect } from './connect';
import { logger } from '../../util/logger';

export class RabbitRPCRequest extends EventEmitter {
  private _id: string;
  public request: Request | null;
  private priority: number;

  constructor(request: Request, priority = 5,) {
    super();
    this._id = randomUUID();
    this.request = request;
    this.priority = priority;
    this.on('error', this._errorHandler);
  }

  get id(): string {
    return this._id;
  }

  public complete(message: string): string {
    const logMessage = `[RPC Request Complete] Received message: ${message}`;
    logger.info(logMessage);
    this.emit('complete', message);
    this.destroy();
    return message;
  }

  public destroy(): void {
    logger.debug(`[RPC Request Destroy] Destroying request with ID: ${this._id}`);
    this.removeAllListeners();
    this._id = '';
    this.request = null;
  }

  private _errorHandler = (error: Error): void => {
    const errorMessage = `[RPC Request Error] Error occurred in emitter: ${error.message}`;
    logger.error(errorMessage);
    this.destroy();
  };

  public async publish(connection: RabbitConnect): Promise<void> {
    const publishDetails = {
      correlationId: this._id,
      replyTo: connection.pushQueue,
      priority: this.priority,
      messageId: this.request?.id,
    };

    connection.channel.publish(
      connection.exchange,
      '',
      Buffer.from(JSON.stringify(this.request)),
      publishDetails
    );

    const logPublish = `[RPC Publish] Published request to RPC queue '${connection.pushQueue}' with details: ${JSON.stringify(publishDetails)}`;
    logger.info(logPublish);
  }
}