import { createLogger, format, transports } from 'winston';

import appConfig from './app';

const logger = createLogger({
  level: appConfig.logging.level,
  format: format.combine(
    format.json(),
    format.timestamp(),
    format.prettyPrint(),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' }),
  ],
});

export default logger;
