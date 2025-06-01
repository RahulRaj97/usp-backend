import { OpenAPIV3 } from 'openapi-types';

export const authSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  LoginRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', example: 'agent@example.com' },
      password: { type: 'string', example: 'securepassword' },
    },
  },
  LoginResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string', example: 'jwt-access-token' },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65fb8a1dabc12345' },
          email: { type: 'string', example: 'agent@example.com' },
          role: { type: 'string', example: 'agent' },
        },
      },
    },
  },
  Address: {
    type: 'object',
    properties: {
      street: { type: 'string', nullable: true, example: '123 Main St' },
      city: { type: 'string', nullable: true, example: 'Anytown' },
      state: { type: 'string', nullable: true, example: 'CA' },
      postalCode: { type: 'string', nullable: true, example: '90210' },
      country: { type: 'string', nullable: true, example: 'USA' },
    },
    description: 'Geographical address',
  },
  UserResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'User ID' },
      email: { type: 'string', format: 'email', description: 'Email address' },
      role: { type: 'string', enum: ['student', 'admin', 'agent'], description: 'Role of the user' },
      profileImage: { type: 'string', format: 'uri', nullable: true, description: 'URL of the profile image' },
      address: { $ref: '#/components/schemas/Address', nullable: true },
      isActive: { type: 'boolean', description: 'Whether the user account is active' },
      isEmailVerified: { type: 'boolean', description: 'Whether the user email is verified' },
      createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
      updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
    }
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'An error occurred' },
    },
    required: ['message'],
  },
};
