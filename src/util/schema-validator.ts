import Ajv, { JSONSchemaType, ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { IValidationErrorMessage, List, OptionKey } from '../types';

export class SchemaValidationError extends Error {
  validationErrors: List<ErrorObject[]>;

  constructor(validationErrors: List<ErrorObject[]>) {
    super();
    this.name = 'JsonSchemaValidationError';
    this.validationErrors = validationErrors;
  }

  toString() {
    let errorMessage = '';
    for (const [requestParam, errors] of Object.entries(this.validationErrors)) {
      errorMessage += `${requestParam}: ${errors.map((e: ErrorObject) => `field ${e.instancePath} - ${e.message}`).join(', ')}`;
    }
    return errorMessage;
  }

  getMessages() {
    const errorMessages: IValidationErrorMessage[] = [];

    for (const [, errors] of Object.entries(this.validationErrors)) {
      errors.forEach((e: ErrorObject) => {
        errorMessages.push({ field: e.instancePath.replace('/', ''), message: e.message || '' });
      });
    }

    return errorMessages;
  }
}

class RequestValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      $data: true,
      useDefaults: true,
      coerceTypes: true,
    });
    addFormats(this.ajv);
    ajvErrors(this.ajv);
  }

  validate<T>(properties: List<JSONSchemaType<T>>): RequestHandler {
    const compiledSchemas = this.compileSchemas(properties);

    return (req: Request, _res: Response, next: NextFunction) => {
      const validationErrors = this.validateRequest(compiledSchemas, req);

      if (Object.keys(validationErrors).length > 0) {
        next(new SchemaValidationError(validationErrors));
      } else {
        next();
      }
    };
  }

  private compileSchemas<T>(properties: List<JSONSchemaType<T>>) {
    return (Object.keys(properties) as OptionKey[]).map((requestProperty) => {
      const schema = properties[requestProperty] as JSONSchemaType<T>;
      const validateFunction = this.ajv.compile(schema);
      return { requestProperty, validateFunction };
    });
  }

  private validateRequest(
    compiledSchemas: { requestProperty: OptionKey; validateFunction: ValidateFunction }[],
    req: Request
  ) {
    return compiledSchemas.reduce((errors, { requestProperty, validateFunction }) => {
      const valid = validateFunction(req[requestProperty]);
      if (!valid) {
        errors[requestProperty] = validateFunction.errors ?? undefined;
      }
      return errors;
    }, {} as Record<OptionKey, ErrorObject[] | undefined>);
  }
}

export const validator = new RequestValidator();
