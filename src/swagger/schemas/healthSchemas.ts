import { OpenAPIV3 } from 'openapi-types';

export const healthSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  HealthResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'OK' },
      uptime: { type: 'number', example: 1200 },
      timestamp: { type: 'number', example: 1700000000000 },
    },
  },
};
