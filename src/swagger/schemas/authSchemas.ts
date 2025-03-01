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
};
