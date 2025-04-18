// File: src/swagger/schemas/adminApplicationSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminApplicationSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  CreateApplicationRequest: {
    type: 'object',
    properties: {
      studentId: { type: 'string', example: '60d0fe4f5311236168a109ca' },
      agentId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
      companyId: { type: 'string', example: '60d0fe4f5311236168a109cc' },
      programmeIds: {
        type: 'array',
        items: { type: 'string', example: '60d0fe4f5311236168a109cd' },
      },
      priorityMapping: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            programmeId: {
              type: 'string',
              example: '60d0fe4f5311236168a109cd',
            },
            priority: { type: 'integer', example: 1, minimum: 1, maximum: 3 },
          },
          required: ['programmeId', 'priority'],
        },
      },
      notes: { type: 'string', example: 'Application for Fall intake' },
      supportingDocuments: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uri',
          example: 'https://s3.aws/.../doc.pdf',
        },
      },
    },
    required: [
      'studentId',
      'agentId',
      'companyId',
      'programmeIds',
      'priorityMapping',
    ],
  },

  UpdateApplicationRequest: {
    type: 'object',
    properties: {
      status: {
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
      currentStage: {
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
      notes: { type: 'string', example: 'Submitted to university portal' },
      supportingDocuments: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uri',
          example: 'https://s3.aws/.../offer.pdf',
        },
      },
    },
  },

  Application: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '60d0fe4f5311236168a109ce' },
      studentId: { type: 'string', example: '60d0fe4f5311236168a109ca' },
      agentId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
      companyId: { type: 'string', example: '60d0fe4f5311236168a109cc' },
      programmeIds: {
        type: 'array',
        items: { type: 'string', example: '60d0fe4f5311236168a109cd' },
      },
      priorityMapping: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            programmeId: {
              type: 'string',
              example: '60d0fe4f5311236168a109cd',
            },
            priority: { type: 'integer', example: 2 },
          },
        },
      },
      status: {
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
      currentStage: {
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
      notes: { type: 'string' },
      supportingDocuments: {
        type: 'array',
        items: { type: 'string', format: 'uri' },
      },
      isWithdrawn: { type: 'boolean', example: false },
      submittedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-18T12:34:56Z',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-18T12:00:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-18T12:30:00Z',
      },
    },
  },

  PaginatedApplications: {
    type: 'object',
    properties: {
      applications: {
        type: 'array',
        items: { $ref: '#/components/schemas/Application' },
      },
      totalPages: { type: 'integer', example: 5 },
      currentPage: { type: 'integer', example: 1 },
    },
  },
};
