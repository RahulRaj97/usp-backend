// File: src/swagger/schemas/adminAuthSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminAuthSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  AdminLoginRequest: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'admin@example.com',
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'admin123',
      },
    },
    required: ['email', 'password'],
  },
  AdminLoginResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Login successful',
      },
      token: {
        type: 'string',
        example: 'jwt-token-here',
      },
      user: {
        $ref: '#/components/schemas/AdminProfile',
      },
    },
    required: ['message', 'token', 'user'],
  },
  AdminProfile: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '60d0fe4f5311236168a109ca',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'admin@example.com',
      },
      role: {
        type: 'string',
        enum: ['admin'],
        example: 'admin',
      },
      name: {
        type: 'string',
        example: 'Admin User',
      },
    },
    required: ['_id', 'email', 'role', 'name'],
  },
};
