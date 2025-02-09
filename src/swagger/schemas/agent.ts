import { OpenAPIV3 } from 'openapi-types';

export const agentSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    _id: { type: 'string', description: 'Unique identifier of the agent' },
    firstName: { type: 'string', description: 'First name of the agent' },
    lastName: { type: 'string', description: 'Last name of the agent' },
    email: {
      type: 'string',
      format: 'email',
      description: 'Agent email address',
    },
    password: {
      type: 'string',
      format: 'password',
      description: 'Hashed password',
    },
    phone: { type: 'string', description: 'Agent phone number' },
    profileImage: {
      type: 'string',
      description: 'URL of the agent’s profile image',
    },
    company: { type: 'string', description: 'Company name of the agent' },
    role: {
      type: 'string',
      enum: ['agent', 'sub-admin', 'parent'],
      description: 'Role of the agent',
    },
    isActive: { type: 'boolean', description: 'Whether the agent is active' },
    isEmailVerified: {
      type: 'boolean',
      description: 'Whether the agent’s email is verified',
    },
    parentId: {
      type: 'string',
      description: 'ID of the parent agent (if applicable)',
    },
    officeId: {
      type: 'string',
      description: 'ID of the office (if applicable)',
    },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        postalCode: { type: 'string' },
        country: { type: 'string' },
      },
      description: 'Agent address',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp of creation',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp of last update',
    },
  },
  required: ['firstName', 'lastName', 'email', 'password', 'role'],
};
