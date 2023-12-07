import { BadRequest } from 'http-errors';
import { IValidationErrorMessage } from '../types';

export class ExtendedBadRequestError extends BadRequest {
  public errors: IValidationErrorMessage[];
  constructor(message: string, errors: IValidationErrorMessage[]) {
    super(message);
    this.errors = errors;
  }
}
