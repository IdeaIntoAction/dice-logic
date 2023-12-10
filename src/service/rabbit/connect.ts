import { Connection, Channel, connect } from 'amqplib';
import { ConnectRabbitType } from './interface';
import { logger } from '../../util/logger';

export class RabbitConnect {
  private _connection!: Connection;

  private _channel!: Channel;

  private readonly _url: string;

  public readonly exchange: string;

  public readonly queue: string;

  public pushQueue?: string;

  private reconnectInterval: number = 5000; // 5 seconds, adjust as needed

  constructor(
    nameExchange = 'rpc_exchange',
    url = 'amqp://user:password@localhost:5672',
  ) {
    this._url = url;
    this.exchange = nameExchange;
    this.queue = `${this.exchange}_queue`;
  }

  async connect(type = ConnectRabbitType.RPC): Promise<RabbitConnect> {
    try {
      this._connection = await connect(this._url);
      this._connection.on('error', this.errorHandler);
      this._connection.on('close', this.reconnect);
      this._connection = await connect(this._url);
      this._connection.on('error', this.errorHandler);
      logger.info(`Rabbit was connected to: ${this.exchange}`);

      this._channel = await this._connection.createChannel();
      await this.setupExchangeAndQueue(type);
    } catch (error) {
      logger.error(error, 'Failed to connect to RabbitMQ:');
      setTimeout(() => this.connect(type), this.reconnectInterval);
    }

    return this;
  }

  private reconnect = (): void => {
    logger.info(`Attempting to reconnect to RabbitMQ in ${this.reconnectInterval / 1000} seconds...`);
    setTimeout(() => this.connect(), this.reconnectInterval);
  };

  private async setupExchangeAndQueue(type: ConnectRabbitType): Promise<void> {
    await this._channel.assertExchange(this.exchange, 'fanout', { durable: false });

    if (type === ConnectRabbitType.RPC) {
      const q = await this._channel.assertQueue('', { exclusive: true, maxPriority: 10 });
      this.pushQueue = q.queue;
    }

    await this._channel.assertQueue(this.queue, { durable: false, maxPriority: 10 });
    await this._channel.bindQueue(this.queue, this.exchange, '');
    await this._channel.prefetch(1);
  }

  private errorHandler = (error: Error): void => {
    logger.error(error, 'RabbitMQ connection error:');
  };

  get channel(): Channel {
    return this._channel;
  }

  get connection(): Connection {
    return this._connection;
  }

  async disconnect(): Promise<void> {
    try {
      await this._channel.close();
      await this._connection.close();
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error(error, 'Error closing RabbitMQ connection:');
    }
  }

  public ack(message: any): void {
    this._channel.ack(message);
  }
}
