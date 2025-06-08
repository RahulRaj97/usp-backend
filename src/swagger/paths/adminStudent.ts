import { OpenAPIV3 } from 'openapi-types';

export const adminStudentPaths: OpenAPIV3.PathsObject = {
  '/api/admin/students': {
    get: {
      tags: ['Admin Students'],
      summary: 'List Students (Admin)',
      description:
        'Retrieve a paginated list of students. Supports filtering by firstName, lastName, gender, and pagination.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'firstName',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by student first name',
        },
        {
          name: 'lastName',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by student last name',
        },
        {
          name: 'gender',
          in: 'query',
          schema: { type: 'string', enum: ['male', 'female', 'other'] },
          description: 'Filter by gender',
        },
        {
          name: 'companyId',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by company ID',
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
        }
      ],
      responses: {
        200: {
          description: 'Paginated list of students',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedStudents' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Admin Students'],
      summary: 'Create Student (Admin)',
      description: 'Create a new student, including uploading documents.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/CreateStudentRequest' },
            encoding: {
              documentTypes: { style: 'form', explode: true },
              documents: { style: 'form', explode: false },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Student created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Student' },
            },
          },
        },
        400: { description: 'Invalid request' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin/students/{id}': {
    get: {
      tags: ['Admin Students'],
      summary: 'Get Student by ID (Admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Student ObjectId',
        },
      ],
      responses: {
        200: {
          description: 'Student details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Student' },
            },
          },
        },
        404: { description: 'Student not found' },
        401: { description: 'Unauthorized' },
      },
    },
    put: {
      tags: ['Admin Students'],
      summary: 'Update Student (Admin)',
      description: 'Update student data and optionally upload new documents.',
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
            schema: { $ref: '#/components/schemas/UpdateStudentRequest' },
            encoding: {
              profileImage: { style: 'form', explode: false },
              documents: { style: 'form', explode: false },
              documentTypes: { style: 'form', explode: true },
              removeDocuments: { style: 'form', explode: true },
              education: { style: 'form', explode: true },
              address: { style: 'form', explode: true }
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Student updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Student' },
            },
          },
        },
        400: { description: 'Invalid request' },
        404: { description: 'Student not found' },
        401: { description: 'Unauthorized' },
      },
    },
    delete: {
      tags: ['Admin Students'],
      summary: 'Delete Student (Admin)',
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
        204: { description: 'Student deleted successfully' },
        404: { description: 'Student not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
