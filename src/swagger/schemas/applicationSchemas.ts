// File: src/swagger/schemas/applicationSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const applicationSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  // ------------------------------------------------------------------
  // 1) Enums
  // ------------------------------------------------------------------
  ApplicationStatus: {
    type: 'string',
    description: 'Overall status of the application',
    enum: [
      'Submitted to USP',
      'Pending Documents',
      'Submitted to University',
      'University Query',
      'Final Decision',
      'Respond to Offer',
    ],
  },
  ApplicationStage: {
    type: 'string',
    description: 'Current step in the application journey',
    enum: [
      'Collect Personal Information',
      'Search Courses',
      'Save Courses',
      'Complete Study Preferences',
      'Capture Any Additional Details',
      'Shortlist Courses',
      'Collect Documents',
      'Review Application',
      'Submit Application to Adventus',
      'Complete Application Form',
      'Review Visa Suitability',
      'Review Documents',
      'Approve and Proceed',
      'Approve & Proceed',
      'Message QCV about',
      'Message QCV about Visa Docs',
      'Upload Offers & Acceptance Docs',
      'Receive offers & Acceptance Documents',
      'Notify student of offers',
      'Complete acceptance forms',
      'Upload completed acceptance docs',
      'Message admissions about payment',
      'Upload proof of payment',
      'Submit acceptance and payment proof',
      'Receive Confirmation Enrolment (CoE, LOA, CAS,i20)',
      'Upload Enrolment Confirmation',
      'Message Counsellor about enrolment',
      'Download Enrolment Confirmation (CoE, LOA, CAS,i20)',
      'Notify Student of Enrolment Confirmation (CoE, LOA, CAS,i20)',
      'Collect Remaining Visa Docs',
      'Upload Remaining Visa Docs',
      'Collect visa documents',
      'Upload visa documents',
      'Organise medical',
      'Organise biometrics interview',
      'Organise visa interview training',
      'Lodge visa application',
      'Upload visa result letter',
      'Notify student',
      'Initiate deferment process(if required)',
      'Initiate refund process(if required)',
      'Invoice University',
      'University Payment Received',
      'Pay Channel Partner',
    ],
  },

  // ------------------------------------------------------------------
  // 2) Stage history entry (for full audit trail)
  // ------------------------------------------------------------------
  StageHistoryEntry: {
    type: 'object',
    properties: {
      stage: { $ref: '#/components/schemas/ApplicationStage' },
      notes: { type: 'string', example: 'Reviewed financial docs' },
      completedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-21T16:43:10Z',
      },
    },
    required: ['stage', 'completedAt'],
  },

  CreateApplicationRequest: {
    type: 'object',
    properties: {
      studentId: { type: 'string', example: '60d0fe4f5311236168a109ca' },
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
    },
    required: ['studentId', 'programmeIds', 'priorityMapping'],
  },

  CreateAdminApplicationRequest: {
    type: 'object',
    properties: {
      studentId: { type: 'string', example: '60d0fe4f5311236168a109ca' },
      agentId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
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
    },
    required: ['studentId', 'agentId', 'programmeIds', 'priorityMapping'],
  },

  UpdateApplicationRequest: {
    type: 'object',
    description: 'Admin only: can update status, currentStage, notes',
    properties: {
      status: { $ref: '#/components/schemas/ApplicationStatus' },
      currentStage: { $ref: '#/components/schemas/ApplicationStage' },
      notes: { type: 'string', example: 'Submitted to university portal' },
    },
  },

  StageStatusUpdateRequest: {
    type: 'object',
    properties: {
      stage: { $ref: '#/components/schemas/ApplicationStage' },
      done: { type: 'boolean', description: 'Mark as done (true) or undone (false)' },
      notes: { type: 'string', description: 'Optional notes for this action' },
      attachments: {
        type: 'array',
        items: { type: 'string', format: 'uri' },
        description: 'Optional attachments (S3 URLs, etc.)',
      },
    },
    required: ['stage', 'done'],
    description: 'The authenticated user is used as the admin performing the action.'
  },

  Application: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '60d0fe4f5311236168a109ce' },
      applicationCode: {
        type: 'string',
        example: 'APP-8S9YG329',
        description: 'Nano-generated unique code',
      },
      student: {
        allOf: [{ $ref: '#/components/schemas/Student' }],
        description: 'Full student object (populated)',
      },
      agentId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
      companyId: { type: 'string', example: '60d0fe4f5311236168a109cc' },
      programmeIds: {
        type: 'array',
        items: { type: 'string' },
      },
      priorityMapping: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            programmeId: { type: 'string' },
            priority: { type: 'integer' },
          },
        },
      },
      status: { $ref: '#/components/schemas/ApplicationStatus' },
      currentStage: { $ref: '#/components/schemas/ApplicationStage' },
      notes: { type: 'string' },
      supportingDocuments: {
        type: 'array',
        items: { type: 'string', format: 'uri' },
      },
      submittedAt: {
        type: 'string',
        format: 'date-time',
      },
      isWithdrawn: { type: 'boolean', example: false },
      stageStatus: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            stage: { $ref: '#/components/schemas/ApplicationStage' },
            done: { type: 'boolean' },
            doneAt: { type: 'string', format: 'date-time' },
            doneBy: { type: 'string' },
            notes: { type: 'string' },
            attachments: {
              type: 'array',
              items: { type: 'string', format: 'uri' },
            },
          },
          required: ['stage', 'done'],
        },
        description: 'Current status of all stages',
      },
      stageHistory: {
        type: 'array',
        items: { $ref: '#/components/schemas/StageHistoryEntry' },
        description: 'Audit trail of all stage completions/changes',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
    required: [
      '_id',
      'applicationCode',
      'student',
      'programmeIds',
      'priorityMapping',
      'status',
      'currentStage',
      'isWithdrawn',
      'stageStatus',
      'stageHistory',
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
    required: ['applications', 'totalPages', 'currentPage'],
  },
};
