import { SchemaValidationError } from '../../util/schema-validator';
import { ExtendedBadRequestError } from '../extended-http-error';
import { AbstractErrorSerializer } from './abstract-error.serializer';

export class SchemaValidationErrorSerializer extends AbstractErrorSerializer<SchemaValidationError> {
  canHandle(error: Error): boolean {
    return error instanceof SchemaValidationError;
  }

  protected serializeTypedError(error: SchemaValidationError) {
    const errors = error.getMessages();
    return new ExtendedBadRequestError('Bad Request', errors);
  }
}
