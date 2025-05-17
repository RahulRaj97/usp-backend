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
    get: {
      tags: ['Admin Management'],
      summary: 'List Admins',
      description: 'Get a paginated list of admins with optional search',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Search term for admin name or email',
        },
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number',
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          description: 'Number of items per page',
        },
      ],
      responses: {
        200: {
          description: 'List of admins',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminListResponse' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Admin Management'],
      summary: 'Create Admin',
      description: 'Create a new admin user',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/CreateAdminRequest' },
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

  '/api/admin/profile/{id}': {
    get: {
      tags: ['Admin Management'],
      summary: 'Get Admin Details',
      description: 'Retrieve the details of an admin by ID',
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
      responses: {
        200: {
          description: 'Admin details retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Admin' },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
  },

  '/api/admin/{id}': {
    put: {
      tags: ['Admin Management'],
      summary: 'Update Admin',
      description: "Update an existing admin's details",
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
            schema: { $ref: '#/components/schemas/UpdateAdminRequest' },
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
