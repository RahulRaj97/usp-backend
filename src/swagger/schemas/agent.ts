import { OpenAPIV3 } from 'openapi-types';

export const agentSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['name', 'email', 'phone'],
};
