import { Config } from '@/types/config';

import testConfig from './environments/test';
import defaultConfig from './environments/default';
import productionConfig from './environments/production';
import developmentConfig from './environments/development';

const environment = process.env.NODE_ENV || 'development';

let config: Config;

switch (environment) {
  case 'production':
    config = productionConfig;
    break;
  case 'test':
    config = testConfig;
    break;
  case 'development':
    config = developmentConfig;
    break;
  default:
    config = defaultConfig;
    break;
}

export default config;
