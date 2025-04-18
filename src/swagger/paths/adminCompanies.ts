// File: src/swagger/paths/adminCompanies.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminCompanyPaths: OpenAPIV3.PathsObject = {
  '/api/admin/companies': {
    get: {
      tags: ['Admin Companies'],
      summary: 'List Companies (Admin)',
      description:
        'Retrieve a paginated list of companies. Supports optional filters by name and pagination.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'name',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by company name',
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
          description: 'Paginated list of companies',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedCompanies' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin/companies/{id}': {
    get: {
      tags: ['Admin Companies'],
      summary: 'Get Company by ID (Admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Company ObjectId',
        },
      ],
      responses: {
        200: {
          description: 'Company details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Company' },
            },
          },
        },
        404: { description: 'Company not found' },
        401: { description: 'Unauthorized' },
      },
    },

    put: {
      tags: ['Admin Companies'],
      summary: 'Update Company (Admin)',
      description: 'Update a company’s details, logo, and documents.',
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
                name: { type: 'string' },
                website: { type: 'string' },
                ntn: { type: 'string' },
                address: { $ref: '#/components/schemas/Address' },
                logo: {
                  type: 'string',
                  format: 'binary',
                  description: 'Logo image file',
                },
                documents: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'One or more document files',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Company updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Company' },
            },
          },
        },
        400: { description: 'Invalid request body' },
        404: { description: 'Company not found' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
