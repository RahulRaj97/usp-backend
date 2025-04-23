// src/swagger/paths/adminProgrammePaths.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminProgrammePaths: OpenAPIV3.PathsObject = {
  '/api/admin/programmes': {
    get: {
      tags: ['AdminProgrammes'],
      summary: 'List all programmes (admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'universityId', in: 'query', schema: { type: 'string' } },
        {
          name: 'type',
          in: 'query',
          schema: { $ref: '#/components/schemas/ProgrammeType' },
        },
        {
          name: 'deliveryMethod',
          in: 'query',
          schema: { $ref: '#/components/schemas/DeliveryMethod' },
        },
        { name: 'openIntakeOnly', in: 'query', schema: { type: 'boolean' } },
        { name: 'minTuition', in: 'query', schema: { type: 'number' } },
        { name: 'maxTuition', in: 'query', schema: { type: 'number' } },
        { name: 'minApplicationFee', in: 'query', schema: { type: 'number' } },
        { name: 'maxApplicationFee', in: 'query', schema: { type: 'number' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 20 },
        },
      ],
      responses: {
        '200': {
          description: 'Paginated list of programmes',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedProgrammes' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
    post: {
      tags: ['AdminProgrammes'],
      summary: 'Create a programme',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/CreateProgrammePayload' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Programme created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Programme' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '400': { $ref: '#/components/responses/BadRequest' },
      },
    },
  },

  '/api/admin/programmes/{id}': {
    get: {
      tags: ['AdminProgrammes'],
      summary: 'Get a programme by ID (admin)',
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
        '200': {
          description: 'Programme details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Programme' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['AdminProgrammes'],
      summary: 'Update a programme',
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
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/UpdateProgrammePayload' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Programme updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Programme' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['AdminProgrammes'],
      summary: 'Delete a programme',
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
        '204': { description: 'Deleted successfully' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
