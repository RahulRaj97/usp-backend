import { OpenAPIV3 } from 'openapi-types';

export const healthPaths: OpenAPIV3.PathsObject = {
  '/health': {
    get: {
      tags: ['System'],
      summary: 'Health Check',
      responses: {
        200: {
          description: 'Server is healthy',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' },
            },
          },
        },
      },
    },
  },
};
