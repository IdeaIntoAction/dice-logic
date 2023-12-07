import { NextFunction } from 'express';
import { IRequest, IResponse } from '../@types/express/interface';

type AsyncFunction = (
  req: IRequest<any, any, any>,
  res: IResponse<any, any>,
  next: NextFunction,
) => Promise<unknown>;

export const asyncErrorHandler = (execution: AsyncFunction) => (
  req: IRequest,
  res: IResponse<any, any>,
  next: NextFunction,
) => {
  execution(req, res, next).catch(next);
};