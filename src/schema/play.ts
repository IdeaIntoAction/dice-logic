import { RequestSchema } from "../types";

export interface IPlayRequest {
  amount: number;
}

export interface IPlayResponse {
  isWin: boolean;
}

export const playRequestSchema: RequestSchema<IPlayRequest> = {
  body: {
    type: 'object',
    required: ['amount'],
    properties: {
      amount: {
        type: 'number',
        nullable: false,
      },
    },
    additionalProperties: false,
  },
};