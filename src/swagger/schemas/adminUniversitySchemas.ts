// File: src/swagger/schemas/adminUniversitySchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminUniversitySchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  CreateUniversityRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        example: 'Oxford University',
      },
      logo: {
        type: 'string',
        format: 'uri',
        example: 'https://s3.aws/.../oxford.png',
        description: 'URL to the university logo',
      },
      website: {
        type: 'string',
        format: 'uri',
        example: 'https://www.ox.ac.uk',
      },
      contactEmail: {
        type: 'string',
        format: 'email',
        example: 'info@ox.ac.uk',
      },
      phone: {
        type: 'string',
        example: '+44 1865 270000',
      },
      description: {
        type: 'string',
        example: 'World-renowned university with a rich academic tradition.',
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: 'Wellington Square' },
          city: { type: 'string', example: 'Oxford' },
          state: { type: 'string', example: 'Oxfordshire' },
          postalCode: { type: 'string', example: 'OX1 2JD' },
          country: { type: 'string', example: 'United Kingdom' },
        },
      },
    },
    required: ['name', 'website', 'contactEmail', 'address'],
  },

  UpdateUniversityRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Oxford University Updated' },
      logo: {
        type: 'string',
        format: 'uri',
        example: 'https://s3.aws/.../oxford-new.png',
      },
      website: {
        type: 'string',
        format: 'uri',
        example: 'https://updated.ox.ac.uk',
      },
      contactEmail: {
        type: 'string',
        format: 'email',
        example: 'contact@ox.ac.uk',
      },
      phone: { type: 'string', example: '+44 1865 270999' },
      description: { type: 'string', example: 'Updated description.' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: 'Queen’s Lane' },
          city: { type: 'string', example: 'Cambridge' },
          state: { type: 'string', example: 'Cambridgeshire' },
          postalCode: { type: 'string', example: 'CB2 3EG' },
          country: { type: 'string', example: 'United Kingdom' },
        },
      },
    },
  },

  University: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
      name: { type: 'string', example: 'Oxford University' },
      logo: {
        type: 'string',
        format: 'uri',
        example: 'https://s3.aws/.../oxford.png',
      },
      website: {
        type: 'string',
        format: 'uri',
        example: 'https://www.ox.ac.uk',
      },
      contactEmail: {
        type: 'string',
        format: 'email',
        example: 'info@ox.ac.uk',
      },
      phone: { type: 'string', example: '+44 1865 270000' },
      description: {
        type: 'string',
        example: 'World-renowned university with a rich academic tradition.',
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: 'Wellington Square' },
          city: { type: 'string', example: 'Oxford' },
          state: { type: 'string', example: 'Oxfordshire' },
          postalCode: { type: 'string', example: 'OX1 2JD' },
          country: { type: 'string', example: 'United Kingdom' },
        },
      },
      currency: {
        type: 'string',
        example: 'GBP',
        description: 'Currency used by the university',
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

  PaginatedUniversities: {
    type: 'object',
    properties: {
      universities: {
        type: 'array',
        items: { $ref: '#/components/schemas/University' },
      },
      totalPages: { type: 'integer', example: 4 },
      currentPage: { type: 'integer', example: 1 },
    },
  },
};
