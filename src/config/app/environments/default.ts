// src/config/app/environments/default.ts
import { Config } from '@/types/config';

const defaultConfig: Config = {
  app: {
    port: Number(process.env.PORT) || 5000,
    environment: 'development',
  },
  database: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/usp-backend',
  },
  logging: {
    level: 'info',
  },
};

export default defaultConfig;
