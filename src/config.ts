import nodeConfig from 'config';

export interface IConfig {
  server: {
    port: number,
  }
}

export const config: IConfig = {
  server: nodeConfig.get('server'),
};
