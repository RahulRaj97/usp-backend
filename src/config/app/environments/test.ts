import { Config } from '@/types/config';

import defaultConfig from './default';

const testConfig: Config = {
  ...defaultConfig,
  database: {
    uri: 'mongodb://127.0.0.1:27017/usp-backend-test',
  },
  logging: {
    level: 'error',
  },
};

export default testConfig;
