// File: src/swagger/paths/adminApplications.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminApplicationPaths: OpenAPIV3.PathsObject = {
  '/api/admin/applications': {
    get: {
      tags: ['Admin Applications'],
      summary: 'List Applications (Admin)',
      description:
        'Retrieve a paginated list of applications. Supports filtering by status, stage, studentId, agentId, companyId.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: [
              'submitted_to_usp',
              'pending_documents',
              'submitted_to_university',
              'university_query',
              'final_decision',
              'respond_to_offer',
            ],
          },
          description: 'Filter by application status',
        },
        {
          name: 'stage',
          in: 'query',
          schema: {
            type: 'string',
            enum: [
              'profile_complete',
              'documents_uploaded',
              'programme_selected',
              'application_submitted',
              'university_processing',
              'offer_received',
              'student_confirmed',
              'visa_processing',
              'finalized',
            ],
          },
          description: 'Filter by current stage',
        },
        {
          name: 'studentId',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by Student ObjectId',
        },
        {
          name: 'agentId',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by Agent ObjectId',
        },
        {
          name: 'companyId',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by Company ObjectId',
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
        'Create a new application with explicit agentId, studentId, companyId, programmes, and priorities.',
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
        400: { description: 'Invalid request body' },
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
          required: true,
          schema: { type: 'string' },
          description: 'Application ObjectId',
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
        404: { description: 'Application not found' },
        401: { description: 'Unauthorized' },
      },
    },
    put: {
      tags: ['Admin Applications'],
      summary: 'Update Application (Admin)',
      description:
        'Update an application’s status, stage, notes, or supportingDocuments.',
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
            schema: { $ref: '#/components/schemas/UpdateApplicationRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Application updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Application' },
            },
          },
        },
        400: { description: 'Invalid request body' },
        404: { description: 'Application not found' },
        401: { description: 'Unauthorized' },
      },
    },
    delete: {
      tags: ['Admin Applications'],
      summary: 'Delete Application (Admin)',
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
        204: { description: 'Application deleted successfully' },
        404: { description: 'Application not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/admin/applications/{id}/withdraw': {
    patch: {
      tags: ['Admin Applications'],
      summary: 'Withdraw Application (Admin)',
      description: 'Mark an application as withdrawn.',
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
          description: 'Application withdrawn successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Application' },
            },
          },
        },
        404: { description: 'Application not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
