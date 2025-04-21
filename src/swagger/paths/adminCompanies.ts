import { OpenAPIV3 } from 'openapi-types';

export const adminCompanyPaths: OpenAPIV3.PathsObject = {
  '/api/admin/companies': {
    get: {
      tags: ['Admin Companies'],
      operationId: 'listCompaniesAdmin',
      summary: 'List Companies (Admin)',
      description: 'Retrieve a paginated list of companies, with filters.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'name',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by name (partial)',
        },
        {
          name: 'country',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by country',
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
          description: 'PaginatedCompanies',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedCompanies' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Admin Companies'],
      operationId: 'createCompanyAdmin',
      summary: 'Create Company (Admin)',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'Oxford University' },
                website: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://ox.ac.uk',
                },
                ntn: { type: 'string', example: '123456789' },
                address: { $ref: '#/components/schemas/Address' },
                logo: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Company',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Company' },
            },
          },
        },
        400: { description: 'Invalid input' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin/companies/{id}': {
    get: {
      tags: ['Admin Companies'],
      operationId: 'getCompanyAdmin',
      summary: 'Get Company by ID (Admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Company ID',
        },
      ],
      responses: {
        200: {
          description: 'Company',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Company' },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Not found' },
      },
    },
    put: {
      tags: ['Admin Companies'],
      operationId: 'updateCompanyAdmin',
      summary: 'Update Company (Admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                website: { type: 'string', format: 'uri' },
                ntn: { type: 'string' },
                address: { $ref: '#/components/schemas/Address' },
                logo: { type: 'string', format: 'binary' },
                documents: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Company',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Company' },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Not found' },
      },
    },
    delete: {
      tags: ['Admin Companies'],
      operationId: 'deleteCompanyAdmin',
      summary: 'Delete Company (Admin)',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        204: { description: 'Deleted' },
        401: { description: 'Unauthorized' },
        404: { description: 'Not found' },
      },
    },
  },
};
