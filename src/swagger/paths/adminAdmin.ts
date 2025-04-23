// File: src/swagger/paths/adminAdmin.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminAdminPaths: OpenAPIV3.PathsObject = {
  '/api/admin/login': {
    post: {
      tags: ['Admin Management'],
      summary: 'Admin Login',
      description: 'Authenticate an admin and issue JWT tokens',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AdminLoginRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminLoginResponse' },
            },
          },
        },
        401: { description: 'Invalid credentials' },
      },
    },
  },

  '/api/admin/refresh': {
    post: {
      tags: ['Admin Management'],
      summary: 'Refresh Admin Access Token',
      description: 'Use refresh token cookie to obtain a new access token',
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'New access token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenResponse' },
            },
          },
        },
        401: { description: 'Refresh token missing or invalid' },
      },
    },
  },

  '/api/admin/logout': {
    post: {
      tags: ['Admin Management'],
      summary: 'Admin Logout',
      description: 'Invalidate refresh token and clear cookie',
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LogoutResponse' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin': {
    post: {
      tags: ['Admin Management'],
      summary: 'Create Admin',
      description: 'Create a new admin user',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'firstName', 'lastName'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
                profileImage: { type: 'string', format: 'binary' },
                address: { $ref: '#/components/schemas/Address' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Admin created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Admin' },
            },
          },
        },
        400: { description: 'Invalid input' },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin/{id}': {
    put: {
      tags: ['Admin Management'],
      summary: 'Update Admin',
      description: 'Update an existing admin’s details',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Admin ObjectId',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
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
          },
        },
      },
      responses: {
        200: {
          description: 'Admin updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Admin' },
            },
          },
        },
        400: { description: 'Invalid input' },
        401: { description: 'Unauthorized' },
        404: { description: 'Admin not found' },
      },
    },
  },
};
