export enum ConnectRabbitType {
  RPC = 'rps',
  CONSUME = 'consume',
}

export type Request = {
  id: string;
  userId: string;
  nickname: string;
};

export type Response = {
  isWin: boolean;
  amount: number;
};

export type MessageHandlerCallback = (msgContent: string) => Promise<Response>;
