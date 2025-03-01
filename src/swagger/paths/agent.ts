import { OpenAPIV3 } from 'openapi-types';

export const agentPaths: OpenAPIV3.PathsObject = {
  '/api/agents': {
    post: {
      tags: ['Agents'],
      summary: 'Create an agent',
      description: 'Admin-only route to create a new agent',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateAgentRequest' },
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
        400: { description: 'Invalid request body' },
        403: { description: 'Forbidden - Only admins can create agents' },
      },
    },
    get: {
      tags: ['Agents'],
      summary: 'Get all agents',
      description: 'Retrieves a list of all agents (Accessible by Admins & Agents)',
      security: [{ BearerAuth: [] }],
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
  },

  '/api/agents/{id}': {
    get: {
      tags: ['Agents'],
      summary: 'Get an agent by ID',
      description: 'Retrieve a specific agent by their unique ID',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Agent retrieved successfully',
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
      tags: ['Agents'],
      summary: 'Update an agent',
      description: 'Updates an agent’s details by their ID',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateAgentRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Agent updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Agent' },
            },
          },
        },
        400: { description: 'Invalid request body' },
        404: { description: 'Agent not found' },
      },
    },

    delete: {
      tags: ['Agents'],
      summary: 'Delete an agent',
      description: 'Deletes an agent by their ID (Only Admins can delete)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        204: { description: 'Agent deleted successfully' },
        404: { description: 'Agent not found' },
      },
    },
  },
};
