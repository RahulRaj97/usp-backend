// File: src/swagger/schemas/adminStudentSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminStudentSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  Education: {
    type: 'object',
    properties: {
      institutionName: { type: 'string', example: 'University A' },
      degree: { type: 'string', example: 'BSc Computer Science' },
      grade: { type: 'string', example: 'A+' },
      year: { type: 'integer', example: 2020 },
    },
    required: ['institutionName', 'degree', 'year'],
  },

  Document: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['passport', 'academic_result', 'certificate', 'resume', 'other'],
      },
      fileUrl: {
        type: 'string',
        format: 'uri',
        example: 'https://s3.aws/.../doc.pdf',
      },
      uploadedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-18T12:00:00Z',
      },
    },
    required: ['type', 'fileUrl', 'uploadedAt'],
  },

  CreateStudentRequest: {
    type: 'object',
    properties: {
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      gender: {
        type: 'string',
        enum: ['male', 'female', 'other'],
        example: 'male',
      },
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      phone: { type: 'string', example: '+1234567890' },
      passportNumber: { type: 'string', example: 'A1234567' },
      passportExpiry: { type: 'string', format: 'date', example: '2030-12-31' },
      education: {
        type: 'array',
        items: { $ref: '#/components/schemas/Education' },
      },
      documents: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
        description: 'One or more document files',
      },
      agentId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
      companyId: { type: 'string', example: '60d0fe4f5311236168a109cc' },
    },
    required: [
      'firstName',
      'lastName',
      'gender',
      'email',
      'education',
      'agentId',
      'companyId',
    ],
  },

  UpdateStudentRequest: {
    type: 'object',
    properties: {
      phone: { type: 'string', example: '+1987654321' },
      passportNumber: { type: 'string', example: 'B7654321' },
      passportExpiry: { type: 'string', format: 'date', example: '2031-01-01' },
      education: {
        type: 'array',
        items: { $ref: '#/components/schemas/Education' },
      },
      documents: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
        description: 'One or more new document files',
      },
    },
  },

  Student: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      gender: { type: 'string', example: 'male' },
      email: { type: 'string', example: 'john@example.com' },
      phone: { type: 'string', example: '+1234567890' },
      passportNumber: { type: 'string', example: 'A1234567' },
      passportExpiry: { type: 'string', format: 'date', example: '2030-12-31' },
      profileStatus: {
        type: 'string',
        enum: ['complete', 'incomplete', 'pending'],
        example: 'pending',
      },
      studentId: { type: 'string', example: 'US00123456' },
      education: {
        type: 'array',
        items: { $ref: '#/components/schemas/Education' },
      },
      documents: {
        type: 'array',
        items: { $ref: '#/components/schemas/Document' },
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

  PaginatedStudents: {
    type: 'object',
    properties: {
      students: {
        type: 'array',
        items: { $ref: '#/components/schemas/Student' },
      },
      totalPages: { type: 'integer', example: 3 },
      currentPage: { type: 'integer', example: 1 },
    },
  },
};
