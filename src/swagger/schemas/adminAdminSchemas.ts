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
      user: { $ref: '#/components/schemas/Admin' },
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
    required: ['email', 'password', 'firstName', 'lastName'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phone: { type: 'string' },
      profileImage: { type: 'string', format: 'binary' },
      address: { $ref: '#/components/schemas/Address' },
    },
  },

  UpdateAdminRequest: {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phone: { type: 'string' },
      profileImage: { type: 'string', format: 'binary' },
      address: { $ref: '#/components/schemas/Address' },
      password: { type: 'string', minLength: 8 },
    },
  },

  Admin: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phone: { type: 'string' },
      profileImage: { type: 'string', format: 'uri' },
      address: { $ref: '#/components/schemas/Address' },
      isActive: { type: 'boolean' },
      isEmailVerified: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
