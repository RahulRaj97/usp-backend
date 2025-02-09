import { OpenAPIV3 } from 'openapi-types';

export const agentPath: OpenAPIV3.PathsObject = {
  '/agents': {
    get: {
      tags: ['Agent'],
      summary: 'Get all agents',
      responses: {
        200: {
          description: 'List of agents',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Agent' },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['Agent'],
      summary: 'Create a new agent',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Agent',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Agent created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Agent' },
            },
          },
        },
      },
    },
  },
  '/agents/{id}': {
    get: {
      tags: ['Agent'],
      summary: 'Get agent by ID',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Agent found' },
        404: { description: 'Agent not found' },
      },
    },
  },
};
