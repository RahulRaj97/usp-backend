// File: src/swagger/paths/adminUniversity.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminUniversityPaths: OpenAPIV3.PathsObject = {
  '/api/admin/universities': {
    get: {
      tags: ['Admin Universities'],
      summary: 'List Universities (Admin)',
      description:
        'Retrieve a list of universities, with optional filters by name or country and pagination.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'name',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by university name',
        },
        {
          name: 'country',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by country',
        },
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', default: 1 },
          description: 'Page number',
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 10 },
          description: 'Items per page',
        },
      ],
      responses: {
        200: {
          description: 'Paginated list of universities',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedUniversities' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Admin Universities'],
      summary: 'Create University (Admin)',
      description: 'Create a new university record.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUniversityRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'University created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/University' },
            },
          },
        },
        400: { description: 'Invalid request body' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/admin/universities/{id}': {
    get: {
      tags: ['Admin Universities'],
      summary: 'Get University by ID (Admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'University ObjectId',
        },
      ],
      responses: {
        200: {
          description: 'University details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/University' },
            },
          },
        },
        404: { description: 'University not found' },
        401: { description: 'Unauthorized' },
      },
    },
    put: {
      tags: ['Admin Universities'],
      summary: 'Update University (Admin)',
      description: 'Update an existing university record.',
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
            schema: { $ref: '#/components/schemas/UpdateUniversityRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'University updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/University' },
            },
          },
        },
        400: { description: 'Invalid request body' },
        404: { description: 'University not found' },
        401: { description: 'Unauthorized' },
      },
    },
    delete: {
      tags: ['Admin Universities'],
      summary: 'Delete University (Admin)',
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
        204: { description: 'University deleted successfully' },
        404: { description: 'University not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
