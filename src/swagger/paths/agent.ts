import { OpenAPIV3 } from 'openapi-types';

export const agentPath: OpenAPIV3.PathsObject = {
  '/agents': {
    get: {
      tags: ['Agent'],
      summary: 'Get all agents',
      description: 'Fetch a list of all agents',
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
          description: 'Agent created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Agent' },
            },
          },
        },
        400: { description: 'Invalid request' },
      },
    },
  },
  '/agents/{id}': {
    get: {
      tags: ['Agent'],
      summary: 'Get agent by ID',
      description: 'Fetch details of a specific agent by their ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Agent ID',
        },
      ],
      responses: {
        200: {
          description: 'Agent details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Agent' },
            },
          },
        },
        404: { description: 'Agent not found' },
      },
    },
    put: {
      tags: ['Agent'],
      summary: 'Update agent by ID',
      description: 'Update details of a specific agent',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Agent ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Agent' },
          },
        },
      },
      responses: {
        200: { description: 'Agent updated successfully' },
        404: { description: 'Agent not found' },
        400: { description: 'Invalid request' },
      },
    },
    delete: {
      tags: ['Agent'],
      summary: 'Delete agent by ID',
      description: 'Remove an agent from the system',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Agent ID',
        },
      ],
      responses: {
        200: { description: 'Agent deleted successfully' },
        404: { description: 'Agent not found' },
      },
    },
  },
};
