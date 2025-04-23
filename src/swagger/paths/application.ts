import { OpenAPIV3 } from 'openapi-types';

export const applicationPaths: OpenAPIV3.PathsObject = {
  '/api/applications': {
    post: {
      tags: ['Applications'],
      summary: 'Create Application',
      description: 'Agent creates a new application (no files here).',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateApplicationRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Application created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Application' },
            },
          },
        },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
      },
    },
    get: {
      tags: ['Applications'],
      summary: 'List Applications',
      description:
        'List applications for the authenticated agent, scoped by their level. Supports pagination & filters.',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 10 },
        },
        { name: 'studentId', in: 'query', schema: { type: 'string' } },
        { name: 'companyId', in: 'query', schema: { type: 'string' } },
        {
          name: 'status',
          in: 'query',
          schema: { $ref: '#/components/schemas/ApplicationStatus' },
        },
        {
          name: 'stage',
          in: 'query',
          schema: { $ref: '#/components/schemas/ApplicationStage' },
        },
      ],
      responses: {
        200: {
          description: 'Paginated list of applications',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedApplications' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/applications/{id}': {
    get: {
      tags: ['Applications'],
      summary: 'Get Application by ID',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Application ObjectId',
        },
      ],
      responses: {
        200: {
          description: 'Application details, with populated student',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Application' },
            },
          },
        },
        404: { description: 'Not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/applications/{id}/supporting-documents': {
    post: {
      tags: ['Applications'],
      summary: 'Upload Supporting Documents',
      description:
        'Attach one or more files to an existing application. Returns updated application.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Application ObjectId',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                files: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'One or more files to upload',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Application updated with new document URLs',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Application' },
            },
          },
        },
        400: { description: 'Invalid upload' },
        401: { description: 'Unauthorized' },
        404: { description: 'Application not found' },
      },
    },
  },
};
