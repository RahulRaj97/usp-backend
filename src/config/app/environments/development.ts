import { Config } from '@/types/config';

import defaultConfig from './default';

const developmentConfig: Config = {
  ...defaultConfig,
  database: {
    uri: 'mongodb://127.0.0.1:27017/usp-backend-dev',
  },
  logging: {
    level: 'debug',
  },
};

export default developmentConfig;
