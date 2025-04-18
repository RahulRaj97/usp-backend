// File: src/swagger/paths/adminProgrammes.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminProgrammePaths: OpenAPIV3.PathsObject = {
  '/api/admin/programmes': {
    get: {
      tags: ['Admin Programmes'],
      summary: 'List Programmes (Admin)',
      description:
        'Retrieve a paginated list of programmes. Supports filtering by universityId, type, subjectArea, startDate, minDuration, maxDuration.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'universityId',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by University ObjectId',
        },
        {
          name: 'type',
          in: 'query',
          schema: {
            type: 'string',
            enum: [
              'bachelor',
              'master',
              'phd',
              'associate',
              'diploma',
              'certificate',
              'exchange',
              'foundation',
              'executive',
            ],
          },
          description: 'Programme type',
        },
        {
          name: 'subjectArea',
          in: 'query',
          schema: {
            type: 'string',
            enum: [
              'computer_science',
              'engineering',
              'business',
              'agriculture',
              'arts',
              'education',
              'law',
              'medicine',
              'social_sciences',
              'natural_sciences',
              'environmental_science',
              'mathematics',
              'economics',
              'design',
              'media',
              'philosophy',
              'psychology',
              'international_relations',
              'data_science',
            ],
          },
          description: 'Filter by subject area',
        },
        {
          name: 'startDate',
          in: 'query',
          schema: { type: 'string', format: 'date' },
          description:
            'Only include programmes starting on or after this date (YYYY-MM-DD)',
        },
        {
          name: 'minDuration',
          in: 'query',
          schema: { type: 'integer' },
          description: 'Minimum duration (in semesters)',
        },
        {
          name: 'maxDuration',
          in: 'query',
          schema: { type: 'integer' },
          description: 'Maximum duration (in semesters)',
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
          description: 'Paginated list of programmes',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedProgrammes' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Admin Programmes'],
      summary: 'Create Programme (Admin)',
      description: 'Create a new programme, including uploading images.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/CreateProgrammeRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Programme created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Programme' },
            },
          },
        },
        400: { description: 'Invalid request body' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin/programmes/{id}': {
    get: {
      tags: ['Admin Programmes'],
      summary: 'Get Programme by ID (Admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Programme ObjectId',
        },
      ],
      responses: {
        200: {
          description: 'Programme details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Programme' },
            },
          },
        },
        404: { description: 'Programme not found' },
        401: { description: 'Unauthorized' },
      },
    },
    put: {
      tags: ['Admin Programmes'],
      summary: 'Update Programme (Admin)',
      description:
        'Update an existing programme and optionally upload new images.',
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
            schema: { $ref: '#/components/schemas/UpdateProgrammeRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Programme updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Programme' },
            },
          },
        },
        400: { description: 'Invalid request body' },
        404: { description: 'Programme not found' },
        401: { description: 'Unauthorized' },
      },
    },
    delete: {
      tags: ['Admin Programmes'],
      summary: 'Delete Programme (Admin)',
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
        204: { description: 'Programme deleted successfully' },
        404: { description: 'Programme not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
