import { OpenAPIV3 } from 'openapi-types';

export const companySchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  Address: {
    type: 'object',
    properties: {
      street: { type: 'string', example: '123 Main St' },
      city: { type: 'string', example: 'Oxford' },
      state: { type: 'string', example: 'Oxfordshire' },
      postalCode: { type: 'string', example: 'OX1 2JD' },
      country: { type: 'string', example: 'United Kingdom' },
    },
  },
  Company: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '60d0fe4f5311236168a109cb' },
      name: { type: 'string', example: 'Oxford University' },
      website: { type: 'string', example: 'https://ox.ac.uk' },
      ntn: { type: 'string', example: '123456789' },
      address: { $ref: '#/components/schemas/Address' },
      logo: { type: 'string', example: 'https://s3/.../logo.png' },
      documents: {
        type: 'array',
        items: { type: 'string', format: 'uri' },
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-19T12:00:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-19T12:00:00Z',
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
      totalPages: { type: 'integer', example: 5 },
      currentPage: { type: 'integer', example: 1 },
    },
  },
};
