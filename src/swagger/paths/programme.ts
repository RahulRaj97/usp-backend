import { OpenAPIV3 } from 'openapi-types';

export const programmePaths: OpenAPIV3.PathsObject = {
  '/api/programmes': {
    get: {
      tags: ['Programmes'],
      summary: 'List published programmes',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'universityId', in: 'query', schema: { type: 'string' } },
        {
          name: 'type',
          in: 'query',
          schema: { $ref: '#/components/schemas/ProgrammeType' },
        },
        {
          name: 'deliveryMethod',
          in: 'query',
          schema: { $ref: '#/components/schemas/DeliveryMethod' },
        },
        { name: 'openIntakeOnly', in: 'query', schema: { type: 'boolean' } },
        { name: 'minTuition', in: 'query', schema: { type: 'number' } },
        { name: 'maxTuition', in: 'query', schema: { type: 'number' } },
        { name: 'minApplicationFee', in: 'query', schema: { type: 'number' } },
        { name: 'maxApplicationFee', in: 'query', schema: { type: 'number' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 20 },
        },
      ],
      responses: {
        '200': {
          description: 'Paginated list of programmes',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedProgrammes' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
  '/api/programmes/{id}': {
    get: {
      tags: ['Programmes'],
      summary: 'Get a single published programme',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'The programme',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Programme' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
