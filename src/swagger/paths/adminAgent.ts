// File: src/swagger/paths/adminAgent.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminAgentPaths: OpenAPIV3.PathsObject = {
  '/api/admin/agents': {
    get: {
      tags: ['Admin Agents'],
      summary: 'List Agents (Admin)',
      description:
        'Retrieve a paginated list of agents. Supports filtering by role, active status, companyId, search term, and pagination.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'role',
          in: 'query',
          schema: {
            type: 'string',
            description: 'Agent level (owner, manager, admission, counsellor)',
          },
        },
        {
          name: 'active',
          in: 'query',
          schema: { type: 'boolean', description: 'Filter by active status' },
        },
        {
          name: 'companyId',
          in: 'query',
          schema: { type: 'string', description: 'Filter by Company ObjectId' },
        },
        {
          name: 'search',
          in: 'query',
          schema: {
            type: 'string',
            description: 'Search by firstName, lastName, or email',
          },
        },
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', default: 1, description: 'Page number' },
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            default: 10,
            description: 'Items per page',
          },
        },
      ],
      responses: {
        200: {
          description: 'Paginated list of agents',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedAgents' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Admin Agents'],
      summary: 'Create Agent (Admin)',
      description: 'Create a new agent under a specified company and parent.',
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
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/admin/agents/{id}': {
    get: {
      tags: ['Admin Agents'],
      summary: 'Get Agent by ID (Admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Agent ObjectId',
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
        401: { description: 'Unauthorized' },
      },
    },
    patch: {
      tags: ['Admin Agents'],
      summary: 'Update Agent (Admin)',
      description:
        'Update agent details, including role, parent, company, and profile info.',
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
        401: { description: 'Unauthorized' },
      },
    },
    delete: {
      tags: ['Admin Agents'],
      summary: 'Delete Agent (Admin)',
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
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/admin/agents/{id}/toggle-active': {
    patch: {
      tags: ['Admin Agents'],
      summary: 'Toggle Agent Active Status (Admin)',
      description: 'Activate or deactivate an agent account.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Agent ObjectId',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                active: { type: 'boolean' },
              },
              required: ['active'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Agent status toggled successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ToggleAgentStatusResponse',
              },
            },
          },
        },
        400: { description: 'Invalid request' },
        404: { description: 'Agent not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
