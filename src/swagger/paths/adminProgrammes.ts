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
        { 
          name: 'country', 
          in: 'query', 
          schema: { 
            type: 'array',
            items: { type: 'string' }
          },
          description: 'Filter by university country. Can be provided multiple times for multiple countries.'
        },
        { 
          name: 'intakeDateFrom', 
          in: 'query', 
          schema: { 
            type: 'string',
            format: 'date'
          },
          description: 'Filter intakes starting from this date (inclusive)'
        },
        { 
          name: 'intakeDateTo', 
          in: 'query', 
          schema: { 
            type: 'string',
            format: 'date'
          },
          description: 'Filter intakes starting until this date (inclusive)'
        },
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
      description: `Update a programme with support for:
        - Basic field updates (name, description, etc.)
        - Array operations (add/remove items from otherFees, metaKeywords, modules, services)
        - Intake operations (add/remove/update intakes)
        - Image operations (add new images, remove existing images, reorder images)
        - Program requirements updates
      `,
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
          description: 'Programme updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Programme' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
        '400': { 
          description: 'Invalid request format or data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        },
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
