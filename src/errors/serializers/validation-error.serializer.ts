import { ExtendedBadRequestError } from '../extended-http-error';
import { ValidationError } from '../validation-error';
import { AbstractErrorSerializer } from './abstract-error.serializer';

export class ValidationErrorSerializer extends AbstractErrorSerializer<ValidationError> {
  canHandle(error: Error): boolean {
    return error instanceof ValidationError;
  }

  protected serializeTypedError(error: ValidationError) {
    const typedError = error as ValidationError;
    return new ExtendedBadRequestError('Bad Request', [{
      field: typedError.field,
      message: typedError.message,
    }]);
  }
}
