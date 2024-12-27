import { OpenAPIV3 } from 'openapi-types';

export const healthSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    uptime: { type: 'number' },
    timestamp: { type: 'number' },
  },
};
