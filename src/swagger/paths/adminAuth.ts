// File: src/swagger/paths/adminAuth.ts
import { OpenAPIV3 } from 'openapi-types';

export const adminAuthPaths: OpenAPIV3.PathsObject = {
  '/admin/login': {
    post: {
      tags: ['Admin Auth'],
      summary: 'Admin login',
      description:
        'Authenticate an admin user and return access & refresh tokens',
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
        401: { description: 'Unauthorized - Invalid credentials' },
      },
    },
  },
  '/admin/logout': {
    post: {
      tags: ['Admin Auth'],
      summary: 'Admin logout',
      description: "Invalidate the admin's refresh token and clear cookie",
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: 'Logout successful' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/admin/profile': {
    get: {
      tags: ['Admin Auth'],
      summary: 'Get admin profile',
      description: "Retrieve the authenticated admin's profile data",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Admin profile information',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminProfile' },
            },
          },
        },
        401: { description: 'Unauthorized - Admin access required' },
      },
    },
  },
};
