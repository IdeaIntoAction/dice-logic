import nodeConfig from 'config';

export interface IConfig {
  server: {
    port: number,
  },
  redis: {
    host: string,
    port: number,
    db: number,
  }
}

export const config: IConfig = {
  server: nodeConfig.get('server'),
  redis: nodeConfig.get('redis'),
};
