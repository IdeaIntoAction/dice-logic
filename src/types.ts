import { JSONSchemaType } from 'ajv';

export interface IValidationErrorMessage {
  field: string,
  message: string,
}

export type OptionKey = 'body' | 'params' | 'query';

export type List<T> = {
  [K in OptionKey]?: T;
};

export type RequestSchema<T> = List<JSONSchemaType<T>>;
