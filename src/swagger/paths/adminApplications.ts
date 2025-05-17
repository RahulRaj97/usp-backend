import { OpenAPIV3 } from 'openapi-types';

export const adminApplicationPaths: OpenAPIV3.PathsObject = {
  '/api/admin/applications': {
    get: {
      tags: ['Admin Applications'],
      summary: 'List Applications (Admin)',
      description:
        'List all applications, with full filtering (student, agent, company, status, stage).',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 10 },
        },
        {
          name: 'studentId',
          in: 'query',
          schema: { type: 'string' },
        },
        {
          name: 'agentId',
          in: 'query',
          schema: { type: 'string' },
        },
        {
          name: 'companyId',
          in: 'query',
          schema: { type: 'string' },
        },
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
    post: {
      tags: ['Admin Applications'],
      summary: 'Create Application (Admin)',
      description:
        'Create a new application on behalf of any agent or student.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateAdminApplicationRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Application created',
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
  },

  '/api/admin/applications/{id}': {
    get: {
      tags: ['Admin Applications'],
      summary: 'Get Application by ID (Admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          schema: { type: 'string' },
          required: true,
        },
      ],
      responses: {
        200: {
          description: 'Application details',
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
    put: {
      tags: ['Admin Applications'],
      summary: 'Update Application (Admin)',
      description:
        'Update status, stage and notes; automatically pushes history when stage change.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          schema: { type: 'string' },
          required: true,
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateApplicationRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Updated application',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Application' },
            },
          },
        },
        400: { description: 'Validation error' },
        404: { description: 'Not found' },
        401: { description: 'Unauthorized' },
      },
    },
    delete: {
      tags: ['Admin Applications'],
      summary: 'Delete Application (Admin)',
      description: 'Permanently delete an application.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          schema: { type: 'string' },
          required: true,
        },
      ],
      responses: {
        204: { description: 'No Content' },
        404: { description: 'Not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin/applications/{id}/withdraw': {
    patch: {
      tags: ['Admin Applications'],
      summary: 'Withdraw Application',
      description: 'Mark an application as withdrawn.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          schema: { type: 'string' },
          required: true,
        },
      ],
      responses: {
        200: {
          description: 'Application marked withdrawn',
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

  '/api/admin/applications/{id}/supporting-documents': {
    post: {
      tags: ['Admin Applications'],
      summary: 'Upload Supporting Documents (Admin)',
      description:
        'Attach one or more files to an existing application as admin.',
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
            schema: {
              type: 'object',
              properties: {
                files: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'One or more files',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Updated application with new document URLs',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Application' },
            },
          },
        },
        400: { description: 'Invalid upload' },
        404: { description: 'Not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin/applications/{id}/stage-status': {
    patch: {
      tags: ['Admin Applications'],
      summary: 'Toggle Stage Status (Admin)',
      description: 'Mark any stage as done or undone, with optional notes and attachments. Updates stageStatus, stageHistory, and currentStage.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          schema: { type: 'string' },
          required: true,
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StageStatusUpdateRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Updated application with new stage status',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Application' },
            },
          },
        },
        400: { description: 'Validation error' },
        404: { description: 'Not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
