import { OpenAPIV3 } from 'openapi-types';

export const agentSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  CreateAgentRequest: {
    type: 'object',
    properties: {
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      email: { type: 'string', example: 'agent@example.com' },
      password: { type: 'string', example: 'securepassword' },
      phone: { type: 'string', example: '+123456789' },
      profileImage: { type: 'string', example: 'https://example.com/avatar.png' },
      level: { type: 'string', enum: ['agent', 'sub-agent', 'parent'], example: 'sub-agent' },
    },
    required: ['firstName', 'lastName', 'email', 'password', 'level'],
  },

  UpdateAgentRequest: {
    type: 'object',
    properties: {
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      phone: { type: 'string', example: '+123456789' },
      profileImage: { type: 'string', example: 'https://example.com/avatar.png' },
      level: { type: 'string', enum: ['agent', 'sub-agent', 'parent'] },
    },
  },

  Agent: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '65fb8a1dabc12345' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      email: { type: 'string', example: 'agent@example.com' },
      phone: { type: 'string', example: '+123456789' },
      profileImage: { type: 'string', example: 'https://example.com/avatar.png' },
      level: { type: 'string', enum: ['agent', 'sub-agent', 'parent'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
