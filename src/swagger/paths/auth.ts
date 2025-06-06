import { OpenAPIV3 } from 'openapi-types';

export const authPaths: OpenAPIV3.PathsObject = {
  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'User login',
      description: 'Authenticates a user and returns access & refresh tokens',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginResponse' },
            },
          },
        },
        401: { description: 'Unauthorized - Invalid credentials' },
      },
    },
  },
  '/api/auth/refresh': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh access token',
      description: 'Generates a new access token using a refresh token stored in cookies',
      responses: {
        200: {
          description: 'New access token generated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenResponse' },
            },
          },
        },
        401: { description: 'Unauthorized - Invalid refresh token' },
      },
    },
  },
  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get current user details',
      description: 'Retrieves the profile information of the currently authenticated user (admin, agent, or student).',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Successfully retrieved user profile.',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/Admin' },
                  { $ref: '#/components/schemas/Agent' },
                  { $ref: '#/components/schemas/Student' },
                ],
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized. Invalid or missing token.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '404': {
          description: 'User not found.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout user',
      description: 'Logs out the user by invalidating the refresh token',
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: 'Successfully logged out' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
