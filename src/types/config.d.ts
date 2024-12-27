export interface Config {
  app: {
    port: number;
    environment: 'development' | 'production' | 'test';
  };
  database: {
    uri: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}
