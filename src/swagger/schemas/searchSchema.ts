import { OpenAPIV3 } from 'openapi-types';

export const searchSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
  /**
   * Response when non-admin (agent/student) calls /api/search
   */
  SearchResult: {
    type: 'object',
    properties: {
      programmes: {
        type: 'array',
        items: { $ref: '#/components/schemas/Programme' },
      },
      students: {
        type: 'array',
        items: { $ref: '#/components/schemas/Student' },
      },
    },
    required: ['programmes', 'students'],
  },

  /**
   * Response when admin calls /api/search
   */
  AdminSearchResult: {
    type: 'object',
    properties: {
      programmes: {
        type: 'array',
        items: { $ref: '#/components/schemas/Programme' },
      },
      universities: {
        type: 'array',
        items: { $ref: '#/components/schemas/University' },
      },
      companies: {
        type: 'array',
        items: { $ref: '#/components/schemas/Company' },
      },
      students: {
        type: 'array',
        items: { $ref: '#/components/schemas/Student' },
      },
      agents: {
        type: 'array',
        items: { $ref: '#/components/schemas/Agent' },
      },
    },
    required: ['programmes', 'universities', 'companies', 'students', 'agents'],
  },
};
