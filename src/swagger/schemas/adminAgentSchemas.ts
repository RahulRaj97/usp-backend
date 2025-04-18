// File: src/swagger/schemas/adminAgentSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminAgentSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  CreateAgentRequest: {
    type: 'object',
    properties: {
      fullName: {
        type: 'string',
        example: 'John Doe',
        description: 'Agent’s first and last name separated by a space',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'john@example.com',
      },
      phone: {
        type: 'string',
        example: '+1234567890',
      },
      profileImage: {
        type: 'string',
        format: 'uri',
        example: 'https://example.com/profile.jpg',
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: '123 Main St' },
          city: { type: 'string', example: 'Toronto' },
          state: { type: 'string', example: 'Ontario' },
          postalCode: { type: 'string', example: 'M1A1A1' },
          country: { type: 'string', example: 'Canada' },
        },
      },
      role: {
        type: 'string',
        enum: ['owner', 'manager', 'admission', 'counsellor'],
        example: 'manager',
      },
      parentId: {
        type: 'string',
        example: '60d0fe4f5311236168a109cb',
        description: 'ObjectId of the parent agent',
      },
      companyId: {
        type: 'string',
        example: '60d0fe4f5311236168a109cc',
        description: 'ObjectId of the company',
      },
    },
    required: ['fullName', 'email', 'role', 'companyId'],
  },

  UpdateAgentRequest: {
    type: 'object',
    properties: {
      phone: { type: 'string', example: '+1987654321' },
      profileImage: {
        type: 'string',
        format: 'uri',
        example: 'https://example.com/new-image.jpg',
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: '456 New St' },
          city: { type: 'string', example: 'San Francisco' },
          state: { type: 'string', example: 'California' },
          postalCode: { type: 'string', example: '94101' },
          country: { type: 'string', example: 'USA' },
        },
      },
      role: {
        type: 'string',
        enum: ['owner', 'manager', 'admission', 'counsellor'],
      },
      parentId: {
        type: 'string',
        example: '60d0fe4f5311236168a109cd',
      },
      companyId: {
        type: 'string',
        example: '60d0fe4f5311236168a109ce',
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'new_secure_password',
      },
    },
  },

  Agent: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      email: { type: 'string', example: 'john@example.com' },
      phone: { type: 'string', example: '+1234567890' },
      profileImage: {
        type: 'string',
        format: 'uri',
        example: 'https://example.com/profile.jpg',
      },
      level: {
        type: 'string',
        enum: ['owner', 'manager', 'admission', 'counsellor'],
      },
      isActive: { type: 'boolean', example: true },
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

  ToggleAgentStatusResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Agent status updated' },
      isActive: { type: 'boolean', example: false },
    },
  },

  PaginatedAgents: {
    type: 'object',
    properties: {
      agents: {
        type: 'array',
        items: { $ref: '#/components/schemas/Agent' },
      },
      totalPages: { type: 'integer', example: 5 },
      currentPage: { type: 'integer', example: 1 },
    },
  },
};
