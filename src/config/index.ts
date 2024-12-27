import appConfig from './app';
import logger from './logger';

const config = {
  logger,
  app: appConfig.app,
  database: appConfig.database,
};

export default config;
