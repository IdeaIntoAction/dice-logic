import { Message } from 'amqplib';
import { ConnectRabbitType, MessageHandlerCallback, Request } from './interface';
import { RabbitConnect } from './connect';
import { RabbitRPCRequest } from './rpc-request';
import { logger } from '../../util/logger';

export class RabbitService {
  private rpcConnection: RabbitConnect;

  private consumeConnection: RabbitConnect;

  public requestSequence: Map<string, { complete: (msg: string) => void }>;

  private static instance: RabbitService;

  private customMessageHandler?: MessageHandlerCallback;

  private constructor(rpcExchange: string, consumeExchange: string) {
    this.rpcConnection = new RabbitConnect(rpcExchange);
    this.consumeConnection = new RabbitConnect(consumeExchange);
    this.requestSequence = new Map<string, { complete:(msg: string) => void }>();
  }

  public static async getInstance(
    rpcExchange: string,
    consumeExchange: string,
  ): Promise<RabbitService> {
    if (!RabbitService.instance) {
      RabbitService.instance = new RabbitService(rpcExchange, consumeExchange);
      await RabbitService.instance.rpcConnection.connect(ConnectRabbitType.RPC);
      await RabbitService.instance.consumeConnection.connect(ConnectRabbitType.CONSUME);
    }
    return RabbitService.instance;
  }

  public setCustomMessageHandler(handler: MessageHandlerCallback) {
    this.customMessageHandler = handler;
  }

  public run = () => {
    this.initConsume();
    this.initRpc();
  };

  public disconnect = async () => {
    logger.info('Closing rabbit connection');
    await this.rpcConnection.disconnect();
    await this.consumeConnection.disconnect();
  };

  private messageHandler = (message: Message | null) => {
    if (!message) return;

    const { correlationId } = message.properties;
    const currentHandler = this.requestSequence.get(correlationId);
    if (currentHandler) {
      currentHandler.complete(message.content.toString());
      this.rpcConnection.ack(message);
      this.requestSequence.delete(correlationId);
    }
  };

  private initRpc = () => {
    const queueName = this.rpcConnection.pushQueue || '';
    logger.info(`[RPC Init] Awaiting messages on queue ${queueName}`);
    this.rpcConnection.channel.consume(queueName, this.messageHandler);
  };

  private initConsume = () => {
    const { channel, queue } = this.consumeConnection;
    channel.consume(queue, this.consumeMessageHandler);
  };

  private consumeMessageHandler = async (msg: Message | null) => {
    if (!msg) return;

    this.consumeConnection.ack(msg);
    const messageContent = msg.content.toString();
    if (this.customMessageHandler) {
      const handlerResult = await this.customMessageHandler(messageContent);

      this.consumeConnection.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(handlerResult)), {
        correlationId: msg.properties.correlationId,
      });
    } else {
      logger.warn('No custom message handler set for RabbitService');
    }
  };

  private timeoutHandler(request: RabbitRPCRequest, reject: (reason: any) => void) {
    return setTimeout(() => {
      request.destroy();
      reject(new Error('Timeout Error'));
    }, 6000);
  }

  public getRequestResult = async (
    request: Request,
    priority = 10,
  ): Promise<string | null> => {
    const newRequest = new RabbitRPCRequest(request, priority);
    this.requestSequence.set(newRequest.id, { complete: newRequest.complete });

    await newRequest.publish(this.rpcConnection);

    return new Promise((resolve, reject) => {
      this.timeoutHandler(newRequest, reject);
      newRequest.on('complete', resolve);
    });
  };

  public publishMessage = (request: Request, priority: number, exchange: string): void => {
    try {
      const { channel, exchange: connectExchange } = this.rpcConnection;
      if (exchange !== connectExchange) {
        channel.assertExchange(exchange, 'fanout', { durable: false });
      }

      channel.publish(exchange, '', Buffer.from(JSON.stringify(request)), {
        priority,
        messageId: request.id || 'unknown',
      });

      logger.info(`[Publish] Message to ${exchange} exchange`, request);
    } catch (error) {
      logger.error('Error publishing message to exchange', error);
    }
  };
}
