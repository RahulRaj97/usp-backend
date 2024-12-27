import { Config } from '@/types/config';

import defaultConfig from './default';

const productionConfig: Config = {
  ...defaultConfig,
  app: {
    ...defaultConfig.app,
    environment: 'production',
  },
  database: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/usp-backend-prod',
  },
  logging: {
    level: 'warn',
  },
};

export default productionConfig;
