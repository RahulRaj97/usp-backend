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
      level: { type: 'string', enum: ['owner', 'manager', 'admission', 'counsellor'], example: 'counsellor' }, // Updated enum
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
      level: { type: 'string', enum: ['owner', 'manager', 'admission', 'counsellor'] }, // Updated enum
    },
  },

  Agent: { // Updated Agent schema
    type: 'object',
    properties: {
      id: { type: 'string', example: '65fb8a1dabc12345' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      email: { type: 'string', format: 'email', example: 'agent@example.com' },
      phone: { type: 'string', nullable: true, example: '+123456789' },
      profileImage: { type: 'string', format: 'uri', nullable: true, example: 'https://example.com/avatar.png' },
      level: { type: 'string', enum: ['owner', 'manager', 'admission', 'counsellor'], description: 'Agent level or type' },
      companyId: { type: 'string', nullable: true, description: 'Associated company ID' },
      parentId: { type: 'string', nullable: true, description: 'Parent agent ID for sub-agents' },
      isVerified: { type: 'boolean', description: 'Whether the agent is verified' },
      // Fields from populated User
      isActive: { type: 'boolean', description: 'Whether the user account is active' },
      role: { type: 'string', enum: ['agent'], description: 'Role of the user (should be agent)' },
      isEmailVerified: { type: 'boolean', description: 'Whether the user email is verified' },
      address: { $ref: '#/components/schemas/Address', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
