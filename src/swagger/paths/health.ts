import { OpenAPIV3 } from 'openapi-types';

export const healthPath: OpenAPIV3.PathsObject = {
  '/health': {
    get: {
      tags: ['System'],
      summary: 'Health Check',
      description: 'Check if the server is running',
      responses: {
        200: {
          description: 'Server is healthy',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Health',
              },
            },
          },
        },
      },
    },
  },
};
