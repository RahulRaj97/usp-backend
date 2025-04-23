// File: src/swagger/schemas/adminApplicationSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminApplicationSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  CreateApplicationRequest: {
    type: 'object',
    properties: {
      studentId: { type: 'string', example: '67f2acf66d01ee19b538f95d' },
      agentId: { type: 'string', example: '67f279a78fd336d654ebb030' },
      companyId: { type: 'string', example: '67f279a78fd336d654ebb02b' },
      programmeIds: {
        type: 'array',
        items: { type: 'string', example: '67e07ebfa9bf5773c6e65a23' },
      },
      priorityMapping: {
        type: 'array',
        items: {
          type: 'object',
          required: ['programmeId', 'priority'],
          properties: {
            programmeId: {
              type: 'string',
              example: '67e07ebfa9bf5773c6e65a23',
            },
            priority: { type: 'integer', example: 1, minimum: 1, maximum: 3 },
          },
        },
      },
      notes: {
        type: 'string',
        example: 'Application for Fall intake',
      },
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
      notes: {
        type: 'string',
        example: 'Submitted to university portal',
      },
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
      _id: { type: 'string', example: '6806759e728ad12632b3a082' },
      applicationCode: {
        type: 'string',
        example: 'APP-8S9YG329',
      },
      agentId: { type: 'string', example: '67f279a78fd336d654ebb030' },
      companyId: { type: 'string', example: '67f279a78fd336d654ebb02b' },
      programmeIds: {
        type: 'array',
        items: { type: 'string', example: '67e07ebfa9bf5773c6e65a23' },
      },
      priorityMapping: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            programmeId: {
              type: 'string',
              example: '67e07ebfa9bf5773c6e65a23',
            },
            priority: { type: 'integer', example: 1 },
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
        example: '2025-04-21T16:43:10.256Z',
      },
      student: { $ref: '#/components/schemas/Student' },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-21T16:43:10.265Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-21T16:43:10.265Z',
      },
    },
    required: [
      '_id',
      'applicationCode',
      'agentId',
      'companyId',
      'programmeIds',
      'priorityMapping',
      'status',
      'currentStage',
      'isWithdrawn',
      'submittedAt',
      'student',
      'createdAt',
      'updatedAt',
    ],
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
