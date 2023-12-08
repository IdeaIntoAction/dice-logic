import { Request, Response } from 'express';

export type EmptyObject = { never: never };

export type IRequest<
  Params = EmptyObject,
  ReqBody = EmptyObject,
  ReqQuery = EmptyObject,
  Locals extends Record<string, any> = EmptyObject,
> = Request<Params, unknown, ReqBody, ReqQuery, Locals>;

export interface IStatusResponseBody {
  status?: number;
}

export interface IResponseWithData<T> extends IStatusResponseBody {
  data: T;
}

type IResponseData<T = null> = T extends null ? IStatusResponseBody : IResponseWithData<T>;

export type IResponse<
  DataType = null,
  Locals extends Record<string, any> = EmptyObject,
> = Response<IResponseData<DataType>, Locals>;
