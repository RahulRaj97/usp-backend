import { authSchemas } from './authSchemas';
import { agentSchemas } from './agentSchemas';
import { healthSchemas } from './healthSchemas';

export const allSchemas = {
  ...authSchemas,
  ...agentSchemas,
  ...healthSchemas,
};
