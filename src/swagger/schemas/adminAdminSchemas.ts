// File: src/swagger/schemas/adminAdminSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminAdminSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  AdminLoginRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', example: 'admin@example.com' },
      password: { type: 'string', format: 'password', example: 'admin123' },
    },
    required: ['email', 'password'],
  },

  AdminLoginResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Login successful' },
      token: { type: 'string', example: 'eyJhbGci…' },
      user: { $ref: '#/components/schemas/AdminProfile' },
    },
    required: ['message', 'token', 'user'],
  },

  RefreshTokenResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string', example: 'eyJhbGci…' },
    },
    required: ['accessToken'],
  },

  LogoutResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Logout successful' },
    },
    required: ['message'],
  },

  CreateAdminRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', example: 'alice@portal.com' },
      password: {
        type: 'string',
        format: 'password',
        example: 'SecurePass!23',
      },
      profileImage: {
        type: 'string',
        format: 'uri',
        example: 'https://cdn.example.com/avatar.png',
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: '123 Main St' },
          city: { type: 'string', example: 'Berlin' },
          state: { type: 'string', example: 'Berlin' },
          postalCode: { type: 'string', example: '10115' },
          country: { type: 'string', example: 'Germany' },
        },
      },
    },
    required: ['email', 'password'],
  },

  UpdateAdminRequest: {
    type: 'object',
    properties: {
      password: { type: 'string', format: 'password', example: 'NewPass!456' },
      profileImage: {
        type: 'string',
        format: 'uri',
        example: 'https://cdn.example.com/new.png',
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: '456 Elm St' },
          city: { type: 'string', example: 'Munich' },
          state: { type: 'string', example: 'Bavaria' },
          postalCode: { type: 'string', example: '80331' },
          country: { type: 'string', example: 'Germany' },
        },
      },
    },
  },

  AdminProfile: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
      email: { type: 'string', format: 'email', example: 'alice@portal.com' },
      profileImage: {
        type: 'string',
        format: 'uri',
        example: 'https://cdn.example.com/avatar.png',
      },
      address: { $ref: '#/components/schemas/Address' },
      isActive: { type: 'boolean', example: true },
      isEmailVerified: { type: 'boolean', example: false },
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
    required: [
      '_id',
      'email',
      'isActive',
      'isEmailVerified',
      'createdAt',
      'updatedAt',
    ],
  },
};
