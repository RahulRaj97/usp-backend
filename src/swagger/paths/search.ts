import { OpenAPIV3 } from 'openapi-types';

export const searchPaths: OpenAPIV3.PathsObject = {
  '/api/search': {
    get: {
      tags: ['Search'],
      summary: 'Search across entities',
      description:
        'If you are an admin, returns matches in Programmes, Universities, Companies, Students and Agents. Otherwise (agent/student) returns Programmes and Students only.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'keyword',
          in: 'query',
          required: true,
          schema: { type: 'string' },
          description: 'Search keyword (case-insensitive substring match)',
        },
      ],
      responses: {
        200: {
          description: 'Search results',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/SearchResult' },
                  { $ref: '#/components/schemas/AdminSearchResult' },
                ],
              },
            },
          },
        },
        401: { description: 'Unauthorized – missing or invalid token' },
      },
    },
  },
};
