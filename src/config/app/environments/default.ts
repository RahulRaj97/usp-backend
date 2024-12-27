import { Config } from '@/types/config';

const defaultConfig: Config = {
  app: {
    port: 5000,
    environment: 'development',
  },
  database: {
    uri: 'mongodb://127.0.0.1:27017/usp-backend',
  },
  logging: {
    level: 'info',
  },
};

export default defaultConfig;
