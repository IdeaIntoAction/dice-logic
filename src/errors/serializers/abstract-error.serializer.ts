import { HttpError } from 'http-errors';
import { ExtendedBadRequestError } from '../extended-http-error';

export interface IErrorSerializer {
  canHandle: (error: Error) => boolean;
  serializeError: (error: Error) => HttpError | ExtendedBadRequestError;
}

export abstract class AbstractErrorSerializer<T extends Error> implements IErrorSerializer {
  abstract canHandle(error: Error): boolean;

  serializeError(error: Error) {
    return this.serializeTypedError(error as T);
  }

  protected abstract serializeTypedError(error: Error): HttpError;
}
