export enum ConnectRabbitType {
  RPC = 'rps',
  CONSUME = 'consume',
}

export type IRequest = {
  id: string;
  userId: string;
  nickname: string;
};

export type Response = {
  isWin: boolean;
  number: number;
};

export type MessageHandlerCallback = (msgContent: string) => Promise<Response>;
