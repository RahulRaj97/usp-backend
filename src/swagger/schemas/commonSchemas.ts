// File: src/swagger/schemas/commonSchemas.ts
import { OpenAPIV3 } from 'openapi-types';

export const commonSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  ErrorResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'An error occurred' },
      statusCode: { type: 'integer', example: 400 },
      error: { type: 'string', example: 'Bad Request' },
    },
    required: ['message', 'statusCode', 'error'],
  },
};
