// File: src/swagger/schemas/adminCompanySchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminCompanySchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  Address: {
    type: 'object',
    properties: {
      street: { type: 'string', example: '123 Main St' },
      city: { type: 'string', example: 'Springfield' },
      state: { type: 'string', example: 'IL' },
      postalCode: { type: 'string', example: '62704' },
      country: { type: 'string', example: 'USA' },
    },
  },

  CreateCompanyRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Acme Corp' },
      website: {
        type: 'string',
        format: 'uri',
        example: 'https://acme.example.com',
      },
      ntn: { type: 'string', example: '123456789' },
      address: { $ref: '#/components/schemas/Address' },
    },
    required: ['name'],
  },

  UpdateCompanyRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Acme Corporation Ltd.' },
      website: {
        type: 'string',
        format: 'uri',
        example: 'https://acme.example.com',
      },
      ntn: { type: 'string', example: '987654321' },
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

  Company: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
      name: { type: 'string', example: 'Acme Corp' },
      website: {
        type: 'string',
        format: 'uri',
        example: 'https://acme.example.com',
      },
      ntn: { type: 'string', example: '123456789' },
      address: { $ref: '#/components/schemas/Address' },
      logo: {
        type: 'string',
        format: 'uri',
        example: 'https://s3.aws/.../logo.png',
      },
      documents: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uri',
          example: 'https://s3.aws/.../doc.pdf',
        },
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

  PaginatedCompanies: {
    type: 'object',
    properties: {
      companies: {
        type: 'array',
        items: { $ref: '#/components/schemas/Company' },
      },
      totalPages: { type: 'integer', example: 3 },
      currentPage: { type: 'integer', example: 1 },
    },
  },
};
